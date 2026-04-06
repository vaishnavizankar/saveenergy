from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import List, Optional
import os

from app.db.session import get_db
from app.models.models import User, AWSResource, MetricHistory, Recommendation, Report, UserRole
from app.core.security import verify_password, create_access_token, get_password_hash
from app.core.config import settings
from app.services.aws_service import aws_service
from app.services.report_service import report_service

api_router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# --- AUTH ENDPOINTS ---

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@api_router.post("/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

@api_router.get("/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "created_at": current_user.created_at
    }

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

# --- METRICS & ANALYTICS ---

@api_router.get("/metrics/live")
async def get_live_dashboard_metrics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Total Running Stats
    total_cost = sum(r.cost_per_hour for r in db.query(AWSResource).filter(AWSResource.status == 'running').all())
    total_carbon = sum(r.carbon_emissions for r in db.query(AWSResource).filter(AWSResource.status == 'running').all())
    running_count = db.query(AWSResource).filter(AWSResource.status == 'running').count()
    idle_count = db.query(AWSResource).filter(AWSResource.idle_since != None).count()
    
    return {
        "total_cost_h": round(total_cost, 4),
        "total_carbon_h": round(total_carbon, 4),
        "running_resources": running_count,
        "idle_resources": idle_count,
        "timestamp": datetime.now(timezone.utc)
    }

@api_router.get("/metrics/timeseries")
async def get_timeseries_data(range_days: int = 7, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Simple history aggregator logic (for charts)
    cutoff = datetime.now(timezone.utc) - timedelta(days=range_days)
    metrics = db.query(MetricHistory).filter(MetricHistory.timestamp >= cutoff).order_by(MetricHistory.timestamp.asc()).all()
    
    # Process into daily/hourly points for charting
    # (Simplified: just raw points)
    return [{
        "time": m.timestamp.isoformat(),
        "cpu": m.cpu_usage,
        "cost": m.cost,
        "carbon": m.carbon_emissions
    } for m in metrics[-100:]] # limit for MVP

# --- RECOMMENDATIONS ---

@api_router.get("/recommendations")
async def get_recommendations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Recommendation).filter(Recommendation.is_applied == False).all()

# --- REPORTS ---

@api_router.post("/reports/generate")
async def generate_report(title: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Gather real-time data for the report
    resources = db.query(AWSResource).all()
    running_resources = [r for r in resources if r.status == 'running']
    
    data = {
        "total_cost": sum(r.cost_per_hour for r in running_resources),
        "total_carbon": sum(r.carbon_emissions for r in running_resources),
        "running_count": len(running_resources),
        "idle_count": db.query(AWSResource).filter(AWSResource.idle_since != None).count(),
        "resources": resources,
        "recommendations": db.query(Recommendation).filter(Recommendation.is_applied == False).limit(5).all()
    }
    
    filename = f"{title.lower().replace(' ', '_')}_{int(datetime.now().timestamp())}.pdf"
    
    try:
        file_path = report_service.generate_sustainability_report(title, data, filename)
        
        new_report = Report(
            title=title,
            file_path=file_path,
            generated_at=datetime.now(timezone.utc),
            created_by=current_user.id
        )
        db.add(new_report)
        db.commit()
        return {"id": new_report.id, "message": "Report generated successfully", "file": filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")

@api_router.get("/reports")
async def get_reports(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Report).all()
