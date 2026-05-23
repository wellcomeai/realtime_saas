"""Глобальные настройки приложения.

Все настройки читаются из .env через pydantic-settings.
Redis опционален: если REDIS_URL пустой — модули используют
PostgreSQL fallback (см. modules/rate_limit/service.py).
"""
from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # === Database ===
    database_url: str = Field(
        default="postgresql+asyncpg://opensaas:password@localhost:5432/opensaas_db"
    )

    # === Redis (опционально) ===
    redis_url: str = Field(default="")

    # === JWT ===
    secret_key: str = Field(
        default="change-me-in-production-this-must-be-at-least-32-chars"
    )
    algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=30)
    refresh_token_expire_days: int = Field(default=30)

    # === Admin ===
    admin_email: str = Field(default="admin@example.com")
    admin_password: str = Field(default="change_in_production")

    # === SMTP ===
    smtp_host: str = Field(default="smtp.gmail.com")
    smtp_port: int = Field(default=587)
    smtp_user: str = Field(default="")
    smtp_password: str = Field(default="")
    smtp_from_email: str = Field(default="noreply@example.com")
    smtp_from_name: str = Field(default="OpenSaaS")
    smtp_use_tls: bool = Field(default=True)

    # === Робокасса ===
    robokassa_merchant_login: str = Field(default="")
    robokassa_password1: str = Field(default="")
    robokassa_password2: str = Field(default="")
    robokassa_test_mode: bool = Field(default=True)

    # === Stripe ===
    stripe_secret_key: str = Field(default="")
    stripe_webhook_secret: str = Field(default="")
    stripe_enabled: bool = Field(default=False)

    # === App ===
    app_name: str = Field(default="OpenSaaS")
    app_url: str = Field(default="http://localhost:3000")
    api_url: str = Field(default="http://localhost:8000")
    environment: str = Field(default="development")
    cors_origins: str = Field(default="http://localhost:3000")

    # === Бизнес-логика ===
    trial_days: int = Field(default=3)
    referral_commission_percent: int = Field(default=20)

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def redis_enabled(self) -> bool:
        return bool(self.redis_url)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
