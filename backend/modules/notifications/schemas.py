"""Pydantic схемы для notifications."""
from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class NotificationPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    type: str
    title: str
    body: str
    is_read: bool
    notification_metadata: dict | None = Field(default=None, alias="notification_metadata")
    created_at: datetime


class NotificationCreate(BaseModel):
    type: str
    title: str
    body: str
    metadata: dict | None = None


class UnreadCount(BaseModel):
    unread: int
