# --- IAM ROLES AND POLICIES ---

# 1. Lambda Execution Role (Missing Reference in main.tf)
resource "aws_iam_role" "lambda_exec" {
  name = "SaveEnergy_Lambda_ExecRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# 2. Monitoring & Cost Explorer Policy
# This policy covers rds:DescribeDBInstances, ce:GetCostAndUsage, and other required actions.
resource "aws_iam_policy" "monitoring_policy" {
  name        = "SaveEnergy_Monitoring_Policy"
  description = "Allows GreenOps backend to collect resource data and cost metrics"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "rds:DescribeDBInstances",
          "ce:GetCostAndUsage",
          "ce:GetAnomalies",
          "ec2:DescribeInstances",
          "s3:ListAllMyBuckets",
          "lambda:ListFunctions",
          "cloudwatch:GetMetricStatistics",
          "sts:AssumeRole"
        ]
        Resource = "*"
      }
    ]
  })
}

# 3. User Policy Attachment (For the user mentioned in errors)
# Note: In a real migration, we'd prefer roles, but the existing system uses an IAM User.
resource "aws_iam_user_policy_attachment" "saveenergy_user_attach" {
  user       = "saveenergy"
  policy_arn = aws_iam_policy.monitoring_policy.arn
}
