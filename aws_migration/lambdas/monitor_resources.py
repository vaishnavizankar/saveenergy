import json
import boto3
import os
from datetime import datetime, timedelta, timezone

# Clients
cw = boto3.client('cloudwatch')
ddb = boto3.resource('dynamodb')
table_name = os.environ.get('DYNAMODB_TABLE', 'SaveEnergy_Resources')
table = ddb.Table(table_name)
kinesis = boto3.client('kinesis')
stream_name = os.environ.get('KINESIS_STREAM', 'SaveEnergy_MetricsStream')

def lambda_handler(event, context):
    print("Carbon Audit Pulse Triggered...")
    
    # 1. Fetch running resources from DynamoDB
    # In a real scenario, this would scan the 'status=running' GSI
    response = table.scan() 
    resources = [r for r in response.get('Items', []) if r.get('status') == 'running']
    
    audit_results = []
    
    for resource in resources:
        res_id = resource['resource_id']
        
        # 2. Get Real-Time CloudWatch Metrics
        metric = cw.get_metric_statistics(
            Namespace='AWS/EC2',
            MetricName='CPUUtilization',
            Dimensions=[{'Name': 'InstanceId', 'Value': res_id}],
            StartTime=datetime.now(timezone.utc) - timedelta(minutes=15),
            EndTime=datetime.now(timezone.utc),
            Period=300,
            Statistics=['Average']
        )
        
        avg_cpu = metric['Datapoints'][-1]['Average'] if metric['Datapoints'] else 0.0
        
        # 3. Calculate Carbon Estimate (Heuristic for demo)
        # 100% CPU on t2.micro ~ 0.015 kg CO2e / hour
        carbon_emissions = (avg_cpu / 100.0) * 0.015
        
        # 4. Push to Kinesis for Live Dashboard
        metric_data = {
            'resource_id': res_id,
            'name': resource.get('name'),
            'type': resource.get('type'),
            'cpu': round(avg_cpu, 2),
            'carbon': round(carbon_emissions, 6),
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        
        kinesis.put_record(
            StreamName=stream_name,
            Data=json.dumps(metric_data),
            PartitionKey=res_id
        )
        
        # 5. Update DynamoDB with latest audit
        table.update_item(
            Key={'resource_id': res_id},
            UpdateExpression="SET last_cpu=:c, carbon_emissions=:e, updated_at=:t",
            ExpressionAttributeValues={
                ':c': round(avg_cpu, 2),
                ':e': round(carbon_emissions, 6),
                ':t': datetime.now(timezone.utc).isoformat()
            }
        )
        
        audit_results.append(metric_data)

    print(f"Audit Complete. Processed {len(audit_results)} resources.")
    
    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": "Sustainability Pulse Succeeded",
            "count": len(audit_results)
        })
    }
