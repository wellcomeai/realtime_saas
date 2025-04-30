import os
import json
import base64
import asyncio
import logging
import traceback
import uuid
import time
from datetime import datetime
from typing import Dict, Optional, List, Any, Union
import httpx

from fastapi import FastAPI, WebSocket, Request, WebSocketDisconnect, HTTPException, Depends, Header, Body, UploadFile, File, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from pydantic import BaseModel, Field, validator

# Для PostgreSQL и ORM
from sqlalchemy import create_engine, Column, String, Boolean, JSON, ForeignKey, Float, DateTime, Text, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.dialects.postgresql import UUID
import sqlalchemy as sa
from sqlalchemy.sql import func

# Для WebSocket
import websockets

# Для JWT
import jwt
from jwt.exceptions import PyJWTError
from datetime import timedelta

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("wellcome-ai")
logger.setLevel(logging.DEBUG)

# Загружаем переменные окружения
load_dotenv()

# Конфигурация приложения
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
PORT = int(os.getenv('PORT', 5050))
REALTIME_WS_URL = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01'
DATABASE_URL = os.getenv('DATABASE_URL')  # URL для PostgreSQL на Render
DEFAULT_SYSTEM_MESSAGE = (
    "Ты умный голосовой помощник. Отвечай на вопросы пользователя коротко, "
    "информативно и с небольшой ноткой юмора, когда это уместно. Стремись быть полезным "
    "и предоставлять точную информацию. Избегай длинных вступлений и лишних фраз."
)
JWT_SECRET = os.getenv('JWT_SECRET_KEY', 'change-this-in-production')

# Настройка PostgreSQL
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Модели SQLAlchemy
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    company_name = Column(String, nullable=True)
    openai_api_key = Column(String, nullable=True)
    subscription_plan = Column(String, default="free")
    google_sheets_token = Column(JSON, nullable=True)
    google_sheets_authorized = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    assistants = relationship("AssistantConfig", back_populates="user", cascade="all, delete-orphan")


class AssistantConfig(Base):
    __tablename__ = "assistant_configs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    system_prompt = Column(Text, nullable=False)
    voice = Column(String, default="alloy")
    language = Column(String, default="ru")
    google_sheet_id = Column(String, nullable=True)
    functions = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="assistants")
    conversations = relationship("Conversation", back_populates="assistant", cascade="all, delete-orphan")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assistant_id = Column(UUID(as_uuid=True), ForeignKey("assistant_configs.id", ondelete="CASCADE"))
    user_message = Column(Text, nullable=True)
    assistant_message = Column(Text, nullable=True)
    duration_seconds = Column(Float, nullable=True)
    client_info = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    assistant = relationship("AssistantConfig", back_populates="conversations")


# Допустимые голоса с русскими названиями для интерфейса
AVAILABLE_VOICES = ["alloy", "ash", "ballad", "coral", "echo", "sage", "shimmer", "verse"]
VOICE_NAMES = {
    "alloy": "Alloy",
    "ash": "Ash",
    "ballad": "Ballad",
    "coral": "Coral",
    "echo": "Echo",
    "sage": "Sage",
    "shimmer": "Shimmer",
    "verse": "Verse"
}
DEFAULT_VOICE = "alloy"

# Базовое содержимое HTML для заглушки
DEFAULT_HTML_CONTENT = """<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WellcomeAI</title>
  <style>
    body { 
      font-family: 'Segoe UI', sans-serif; 
      background: white; 
      display: flex; 
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .container { 
      text-align: center; 
      max-width: 600px;
      padding: 20px;
    }
    h1 { color: #4a86e8; }
  </style>
</head>
<body>
  <div class="container">
    <h1>WellcomeAI</h1>
    <p>Загрузка...</p>
  </div>
</body>
</html>
"""

# Инициализация FastAPI
app = FastAPI(
    title="WellcomeAI - SaaS голосовой помощник",
    description="API для управления персонализированными голосовыми помощниками на базе OpenAI",
    version="1.0.0"
)

# Добавляем CORS middleware для разрешения кросс-доменных запросов
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Проверка наличия директории static и создание базового index.html
static_dir = os.path.join(os.getcwd(), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir)
    logger.info(f"Создана директория static")

index_in_static = os.path.join(static_dir, "index.html")
if not os.path.exists(index_in_static):
    try:
        with open(index_in_static, "w", encoding="utf-8") as f:
            f.write(DEFAULT_HTML_CONTENT)
        logger.info("Создан файл index.html в директории static")
    except Exception as e:
        logger.error(f"Ошибка при создании index.html: {str(e)}")

# Монтируем статические файлы
app.mount("/static", StaticFiles(directory="static"), name="static")

# Проверка наличия API ключа OpenAI
if not OPENAI_API_KEY:
    logger.warning('Отсутствует ключ API OpenAI по умолчанию. Пользователи должны будут предоставить свои ключи.')

# Функция для получения сессии БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Схемы данных

# Авторизация и пользователи
class UserCreate(BaseModel):
    email: str
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company_name: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company_name: Optional[str] = None
    openai_api_key: Optional[str] = None

class TokenData(BaseModel):
    sub: str
    exp: int
    
# Конфигурация ассистента
class AssistantCreate(BaseModel):
    name: str
    description: Optional[str] = None
    system_prompt: str = DEFAULT_SYSTEM_MESSAGE
    voice: str = DEFAULT_VOICE
    language: str = "ru"
    google_sheet_id: Optional[str] = None
    functions: Optional[List[Dict[str, Any]]] = None
    
    @validator('voice')
    def validate_voice(cls, v):
        if v not in AVAILABLE_VOICES:
            raise ValueError(f'Голос должен быть одним из {", ".join(AVAILABLE_VOICES)}')
        return v

class AssistantUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    voice: Optional[str] = None
    language: Optional[str] = None
    google_sheet_id: Optional[str] = None
    functions: Optional[List[Dict[str, Any]]] = None
    is_active: Optional[bool] = None
    
    @validator('voice')
    def validate_voice(cls, v):
        if v is not None and v not in AVAILABLE_VOICES:
            raise ValueError(f'Голос должен быть одним из {", ".join(AVAILABLE_VOICES)}')
        return v

# Хранилище активных соединений клиент <-> OpenAI
client_connections = {}

# Отслеживаемые события от OpenAI для подробного логирования
LOG_EVENT_TYPES = [
    'response.done',
    'input_audio_buffer.speech_stopped',
    'input_audio_buffer.speech_started',
    'session.created', 
    'session.updated'
]

# Утилиты для JWT токенов
def create_jwt_token(user_id: str, expires_delta_minutes: int = 60*24) -> str:
    expire = datetime.utcnow() + timedelta(minutes=expires_delta_minutes)
    to_encode = {"sub": str(user_id), "exp": expire}
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")
    return encoded_jwt

def decode_jwt_token(token: str) -> TokenData:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("sub")
        exp = payload.get("exp")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return TokenData(sub=user_id, exp=exp)
    except PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Зависимость для проверки аутентификации
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db = Depends(get_db)):
    token_data = decode_jwt_token(credentials.credentials)
    
    # Проверяем существование пользователя в базе данных
    user = db.query(User).filter(User.id == token_data.sub).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid user")
    
    return user

# Вспомогательные функции для WebSocket и OpenAI API
async def create_openai_connection(api_key=None):
    """Создание нового соединения с OpenAI API"""
    try:
        key_to_use = api_key or OPENAI_API_KEY
        if not key_to_use:
            raise ValueError("API ключ OpenAI не предоставлен")
            
        openai_ws = await websockets.connect(
            REALTIME_WS_URL,
            header={  # Изменено с extra_headers на header
                "Authorization": f"Bearer {key_to_use}",
                "OpenAI-Beta": "realtime=v1"
            },
            # Увеличены буферы для более надежной передачи аудио
            max_size=10 * 1024 * 1024,  # 10MB max message size
            ping_interval=20,
            ping_timeout=60
        )
        logger.info("Создано новое соединение с OpenAI")
        return openai_ws
    except Exception as e:
        logger.error(f"Ошибка при создании соединения с OpenAI: {str(e)}")
        raise

async def send_session_update(openai_ws, voice=DEFAULT_VOICE, system_message=DEFAULT_SYSTEM_MESSAGE, functions=None):
    """Отправляет настройки сессии в WebSocket OpenAI"""
    
    # Настройка определения завершения речи
    turn_detection = {
        "type": "server_vad",
        "threshold": 0.25,                 # Чувствительность определения голоса
        "prefix_padding_ms": 200,          # Начальное время записи
        "silence_duration_ms": 300,        # Время ожидания тишины
        "create_response": True            # Автоматически создавать ответ при завершении речи
    }
    
    # Подготавливаем инструменты (functions)
    tools = []
    if functions:
        for func in functions:
            tools.append({
                "type": "function",
                "name": func.get("name"),
                "description": func.get("description"),
                "parameters": func.get("parameters")
            })
    
    # Подготавливаем настройки сессии
    session_update = {
        "type": "session.update",
        "session": {
            "turn_detection": turn_detection,
            "input_audio_format": "pcm16",        # Формат входящего аудио
            "output_audio_format": "pcm16",       # Формат исходящего аудио
            "voice": voice,                       # Голос ассистента
            "instructions": system_message,       # Системное сообщение
            "modalities": ["text", "audio"],      # Поддерживаемые модальности
            "temperature": 0.7,                   # Температура генерации
            "max_response_output_tokens": 500,    # Лимит токенов для ответа
            "tools": tools,                       # Инструменты (функции)
            "tool_choice": "auto" if tools else "none"  # Метод выбора инструментов
        }
    }
    
    try:
        # Отправляем настройки и ожидаем небольшое время для применения
        await openai_ws.send(json.dumps(session_update))
        logger.info(f"Настройки сессии с голосом {voice} отправлены")
    except Exception as e:
        logger.error(f"Ошибка при отправке настроек сессии: {str(e)}")
        raise

# Глобальный обработчик исключений
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Глобальный обработчик исключений для логирования ошибок"""
    logger.error(f"Необработанное исключение: {str(exc)}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": f"Внутренняя ошибка сервера: {str(exc)}"}
    )

# API эндпоинты для аутентификации
@app.post("/api/auth/register", status_code=201)
async def register_user(user: UserCreate, db = Depends(get_db)):
    """Регистрация нового пользователя"""
    try:
        # Проверяем, не существует ли уже пользователь с таким email
        existing_user = db.query(User).filter(User.email == user.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")
            
        # Хешируем пароль
        import hashlib
        hashed_password = hashlib.sha256(user.password.encode()).hexdigest()
        
        # Создаем пользователя в базе данных
        new_user = User(
            email=user.email,
            password_hash=hashed_password,
            first_name=user.first_name,
            last_name=user.last_name,
            company_name=user.company_name,
            subscription_plan="free"
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Создаем и возвращаем JWT токен
        token = create_jwt_token(str(new_user.id))
        
        # Преобразуем UUID в строку для JSON
        user_dict = {
            "id": str(new_user.id),
            "email": new_user.email,
            "first_name": new_user.first_name,
            "last_name": new_user.last_name,
            "company_name": new_user.company_name,
            "subscription_plan": new_user.subscription_plan,
            "created_at": new_user.created_at.isoformat() if new_user.created_at else None
        }
        
        return {"token": token, "user": user_dict}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Ошибка при регистрации пользователя: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Внутренняя ошибка сервера: {str(e)}")

@app.post("/api/auth/login")
async def login_user(user: UserLogin, db = Depends(get_db)):
    """Вход пользователя"""
    try:
        # Хешируем пароль для сравнения
        import hashlib
        hashed_password = hashlib.sha256(user.password.encode()).hexdigest()
        
        # Ищем пользователя в базе
        db_user = db.query(User).filter(User.email == user.email).first()
        
        if not db_user:
            raise HTTPException(status_code=401, detail="Неверный email или пароль")
            
        # Проверяем пароль
        if db_user.password_hash != hashed_password:
            raise HTTPException(status_code=401, detail="Неверный email или пароль")
            
        # Создаем и возвращаем JWT токен
        token = create_jwt_token(str(db_user.id))
        
        # Получаем список помощников пользователя
        assistants = db.query(AssistantConfig).filter(AssistantConfig.user_id == db_user.id).all()
        
        # Преобразуем данные ассистентов для JSON
        assistants_list = []
        for assistant in assistants:
            assistants_list.append({
                "id": str(assistant.id),
                "user_id": str(assistant.user_id),
                "name": assistant.name,
                "description": assistant.description,
                "system_prompt": assistant.system_prompt,
                "voice": assistant.voice,
                "language": assistant.language,
                "google_sheet_id": assistant.google_sheet_id,
                "functions": assistant.functions,
                "is_active": assistant.is_active,
                "created_at": assistant.created_at.isoformat() if assistant.created_at else None,
                "updated_at": assistant.updated_at.isoformat() if assistant.updated_at else None
            })
        
        # Преобразуем UUID в строку для JSON
        user_dict = {
            "id": str(db_user.id),
            "email": db_user.email,
            "first_name": db_user.first_name,
            "last_name": db_user.last_name,
            "company_name": db_user.company_name,
            "openai_api_key": db_user.openai_api_key,
            "subscription_plan": db_user.subscription_plan,
            "google_sheets_authorized": db_user.google_sheets_authorized,
            "created_at": db_user.created_at.isoformat() if db_user.created_at else None
        }
        
        return {"token": token, "user": user_dict, "assistants": assistants_list}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Ошибка при входе пользователя: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Внутренняя ошибка сервера: {str(e)}")

@app.get("/api/users/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Получение информации о текущем пользователе"""
    user_dict = {
        "id": str(current_user.id),
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "company_name": current_user.company_name,
        "openai_api_key": current_user.openai_api_key,
        "subscription_plan": current_user.subscription_plan,
        "google_sheets_authorized": current_user.google_sheets_authorized,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None
    }
    return user_dict

@app.put("/api/users/me")
async def update_current_user_info(user_update: UserUpdate, current_user: User = Depends(get_current_user), db = Depends(get_db)):
    """Обновление информации о текущем пользователе"""
    try:
        # Получаем только установленные поля (не None)
        update_data = user_update.dict(exclude_unset=True)
        
        # Добавляем подробное логирование
        logger.info(f"Обновление пользователя {current_user.id}. Данные: {update_data}")
        
        if not update_data:
            return {"message": "Нет данных для обновления"}
        
        # Обновляем данные пользователя
        for key, value in update_data.items():
            setattr(current_user, key, value)
            logger.info(f"Установлено свойство {key} = {value}")
        
        # Сохраняем изменения
        db.commit()
        logger.info(f"Изменения сохранены в базу данных для пользователя {current_user.id}")
        
        # Возвращаем обновленные данные
        user_dict = {
            "id": str(current_user.id),
            "email": current_user.email,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "company_name": current_user.company_name,
            "openai_api_key": current_user.openai_api_key,
            "subscription_plan": current_user.subscription_plan,
            "google_sheets_authorized": current_user.google_sheets_authorized,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
            "updated_at": current_user.updated_at.isoformat() if current_user.updated_at else None
        }
        
        return user_dict
    except Exception as e:
        logger.error(f"Ошибка при обновлении пользователя: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Ошибка при обновлении пользователя: {str(e)}")

# API для управления помощниками
@app.post("/api/assistants", status_code=201)
async def create_assistant(assistant: AssistantCreate, current_user: User = Depends(get_current_user), db = Depends(get_db)):
    """Создание нового голосового помощника"""
    try:
        # Проверяем, есть ли API ключ у пользователя
        api_key = current_user.openai_api_key or OPENAI_API_KEY
        if not api_key:
            raise HTTPException(status_code=400, detail="Требуется API ключ OpenAI")
        
        # Создаем помощника в базе данных
        new_assistant = AssistantConfig(
            user_id=current_user.id,
            name=assistant.name,
            description=assistant.description,
            system_prompt=assistant.system_prompt,
            voice=assistant.voice,
            language=assistant.language,
            google_sheet_id=assistant.google_sheet_id,
            functions=assistant.functions,
            is_active=True
        )
        
        db.add(new_assistant)
        db.commit()
        db.refresh(new_assistant)
        
        # Преобразуем данные для JSON ответа
        assistant_dict = {
            "id": str(new_assistant.id),
            "user_id": str(new_assistant.user_id),
            "name": new_assistant.name,
            "description": new_assistant.description,
            "system_prompt": new_assistant.system_prompt,
            "voice": new_assistant.voice,
            "language": new_assistant.language,
            "google_sheet_id": new_assistant.google_sheet_id,
            "functions": new_assistant.functions,
            "is_active": new_assistant.is_active,
            "created_at": new_assistant.created_at.isoformat() if new_assistant.created_at else None,
            "updated_at": new_assistant.updated_at.isoformat() if new_assistant.updated_at else None
        }
        
        return assistant_dict
        
    except Exception as e:
        logger.error(f"Ошибка при создании помощника: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Внутренняя ошибка сервера: {str(e)}")

@app.get("/api/assistants")
async def get_user_assistants(current_user: User = Depends(get_current_user), db = Depends(get_db)):
    """Получение списка помощников пользователя"""
    try:
        assistants = db.query(AssistantConfig).filter(AssistantConfig.user_id == current_user.id).all()
        
        # Преобразуем данные для JSON ответа
        result = []
        for assistant in assistants:
            result.append({
                "id": str(assistant.id),
                "user_id": str(assistant.user_id),
                "name": assistant.name,
                "description": assistant.description,
                "system_prompt": assistant.system_prompt,
                "voice": assistant.voice,
                "language": assistant.language,
                "google_sheet_id": assistant.google_sheet_id,
                "functions": assistant.functions,
                "is_active": assistant.is_active,
                "created_at": assistant.created_at.isoformat() if assistant.created_at else None,
                "updated_at": assistant.updated_at.isoformat() if assistant.updated_at else None
            })
        
        return result
    except Exception as e:
        logger.error(f"Ошибка при получении списка помощников: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Внутренняя ошибка сервера: {str(e)}")

@app.get("/api/assistants/{assistant_id}")
async def get_assistant(assistant_id: str, current_user: User = Depends(get_current_user), db = Depends(get_db)):
    """Получение информации о конкретном помощнике"""
    try:
        # Добавляем логирование
        logger.info(f"Запрос на получение ассистента с ID: {assistant_id}, пользователь: {current_user.id}")
        
        # Проверяем, существует ли помощник и принадлежит ли он пользователю
        assistant = db.query(AssistantConfig).filter(
            AssistantConfig.id == assistant_id,
            AssistantConfig.user_id == current_user.id
        ).first()
        
        if not assistant:
            logger.error(f"Ассистент не найден: {assistant_id}")
            raise HTTPException(status_code=404, detail="Помощник не найден")
            
        # Преобразуем данные для JSON ответа
        assistant_dict = {
            "id": str(assistant.id),
            "user_id": str(assistant.user_id),
            "name": assistant.name,
            "description": assistant.description,
            "system_prompt": assistant.system_prompt,
            "voice": assistant.voice,
            "language": assistant.language,
            "google_sheet_id": assistant.google_sheet_id,
            "functions": assistant.functions,
            "is_active": assistant.is_active,
            "created_at": assistant.created_at.isoformat() if assistant.created_at else None,
            "updated_at": assistant.updated_at.isoformat() if assistant.updated_at else None
        }
        
        logger.info(f"Данные ассистента успешно получены: {assistant.id}")
        return assistant_dict
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Ошибка при получении информации о помощнике: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Внутренняя ошибка сервера: {str(e)}")

@app.put("/api/assistants/{assistant_id}")
async def update_assistant(assistant_id: str, assistant_update: AssistantUpdate, current_user: User = Depends(get_current_user), db = Depends(get_db)):
    """Обновление информации о помощнике"""
    try:
        # Проверяем, существует ли помощник и принадлежит ли он пользователю
        assistant = db.query(AssistantConfig).filter(
            AssistantConfig.id == assistant_id,
            AssistantConfig.user_id == current_user.id
        ).first()
        
        if not assistant:
            raise HTTPException(status_code=404, detail="Помощник не найден")
            
        # Подготавливаем данные для обновления
        update_data = assistant_update.dict(exclude_unset=True)
        
        if not update_data:
            return {"message": "Нет данных для обновления"}
            
        # Обновляем данные в базе
        for key, value in update_data.items():
            setattr(assistant, key, value)
            
        db.commit()
        db.refresh(assistant)
        
        # Преобразуем данные для JSON ответа
        assistant_dict = {
            "id": str(assistant.id),
            "user_id": str(assistant.user_id),
            "name": assistant.name,
            "description": assistant.description,
            "system_prompt": assistant.system_prompt,
            "voice": assistant.voice,
            "language": assistant.language,
            "google_sheet_id": assistant.google_sheet_id,
            "functions": assistant.functions,
            "is_active": assistant.is_active,
            "created_at": assistant.created_at.isoformat() if assistant.created_at else None,
            "updated_at": assistant.updated_at.isoformat() if assistant.updated_at else None
        }
        
        return assistant_dict
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Ошибка при обновлении помощника: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Внутренняя ошибка сервера: {str(e)}")

@app.delete("/api/assistants/{assistant_id}")
async def delete_assistant(assistant_id: str, current_user: User = Depends(get_current_user), db = Depends(get_db)):
    """Удаление помощника"""
    try:
        # Проверяем, существует ли помощник и принадлежит ли он пользователю
        assistant = db.query(AssistantConfig).filter(
            AssistantConfig.id == assistant_id,
            AssistantConfig.user_id == current_user.id
        ).first()
        
        if not assistant:
            raise HTTPException(status_code=404, detail="Помощник не найден")
            
        # Удаляем помощника из базы
        db.delete(assistant)
        db.commit()
        
        return {"message": "Помощник успешно удален", "id": assistant_id}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Ошибка при удалении помощника: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Внутренняя ошибка сервера: {str(e)}")

@app.get("/api/assistants/{assistant_id}/embed-code")
async def get_assistant_embed_code(assistant_id: str, current_user: User = Depends(get_current_user), db = Depends(get_db)):
    """Получение кода для встраивания голосового помощника на сайт"""
    try:
        # Проверяем, существует ли помощник и принадлежит ли он пользователю
        assistant = db.query(AssistantConfig).filter(
            AssistantConfig.id == assistant_id,
            AssistantConfig.user_id == current_user.id
        ).first()
        
        if not assistant:
            raise HTTPException(status_code=404, detail="Помощник не найден")
            
        if not assistant.is_active:
            raise HTTPException(status_code=400, detail="Этот помощник не активен. Активируйте его перед получением кода встраивания.")
            
        # Формируем код для встраивания
        host = os.getenv('HOST_URL', 'https://realtime-saas.onrender.com')
        embed_code = f"""<!-- WellcomeAI Голосовой Помощник -->
<script>
    (function() {{
        var script = document.createElement('script');
        script.src = '{host}/static/widget.js';
        script.dataset.assistantId = '{assistant_id}';
        script.dataset.server = '{host}'; // Явное указание сервера
        script.dataset.position = 'bottom-right'; // Положение виджета
        script.async = true;
        document.head.appendChild(script);
    }})();
</script>
<!-- Конец WellcomeAI -->"""
        
        return {"embed_code": embed_code}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Ошибка при получении кода встраивания: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Внутренняя ошибка сервера: {str(e)}")

# WebSocket для голосовых помощников
@app.websocket("/ws/{assistant_id}")
async def websocket_assistant(websocket: WebSocket, assistant_id: str, db = Depends(get_db)):
    """
    WebSocket-эндпоинт для взаимодействия с голосовым помощником.
    Устанавливает соединение с клиентом и OpenAI Realtime API.
    """
    # Принимаем соединение
    await websocket.accept()
    
    client_id = id(websocket)
    logger.info(f"Новое клиентское соединение: {client_id} для помощника {assistant_id}")
    
    # Получаем информацию о помощнике из базы данных
    try:
        assistant = db.query(AssistantConfig).filter(AssistantConfig.id == assistant_id).first()
        
        if not assistant:
            await websocket.send_json({
                "type": "error",
                "error": {
                    "message": "Помощник не найден"
                }
            })
            await websocket.close()
            return
            
        if not assistant.is_active:
            await websocket.send_json({
                "type": "error",
                "error": {
                    "message": "Этот помощник не активен"
                }
            })
            await websocket.close()
            return
            
        # Получаем API ключ пользователя
        user_id = assistant.user_id
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            await websocket.send_json({
                "type": "error",
                "error": {
                    "message": "Пользователь не найден"
                }
            })
            await websocket.close()
            return
            
        # Используем API ключ пользователя или дефолтный
        openai_api_key = user.openai_api_key or OPENAI_API_KEY
        
        if not openai_api_key:
            await websocket.send_json({
                "type": "error",
                "error": {
                    "message": "API ключ OpenAI не настроен"
                }
            })
            await websocket.close()
            return
            
        # Хранение информации об этом клиенте
        client_connections[client_id] = {
            "client_ws": websocket,
            "openai_ws": None,
            "active": True,
            "voice": assistant.voice,
            "system_message": assistant.system_prompt,
            "functions": assistant.functions,
            "user_id": str(user_id),
            "assistant_id": str(assistant_id),
            "tasks": [],     # Для хранения задач
            "reconnecting": False,  # Флаг, указывающий на пересоздание соединения
            "conversation": {
                "user_message": "",
                "assistant_message": "",
                "start_time": time.time()
            }
        }
        
        # Устанавливаем соединение с OpenAI
        openai_ws = await asyncio.wait_for(
            create_openai_connection(openai_api_key),
            timeout=20.0
        )
        
        client_connections[client_id]["openai_ws"] = openai_ws
        logger.info(f"Соединение с OpenAI установлено для клиента {client_id}")
        
        # Отправляем настройки сессии в OpenAI
        await send_session_update(
            openai_ws, 
            voice=assistant.voice, 
            system_message=assistant.system_prompt,
            functions=assistant.functions
        )
        
        # Создаем две задачи для двустороннего обмена сообщениями
        client_to_openai = asyncio.create_task(forward_client_to_openai(websocket, openai_ws, client_id))
        openai_to_client = asyncio.create_task(forward_openai_to_client(openai_ws, websocket, client_id, db))
        
        # Сохраняем задачи для возможности отмены
        client_connections[client_id]["tasks"] = [client_to_openai, openai_to_client]
        
        # Ждем, пока одна из задач не завершится
        done, pending = await asyncio.wait(
            [client_to_openai, openai_to_client],
            return_when=asyncio.FIRST_COMPLETED
        )
        
        # Проверяем, есть ли ошибка в завершенных задачах
        for task in done:
            try:
                # Если задача завершилась с ошибкой, вызываем исключение
                task.result()
            except Exception as e:
                logger.error(f"Задача завершилась с ошибкой: {str(e)}")
                logger.error(traceback.format_exc())
        
        # Отменяем оставшиеся задачи
        for task in pending:
            task.cancel()
            
    except Exception as e:
        logger.error(f"Ошибка при обработке WebSocket соединения: {str(e)}")
        logger.error(traceback.format_exc())
        try:
            await websocket.send_json({
                "type": "error",
                "error": {
                    "message": f"Произошла ошибка: {str(e)}"
                }
            })
        except:
            pass
    finally:
        # Закрываем соединение с OpenAI, если оно существует
        if client_id in client_connections and client_connections[client_id]["openai_ws"]:
            try:
                await client_connections[client_id]["openai_ws"].close()
            except:
                pass
        
        # Отменяем все задачи
        if client_id in client_connections and "tasks" in client_connections[client_id]:
            for task in client_connections[client_id]["tasks"]:
                if not task.done():
                    task.cancel()
        
        # Удаляем информацию о клиенте
        if client_id in client_connections:
            client_connections[client_id]["active"] = False
            del client_connections[client_id]
        
        logger.info(f"Соединение с клиентом {client_id} закрыто")

async def forward_client_to_openai(client_ws: WebSocket, openai_ws, client_id: int):
    """Пересылает сообщения от клиента (браузера) к API OpenAI"""
    try:
        while client_id in client_connections and client_connections[client_id]["active"]:
            # Получаем данные от клиента
            try:
                message = await client_ws.receive_text()
            except WebSocketDisconnect:
                logger.info(f"Клиент {client_id} отключился")
                break
            
            # Проверяем, что сообщение не пустое
            if not message:
                continue
                
            # Проверяем, что клиент не в процессе переподключения
            if client_id in client_connections and client_connections[client_id].get("reconnecting", False):
                logger.debug(f"Сообщение от клиента {client_id} проигнорировано - идет переподключение")
                continue
            
            # Парсим JSON
            try:
                data = json.loads(message)
                msg_type = data.get("type", "unknown")
                
                # Не логируем аппенд аудио буфера для уменьшения шума в логах
                if msg_type != "input_audio_buffer.append":
                    logger.debug(f"[Клиент {client_id} -> OpenAI] {msg_type}")
                
                # Захватываем транскрипцию для логов
                if msg_type == "conversation.item.input_audio_transcription.completed" and "transcript" in data:
                    client_connections[client_id]["conversation"]["user_message"] = data["transcript"]
                
                # Отправляем сообщение в OpenAI
                await openai_ws.send(message)
                
            except json.JSONDecodeError as e:
                logger.error(f"Получены некорректные данные от клиента")
            except Exception as e:
                logger.error(f"Ошибка при обработке сообщения от клиента: {str(e)}")
                logger.error(traceback.format_exc())
    
    except Exception as e:
        logger.error(f"Ошибка в задаче forward_client_to_openai: {str(e)}")
        logger.error(traceback.format_exc())
        raise

async def forward_openai_to_client(openai_ws, client_ws: WebSocket, client_id: int, db = None):
    """Пересылает сообщения от API OpenAI клиенту (браузеру)"""
    try:
        # Для сбора текстового ответа
        response_text = ""
        
        async for openai_message in openai_ws:
            if client_id not in client_connections or not client_connections[client_id]["active"]:
                break
                
            try:
                # Парсим JSON от OpenAI
                if isinstance(openai_message, str):
                    response = json.loads(openai_message)
                    
                    # Логируем определенные типы событий
                    if response.get('type') in LOG_EVENT_TYPES:
                        logger.info(f"[OpenAI -> Клиент {client_id}] {response.get('type')}")
                    
                    # Собираем текст ответа для логирования
                    if response.get('type') == 'response.text.delta' and 'delta' in response:
                        response_text += response['delta']
                        
                    # Сохраняем полный ответ при завершении
                    if response.get('type') == 'response.text.done' and 'text' in response:
                        response_text = response['text']
                        client_connections[client_id]["conversation"]["assistant_message"] = response_text
                        
                    # Сохраняем разговор в базу данных при завершении ответа
                    if response.get('type') == 'response.done' and db:
                        # Рассчитываем длительность разговора
                        start_time = client_connections[client_id]["conversation"].get("start_time", time.time())
                        duration = time.time() - start_time
                
                        # Запускаем запись в базу данных в фоновом режиме
                        user_id = client_connections[client_id]["user_id"]
                        assistant_id = client_connections[client_id]["assistant_id"]
                        user_message = client_connections[client_id]["conversation"].get("user_message", "")
                        assistant_message = client_connections[client_id]["conversation"].get("assistant_message", "")
                        
                        # Записываем в базу данных
                        try:
                            conversation = Conversation(
                                assistant_id=assistant_id,
                                user_message=user_message,
                                assistant_message=assistant_message,
                                duration_seconds=duration,
                                client_info={}
                            )
                            db.add(conversation)
                            db.commit()
                        except Exception as db_error:
                            logger.error(f"Ошибка при записи разговора в базу данных: {str(db_error)}")
                        
                        # Сбрасываем данные разговора для следующего
                        client_connections[client_id]["conversation"] = {
                            "user_message": "",
                            "assistant_message": "",
                            "start_time": time.time()
                        }
                    
                    # Пересылаем сообщение клиенту
                    await client_ws.send_text(openai_message)
                else:
                    # Если это бинарные данные, отправляем как есть
                    await client_ws.send_bytes(openai_message)
                
            except json.JSONDecodeError:
                logger.error(f"Получены некорректные данные от OpenAI")
                # Пытаемся все равно отправить данные клиенту
                if isinstance(openai_message, str):
                    await client_ws.send_text(openai_message)
                else:
                    await client_ws.send_bytes(openai_message)
            except Exception as e:
                logger.error(f"Ошибка при пересылке данных от OpenAI клиенту: {str(e)}")
    
    except websockets.exceptions.ConnectionClosed as e:
        logger.info(f"Соединение с OpenAI закрыто для клиента {client_id}")
        try:
            # Сообщаем клиенту о закрытии соединения
            await client_ws.send_json({
                "type": "error",
                "error": {
                    "message": "Соединение прервано"
                }
            })
        except:
            pass
    except Exception as e:
        logger.error(f"Ошибка в задаче forward_openai_to_client: {str(e)}")
        logger.error(traceback.format_exc())
        raise

# Функция для создания таблиц при запуске приложения
def create_tables():
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Таблицы в базе данных созданы успешно")
    except Exception as e:
        logger.error(f"Ошибка при создании таблиц: {str(e)}")

# Основной маршрут для возврата HTML-интерфейса
@app.get("/")
async def index_page():
    """Возвращает HTML страницу с интерфейсом"""
    try:
        index_path = os.path.join(static_dir, "index.html")
        if os.path.exists(index_path):
            with open(index_path, "r", encoding="utf-8") as file:
                content = file.read()
            return HTMLResponse(content=content)
        else:
            # Если файл не найден в static, создаем заглушку
            logger.warning(f"Файл {index_path} не найден, создаем заглушку")
            with open(index_path, "w", encoding="utf-8") as file:
                file.write(DEFAULT_HTML_CONTENT)
            with open(index_path, "r", encoding="utf-8") as file:
                content = file.read()
            return HTMLResponse(content=content)
    except Exception as e:
        logger.error(f"Ошибка при отдаче главной страницы: {str(e)}")
        return HTMLResponse(
            content=f"<html><body><h1>WellcomeAI</h1><p>Произошла ошибка: {str(e)}</p></body></html>",
            status_code=500
        )

# Маршрут для виджета встраивания
@app.get("/widget")
async def widget_page():
    """Возвращает HTML страницу с виджетом для встраивания"""
    widget_path = os.path.join(static_dir, "widget.html")
    
    # Если файл виджета не существует, используем стандартный index.html
    if not os.path.exists(widget_path):
        widget_path = os.path.join(static_dir, "index.html")
    
    try:
        with open(widget_path, "r", encoding="utf-8") as file:
            content = file.read()
        return HTMLResponse(content=content)
    except Exception as e:
        logger.error(f"Ошибка при отдаче виджета: {str(e)}")
        return HTMLResponse(
            content=f"<html><body><h1>Ошибка</h1><p>{str(e)}</p></body></html>",
            status_code=500
        )

# Событие при запуске приложения
@app.on_event("startup")
async def startup_event():
    create_tables()

# Запуск приложения с uvicorn при запуске файла напрямую
if __name__ == "__main__":
    import uvicorn
    logger.info(f"Запуск сервера на порту {PORT}")
    # Оптимизированные настройки uvicorn для более быстрой обработки запросов
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=PORT,
        log_level="info",
        timeout_keep_alive=120,  # Увеличенный таймаут для длинных ответов
        loop="auto"              # Использовать оптимальный цикл событий для платформы
    )
