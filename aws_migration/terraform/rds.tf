# ============================================================
# SaveEnergy - Amazon RDS (PostgreSQL) Infrastructure
# ============================================================

# --- SUBNET GROUP ---
# Uses default subnets in the default VPC
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

resource "aws_db_subnet_group" "saveenergy_db_subnet" {
  name       = "saveenergy-db-subnet-group"
  subnet_ids = data.aws_subnets.default.ids

  tags = {
    Name = "SaveEnergy DB Subnet Group"
  }
}

# --- SECURITY GROUP ---
# Allows inbound Postgres traffic on port 5432
resource "aws_security_group" "db_sg" {
  name        = "saveenergy-db-sg"
  description = "Allow PostgreSQL traffic for SaveEnergy RDS"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "PostgreSQL from anywhere (restrict to your IP in production)"
    from_port   = 5432
    to_port     = 5432
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
    Name = "SaveEnergy DB Security Group"
  }
}

# --- RDS POSTGRES INSTANCE ---
resource "aws_db_instance" "postgres_db" {
  identifier          = "saveenergy-postgres"
  allocated_storage   = 20
  storage_type        = "gp2"
  engine              = "postgres"
  engine_version      = "15.7"
  instance_class      = "db.t3.micro" # Free Tier eligible

  db_name  = "greenops"
  username = "postgres"
  password = "vedant123"

  db_subnet_group_name   = aws_db_subnet_group.saveenergy_db_subnet.name
  vpc_security_group_ids = [aws_security_group.db_sg.id]

  publicly_accessible     = true
  multi_az                = false  # Must be false for Free Tier
  skip_final_snapshot     = true
  deletion_protection     = false
  backup_retention_period = 0      # Disable backups to stay in Free Tier
  auto_minor_version_upgrade = false

  parameter_group_name = "default.postgres15"

  tags = {
    Name        = "SaveEnergy-RDS"
    Project     = "SaveEnergy"
    Environment = "production"
  }
}

# --- OUTPUTS ---
# Copy the rds_endpoint value and use it in your backend/.env
output "rds_endpoint" {
  description = "The connection endpoint for the RDS database"
  value       = aws_db_instance.postgres_db.endpoint
}

output "rds_database_url" {
  description = "Full DATABASE_URL ready to paste into backend/.env"
  value       = "postgresql://postgres:vedant123@${aws_db_instance.postgres_db.endpoint}/greenops"
  sensitive   = true
}
