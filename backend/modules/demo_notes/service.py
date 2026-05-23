"""CRUD для демо-заметок. Защита: пользователь видит только свои."""
from __future__ import annotations

from typing import Sequence
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from modules.auth.models import User
from modules.demo_notes.models import DemoNote
from modules.demo_notes.schemas import NoteCreate, NoteUpdate


async def list_notes(
    db: AsyncSession, user: User, limit: int = 50, offset: int = 0
) -> Sequence[DemoNote]:
    return (
        await db.scalars(
            select(DemoNote)
            .where(DemoNote.user_id == user.id)
            .order_by(DemoNote.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
    ).all()


async def get_note(db: AsyncSession, user: User, note_id: UUID) -> DemoNote:
    obj = await db.get(DemoNote, note_id)
    if obj is None or obj.user_id != user.id:
        raise HTTPException(status_code=404, detail="Note not found")
    return obj


async def create_note(
    db: AsyncSession, user: User, payload: NoteCreate
) -> DemoNote:
    obj = DemoNote(user_id=user.id, title=payload.title, content=payload.content)
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj


async def update_note(
    db: AsyncSession, user: User, note_id: UUID, payload: NoteUpdate
) -> DemoNote:
    obj = await get_note(db, user, note_id)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    await db.commit()
    await db.refresh(obj)
    return obj


async def delete_note(db: AsyncSession, user: User, note_id: UUID) -> None:
    obj = await get_note(db, user, note_id)
    await db.delete(obj)
    await db.commit()
