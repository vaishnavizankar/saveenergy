# --- AMAZON SAGEMAKER (ML PREDICTION) ---

# 1. Model Definition
resource "aws_sagemaker_model" "waste_predictor_model" {
  name               = "SaveEnergy-WastePredictor-v1"
  execution_role_arn = aws_iam_role.sagemaker_role.arn

  primary_container {
    image = "382416733822.dkr.ecr.us-east-1.amazonaws.com/linear-learner:1" # Standard AWS Linear Learner
    model_data_url = "s3://${aws_s3_bucket.model_data.bucket}/${aws_s3_object.model_payload.key}"
  }
}

# Upload the placeholder model payload (prevents CreateModel failure)
resource "aws_s3_object" "model_payload" {
  bucket = aws_s3_bucket.model_data.id
  key    = "model.tar.gz"
  source = "${path.module}/../model.tar.gz"
  # Track changes via etag
  etag   = filemd5("${path.module}/../model.tar.gz")
}

# 2. Endpoint Configuration (Fine-tuned for Cost & Latency)
resource "aws_sagemaker_endpoint_configuration" "config" {
  name = "SaveEnergy-EndpointConfig-v1"

  production_variants {
    variant_name           = "AllTraffic"
    model_name            = aws_sagemaker_model.waste_predictor_model.name
    initial_instance_count = 1
    instance_type          = "ml.t2.medium" # Burstability for metric spikes
  }
}

# 3. Real-Time Endpoint
resource "aws_sagemaker_endpoint" "endpoint" {
  name                 = "saveenergy-waste-predictor"
  endpoint_config_name = aws_sagemaker_endpoint_configuration.config.name
}

# 4. Model Training Parameters (Fine-Tuning Recommendation)
# These are applied during the Training Job (via SageMaker SDK):
# - target_type: 'binary_classifier' (Idle Waste vs Active)
# - binary_classifier_model_selection_criteria: 'precision_at_target_recall'
# - feature_dim: 2 (CPU_Avg, Time_of_Day)
# - mini_batch_size: 100

# IAM Role for SageMaker
resource "aws_iam_role" "sagemaker_role" {
  name = "SaveEnergy_SageMaker_ExecRole"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "sagemaker.amazonaws.com" }
    }]
  })
}

# Grant SageMaker access to S3 (Model Data) and CloudWatch (Logs)
resource "aws_iam_role_policy" "sagemaker_policy" {
  name = "SaveEnergy_SageMaker_Policy"
  role = aws_iam_role.sagemaker_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:GetObject",
          "s3:ListBucket",
          "s3:PutObject"
        ]
        Effect   = "Allow"
        Resource = [
          aws_s3_bucket.model_data.arn,
          "${aws_s3_bucket.model_data.arn}/*"
        ]
      },
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

resource "aws_s3_bucket" "model_data" {
  bucket = "saveenergy-sagemaker-models-${random_id.id.hex}"
}
