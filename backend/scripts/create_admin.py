"""Создаёт админа из ADMIN_EMAIL/ADMIN_PASSWORD при первом запуске.

Идемпотентен — если админ уже существует, не делает ничего.
Также создаёт дефолтные планы и UserProfile для админа.
"""
from __future__ import annotations

import asyncio
import sys
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select  # noqa: E402

from config import settings  # noqa: E402
from database import AsyncSessionLocal  # noqa: E402
from modules.auth.models import User, UserProfile, UserRole  # noqa: E402
from modules.auth.utils import hash_password  # noqa: E402
from modules.billing.models import (  # noqa: E402
    Plan,
    PlanInterval,
    Subscription,
    SubscriptionStatus,
)


DEFAULT_PLANS = [
    {
        "name": "Basic",
        "price": Decimal("990"),
        "currency": "RUB",
        "interval": PlanInterval.MONTH,
        "features": ["До 100 запросов в день", "Email поддержка", "Базовая аналитика"],
        "sort_order": 1,
    },
    {
        "name": "Pro",
        "price": Decimal("2990"),
        "currency": "RUB",
        "interval": PlanInterval.MONTH,
        "features": [
            "Безлимит запросов",
            "Приоритетная поддержка",
            "Расширенная аналитика",
            "API доступ",
        ],
        "sort_order": 2,
    },
]


async def main() -> None:
    async with AsyncSessionLocal() as db:
        # Планы
        existing_plans = (await db.scalars(select(Plan))).all()
        if not existing_plans:
            for p in DEFAULT_PLANS:
                db.add(Plan(**p))
            await db.commit()
            print(f"[create_admin] Created {len(DEFAULT_PLANS)} default plans")

        # Админ
        admin = await db.scalar(
            select(User).where(User.email == settings.admin_email)
        )
        if admin:
            print(f"[create_admin] Admin {settings.admin_email} already exists")
            return

        admin = User(
            email=settings.admin_email,
            hashed_password=hash_password(settings.admin_password),
            role=UserRole.ADMIN,
            is_active=True,
            is_email_verified=True,
            trial_ends_at=datetime.now(timezone.utc)
            + timedelta(days=365 * 100),
        )
        db.add(admin)
        await db.flush()
        db.add(UserProfile(user_id=admin.id, first_name="Admin"))
        db.add(
            Subscription(
                user_id=admin.id,
                status=SubscriptionStatus.ACTIVE,
                current_period_start=datetime.now(timezone.utc),
                current_period_end=datetime.now(timezone.utc)
                + timedelta(days=365 * 100),
            )
        )
        await db.commit()
        print(f"[create_admin] Admin {settings.admin_email} created")


if __name__ == "__main__":
    asyncio.run(main())
