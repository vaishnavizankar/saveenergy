import json
import boto3
import time
import random
from datetime import datetime, timezone

# Configuration
STREAM_NAME = 'SaveEnergy_MetricsStream'
REGION = 'us-east-1'

# Initialize Boto3 Kinesis Client
# (Assumes AWS CLI is configured or running with local stack)
kinesis = boto3.client('kinesis', region_name=REGION)

def simulate_pulse():
    print(f"Starting Kinesis Mock Simulation on {STREAM_NAME}...")
    
    resources = [
        {'id': 'i-0a2b3c4d5e6f', 'name': 'Web-Server-01', 'type': 'EC2'},
        {'id': 'i-1a2b3c4d5e6g', 'name': 'DB-Node-01', 'type': 'RDS'},
        {'id': 'i-2a2b3c4d5e6h', 'name': 'Cache-Cluster', 'type': 'EC2'},
        {'id': 'i-3a2b3c4d5e6i', 'name': 'Staging-App', 'type': 'EC2'}
    ]

    try:
        while True:
            for res in resources:
                # 1. Generate stochastic metrics
                cpu = random.uniform(5.0, 85.0)
                # 100% CPU ~ 0.012 kg CO2e / hr
                carbon = (cpu / 100.0) * 0.012 
                
                payload = {
                    'resource_id': res['id'],
                    'name': res['name'],
                    'type': res['type'],
                    'cpu': round(cpu, 2),
                    'carbon': round(carbon, 6),
                    'timestamp': datetime.now(timezone.utc).isoformat()
                }

                print(f"Pushing Metric [{{res['name']}}]: {{payload['cpu']}}% CPU | {{payload['carbon']}}kg CO2e")

                # 2. Put record into Kinesis Stream
                # Note: In a production test, you'd handle ProvisionedThroughputExceededException
                kinesis.put_record(
                    StreamName=STREAM_NAME,
                    Data=json.dumps(payload),
                    PartitionKey=res['id']
                )

            print("-" * 50)
            time.sleep(10) # 10s intervals for live simulation
            
    except KeyboardInterrupt:
        print("\nSimulation stopped.")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    simulate_pulse()
