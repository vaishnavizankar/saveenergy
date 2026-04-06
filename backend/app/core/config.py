import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "GreenOps"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "7b0b6d859a7f34c26a978f5a5e3c7d6e")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # AWS Config
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    AWS_ACCESS_KEY_ID: Optional[str] = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: Optional[str] = os.getenv("AWS_SECRET_ACCESS_KEY")
    
    # DATABASE Config
    SQLALCHEMY_DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/greenops")
    
    # Carbon Emission Factors (CO2e kg / kWh) - Mock values for demonstration
    CARBON_FACTORS: dict = {
        "us-east-1": 0.4,
        "us-west-2": 0.3,
        "eu-west-1": 0.25,
        "ap-southeast-1": 0.45,
    }

    class Config:
        case_sensitive = True

settings = Settings()
