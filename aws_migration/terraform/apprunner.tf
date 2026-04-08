# ============================================================
# SaveEnergy - AWS App Runner (Backend Hosting)
# ============================================================

# --- ECR REPOSITORY ---
# Stores your backend Docker image
resource "aws_ecr_repository" "backend" {
  name                 = "saveenergy-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name    = "SaveEnergy Backend ECR"
    Project = "SaveEnergy"
  }
}

# --- IAM ROLE FOR APP RUNNER ---
# Allows App Runner to pull images from ECR
resource "aws_iam_role" "apprunner_ecr_role" {
  name = "SaveEnergy_AppRunner_ECR_Role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "build.apprunner.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "apprunner_ecr_policy" {
  role       = aws_iam_role.apprunner_ecr_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
}

# --- IAM ROLE FOR APP RUNNER INSTANCE ---
# Allows the running app to access AWS services (RDS, S3, Cognito, etc.)
resource "aws_iam_role" "apprunner_instance_role" {
  name = "SaveEnergy_AppRunner_Instance_Role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "tasks.apprunner.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "apprunner_instance_policy" {
  name = "SaveEnergy_AppRunner_Instance_Policy"
  role = aws_iam_role.apprunner_instance_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject", "s3:PutObject", "s3:ListBucket",
          "cognito-idp:*",
          "cloudwatch:PutMetricData",
          "logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"
        ]
        Resource = "*"
      }
    ]
  })
}

# --- OUTPUTS ---
output "ecr_repository_url" {
  description = "ECR URL to push your Docker image to"
  value       = aws_ecr_repository.backend.repository_url
}
