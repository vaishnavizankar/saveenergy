import json
import boto3
import os
from datetime import datetime, timezone

# Clients
sagemaker = boto3.client('sagemaker-runtime')
ddb = boto3.resource('dynamodb')
table_name = os.environ.get('DYNAMODB_TABLE', 'SaveEnergy_Recommendations')
table = ddb.Table(table_name)
endpoint_name = os.environ.get('SAGEMAKER_ENDPOINT', 'saveenergy-waste-predictor')

def lambda_handler(event, context):
    print("Optimization Predictor Triggered...")
    
    # Payload from the Pulse auditor or Kinesis trigger
    # Expecting: {'resource_id': '...', 'cpu': 0.0, 'carbon': 0.0, 'name': '...'}
    for record in event['Records']:
        data = json.loads(record['kinesis']['data'])
        res_id = data['resource_id']
        cpu = data['cpu']
        
        # 1. Prepare data for SageMaker prediction (Example Payload)
        # Model predicts 'is_idle_waste' (0-1) based on CPU and Time
        payload = {
            'instances': [{'features': [cpu, datetime.now(timezone.utc).hour]}]
        }
        
        # 2. Invoke SageMaker Endpoint
        response = sagemaker.invoke_endpoint(
            EndpointName=endpoint_name,
            ContentType='application/json',
            Body=json.dumps(payload)
        )
        
        result = json.loads(response['Body'].read().decode())
        prediction_score = result['predictions'][0]['score'] if result['predictions'] else 0.0
        
        # 3. Decision Logic: If > 0.8 probability of wasteful idle
        if prediction_score > 0.8:
            print(f"CRITICAL WASTE DETECTED: {res_id} (Score: {prediction_score})")
            
            # 4. Generate & Save Recommendation to DynamoDB
            rec_id = f"REC-{int(datetime.now().timestamp())}-{res_id}"
            
            table.put_item(
                Item={
                    'recommendation_id': rec_id,
                    'resource_id': res_id,
                    'name': data.get('name'),
                    'action': 'STOP / RIGHT-SIZE',
                    'description': f"Predictive model flags {res_id} as 'idle waste' with {round(prediction_score*100, 1)}% confidence.",
                    'potential_savings': 12.45, # Example value
                    'is_applied': False,
                    'created_at': datetime.now(timezone.utc).isoformat()
                }
            )
            
            # 5. Push Notification (SNS integration could go here)
            # sns.publish(...)
            
    return {"statusCode": 200, "message": "Predictions processed."}
