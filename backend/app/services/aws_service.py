import boto3
import random
from app.core.config import settings
from datetime import datetime, timezone

class AWSService:
    def __init__(self):
        # Fallback to mock data if credentials aren't provided
        try:
            if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
                self.ec2 = boto3.client(
                    'ec2',
                    region_name=settings.AWS_REGION,
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
                )
                self.cloudwatch = boto3.client(
                    'cloudwatch',
                    region_name=settings.AWS_REGION,
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
                )
                self.is_mock = False
            else:
                self.is_mock = True
        except Exception:
            self.is_mock = True

    def get_ec2_resources(self):
        if self.is_mock:
            return self._mock_ec2_resources()
        
        # Real Boto3 integration
        instances = self.ec2.describe_instances()
        resources = []
        for reservation in instances['Reservations']:
            for instance in reservation['Instances']:
                resources.append({
                    'id': instance['InstanceId'],
                    'name': next((tag['Value'] for tag in instance.get('Tags', []) if tag['Key'] == 'Name'), instance['InstanceId']),
                    'type': 'EC2',
                    'status': instance['State']['Name'],
                    'instance_type': instance['InstanceType'],
                    'region': settings.AWS_REGION,
                    'cost_per_hour': self._get_cost_estimate(instance['InstanceType']),
                })
        return resources

    def _mock_ec2_resources(self):
        return [
            {'id': 'i-0a1b2c3d4e5f6g7h1', 'name': 'Web-Server-01', 'type': 'EC2', 'status': 'running', 'instance_type': 't3.medium', 'region': 'us-east-1', 'cost_per_hour': 0.0416},
            {'id': 'i-0a1b2c3d4e5f6g7h2', 'name': 'DB-Node-01', 'type': 'EC2', 'status': 'running', 'instance_type': 't3.large', 'region': 'us-east-1', 'cost_per_hour': 0.0832},
            {'id': 'i-0a1b2c3d4e5f6g7h3', 'name': 'Cache-Cluster', 'type': 'EC2', 'status': 'running', 'instance_type': 't3.small', 'region': 'us-east-1', 'cost_per_hour': 0.0208},
            {'id': 'i-0a1b2c3d4e5f6g7h4', 'name': 'Analytic-Job', 'type': 'EC2', 'status': 'stopped', 'instance_type': 'm5.xlarge', 'region': 'us-east-1', 'cost_per_hour': 0.192},
            {'id': 'i-0a1b2c3d4e5f6g7h5', 'name': 'Staging-App', 'type': 'EC2', 'status': 'running', 'instance_type': 't3.micro', 'region': 'us-east-1', 'cost_per_hour': 0.0104},
        ]

    def get_live_metrics(self, resource_id):
        if self.is_mock:
            # Randomize metrics for mock display
            return {
                'cpu_usage': round(random.uniform(1.0, 15.0), 2),
                'timestamp': datetime.now(timezone.utc)
            }
        
        # Real CloudWatch integration (last 5 minutes)
        response = self.cloudwatch.get_metric_statistics(
            Namespace='AWS/EC2',
            MetricName='CPUUtilization',
            Dimensions=[{'Name': 'InstanceId', 'Value': resource_id}],
            StartTime=datetime.now(timezone.utc) - datetime.timedelta(minutes=5),
            EndTime=datetime.now(timezone.utc),
            Period=60,
            Statistics=['Average']
        )
        points = response.get('Datapoints', [])
        if points:
            return {'cpu_usage': points[-1]['Average'], 'timestamp': points[-1]['Timestamp']}
        return {'cpu_usage': 0.0, 'timestamp': datetime.now(timezone.utc)}

    def _get_cost_estimate(self, instance_type):
        # Basic mapping for common types if AWS Price List API is complex for MVP
        prices = {'t3.micro': 0.0104, 't3.small': 0.0208, 't3.medium': 0.0416, 't3.large': 0.0832, 'm5.large': 0.096, 'm5.xlarge': 0.192}
        return prices.get(instance_type, 0.05)

aws_service = AWSService()
