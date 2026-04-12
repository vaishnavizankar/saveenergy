from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import List, Optional
import os

from app.db.session import get_db
from app.models.models import User, AWSResource, MetricHistory, Recommendation, Report, UserRole
from app.utils.reports import generate_sustainability_pdf
from fastapi.responses import FileResponse
from app.models.aws_account import AWSAccount
from app.schemas.aws_account import AWSAccountCreate, AWSAccount as AWSAccountSchema
from app.core.security import verify_password, create_access_token, get_password_hash, encrypt_content, decrypt_content
from app.core.config import settings
from app.services.aws_service import aws_service
from app.services.report_service import report_service
import boto3
import logging

logger = logging.getLogger(__name__)

api_router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

# --- AUTH ENDPOINTS ---

async def get_current_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # PERMANENT BYPASS: Platform is unlocked for instant access
    admin_email = "admin@greenops.com"
    user = db.query(User).filter(User.email == admin_email).first()
    
    # If for some reason the admin user is deleted, create it on the fly
    if not user:
        from app.models.models import UserRole
        user = User(
            email=admin_email, 
            full_name="GreenOps Admin", 
            role=UserRole.ADMIN,
            hashed_password="BYPASS_ACTIVE"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    return user

@api_router.post("/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # 1. Attempt AWS Cognito Authentication if configured
    if settings.COGNITO_CLIENT_ID:
        try:
            client = boto3.client('cognito-idp', region_name=settings.AWS_REGION)
            response = client.initiate_auth(
                ClientId=settings.COGNITO_CLIENT_ID,
                AuthFlow='USER_PASSWORD_AUTH',
                AuthParameters={
                    'USERNAME': form_data.username,
                    'PASSWORD': form_data.password
                }
            )
            # Cognito Auth Success
            # Optionally sync user to local DB or just issue local JWT
            # For this integration, we'll continue using the local JWT for simplicity in session management
            user = db.query(User).filter(User.email == form_data.username).first()
            if not user:
                # Auto-provision user from Cognito on first login
                user = User(email=form_data.username, full_name=form_data.username, role=UserRole.VIEWER)
                db.add(user)
                db.commit()
                db.refresh(user)
            
            access_token = create_access_token(data={"sub": user.email})
            return {"access_token": access_token, "token_type": "bearer", "role": user.role, "method": "AWS_COGNITO"}
            
        except Exception as e:
            logger.warning(f"Cognito Auth failed or not fully set up: {str(e)}. Falling back to local authentication.")

    # 2. Local Database Authentication (Fallback)
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "role": user.role, "method": "LOCAL_DB"}

@api_router.get("/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "created_at": current_user.created_at
    }

@api_router.post("/auth/forgot-password")
async def forgot_password(email: str):
    """Requests a password reset code from AWS Cognito"""
    if not settings.COGNITO_CLIENT_ID:
        # Mock successful dispatch during dev if Cognito not set
        return {"status": "success", "message": "Mock: Password reset code sent to " + email}
    
    try:
        client = boto3.client('cognito-idp', region_name=settings.AWS_REGION)
        client.forgot_password(
            ClientId=settings.COGNITO_CLIENT_ID,
            Username=email
        )
        return {"status": "success", "message": "Password reset code sent to email."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/auth/confirm-reset")
async def confirm_reset(email: str, code: str, new_password: str):
    """Confirms the new password using the verification code from Cognito"""
    if not settings.COGNITO_CLIENT_ID:
        # Mock success in local dev
        return {"status": "success", "message": "Mock: Password reset successful."}
        
    try:
        client = boto3.client('cognito-idp', region_name=settings.AWS_REGION)
        client.confirm_forgot_password(
            ClientId=settings.COGNITO_CLIENT_ID,
            Username=email,
            ConfirmationCode=code,
            Password=new_password
        )
        return {"status": "success", "message": "Password successfully updated."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- RESOURCES ENDPOINTS ---

@api_router.get("/resources")
async def get_resources(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(AWSResource).all()

@api_router.post("/actions/stop")
async def stop_resource(resource_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    res = db.query(AWSResource).filter(AWSResource.resource_id == resource_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    res.status = "stopped"
    res.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {"status": "success", "message": f"Resource {resource_id} stopping..."}

@api_router.post("/actions/start")
async def start_resource(resource_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    res = db.query(AWSResource).filter(AWSResource.resource_id == resource_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    # Reset status to running (or available for RDS)
    res.status = "running" if res.type == "EC2" else "available"
    res.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {"status": "success", "message": f"Resource {resource_id} starting..."}

@api_router.post("/actions/sync")
async def sync_resources(background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.workers.scheduler import sync_aws_inventory
    background_tasks.add_task(sync_aws_inventory)
    return {"status": "success", "message": "Inventory sync started in background!"}

@api_router.delete("/resources/{resource_id}")
async def delete_resource(resource_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    res = db.query(AWSResource).filter(AWSResource.resource_id == resource_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    # Delete associated metric history first
    db.query(MetricHistory).filter(MetricHistory.resource_id == res.id).delete()
    db.delete(res)
    db.commit()
    return {"status": "success", "message": f"Resource {resource_id} permanently removed."}

# --- METRICS & ANALYTICS ---

async def get_user_account_ids(db: Session, current_user: User) -> List[int]:
    accounts = db.query(AWSAccount).filter(AWSAccount.owner_id == current_user.id).all()
    return [acc.id for acc in accounts]

@api_router.get("/metrics/live")
async def get_live_dashboard_metrics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_account_ids = await get_user_account_ids(db, current_user)
    
    # Filter by user's accounts
    query = db.query(AWSResource).filter(AWSResource.account_id.in_(user_account_ids))
    
    resources = query.all()
    total_cost = sum(r.cost_per_hour for r in resources if r.status == 'running')
    total_carbon = sum(r.carbon_emissions for r in resources if r.status == 'running')
    running_count = len([r for r in resources if r.status == 'running'])
    idle_count = len([r for r in resources if r.idle_since is not None])
    
    return {
        "total_cost_h": round(total_cost, 4),
        "total_carbon_h": round(total_carbon, 4),
        "running_resources": running_count,
        "idle_resources": idle_count,
        "timestamp": datetime.now(timezone.utc)
    }

@api_router.get("/metrics/timeseries")
async def get_timeseries_data(range_days: int = 7, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_account_ids = await get_user_account_ids(db, current_user)
    
    cutoff = datetime.now(timezone.utc) - timedelta(days=range_days)
    metrics = db.query(MetricHistory).join(AWSResource).filter(
        AWSResource.account_id.in_(user_account_ids),
        MetricHistory.timestamp >= cutoff
    ).order_by(MetricHistory.timestamp.asc()).all()
    
    return [{
        "time": m.timestamp.isoformat(),
        "cpu": m.cpu_usage,
        "cost": m.cost,
        "carbon": m.carbon_emissions
    } for m in metrics[-100:]]

@api_router.get("/metrics/cost-breakdown")
async def get_cost_breakdown(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_account_ids = await get_user_account_ids(db, current_user)
    
    resources = db.query(AWSResource).filter(AWSResource.account_id.in_(user_account_ids)).all()
    breakdown = {}
    total_hourly = 0.0
    
    for res in resources:
        if res.status in ['running', 'available', 'active']:
            breakdown[res.type] = breakdown.get(res.type, 0) + (res.cost_per_hour or 0)
            total_hourly += (res.cost_per_hour or 0)
    
    return {
        "status": "success",
        "total_hourly_cost": round(total_hourly, 4),
        "breakdown": [{"service": k, "cost": round(v, 4)} for k, v in breakdown.items()],
        "anomalies": aws_service.get_cost_anomalies()
    }

@api_router.get("/metrics/iam-billing")
async def get_iam_billing(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_accounts = db.query(AWSAccount).filter(AWSAccount.owner_id == current_user.id).all()
    if not user_accounts:
        raise HTTPException(status_code=400, detail="No IAM accounts connected.")
    
    total_hourly_cost = 0.0
    for acc in user_accounts:
        try:
            session = aws_service.account_manager.get_session(
                role_arn=acc.role_arn,
                access_key=acc.access_key_id,
                secret_key=acc.secret_access_key,
                region=acc.region
            )
            ce = session.client('ce')
            end_date = datetime.now(timezone.utc).strftime('%Y-%m-%d')
            start_date = (datetime.now(timezone.utc) - timedelta(days=1)).strftime('%Y-%m-%d')
            
            response = ce.get_cost_and_usage(
                TimePeriod={'Start': start_date, 'End': end_date},
                Granularity='DAILY',
                Metrics=['UnblendedCost']
            )
            
            # Convert recent daily unblended cost to hourly
            daily_cost = sum(float(x['Total']['UnblendedCost']['Amount']) for x in response.get('ResultsByTime', []))
            total_hourly_cost += (daily_cost / 24.0)
            
        except Exception as e:
            logger.error(f"Cost fetching failed for IAM {acc.name}: {e}")
            raise HTTPException(status_code=403, detail=f"IAM Permission Error: {str(e)}")
            
    return {"status": "success", "iam_hourly_cost": total_hourly_cost}

# --- RECOMMENDATIONS ---

@api_router.get("/recommendations")
async def get_recommendations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Recommendation).filter(Recommendation.is_applied == False).all()

@api_router.post("/recommendations/{recommendation_id}/apply")
async def apply_recommendation(recommendation_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rec = db.query(Recommendation).filter(Recommendation.id == recommendation_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    
    # 1. Get the resource
    res = db.query(AWSResource).filter(AWSResource.id == rec.resource_db_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Associated resource not found")
    
    # 2. Perform the action (Simulation based on action type)
    if rec.action in ["Stop", "Optimization"]:
        # Simulate stopping the resource
        res.status = "stopped"
        res.idle_since = None
        res.updated_at = datetime.now(timezone.utc)
        logger.info(f"Optimization applied: Stopping resource {res.resource_id}")
    elif rec.action == "Resize":
        # Simulate resizing
        res.instance_type = "t3.nano" # Mock downsizing
        res.updated_at = datetime.now(timezone.utc)
        logger.info(f"Optimization applied: Resizing resource {res.resource_id}")
        
    # 3. Mark recommendation as applied
    rec.is_applied = True
    db.commit()
    
    return {"status": "success", "message": f"Recommendation for {res.name} applied successfully!"}


# --- AWS ACCOUNTS (MULTI-ACCOUNT) ---

@api_router.get("/aws-accounts", response_model=List[AWSAccountSchema])
async def get_aws_accounts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Users only see their own connected accounts
    return db.query(AWSAccount).filter(AWSAccount.owner_id == current_user.id).all()

@api_router.post("/aws-accounts", response_model=AWSAccountSchema)
async def add_aws_account(account: AWSAccountCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Encrypt the secret access key before storing
    encrypted_secret = encrypt_content(account.secret_access_key) if account.secret_access_key else None
    
    new_account = AWSAccount(
        name=account.name,
        role_arn=account.role_arn,
        access_key_id=account.access_key_id,
        secret_access_key=encrypted_secret,
        region=account.region,
        owner_id=current_user.id,
        status="active",
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_account)
    db.commit()
    db.refresh(new_account)
    return new_account

@api_router.delete("/aws-accounts/{account_id}")
async def delete_aws_account(account_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can manage AWS integrations")
    
    account = db.query(AWSAccount).filter(AWSAccount.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
        
    db.delete(account)
    db.commit()
    return {"status": "success", "message": "Account removed successfully"}

# --- REPORT ENDPOINTS ---

@api_router.get("/reports", response_model=List[dict])
async def get_reports(db: Session = Depends(get_db)):
    reports = db.query(Report).order_by(Report.generated_at.desc()).all()
    return [
        {
            "id": r.id,
            "title": r.title,
            "generated_at": r.generated_at,
            "file_path": r.file_path
        } for r in reports
    ]

@api_router.post("/reports/generate")
async def generate_report(title: str = "Sustainability Audit", db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        # 1. Gather Data for Report
        resources = db.query(AWSResource).all()
        total_carbon = sum((r.carbon_emissions or 0.0) for r in resources)
        
        report_data = {
            'title': title,
            'summary': {
                'total_resources': len(resources),
                'total_carbon': total_carbon * 24 * 30, # Estimated Monthly
                'avg_efficiency': 85.0 # Placeholder logic
            },
            'resources': [
                {
                    'name': r.name or "Unknown Resource",
                    'type': r.type or "EC2",
                    'carbon_emissions': r.carbon_emissions or 0.0,
                    'status': r.status or "Active"
                } for r in resources[:20] # Limit to top 20 for PDF size
            ]
        }

        # 2. Generate PDF File
        reports_dir = "/app/reports" # Use absolute path inside container
        if not os.path.exists(reports_dir):
            os.makedirs(reports_dir, exist_ok=True)
            
        # SANITIZE FILENAME: Replace slashes and spaces with underscores
        safe_title = title.replace("/", "_").replace("\\", "_").replace(" ", "_").lower()
        filename = f"{safe_title}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        file_path = os.path.join(reports_dir, filename)
        
        generate_sustainability_pdf(file_path, report_data)

        # 3. Save to Database
        new_report = Report(
            title=title,
            file_path=file_path,
            created_by=current_user.id
        )
        db.add(new_report)
        db.commit()
        db.refresh(new_report)
        
        return {"status": "success", "report_id": new_report.id}
    except Exception as e:
        logger.error(f"REPORT GENERATION FAILED: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")

@api_router.get("/reports/download/{report_id}")
async def download_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report or not os.path.exists(report.file_path):
        raise HTTPException(status_code=404, detail="Report file not found")
        
    return FileResponse(
        report.file_path, 
        media_type='application/pdf', 
        filename=f"{report.title}.pdf"
    )
