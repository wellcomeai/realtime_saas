"""Notifications endpoints (internal)."""
from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from dependencies import CurrentUser
from modules.notifications import service as notif_service
from modules.notifications.schemas import NotificationPublic, UnreadCount

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationPublic])
async def list_notifications(
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    items = await notif_service.list_notifications(db, user, limit, offset)
    return [NotificationPublic.model_validate(n) for n in items]


@router.get("/unread-count", response_model=UnreadCount)
async def unread_count(
    user: CurrentUser, db: Annotated[AsyncSession, Depends(get_db)]
):
    return UnreadCount(unread=await notif_service.unread_count(db, user))


@router.patch("/{notification_id}/read", response_model=NotificationPublic)
async def mark_read(
    notification_id: UUID,
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    obj = await notif_service.mark_read(db, user, notification_id)
    return NotificationPublic.model_validate(obj)


@router.patch("/read-all", status_code=status.HTTP_204_NO_CONTENT)
async def mark_all_read(
    user: CurrentUser, db: Annotated[AsyncSession, Depends(get_db)]
):
    await notif_service.mark_all_read(db, user)
    return None
