# ============================================================
# SaveEnergy - Deploy Backend to AWS ECR + App Runner
# Run this script from: c:\Users\dell\saveenergy
# ============================================================

param(
    [string]$Region = "us-east-1",
    [string]$AccountId = "117030212836",
    [string]$RepoName = "saveenergy-backend",
    [string]$Tag = "latest"
)

$ECR_URL = "$AccountId.dkr.ecr.$Region.amazonaws.com"
$IMAGE_URI = "${ECR_URL}/${RepoName}:${Tag}"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SaveEnergy - AWS Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Authenticate Docker with ECR
Write-Host "[1/4] Logging into Amazon ECR..." -ForegroundColor Yellow
aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin $ECR_URL

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: ECR login failed. Check your AWS credentials." -ForegroundColor Red
    exit 1
}
Write-Host "      ECR login successful." -ForegroundColor Green

# Step 2: Build the Docker image
Write-Host ""
Write-Host "[2/4] Building backend Docker image..." -ForegroundColor Yellow
docker build -t "${RepoName}:${Tag}" ./backend

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker build failed." -ForegroundColor Red
    exit 1
}
Write-Host "      Build successful." -ForegroundColor Green

# Step 3: Tag the image for ECR
Write-Host ""
Write-Host "[3/4] Tagging image for ECR..." -ForegroundColor Yellow
docker tag "${RepoName}:${Tag}" $IMAGE_URI
Write-Host "      Tagged as: $IMAGE_URI" -ForegroundColor Green

# Step 4: Push to ECR
Write-Host ""
Write-Host "[4/4] Pushing image to Amazon ECR..." -ForegroundColor Yellow
docker push $IMAGE_URI

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker push failed." -ForegroundColor Red
    exit 1
}
Write-Host "      Push successful!" -ForegroundColor Green

# Done
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Image pushed to: $IMAGE_URI" -ForegroundColor White
Write-Host ""
Write-Host "  Next step: Run 'terraform apply' in" -ForegroundColor White
Write-Host "  aws_migration/terraform/ to deploy" -ForegroundColor White
Write-Host "  or trigger a redeployment on App Runner." -ForegroundColor White
Write-Host ""
