from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class AWSAccountBase(BaseModel):
    name: str
    region: Optional[str] = "us-east-1"
    role_arn: Optional[str] = None
    access_key_id: Optional[str] = None

class AWSAccountCreate(AWSAccountBase):
    secret_access_key: Optional[str] = None

class AWSAccountUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None

class AWSAccount(AWSAccountBase):
    id: int
    owner_id: int
    status: str
    created_at: datetime
    last_synced: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
