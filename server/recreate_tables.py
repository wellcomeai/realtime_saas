import os
import logging
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("database-reset")

# Загружаем переменные окружения
load_dotenv()

def recreate_tables():
    # Получаем URL для подключения к PostgreSQL
    DATABASE_URL = os.getenv('DATABASE_URL')
    
    if not DATABASE_URL:
        logger.error("Не указан DATABASE_URL в .env файле")
        return
    
    try:
        # Создаем подключение к базе данных
        engine = create_engine(DATABASE_URL)
        connection = engine.connect()
        
        # Начинаем транзакцию
        transaction = connection.begin()
        
        try:
            logger.info("Удаление существующих таблиц...")
            
            # Удаляем таблицы в правильном порядке из-за ограничений внешних ключей
            # 1. Сначала удаляем зависимые таблицы
            connection.execute(text("DROP TABLE IF EXISTS conversations CASCADE"))
            connection.execute(text("DROP TABLE IF EXISTS file_uploads CASCADE"))
            # 2. Затем удаляем основные таблицы
            connection.execute(text("DROP TABLE IF EXISTS assistant_configs CASCADE"))
            connection.execute(text("DROP TABLE IF EXISTS users CASCADE"))
            
            logger.info("Все таблицы успешно удалены")
            
            # Создаем таблицу users
            logger.info("Создание таблицы users...")
            connection.execute(text("""
                CREATE TABLE users (
                    id UUID PRIMARY KEY,
                    email VARCHAR UNIQUE NOT NULL,
                    password_hash VARCHAR NOT NULL,
                    first_name VARCHAR,
                    last_name VARCHAR,
                    company_name VARCHAR,
                    openai_api_key VARCHAR,
                    subscription_plan VARCHAR DEFAULT 'free',
                    google_sheets_token JSONB,
                    google_sheets_authorized BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE
                )
            """))
            
            # Создаем таблицу assistant_configs с новым полем openai_assistant_id
            logger.info("Создание таблицы assistant_configs...")
            connection.execute(text("""
                CREATE TABLE assistant_configs (
                    id UUID PRIMARY KEY,
                    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    name VARCHAR NOT NULL,
                    description VARCHAR,
                    system_prompt TEXT NOT NULL,
                    voice VARCHAR DEFAULT 'alloy',
                    language VARCHAR DEFAULT 'ru',
                    google_sheet_id VARCHAR,
                    functions JSONB,
                    is_active BOOLEAN DEFAULT TRUE,
                    openai_assistant_id VARCHAR,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE
                )
            """))
            
            # Создаем таблицу conversations
            logger.info("Создание таблицы conversations...")
            connection.execute(text("""
                CREATE TABLE conversations (
                    id UUID PRIMARY KEY,
                    assistant_id UUID NOT NULL REFERENCES assistant_configs(id) ON DELETE CASCADE,
                    user_message TEXT,
                    assistant_message TEXT,
                    duration_seconds FLOAT,
                    client_info JSONB,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            """))
            
            # Создаем таблицу file_uploads
            logger.info("Создание таблицы file_uploads...")
            connection.execute(text("""
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
            
            # Фиксируем транзакцию
            transaction.commit()
            logger.info("Все таблицы успешно созданы! База данных готова к использованию.")
            
        except Exception as e:
            # Если произошла ошибка, откатываем транзакцию
            transaction.rollback()
            logger.error(f"Ошибка при пересоздании таблиц: {str(e)}")
            raise
        finally:
            # Закрываем соединение
            connection.close()
            
    except Exception as e:
        logger.error(f"Ошибка при подключении к базе данных: {str(e)}")

if __name__ == "__main__":
    recreate_tables()
