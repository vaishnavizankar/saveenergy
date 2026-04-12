# ============================================================
# SaveEnergy - AWS ECS Fargate (Backend Hosting)
# Replaces App Runner with ECS — no subscription required
# ============================================================

# --- ECS CLUSTER ---
resource "aws_ecs_cluster" "backend_cluster" {
  name = "saveenergy-cluster"

  tags = {
    Name    = "SaveEnergy ECS Cluster"
    Project = "SaveEnergy"
  }
}

# --- CLOUDWATCH LOG GROUP ---
resource "aws_cloudwatch_log_group" "backend_logs" {
  name              = "/ecs/saveenergy-backend"
  retention_in_days = 7
}

# --- IAM ROLE FOR ECS TASK EXECUTION ---
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "SaveEnergy_ECS_TaskExecution_Role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# --- IAM ROLE FOR ECS TASK (APP PERMISSIONS) ---
resource "aws_iam_role" "ecs_task_role" {
  name = "SaveEnergy_ECS_Task_Role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "ecs_task_policy" {
  name = "SaveEnergy_ECS_Task_Policy"
  role = aws_iam_role.ecs_task_role.id

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

# --- SECURITY GROUP FOR ECS ---
resource "aws_security_group" "ecs_sg" {
  name        = "saveenergy-ecs-sg"
  description = "Allow HTTP traffic to ECS backend"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "HTTP from anywhere"
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "SaveEnergy ECS Security Group"
  }
}

# --- ECS TASK DEFINITION ---
resource "aws_ecs_task_definition" "backend_task" {
  family                   = "saveenergy-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"   # 0.5 vCPU
  memory                   = "1024"  # 1 GB RAM
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "saveenergy-backend"
      image     = "${aws_ecr_repository.backend.repository_url}:latest"
      essential = true

      portMappings = [
        {
          containerPort = 8000
          hostPort      = 8000
          protocol      = "tcp"
        }
      ]

      environment = [
        { name = "DATABASE_URL",                value = "postgresql://postgres:vedant123@${aws_db_instance.postgres_db.endpoint}/greenops" },
        { name = "SECRET_KEY",                  value = "c01668228323c8f4fca1baf758d32de48dba84135e81bf4fa123686701ba52e1" },
        { name = "ALGORITHM",                   value = "HS256" },
        { name = "ACCESS_TOKEN_EXPIRE_MINUTES", value = "10080" },
        { name = "AWS_REGION",                  value = "us-east-1" },
        { name = "AWS_ACCESS_KEY_ID",           value = "REPLACED_FOR_GITHUB" },
        { name = "AWS_SECRET_ACCESS_KEY",       value = "REPLACED_FOR_GITHUB" },
        { name = "AWS_COGNITO_USER_POOL_ID",    value = "us-east-1_GNxIumfQJ" },
        { name = "AWS_COGNITO_CLIENT_ID",       value = "4n86iijadkp6lgcfuagp753oat" },
        { name = "MONITOR_INTERVAL_SECONDS",    value = "15" },
        { name = "IDLE_CPU_THRESHOLD",          value = "5.0" }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.backend_logs.name
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = {
    Name    = "SaveEnergy Backend Task"
    Project = "SaveEnergy"
  }
}

# --- ECS SERVICE (RUNS THE CONTAINER) ---
resource "aws_ecs_service" "backend_service" {
  name            = "saveenergy-backend-service"
  cluster         = aws_ecs_cluster.backend_cluster.id
  task_definition = aws_ecs_task_definition.backend_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.ecs_sg.id]
    assign_public_ip = true  # Required for Fargate in public subnets
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend_tg.arn
    container_name   = "saveenergy-backend"
    container_port   = 8000
  }

  tags = {
    Name    = "SaveEnergy Backend Service"
    Project = "SaveEnergy"
  }
}

# --- OUTPUTS ---
output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.backend_cluster.name
}

output "ecs_service_name" {
  description = "Name of the ECS service"
  value       = aws_ecs_service.backend_service.name
}
