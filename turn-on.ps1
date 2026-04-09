# ==============================================================================
# SaveEnergy GreenOps - Boot sequence
# Run this to START all AWS resources and bring the platform online.
# ==============================================================================

Write-Host "🟢 Waking up the PostgreSQL Database..." -ForegroundColor Green
$dbStatus = aws rds describe-db-instances --db-instance-identifier saveenergy-postgres --region us-east-1 --query "DBInstances[0].DBInstanceStatus" --output text 2>$null
if ($dbStatus -eq "stopped") {
    aws rds start-db-instance --db-instance-identifier saveenergy-postgres --region us-east-1 | Out-Null
    Write-Host "✅ Database boot sequence initiated. (AWS takes ~3 minutes to fully warm up)." -ForegroundColor Cyan
} else {
    Write-Host "✅ Database is currently '$dbStatus'. No need to start." -ForegroundColor Cyan
}

Write-Host "🟢 Booting up the Backend API (ECS Fargate)..." -ForegroundColor Green
aws ecs update-service --cluster saveenergy-cluster --service saveenergy-backend-service --desired-count 1 --region us-east-1 | Out-Null
Write-Host "✅ Backend API successfully scaled up." -ForegroundColor Cyan

Write-Host "`nAll compute services have been launched! The dashboard will be fully responsive in about 3 minutes. 🚀" -ForegroundColor Yellow
