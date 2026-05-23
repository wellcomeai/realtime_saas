"""Бизнес-логика уведомлений."""
from __future__ import annotations

from typing import Sequence
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from modules.auth.models import User
from modules.notifications.models import Notification
from modules.notifications.schemas import NotificationCreate


async def create_notification(
    db: AsyncSession, user_id: UUID, payload: NotificationCreate
) -> Notification:
    obj = Notification(
        user_id=user_id,
        type=payload.type,
        title=payload.title,
        body=payload.body,
        notification_metadata=payload.metadata,
    )
    db.add(obj)
    await db.flush()
    return obj


async def list_notifications(
    db: AsyncSession, user: User, limit: int = 20, offset: int = 0
) -> Sequence[Notification]:
    return (
        await db.scalars(
            select(Notification)
            .where(Notification.user_id == user.id)
            .order_by(Notification.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
    ).all()


async def unread_count(db: AsyncSession, user: User) -> int:
    cnt = await db.scalar(
        select(func.count(Notification.id)).where(
            Notification.user_id == user.id, Notification.is_read == False  # noqa: E712
        )
    )
    return int(cnt or 0)


async def mark_read(db: AsyncSession, user: User, notification_id: UUID) -> Notification:
    obj = await db.get(Notification, notification_id)
    if obj is None or obj.user_id != user.id:
        raise HTTPException(status_code=404, detail="Notification not found")
    obj.is_read = True
    await db.commit()
    return obj


async def mark_all_read(db: AsyncSession, user: User) -> int:
    result = await db.execute(
        update(Notification)
        .where(
            Notification.user_id == user.id, Notification.is_read == False  # noqa: E712
        )
        .values(is_read=True)
    )
    await db.commit()
    return result.rowcount or 0
