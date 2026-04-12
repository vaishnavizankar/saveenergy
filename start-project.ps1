# ==============================================================================
# SaveEnergy GreenOps - Full Project Launch Script
# ==============================================================================
# This script:
# 1. Starts AWS RDS and ECS services (via turn-on.ps1)
# 2. Builds the React frontend
# 3. Deploys the frontend to S3 for CloudFront distribution
# ==============================================================================

$ROOT = Get-Location
$FRONTEND_PATH = Join-Path $ROOT "frontend"
$FRONTEND_BUCKET = "saveenergy-frontend-production-609a825f"
$CLOUDFRONT_URL = "https://d35s9i1zx5q36s.cloudfront.net"

Write-Host "`n🚀 Starting SaveEnergy Infrastructure..." -ForegroundColor Cyan

# 1. Start AWS Services
.\turn-on.ps1

Write-Host "`n📦 Preparing Frontend for Cloud Deployment..." -ForegroundColor Yellow

# 2. Build Frontend
Write-Host "🔨 Compiling assets in $FRONTEND_PATH (npm build)..." -ForegroundColor Magenta
npm run build --prefix "$FRONTEND_PATH"

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Error: Frontend build failed." -ForegroundColor Red
    exit 1
}

# 3. Deploy to S3
Set-Location $FRONTEND_PATH
Write-Host "🌐 Syncing build to S3 bucket: $FRONTEND_BUCKET..." -ForegroundColor Cyan
aws s3 sync dist/ "s3://$FRONTEND_BUCKET" --delete --cache-control "max-age=0, no-cache, no-store, must-revalidate"

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Error: S3 sync failed. Check your AWS permissions." -ForegroundColor Red
    Set-Location $ROOT
    exit 1
}

Set-Location $ROOT

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "  ✅ PROJECT IS ONLINE AND SYNCED TO AWS DOMAIN!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  Visit your platform here:" -ForegroundColor White
Write-Host "  $CLOUDFRONT_URL" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  Note: Services may take ~3 minutes to fully warm up." -ForegroundColor Yellow
Write-Host ""
