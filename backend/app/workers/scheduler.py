from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services.aws_service import aws_service
from app.websocket.manager import manager
from app.db.session import SessionLocal
from app.models.models import AWSResource, MetricHistory, Recommendation
from app.models.aws_account import AWSAccount
from datetime import datetime, timezone, timedelta
import asyncio
import logging

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()

async def sync_aws_inventory():
    """Sync AWS resources periodically (Every 5 mins)"""
    db = SessionLocal()
    try:
        logger.info("Syncing AWS inventory...")
        # Fetch all registered active AWS accounts
        accounts = db.query(AWSAccount).filter(AWSAccount.status == 'active').all()
        total_resources = 0
        for acc in accounts:
            try:
                resources_raw = aws_service.get_resources(accounts=[acc])
            except Exception as e:
                logger.error(f"Skipping sync for account {acc.id} due to fetch error: {e}")
                continue # Do not attempt cleanup if the fetch failed entirely
                
            total_resources += len(resources_raw)
            fetched_ids = [raw['id'] for raw in resources_raw]
            
            for raw in resources_raw:
                # Upsert logic
                resource = db.query(AWSResource).filter(AWSResource.resource_id == raw['id']).first()
                if not resource:
                    resource = AWSResource(
                        resource_id=raw['id'],
                        account_id=acc.id,
                        name=raw['name'],
                        type=raw['type'],
                        status=raw['status'],
                        region=raw['region'],
                        instance_type=raw['instance_type'],
                        cost_per_hour=raw['cost_per_hour']
                    )
                    db.add(resource)
                else:
                    # Update existing
                    resource.account_id = acc.id
                    resource.status = raw['status']
                    resource.cost_per_hour = raw['cost_per_hour']
                    resource.updated_at = datetime.now(timezone.utc)
                
            # --- CLEANUP ORPHANED RESOURCES ---
            # Run a true hard-deletion query so deleted instances vanish from the dashboard
            if fetched_ids:
                db.query(AWSResource).filter(
                    AWSResource.account_id == acc.id, 
                    ~AWSResource.resource_id.in_(fetched_ids)
                ).delete(synchronize_session=False)
            else:
                db.query(AWSResource).filter(AWSResource.account_id == acc.id).delete(synchronize_session=False)
                
            db.commit()
        logger.info(f"Inventory sync complete. {total_resources} resources processed.")
    except Exception as e:
        logger.error(f"Error in sync_aws_inventory: {e}")
    finally:
        db.close()

async def monitor_resources():
    """Monitor performance metrics of running resources (Real-time)"""
    db = SessionLocal()
    try:
        # Fetch resources that are in running or active state
        resources = db.query(AWSResource).filter(
            AWSResource.status.in_(['running', 'available', 'active'])
        ).all()
        
        live_updates = []
        for res in resources:
            metrics = aws_service.get_live_metrics(res.resource_id, res.type)
            
            # Simplified carbon calculation
            region_factor = 0.4 # kg CO2 / kWh
            cpu = metrics['cpu_usage']
            base_power = 10.0 # Watts
            usage_power = (cpu / 100.0) * 50.0 
            total_power_kw = (base_power + usage_power) / 1000.0
            carbon_kg_h = total_power_kw * region_factor
            
            # Save to Metric History
            new_metric = MetricHistory(
                resource_db_id=res.id,
                cpu_usage=cpu,
                cost=res.cost_per_hour,
                carbon_emissions=carbon_kg_h,
                timestamp=datetime.now(timezone.utc)
            )
            db.add(new_metric)
            
            # Update resource live stats
            res.cpu_usage = cpu
            res.carbon_emissions = carbon_kg_h
            res.updated_at = datetime.now(timezone.utc)
            
            # Recommendation Logic (Optimizing)
            if cpu < 5.0 and res.type == 'EC2':
                if res.idle_since is None:
                    res.idle_since = datetime.now(timezone.utc)
                
                idle_duration = datetime.now(timezone.utc) - res.idle_since
                if idle_duration > timedelta(minutes=1):
                    existing_rec = db.query(Recommendation).filter(
                        Recommendation.resource_db_id == res.id,
                        Recommendation.is_applied == False
                    ).first()
                    
                    if not existing_rec:
                        new_rec = Recommendation(
                            resource_db_id=res.id,
                            action="Optimization",
                            description=f"Resource {res.name} ({res.type}) shows low utilization. Potential saving: ${res.cost_per_hour * 24:.2f}/day.",
                            potential_savings=res.cost_per_hour * 24,
                            potential_co2_reduction=carbon_kg_h * 24,
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
            
            db.commit()

        if live_updates:
            await manager.broadcast({
                'type': 'LIVE_METRICS',
                'data': live_updates,
                'timestamp': datetime.now(timezone.utc).isoformat()
            })
            
    except Exception as e:
        logger.error(f"Error in monitor_resources: {e}")
    finally:
        db.close()

def start_scheduler():
    # Sync inventory every 1 minute
    scheduler.add_job(sync_aws_inventory, 'interval', minutes=1)
    # Monitor metrics every 30 seconds for live UI updates
    scheduler.add_job(monitor_resources, 'interval', seconds=30)
    scheduler.start()
    # Run initial sync immediately
    asyncio.create_task(sync_aws_inventory())
