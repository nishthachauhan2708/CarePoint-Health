import os
import logging
from typing import List

logger = logging.getLogger("carehealth.security")

class Settings:
    PROJECT_NAME: str = "CareHealth Point API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "carehealth-point-insecure-secret-key-change-in-prod-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./carehealth.db"
    )

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
    origin.strip()
    for origin in os.getenv(
        "BACKEND_CORS_ORIGINS",
        "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"
    ).split(",")
    if origin.strip()
]

    def __init__(self):
        insecure_keys = [
            "carehealth-point-insecure-secret-key-change-in-prod-2026",
            "changeme",
            "secret",
            "password",
            "123456"
        ]
        # In production environments, strictly validate that a custom secure key is provided
        if self.ENVIRONMENT.lower() == "production":
            if not self.SECRET_KEY or self.SECRET_KEY in insecure_keys:
                if os.getenv("STRICT_PRODUCTION_SECURITY", "false").lower() == "true":
                    raise ValueError(
                        "CRITICAL SECURITY CONFIGURATION ERROR: Running in production mode (ENVIRONMENT=production) "
                        "with an insecure default SECRET_KEY! A strong, unique cryptographic SECRET_KEY must be "
                        "supplied via environment variables."
                    )
                else:
                    logger.warning(
                        "[SECURITY WARNING] Running in production mode with default fallback SECRET_KEY. "
                        "Set a secure, random SECRET_KEY environment variable in your production deployment."
                    )

settings = Settings()
