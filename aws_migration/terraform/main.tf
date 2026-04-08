terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# --- AWS COGNITO (AUTH) ---
resource "aws_cognito_user_pool" "saveenergy_users" {
  name = "SaveEnergy_UserPool"
  password_policy {
    minimum_length = 8
    require_lowercase = true
    require_numbers = true
  }
}

resource "aws_cognito_user_pool_client" "client" {
  name = "SaveEnergy_AppClient"
  user_pool_id = aws_cognito_user_pool.saveenergy_users.id
}

# --- AMAZON DYNAMODB (PERSISTENCE) ---
resource "aws_dynamodb_table" "resources_table" {
  name           = "SaveEnergy_Resources"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "resource_id"
  
  attribute {
    name = "resource_id"
    type = "S"
  }
}

resource "aws_dynamodb_table" "recommendations_table" {
  name           = "SaveEnergy_Recommendations"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "recommendation_id"
  
  attribute {
    name = "recommendation_id"
    type = "S"
  }
}

# --- AMAZON KINESIS (STREAMING) ---
# NOTE: Disabled - requires AWS subscription upgrade
# resource "aws_kinesis_stream" "metrics_stream" {
#   name             = "SaveEnergy_MetricsStream"
#   shard_count      = 1
#   retention_period = 24
# }


# --- ZIP LAMBDA CODE ---
data "archive_file" "monitor_pulse_zip" {
  type        = "zip"
  source_file = "${path.module}/../lambdas/monitor_resources.py"
  output_path = "${path.module}/monitor_pulse.zip"
}

data "archive_file" "waste_predictor_zip" {
  type        = "zip"
  source_file = "${path.module}/../lambdas/waste_predictor.py"
  output_path = "${path.module}/waste_predictor.zip"
}

# --- AWS LAMBDA (BACKEND COMPUTE) ---
resource "aws_lambda_function" "monitor_pulse" {
  function_name = "SaveEnergy_MonitorPulse"
  runtime       = "python3.11"
  handler       = "monitor_resources.lambda_handler"
  role          = aws_iam_role.lambda_exec.arn

  filename         = data.archive_file.monitor_pulse_zip.output_path
  source_code_hash = data.archive_file.monitor_pulse_zip.output_base64sha256
}

resource "aws_lambda_function" "waste_predictor" {
  function_name = "SaveEnergy_WastePredictor"
  runtime       = "python3.11"
  handler       = "waste_predictor.lambda_handler"
  role          = aws_iam_role.lambda_exec.arn

  filename         = data.archive_file.waste_predictor_zip.output_path
  source_code_hash = data.archive_file.waste_predictor_zip.output_base64sha256
}

# --- EVENTBRIDGE (REPLACES APSCHEDULER) ---
resource "aws_cloudwatch_event_rule" "pulse_schedule" {
  name                = "SaveEnergy_PulseSchedule"
  description         = "Triggers Carbon Audit every 15 mins"
  schedule_expression = "rate(15 minutes)"
}

resource "aws_cloudwatch_event_target" "lambda_target" {
  rule      = aws_cloudwatch_event_rule.pulse_schedule.name
  target_id = "MonitorPulseLambda"
  arn       = aws_lambda_function.monitor_pulse.arn
}

# --- AMAZON S3 (REPORTS) ---
resource "aws_s3_bucket" "reports_bucket" {
  bucket = "saveenergy-sustainability-reports-${random_id.id.hex}"
}

resource "random_id" "id" {
  byte_length = 4
}
