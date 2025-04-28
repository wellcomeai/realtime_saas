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

from fastapi import FastAPI, WebSocket, Request, WebSocketDisconnect, HTTPException, Depends, Header, Body, UploadFile, File, BackgroundTasks
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from pydantic import BaseModel, Field, validator

# Для WebSocket
import websockets

# Для Supabase
from supabase import create_client, Client

# Для Google Sheets
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

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
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
DEFAULT_SYSTEM_MESSAGE = (
    "Ты умный голосовой помощник. Отвечай на вопросы пользователя коротко, "
    "информативно и с небольшой ноткой юмора, когда это уместно. Стремись быть полезным "
    "и предоставлять точную информацию. Избегай длинных вступлений и лишних фраз."
)
JWT_SECRET = os.getenv('JWT_SECRET_KEY', 'change-this-in-production')

# Инициализация Supabase клиента
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

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

class GoogleSheetsAuth(BaseModel):
    token: Dict[str, Any]

# Разговоры и сообщения
class MessageCreate(BaseModel):
    assistant_id: str
    text: Optional[str] = None
    audio_base64: Optional[str] = None

class ConversationItem(BaseModel):
    id: str
    role: str
    content: str
    timestamp: float

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
    import jwt
    from datetime import datetime, timedelta
    
    expire = datetime.utcnow() + timedelta(minutes=expires_delta_minutes)
    to_encode = {"sub": user_id, "exp": expire}
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")
    return encoded_jwt

def decode_jwt_token(token: str) -> TokenData:
    import jwt
    from jwt.exceptions import PyJWTError
    
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

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token_data = decode_jwt_token(credentials.credentials)
    
    # Проверяем существование пользователя в Supabase
    user_response = supabase.table("users").select("*").eq("id", token_data.sub).execute()
    if len(user_response.data) == 0:
        raise HTTPException(status_code=401, detail="Invalid user")
    
    return user_response.data[0]

# Функции для работы с Google Sheets
async def save_to_google_sheets(user_id: str, assistant_id: str, user_message: str, assistant_message: str, duration: float):
    try:
        # Получаем данные пользователя и ассистента
        user_data = supabase.table("users").select("google_sheets_token").eq("id", user_id).execute()
        assistant_data = supabase.table("assistant_configs").select("google_sheet_id").eq("id", assistant_id).execute()
        
        if not user_data.data or not user_data.data[0].get("google_sheets_token"):
            logger.warning(f"Нет токена Google Sheets для пользователя {user_id}")
            return
            
        if not assistant_data.data or not assistant_data.data[0].get("google_sheet_id"):
            logger.warning(f"Нет ID Google Sheet для ассистента {assistant_id}")
            return
            
        sheets_token = user_data.data[0].get("google_sheets_token")
        sheet_id = assistant_data.data[0].get("google_sheet_id")
        
        # Создаем Google Sheets клиент
        credentials = Credentials.from_authorized_user_info(sheets_token)
        service = build('sheets', 'v4', credentials=credentials)
        
        # Подготавливаем данные
        timestamp = datetime.now().isoformat()
        row_data = [timestamp, user_message, assistant_message, duration]
        
        # Записываем в таблицу
        result = service.spreadsheets().values().append(
            spreadsheetId=sheet_id,
            range='Разговоры!A:D',
            valueInputOption='RAW',
            insertDataOption='INSERT_ROWS',
            body={'values': [row_data]}
        ).execute()
        
        logger.info(f"Данные записаны в Google Sheets: {result.get('updates').get('updatedCells')} ячеек обновлено")
        return True
    except Exception as e:
        logger.error(f"Ошибка при записи в Google Sheets: {str(e)}")
        logger.error(traceback.format_exc())
        return False

# Вспомогательные функции для WebSocket и OpenAI API
async def create_openai_connection(api_key=None):
    """Создание нового соединения с OpenAI API"""
    try:
        key_to_use = api_key or OPENAI_API_KEY
        if not key_to_use:
            raise ValueError("API ключ OpenAI не предоставлен")
            
        openai_ws = await websockets.connect(
            REALTIME_WS_URL,
            extra_headers={
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

# API эндпоинты для аутентификации
@app.post("/api/auth/register", status_code=201)
async def register_user(user: UserCreate):
    """Регистрация нового пользователя"""
    try:
        # Проверяем, не существует ли уже пользователь с таким email
        existing_user = supabase.table("users").select("*").eq("email", user.email).execute()
        if existing_user.data and len(existing_user.data) > 0:
            raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")
            
        # Хешируем пароль
        import hashlib
        hashed_password = hashlib.sha256(user.password.encode()).hexdigest()
        
        # Создаем пользователя в Supabase
        new_user = {
            "email": user.email,
            "password_hash": hashed_password,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "company_name": user.company_name,
            "subscription_plan": "free", # По умолчанию бесплатный план
            "created_at": datetime.now().isoformat()
        }
        
        response = supabase.table("users").insert(new_user).execute()
        user_id = response.data[0]["id"]
        
        # Создаем и возвращаем JWT токен
        token = create_jwt_token(user_id)
        
        return {"token": token, "user": {**response.data[0], "password_hash": None}}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Ошибка при регистрации пользователя: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Внутренняя ошибка сервера: {str(e)}")

@app.post("/api/auth/login")
async def login_user(user: UserLogin):
    """Вход пользователя"""
    try:
        # Хешируем пароль для сравнения
        import hashlib
        hashed_password = hashlib.sha256(user.password.encode()).hexdigest()
        
        # Ищем пользователя в Supabase
        response = supabase.table("users").select("*").eq("email", user.email).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=401, detail="Неверный email или пароль")
            
        db_user = response.data[0]
        
        # Проверяем пароль
        if db_user["password_hash"] != hashed_password:
            raise HTTPException(status_code=401, detail="Неверный email или пароль")
            
        # Создаем и возвращаем JWT токен
        token = create_jwt_token(db_user["id"])
        
        return {"token": token, "user": {**db_user, "password_hash": None}}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Ошибка при входе пользователя: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Внутренняя ошибка сервера: {str(e)}")

@app.get("/api/users/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Получение информации о текущем пользователе"""
    current_user.pop("password_hash", None)
    return current_user

@app.put("/api/users/me")
async def update_user_info(user_update: UserUpdate, current_user: dict = Depends(get_current_user)):
    """Обновление информации о пользователе"""
    try:
        # Подготавливаем данные для обновления
        update_data = {}
        for field, value in user_update.dict(exclude_unset=True).items():
            update_data[field] = value
            
        if not update_data:
            return {"message": "Нет данных для обновления"}
            
        # Обновляем данные в Supabase
        response = supabase.table("users").update(update_data).eq("id", current_user["id"]).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Пользователь не найден")
            
        updated_user = response.data[0]
        updated_user.pop("password_hash", None)
        
        return updated_user
        
    except Exception as e:
        logger.error(f"Ошибка при обновлении пользователя: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Внутренняя ошибка сервера: {str(e)}")

# API для управления помощниками
@app.post("/api/assistants", status_code=201)
async def create_assistant(assistant: AssistantCreate, current_user: dict = Depends(get_current_user)):
    """Создание нового голосового помощника"""
    try:
        # Подготавливаем данные для создания помощника
        new_assistant = {
            "user_id": current_user["id"],
            "name": assistant.name,
            "description": assistant.description,
            "system_prompt": assistant.system_prompt,
            "voice": assistant.voice,
            "language": assistant.language,
            "google_sheet_id": assistant.google_sheet_id,
            "functions": assistant.functions,
            "is_active": True,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        # Создаем помощника в Supabase
        response = supabase.table("assistant_configs").insert(new_assistant).execute()
        
        return response.data[0]
        
    except Exception as e:
        logger.error(f"Ошибка при создании помощника: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Внутренняя ошибка сервера: {str(e)}")

@app.get("/api/assistants")
async def get_user_assistants(current_user: dict = Depends(get_current_user)):
    """Получение списка помощников пользователя"""
    try:
        response = supabase.table("assistant_configs").select("*").eq("user_id", current_user["id"]).execute()
        return response.data
    except Exception as e:
        logger.error(f"Ошибка при получении списка помощников: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Внутренняя ошибка сервера: {str(e)}")

@app.get("/api/assistants/{assistant_id}")
async def get_assistant(assistant_id: str, current_user: dict = Depends(get_current_user)):
    """Получение информации о конкретном помощнике"""
    try:
        response = supabase.table("assistant_configs").select("*").eq("id", assistant_id).eq("user_id", current_user["id"]).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Помощник не найден")
            
        return response.data[0]
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Ошибка при получении информации о помощнике: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Внутренняя ошибка сервера: {str(e)}")

@app.put("/api/assistants/{assistant_id}")
async def update_assistant(assistant_id: str, assistant_update: AssistantUpdate, current_user: dict = Depends(get_current_user)):
    """Обновление информации о помощнике"""
    try:
        # Проверяем, существует ли помощник и принадлежит ли он пользователю
        check_response = supabase.table("assistant_configs").select("id").eq("id", assistant_id).eq("user_id", current_user["id"]).execute()
        
        if not check_response.data or len(check_response.data) == 0:
            raise HTTPException(status_code=404, detail="Помощник не найден")
            
        # Подготавливаем данные для обновления
        update_data = {}
        for field, value in assistant_update.dict(exclude_unset=True).items():
            if value is not None:
                update_data[field] = value
                
        if not update_data:
            return {"message": "Нет данных для обновления"}
            
        # Добавляем дату обновления
        update_data["updated_at"] = datetime.now().isoformat()
        
        # Обновляем данные в Supabase
        response = supabase.table("assistant_configs").update(update_data).eq("id", assistant_id).eq("user_id", current_user["id"]).execute()
        
        return response.data[0]
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Ошибка при обновлении помощника: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Внутренняя ошибка сервера: {str(e)}")

@app.delete("/api/assistants/{assistant_id}")
async def delete_assistant(assistant_id: str, current_user: dict = Depends(get_current_user)):
    """Удаление помощника"""
    try:
        # Проверяем, существует ли помощник и принадлежит ли он пользователю
        check_response = supabase.table("assistant_configs").select("id").eq("id", assistant_id).eq("user_id", current_user["id"]).execute()
        
        if not check_response.data or len(check_response.data) == 0:
            raise HTTPException(status_code=404, detail="Помощник не найден")
            
        # Удаляем помощника из Supabase
        response = supabase.table("assistant_configs").delete().eq("id", assistant_id).eq("user_id", current_user["id"]).execute()
        
        return {"message": "Помощник успешно удален", "id": assistant_id}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Ошибка при удалении помощника: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Внутренняя ошибка сервера: {str(e)}")

@app.get("/api/assistants/{assistant_id}/embed-code")
async def get_assistant_embed_code(assistant_id: str, current_user: dict = Depends(get_current_user)):
    """Получение кода для встраивания голосового помощника на сайт"""
    try:
        # Проверяем, существует ли помощник и принадлежит ли он пользователю
        check_response = supabase.table("assistant_configs").select("*").eq("id", assistant_id).eq("user_id", current_user["id"]).execute()
        
        if not check_response.data or len(check_response.data) == 0:
            raise HTTPException(status_code=404, detail="Помощник не найден")
            
        assistant = check_response.data[0]
        if not assistant["is_active"]:
            raise HTTPException(status_code=400, detail="Этот помощник не активен. Активируйте его перед получением кода встраивания.")
            
        # Формируем код для встраивания
        host = os.getenv('HOST_URL', 'https://your-render-app.onrender.com')
        embed_code = f"""<!-- WellcomeAI Голосовой Помощник -->
<script>
    (function() {{
        var script = document.createElement('script');
        script.src = '{host}/static/widget.js';
        script.dataset.assistantId = '{assistant_id}';
        script.dataset.position = 'bottom-right'; // Положение виджета (bottom-right, bottom-left, top-right, top-left)
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

# API для работы с Google Sheets
@app.post("/api/google-sheets/auth")
async def authorize_google_sheets(auth_data: GoogleSheetsAuth, current_user: dict = Depends(get_current_user)):
    """Авторизация для работы с Google Sheets"""
    try:
        # Сохраняем токен в базе данных для пользователя
        response = supabase.table("users").update({"google_sheets_token": auth_data.token, "google_sheets_authorized": True}).eq("id", current_user["id"]).execute()
        
        return {"success": True, "message": "Google Sheets успешно авторизован"}
        
    except Exception as e:
        logger.error(f"Ошибка при авторизации Google Sheets: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Внутренняя ошибка сервера: {str(e)}")

@app.get("/api/google-sheets/validate-sheet")
async def validate_google_sheet(sheet_id: str, current_user: dict = Depends(get_current_user)):
    """Проверка доступности Google Sheet и создание необходимой структуры"""
    try:
        # Получаем токен пользователя
        user_response = supabase.table("users").select("google_sheets_token").eq("id", current_user["id"]).execute()
        
        if not user_response.data or not user_response.data[0].get("google_sheets_token"):
            raise HTTPException(status_code=400, detail="Google Sheets не авторизован")
            
        sheets_token = user_response.data[0].get("google_sheets_token")
        
        # Пытаемся получить доступ к таблице
        credentials = Credentials.from_authorized_user_info(sheets_token)
        service = build('sheets', 'v4', credentials=credentials)
        
        try:
            # Проверяем доступность таблицы
            sheet_metadata = service.spreadsheets().get(spreadsheetId=sheet_id).execute()
            title = sheet_metadata.get('properties', {}).get('title', 'Untitled')
            
            # Проверяем, есть ли лист "Разговоры"
            sheet_exists = False
            for sheet in sheet_metadata.get('sheets', []):
                if sheet.get('properties', {}).get('title') == 'Разговоры':
                    sheet_exists = True
                    break
                    
            # Если нет листа "Разговоры", создаем его
            if not sheet_exists:
                body = {
                    'requests': [{
                        'addSheet': {
                            'properties': {
                                'title': 'Разговоры'
                            }
                        }
                    }]
                }
                service.spreadsheets().batchUpdate(spreadsheetId=sheet_id, body=body).execute()
                
                # Добавляем заголовки
                headers = [["Время", "Сообщение пользователя", "Ответ ассистента", "Длительность (сек)"]]
                service.spreadsheets().values().update(
                    spreadsheetId=sheet_id,
                    range='Разговоры!A1:D1',
                    valueInputOption='RAW',
                    body={'values': headers}
                ).execute()
            
            return {"success": True, "title": title, "message": "Таблица доступна и готова к использованию"}
            
        except Exception as google_error:
            logger.error(f"Ошибка при проверке Google Sheet: {str(google_error)}")
            raise HTTPException(status_code=400, detail=f"Ошибка доступа к таблице: {str(google_error)}")
            
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Ошибка при валидации Google Sheet: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Внутренняя ошибка сервера: {str(e)}")

# API для анализа разговоров
@app.get("/api/conversations/{assistant_id}")
async def get_assistant_conversations(
    assistant_id: str, 
    limit: int = 10, 
    offset: int = 0, 
    current_user: dict = Depends(get_current_user)
):
    """Получение истории разговоров с помощником"""
    try:
        # Проверяем, существует ли помощник и принадлежит ли он пользователю
        check_response = supabase.table("assistant_configs").select("id").eq("id", assistant_id).eq("user_id", current_user["id"]).execute()
        
        if not check_response.data or len(check_response.data) == 0:
            raise HTTPException(status_code=404, detail="Помощник не найден")
            
        # Получаем историю разговоров из Supabase
        response = supabase.table("conversations").select("*")\
            .eq("assistant_id", assistant_id)\
            .order("created_at", desc=True)\
            .range(offset, offset + limit - 1)\
            .execute()
            
        return response.data
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Ошибка при получении истории разговоров: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Внутренняя ошибка сервера: {str(e)}")

# WebSocket для голосовых помощников
@app.websocket("/ws/{assistant_id}")
async def websocket_assistant(websocket: WebSocket, assistant_id: str):
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
        assistant_response = supabase.table("assistant_configs").select("*").eq("id", assistant_id).execute()
        
        if not assistant_response.data or len(assistant_response.data) == 0:
            await websocket.send_json({
                "type": "error",
                "error": {
                    "message": "Помощник не найден"
                }
            })
            await websocket.close()
            return
            
        assistant = assistant_response.data[0]
        
        if not assistant["is_active"]:
            await websocket.send_json({
                "type": "error",
                "error": {
                    "message": "Этот помощник не активен"
                }
            })
            await websocket.close()
            return
            
        # Получаем API ключ пользователя
        user_id = assistant["user_id"]
        user_response = supabase.table("users").select("openai_api_key").eq("id", user_id).execute()
        
        if not user_response.data:
            await websocket.send_json({
                "type": "error",
                "error": {
                    "message": "Пользователь не найден"
                }
            })
            await websocket.close()
            return
            
        # Используем API ключ пользователя или дефолтный
        openai_api_key = user_response.data[0].get("openai_api_key") or OPENAI_API_KEY
        
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
            "voice": assistant["voice"],
            "system_message": assistant["system_prompt"],
            "functions": assistant.get("functions", []),
            "user_id": user_id,
            "assistant_id": assistant_id,
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
            voice=assistant["voice"], 
            system_message=assistant["system_prompt"],
            functions=assistant.get("functions", [])
        )
        
        # Создаем две задачи для двустороннего обмена сообщениями
        client_to_openai = asyncio.create_task(forward_client_to_openai(websocket, openai_ws, client_id))
        openai_to_client = asyncio.create_task(forward_openai_to_client(openai_ws, websocket, client_id))
        
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

async def forward_openai_to_client(openai_ws, client_ws: WebSocket, client_id: int):
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
                    if response.get('type') == 'response.done':
                        # Рассчитываем длительность разговора
                        start_time = client_connections[client_id]["conversation"].get("start_time", time.time())
                        duration = time.time() - start_time
                        
                        # Запускаем запись в базу данных и Google Sheets в фоновом режиме
                        user_id = client_connections[client_id]["user_id"]
                        assistant_id = client_connections[client_id]["assistant_id"]
                        user_message = client_connections[client_id]["conversation"].get("user_message", "")
                        assistant_message = client_connections[client_id]["conversation"].get("assistant_message", "")
                        
                        # Записываем в базу данных
                        try:
                            conversation_data = {
                                "assistant_id": assistant_id,
                                "user_message": user_message,
                                "assistant_message": assistant_message,
                                "created_at": datetime.now().isoformat(),
                                "duration_seconds": duration,
                                "client_info": {}  # Можно добавить информацию о клиенте (IP, браузер и т.д.)
                            }
                            
                            supabase.table("conversations").insert(conversation_data).execute()
                        except Exception as db_error:
                            logger.error(f"Ошибка при записи разговора в базу данных: {str(db_error)}")
                        
                        # Записываем в Google Sheets
                        try:
                            asyncio.create_task(save_to_google_sheets(
                                user_id, assistant_id, user_message, assistant_message, duration
                            ))
                        except Exception as sheets_error:
                            logger.error(f"Ошибка при записи в Google Sheets: {str(sheets_error)}")
                        
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
