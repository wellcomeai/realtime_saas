"""Demo notes endpoints (internal). Удалить когда модуль не нужен."""
from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from dependencies import CurrentUser
from modules.demo_notes import service as notes_service
from modules.demo_notes.schemas import NoteCreate, NotePublic, NoteUpdate

router = APIRouter(prefix="/demo/notes", tags=["demo-notes"])


@router.get("", response_model=list[NotePublic])
async def list_notes(
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    items = await notes_service.list_notes(db, user, limit, offset)
    return [NotePublic.model_validate(n) for n in items]


@router.post("", response_model=NotePublic, status_code=status.HTTP_201_CREATED)
async def create_note(
    payload: NoteCreate,
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    obj = await notes_service.create_note(db, user, payload)
    return NotePublic.model_validate(obj)


@router.get("/{note_id}", response_model=NotePublic)
async def get_note(
    note_id: UUID,
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    obj = await notes_service.get_note(db, user, note_id)
    return NotePublic.model_validate(obj)


@router.patch("/{note_id}", response_model=NotePublic)
async def update_note(
    note_id: UUID,
    payload: NoteUpdate,
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    obj = await notes_service.update_note(db, user, note_id, payload)
    return NotePublic.model_validate(obj)


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: UUID,
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    await notes_service.delete_note(db, user, note_id)
    return None
