from functools import lru_cache

from pydantic import Field, SecretStr
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
    ai_provider: str = Field(default="deepseek", validation_alias="AI_PROVIDER")
    ai_use_real_model: bool = Field(default=True, validation_alias="AI_USE_REAL_MODEL")
    deepseek_api_key: SecretStr = Field(default=SecretStr(""), validation_alias="DEEPSEEK_API_KEY")
    deepseek_base_url: str = Field(
        default="https://api.deepseek.com",
        validation_alias="DEEPSEEK_BASE_URL",
    )
    deepseek_model: str = Field(default="deepseek-v4-flash", validation_alias="DEEPSEEK_MODEL")
    redis_url: str = Field(default="redis://127.0.0.1:6379/0", validation_alias="REDIS_URL")
    redis_enabled: bool = Field(default=True, validation_alias="REDIS_ENABLED")
    email_code_ttl_seconds: int = Field(default=600, validation_alias="EMAIL_CODE_TTL_SECONDS")
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
