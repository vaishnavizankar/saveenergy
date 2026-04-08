from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Boolean, JSON
from sqlalchemy.sql import func
from app.db.session import Base
import enum
from datetime import datetime

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    VIEWER = "viewer"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(Enum(UserRole), default=UserRole.VIEWER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class AWSResource(Base):
    __tablename__ = "resources"
    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(String, unique=True, index=True) # e.g. i-12345
    account_id = Column(Integer, ForeignKey("aws_accounts.id"), nullable=True) 
    name = Column(String)
    type = Column(String) # EC2, RDS, S3
    status = Column(String) # Running, Stopped, Idle
    region = Column(String)
    instance_type = Column(String) # t2.micro, db.t3.medium
    cost_per_hour = Column(Float, default=0.0)
    cpu_usage = Column(Float, default=0.0)
    carbon_emissions = Column(Float, default=0.0) # kg CO2e / hour
    last_active = Column(DateTime(timezone=True), server_default=func.now())
    idle_since = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class MetricHistory(Base):
    __tablename__ = "metrics"
    id = Column(Integer, primary_key=True, index=True)
    resource_db_id = Column(Integer, ForeignKey("resources.id"))
    cpu_usage = Column(Float)
    cost = Column(Float)
    carbon_emissions = Column(Float)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class Recommendation(Base):
    __tablename__ = "recommendations"
    id = Column(Integer, primary_key=True, index=True)
    resource_db_id = Column(Integer, ForeignKey("resources.id"))
    action = Column(String) # Stop, Resize, Move
    description = Column(String)
    potential_savings = Column(Float)
    potential_co2_reduction = Column(Float)
    is_applied = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    file_path = Column(String)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(Integer, ForeignKey("users.id"))
