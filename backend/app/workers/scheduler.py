from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services.aws_service import aws_service
from app.websocket.manager import manager
from app.db.session import SessionLocal
from app.models.models import AWSResource, MetricHistory
from datetime import datetime, timezone
import asyncio

scheduler = AsyncIOScheduler()

async def monitor_resources():
    # Session fetch
    db = SessionLocal()
    try:
        # 1. Fetch all running resources
        resources = db.query(AWSResource).filter(AWSResource.status == 'running').all()
        
        live_updates = []
        for res in resources:
            # 2. Get live metrics via Boto3/Mock
            metrics = aws_service.get_live_metrics(res.resource_id)
            
            # 3. Calculate CO2 based on region and instance base power (simplified for MVP)
            # Power Consumption (W) ~= Idle + Usage * (Max - Idle)
            # CO2 (kg) = kWh * Emission Factor
            region_factor = 0.4 # Default kg CO2 / kWh
            cpu = metrics['cpu_usage']
            base_power = 10.0 # Watts
            usage_power = (cpu / 100.0) * 50.0 # Additional Watts for CPU usage
            total_power_kw = (base_power + usage_power) / 1000.0
            carbon_kg_h = total_power_kw * region_factor
            
            # 4. Save to Metric History (Time-series)
            new_metric = MetricHistory(
                resource_db_id=res.id,
                cpu_usage=cpu,
                cost=res.cost_per_hour,
                carbon_emissions=carbon_kg_h,
                timestamp=datetime.now(timezone.utc)
            )
            db.add(new_metric)
            
            # Update current state on resource
            res.cpu_usage = cpu
            res.carbon_emissions = carbon_kg_h
            res.updated_at = datetime.now(timezone.utc)
            
            # Detect Idle (CPU < 5% for long time - simple logic here)
            if cpu < 5.0:
                if res.idle_since is None:
                    res.idle_since = datetime.now(timezone.utc)
                
                # Generate Recommendation if idle for more than 1 minute (for testing/demo purposes)
                # In real prod this would be hours/days
                idle_duration = datetime.now(timezone.utc) - res.idle_since
                if idle_duration.total_seconds() > 60:
                    existing_rec = db.query(Recommendation).filter(
                        Recommendation.resource_db_id == res.id,
                        Recommendation.is_applied == False
                    ).first()
                    
                    if not existing_rec:
                        new_rec = Recommendation(
                            resource_db_id=res.id,
                            action="Stop",
                            description=f"Resource {res.name} has been idle for {int(idle_duration.total_seconds()/60)} minutes. Stopping this instance would save ${res.cost_per_hour * 24:.2f}/day and reduce CO2 by {res.carbon_emissions * 24:.2f}kg/day.",
                            potential_savings=res.cost_per_hour * 24,
                            potential_co2_reduction=res.carbon_emissions * 24,
                            created_at=datetime.now(timezone.utc)
                        )
                        db.add(new_rec)
            else:
                res.idle_since = None

            live_updates.append({
                'id': res.resource_id,
                'name': res.name,
                'cpu': cpu,
                'cost': res.cost_per_hour,
                'carbon': carbon_kg_h,
                'timestamp': datetime.now(timezone.utc).isoformat()
            })

            # Commit changes for each resource
            db.commit()

        # 5. Broadcast live metrics to all frontends
        if live_updates:
            await manager.broadcast({
                'type': 'LIVE_METRICS',
                'data': live_updates,
                'timestamp': datetime.now(timezone.utc).isoformat()
            })
            
    except Exception as e:
        print(f"Error in monitor_resources: {e}")
    finally:
        db.close()

def start_scheduler():
    scheduler.add_job(monitor_resources, 'interval', seconds=15)
    scheduler.start()
