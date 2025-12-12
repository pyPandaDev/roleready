"""
Application Settings and Configuration
Centralized configuration management for the RoleReady backend.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional
import os


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    Uses pydantic-settings for validation and type coercion.
    """
    
    # Firebase
    firebase_service_account_path: str = "./firebase-service-account.json"
    
    # Gemini AI
    gemini_api_key: str = ""
    
    # Server
    port: int = 8000
    debug: bool = False
    frontend_url: str = "http://localhost:5173"
    
    # Admin Panel
    admin_email: str = ""
    admin_password: str = ""
    jwt_secret: str = ""
    jwt_algorithm: str = "HS256"
    token_expiry_hours: int = 24
    
    # Rate Limiting
    rate_limit_default: str = "100/minute"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    Uses lru_cache to avoid reading env file on every call.
    """
    return Settings()


# Convenience access
settings = get_settings()
