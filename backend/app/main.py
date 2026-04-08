from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import engine, Base, SessionLocal
from app.models.models import User, AWSResource, UserRole
from app.models.aws_account import AWSAccount
from app.core.security import get_password_hash
from app.api.api import api_router
from app.websocket.manager import manager
from app.workers.scheduler import start_scheduler
from datetime import datetime, timezone
import uvicorn

# Initialize Database
Base.metadata.create_all(bind=engine)

app = FastAPI(title="GreenOps API", version="1.0.0")

@app.get("/")
async def root():
    return {"message": "SaveEnergy API is running", "version": "1.0.0"}

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Start background workers on startup
@app.on_event("startup")
async def on_startup():
    # Initial Admin Setup (for demonstration)
    db = SessionLocal()
    admin = db.query(User).filter(User.email == "admin@greenops.com").first()
    if not admin:
        print("DEBUG: Creating admin user")
        admin_user = User(
            email="admin@greenops.com",
            hashed_password=get_password_hash("admin123"),
            full_name="GreenOps Admin",
            role=UserRole.ADMIN
        )
        db.add(admin_user)
        db.commit()
    
    # Pre-populate some Mock Resources if empty
    res_count = db.query(AWSResource).count()
    if res_count == 0:
        from app.services.aws_service import aws_service
        mock_data = aws_service.get_resources()
        for res in mock_data:
            new_res = AWSResource(
                resource_id=res['id'],
                name=res['name'],
                type=res['type'],
                status=res['status'],
                instance_type=res['instance_type'],
                region=res['region'],
                cost_per_hour=res['cost_per_hour'],
                last_active=datetime.now(timezone.utc)
            )
            db.add(new_res)
        db.commit()
    db.close()
    
    # Start the monitoring scheduler
    start_scheduler()

# WebSocket Endpoint
@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Include API Routes
app.include_router(api_router, prefix="/api/v1")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
