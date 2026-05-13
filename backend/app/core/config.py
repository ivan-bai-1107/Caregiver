from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "医疗照顾者的客户端系统设计与实现 API"
    api_prefix: str = "/api"
    database_url: str = Field(
        default="postgresql+psycopg://caregiver:caregiver123@127.0.0.1:5432/caregiver_system",
        validation_alias="DATABASE_URL",
    )
    jwt_secret_key: str = Field(
        default="change-me-in-local-env",
        validation_alias="JWT_SECRET_KEY",
    )
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7
    refresh_token_expire_minutes: int = 60 * 24 * 30
    cors_origins: list[str] = [
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:5174",
        "http://localhost:5174",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
