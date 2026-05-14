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
    email_provider: str = Field(default="console", validation_alias="EMAIL_PROVIDER")
    smtp_host: str = Field(default="smtp.qq.com", validation_alias="SMTP_HOST")
    smtp_port: int = Field(default=465, validation_alias="SMTP_PORT")
    smtp_use_ssl: bool = Field(default=True, validation_alias="SMTP_USE_SSL")
    smtp_use_starttls: bool = Field(default=False, validation_alias="SMTP_USE_STARTTLS")
    smtp_username: str = Field(default="", validation_alias="SMTP_USERNAME")
    smtp_password: SecretStr = Field(default=SecretStr(""), validation_alias="SMTP_PASSWORD")
    email_from: str = Field(default="", validation_alias="EMAIL_FROM")
    email_from_name: str = Field(default="Caregiver 护理助手", validation_alias="EMAIL_FROM_NAME")
    email_debug_code: bool = Field(default=True, validation_alias="EMAIL_DEBUG_CODE")
    email_send_timeout_seconds: int = Field(default=10, validation_alias="EMAIL_SEND_TIMEOUT_SECONDS")
    content_moderation_enabled: bool = Field(default=True, validation_alias="CONTENT_MODERATION_ENABLED")
    content_moderation_base_url: str = Field(
        default="https://v1.apizero.cn",
        validation_alias="CONTENT_MODERATION_BASE_URL",
    )
    content_moderation_path: str = Field(default="/api/content-moderation", validation_alias="CONTENT_MODERATION_PATH")
    content_moderation_api_key: SecretStr = Field(default=SecretStr(""), validation_alias="CONTENT_MODERATION_API_KEY")
    content_moderation_timeout_seconds: int = Field(default=10, validation_alias="CONTENT_MODERATION_TIMEOUT_SECONDS")
    cors_origins: list[str] = [
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:5174",
        "http://localhost:5174",
    ]
    cors_origin_regex: str | None = Field(
        default=(
            r"^http://("
            r"localhost|127\.0\.0\.1|"
            r"10\.\d+\.\d+\.\d+|"
            r"192\.168\.\d+\.\d+|"
            r"172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+"
            r"):(5173|5174)$"
        ),
        validation_alias="CORS_ORIGIN_REGEX",
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
