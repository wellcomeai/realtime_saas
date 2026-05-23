# notifications — контекст

## Назначение

In-app уведомления (звоночек в правом верхнем углу). Не email,
не push — простой список в БД с прочитан/не прочитан.

## Файлы

- `models.py` — Notification (user_id, type, title, body, is_read, metadata)
- `schemas.py` — Pydantic схемы
- `service.py` — create_notification, list_notifications, mark_read, ...

## Типы (`type`)

- `payment_success`
- `trial_ending` / `trial_expired`
- `referral_earned` / `payout_approved`
- `subscription_cancelled`

Можно расширять — поле `type` свободное.

## Endpoints

```
GET   /api/v1/notifications?limit=20&offset=0
GET   /api/v1/notifications/unread-count
PATCH /api/v1/notifications/{id}/read
PATCH /api/v1/notifications/read-all
```

## Бизнес-логика

- Создаются другими модулями (billing webhooks, referrals).
- Защита: пользователь видит только свои (`user_id == current_user.id`).

## Зависимости

- `modules.auth.models.User`

## Как расширить

- **Push (web/mobile)** — добавить `device_tokens` таблицу + FCM/APNS.
- **Группировка**: добавить поле `group_key`, при чтении группировать
  по нему похожие уведомления.
