import sqlalchemy as sa
import logging
from sqlalchemy.exc import ProgrammingError, OperationalError

logger = logging.getLogger("wellcome-ai")

def migrate_database(engine):
    """Выполняет необходимые миграции для базы данных"""
    logger.info("Запуск миграции базы данных...")

    # Создаем соединение с базой данных
    connection = engine.connect()
    transaction = connection.begin()

    try:
        # Миграция 1: Добавление поля openai_assistant_id в assistant_configs
        logger.info("Проверка наличия столбца openai_assistant_id...")
        
        # Проверяем, существует ли уже столбец openai_assistant_id
        has_column = False
        try:
            connection.execute(sa.text(
                "SELECT openai_assistant_id FROM assistant_configs LIMIT 1"
            ))
            has_column = True
            logger.info("Столбец openai_assistant_id уже существует")
        except (ProgrammingError, OperationalError):
            logger.info("Столбец openai_assistant_id не найден, добавляем...")
            has_column = False
        
        # Если столбца нет, добавляем его
        if not has_column:
            connection.execute(sa.text(
                "ALTER TABLE assistant_configs ADD COLUMN openai_assistant_id VARCHAR"
            ))
            logger.info("Столбец openai_assistant_id успешно добавлен")
        
        # Миграция 2: Создание таблицы file_uploads, если она не существует
        logger.info("Проверка наличия таблицы file_uploads...")
        
        # Проверяем, существует ли таблица file_uploads
        table_exists = False
        try:
            connection.execute(sa.text(
                "SELECT 1 FROM file_uploads LIMIT 1"
            ))
            table_exists = True
            logger.info("Таблица file_uploads уже существует")
        except (ProgrammingError, OperationalError):
            logger.info("Таблица file_uploads не найдена, создаем...")
            table_exists = False
        
        # Если таблицы нет, создаем ее
        if not table_exists:
            connection.execute(sa.text("""
                CREATE TABLE file_uploads (
                    id UUID PRIMARY KEY,
                    assistant_id UUID NOT NULL REFERENCES assistant_configs(id) ON DELETE CASCADE,
                    name VARCHAR NOT NULL,
                    size INTEGER NOT NULL,
                    mime_type VARCHAR,
                    openai_file_id VARCHAR NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            """))
            logger.info("Таблица file_uploads успешно создана")
        
        # Фиксируем транзакцию
        transaction.commit()
        logger.info("Миграция базы данных успешно завершена")
        
    except Exception as e:
        # Если произошла ошибка, откатываем транзакцию
        transaction.rollback()
        logger.error(f"Ошибка при миграции базы данных: {str(e)}")
        raise
    finally:
        # Закрываем соединение
        connection.close()
