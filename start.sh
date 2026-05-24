#!/bin/bash
set -e
echo "==> Running migrations..."
cd /app/backend
alembic upgrade head
python scripts/create_admin.py
echo "==> Starting services..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/app.conf
