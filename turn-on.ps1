# ==============================================================================
# SaveEnergy GreenOps - Boot sequence
# Run this to START all AWS resources and bring the platform online.
# ==============================================================================

Write-Host "🟢 Waking up the PostgreSQL Database..." -ForegroundColor Green
aws rds start-db-instance --db-instance-identifier saveenergy-postgres --region us-east-1 | Out-Null
Write-Host "✅ Database boot sequence initiated. (AWS takes ~3 minutes to fully warm up)." -ForegroundColor Cyan

Write-Host "🟢 Booting up the Backend API (ECS Fargate)..." -ForegroundColor Green
aws ecs update-service --cluster saveenergy-cluster --service saveenergy-backend-service --desired-count 1 --region us-east-1 | Out-Null
Write-Host "✅ Backend API successfully scaled up." -ForegroundColor Cyan

Write-Host "`nAll compute services have been launched! The dashboard will be fully responsive in about 3 minutes. 🚀" -ForegroundColor Yellow
