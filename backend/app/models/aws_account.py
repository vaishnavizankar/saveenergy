from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from app.db.session import Base
from datetime import datetime, timezone

class AWSAccount(Base):
    __tablename__ = "aws_accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    
    # User ownership
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    # Option A: Direct Keys (Stored Encrypted)
    access_key_id = Column(String, nullable=True)
    secret_access_key = Column(String, nullable=True)
    region = Column(String, default="us-east-1")
    
    # Option B: Role Assumption
    role_arn = Column(String, unique=True, nullable=True)
    
    status = Column(String, default="active") # active, error, pending
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_synced = Column(DateTime, nullable=True)
