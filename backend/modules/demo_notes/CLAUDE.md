# demo_notes — контекст

## Назначение

**Демо-модуль** — пример "как добавить свой модуль" для разработчиков,
использующих OpenSaaS как шаблон.

Удаляется когда не нужен.

## Что показывает

- Модель SQLAlchemy с `user_id` (привязка к пользователю)
- CRUD операции в `service.py`
- Pydantic схемы в `schemas.py`
- FastAPI роутер с правильными зависимостями
- **Защита данных**: пользователь видит ТОЛЬКО свои заметки
- Пагинация (`limit`, `offset`)

## Файлы

- `models.py` — DemoNote (id, user_id, title, content, created_at, updated_at)
- `schemas.py` — NoteCreate, NoteUpdate, NotePublic
- `service.py` — list_notes, get_note, create_note, update_note, delete_note
- Роутер: `backend/api/v1/internal/demo_notes.py`

## Endpoints

```
GET    /api/v1/demo/notes
POST   /api/v1/demo/notes
GET    /api/v1/demo/notes/{id}
PATCH  /api/v1/demo/notes/{id}
DELETE /api/v1/demo/notes/{id}
```

## Защита данных (важный паттерн)

В `service.get_note` всегда фильтр по `user_id`:

```python
if obj is None or obj.user_id != user.id:
    raise HTTPException(status_code=404, detail="Note not found")
```

Так же в `list_notes` — `where(DemoNote.user_id == user.id)`.

**Никогда** не возвращайте данные без этой проверки.

## Как удалить демо-модуль

1. `rm -rf backend/modules/demo_notes/`
2. `rm backend/api/v1/internal/demo_notes.py`
3. Убрать импорт и `include_router` из `backend/api/v1/router.py`
4. Создать миграцию: `alembic revision -m "drop_demo_notes"` с `op.drop_table("demo_notes")`
5. `rm frontend/src/app/(dashboard)/demo/page.tsx`
6. Убрать ссылку "Demo" из `frontend/src/components/layout/Sidebar.tsx`
7. Убрать `frontend/src/api/demoNotes.ts` если есть
