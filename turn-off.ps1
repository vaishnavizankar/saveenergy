# ==============================================================================
# SaveEnergy GreenOps - Suspension Script
# Run this to STOP costly AWS resources when not in use.
# ==============================================================================

Write-Host "--- Shutting down the Backend API (ECS Fargate) to stop compute billing..." -ForegroundColor Red
aws ecs update-service --cluster saveenergy-cluster --service saveenergy-backend-service --desired-count 0 --region us-east-1
Write-Host "OK: Backend API successfully scaled down to 0." -ForegroundColor Green

Write-Host "--- Hibernating the PostgreSQL Database..." -ForegroundColor Red
aws rds stop-db-instance --db-instance-identifier saveenergy-postgres --region us-east-1
Write-Host "OK: Database sequence triggered. Data is saved but hourly billing is stopped." -ForegroundColor Green

Write-Host "`nAll major compute services have been suspended. Goodnight!" -ForegroundColor Cyan
