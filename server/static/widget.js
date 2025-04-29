/**
 * WellcomeAI Widget - Клиентский виджет для SaaS голосового помощника
 * Версия: 1.0
 * 
 * Этот скрипт динамически создает и встраивает виджет голосового ассистента
 * на любой сайт, используя WebSocket соединение для общения с серверной частью.
 * 
 * Для встраивания на сайт используйте:
 * <script src="https://your-domain.com/static/widget.js" data-assistant-id="YOUR_ASSISTANT_ID" async></script>
 */

(function() {
  // Конфигурация по умолчанию
  const DEFAULT_CONFIG = {
    position: 'bottom-right',         // Положение виджета на странице
    primaryColor: '#4a86e8',          // Основной цвет
    secondaryColor: '#2b59c3',        // Дополнительный цвет
    title: 'WellcomeAI',              // Заголовок виджета в раскрытом состоянии
    initialState: 'collapsed',         // Начальное состояние: 'collapsed' или 'expanded'
    language: 'ru',                   // Язык по умолчанию
    welcomeMessage: 'Привет! Чем я могу помочь?',  // Приветственное сообщение
    zIndex: 2147483647,              // z-index для виджета (максимальное значение)
    size: 'normal',                   // Размер виджета: 'small', 'normal', 'large'
    hideAfterInactivity: 300000,      // Время в мс перед автоскрытием (5 минут), 0 - никогда
    activationEvents: ['click'],      // События активации: 'click', 'hover'
    showBranding: true                // Показывать брендинг WellcomeAI
  };

  // Получение ID ассистента из атрибута скрипта
  function getAssistantId() {
    const scripts = document.getElementsByTagName('script');
    const currentScript = scripts[scripts.length - 1];
    const assistantId = currentScript.getAttribute('data-assistant-id');
    
    if (!assistantId) {
      console.error('WellcomeAI: Не указан ID ассистента. Добавьте атрибут data-assistant-id="YOUR_ASSISTANT_ID" в тег скрипта.');
      return null;
    }
    
    return assistantId;
  }

  // Получение настроек из атрибутов скрипта
  function getWidgetConfig() {
    const scripts = document.getElementsByTagName('script');
    const currentScript = scripts[scripts.length - 1];
    
    const config = {...DEFAULT_CONFIG};
    
    // Получаем все data- атрибуты из скрипта
    const dataAttributes = currentScript.dataset;
    for (const key in dataAttributes) {
      if (key !== 'assistantId' && key in DEFAULT_CONFIG) {
        config[key] = dataAttributes[key];
      }
    }
    
    // Преобразуем строковые значения в правильные типы
    if (config.hideAfterInactivity) {
      config.hideAfterInactivity = parseInt(config.hideAfterInactivity);
    }
    if (config.showBranding === 'false') {
      config.showBranding = false;
    }
    if (config.activationEvents && typeof config.activationEvents === 'string') {
      config.activationEvents = config.activationEvents.split(',').map(e => e.trim());
    }
    
    return config;
  }

  // Создаем стили для виджета
  function createStyles(config) {
    const styleEl = document.createElement('style');
    styleEl.id = 'wellcomeai-widget-styles';
    
    // Определение размеров на основе конфигурации
    const sizes = {
      small: {
        button: '48px',
        expandedWidth: '280px', 
        expandedHeight: '350px',
        circle: '150px',
        iconSize: '20px'
      },
      normal: {
        button: '60px',
        expandedWidth: '320px',
        expandedHeight: '400px',
        circle: '180px',
        iconSize: '22px'
      },
      large: {
        button: '70px',
        expandedWidth: '360px',
        expandedHeight: '450px',
        circle: '200px',
        iconSize: '26px'
      }
    };
    
    const size = sizes[config.size] || sizes.normal;
    
    // Позиционирование на основе конфигурации
    const positions = {
      'bottom-right': 'bottom: 20px; right: 20px;',
      'bottom-left': 'bottom: 20px; left: 20px;',
      'top-right': 'top: 20px; right: 20px;',
      'top-left': 'top: 20px; left: 20px;'
    };
    
    const position = positions[config.position] || positions['bottom-right'];
    
    styleEl.textContent = `
      .wellcomeai-widget-container {
        position: fixed;
        ${position}
        z-index: ${config.zIndex};
        transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      }
      
      .wellcomeai-widget-button {
        width: ${size.button};
        height: ${size.button};
        border-radius: 50%;
        background: linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor});
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        border: none;
        outline: none;
      }
      
      .wellcomeai-widget-button:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
      }
      
      .wellcomeai-widget-button::before {
        content: '';
        position: absolute;
        width: 150%;
        height: 150%;
        background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.2));
        transform: rotate(45deg);
        top: -30%;
        left: -30%;
        transition: all 0.6s ease;
      }
      
      .wellcomeai-widget-button:hover::before {
        transform: rotate(90deg);
      }
      
      .wellcomeai-widget-icon {
        color: white;
        font-size: ${size.iconSize};
        z-index: 2;
        transition: all 0.3s ease;
      }
      
      .wellcomeai-widget-expanded {
        position: absolute;
        bottom: 0;
        right: 0;
        width: ${size.expandedWidth};
        height: 0;
        opacity: 0;
        pointer-events: none;
        background: white;
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        overflow: hidden;
        transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        display: flex;
        flex-direction: column;
      }
      
      .wellcomeai-widget-container.active .wellcomeai-widget-expanded {
        height: ${size.expandedHeight};
        opacity: 1;
        pointer-events: all;
      }
      
      .wellcomeai-widget-container.active .wellcomeai-widget-button {
        transform: scale(0.9);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      }
      
      .wellcomeai-widget-header {
        padding: 15px 20px;
        background: linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor});
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-radius: 20px 20px 0 0;
      }
      
      .wellcomeai-widget-title {
        font-weight: 600;
        font-size: 16px;
        letter-spacing: 0.3px;
      }
      
      .wellcomeai-widget-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        opacity: 0.8;
        transition: all 0.2s;
      }
      
      .wellcomeai-widget-close:hover {
        opacity: 1;
        transform: scale(1.1);
      }
      
      .wellcomeai-widget-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #f9fafc;
        position: relative;
        padding: 20px;
      }
      
      .wellcomeai-main-circle {
        width: ${size.circle};
        height: ${size.circle};
        border-radius: 50%;
        background: linear-gradient(135deg, #ffffff, #e1f5fe, ${config.primaryColor});
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .wellcomeai-main-circle::before {
        content: '';
        position: absolute;
        width: 140%;
        height: 140%;
        background: linear-gradient(45deg, rgba(255, 255, 255, 0.3), rgba(74, 134, 232, 0.2));
        animation: wellcomeai-wave 8s linear infinite;
        border-radius: 40%;
      }
      
      @keyframes wellcomeai-wave {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .wellcomeai-main-circle.listening {
        background: linear-gradient(135deg, #ffffff, #e3f2fd, #2196f3);
        box-shadow: 0 0 30px rgba(33, 150, 243, 0.6);
      }
      
      .wellcomeai-main-circle.listening::before {
        animation: wellcomeai-wave 4s linear infinite;
        background: linear-gradient(45deg, rgba(255, 255, 255, 0.5), rgba(33, 150, 243, 0.3));
      }
      
      .wellcomeai-main-circle.listening::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 3px solid rgba(33, 150, 243, 0.5);
        animation: wellcomeai-pulse 1.5s ease-out infinite;
      }
      
      @keyframes wellcomeai-pulse {
        0% { 
          transform: scale(0.95);
          opacity: 0.7;
        }
        50% { 
          transform: scale(1.05);
          opacity: 0.3;
        }
        100% { 
          transform: scale(0.95);
          opacity: 0.7;
        }
      }
      
      .wellcomeai-main-circle.speaking {
        background: linear-gradient(135deg, #ffffff, #e8f5e9, #4caf50);
        box-shadow: 0 0 30px rgba(76, 175, 80, 0.6);
      }
      
      .wellcomeai-main-circle.speaking::before {
        animation: wellcomeai-wave 3s linear infinite;
        background: linear-gradient(45deg, rgba(255, 255, 255, 0.5), rgba(76, 175, 80, 0.3));
      }
      
      .wellcomeai-main-circle.speaking::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle, transparent 50%, rgba(76, 175, 80, 0.1) 100%);
        border-radius: 50%;
        animation: wellcomeai-ripple 2s ease-out infinite;
      }
      
      @keyframes wellcomeai-ripple {
        0% { 
          transform: scale(0.8); 
          opacity: 0;
        }
        50% { 
          opacity: 0.5;
        }
        100% { 
          transform: scale(1.2); 
          opacity: 0;
        }
      }
      
      .wellcomeai-mic-icon {
        color: ${config.primaryColor};
        font-size: 32px;
        z-index: 10;
      }
      
      .wellcomeai-main-circle.listening .wellcomeai-mic-icon {
        color: #2196f3;
      }
      
      .wellcomeai-main-circle.speaking .wellcomeai-mic-icon {
        color: #4caf50;
      }
      
      .wellcomeai-audio-visualization {
        position: absolute;
        width: 100%;
        max-width: 160px;
        height: 30px;
        bottom: -5px;
        opacity: 0.8;
        pointer-events: none;
      }
      
      .wellcomeai-audio-bars {
        display: flex;
        align-items: flex-end;
        height: 30px;
        gap: 2px;
        width: 100%;
        justify-content: center;
      }
      
      .wellcomeai-audio-bar {
        width: 3px;
        height: 2px;
        background-color: ${config.primaryColor};
        border-radius: 1px;
        transition: height 0.1s ease;
      }
      
      .wellcomeai-loader-modal {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s;
        border-radius: 20px;
      }
      
      .wellcomeai-loader-modal.active {
        opacity: 1;
        visibility: visible;
      }
      
      .wellcomeai-loader {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(74, 134, 232, 0.3);
        border-radius: 50%;
        border-top-color: ${config.primaryColor};
        animation: wellcomeai-spin 1s linear infinite;
      }
      
      @keyframes wellcomeai-spin {
        to { transform: rotate(360deg); }
      }
      
      .wellcomeai-message-display {
        position: absolute;
        width: 90%;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        padding: 12px 15px;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        text-align: center;
        font-size: 14px;
        line-height: 1.4;
        opacity: 0;
        transition: all 0.3s;
        max-height: 100px;
        overflow-y: auto;
        z-index: 10;
      }
      
      .wellcomeai-message-display.show {
        opacity: 1;
      }
      
      .wellcomeai-welcome-message {
        position: absolute;
        max-width: 220px;
        background: white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        border-radius: 12px;
        padding: 10px 15px;
        font-size: 14px;
        transition: all 0.3s;
        opacity: 0;
        transform: scale(0.9);
        pointer-events: none;
      }
      
      .wellcomeai-welcome-message.show {
        opacity: 1;
        transform: scale(1);
      }
      
      .wellcomeai-welcome-message::after {
        content: '';
        position: absolute;
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 8px solid white;
        bottom: -8px;
        left: calc(50% - 8px);
      }
      
      .wellcomeai-container-${config.position} .wellcomeai-welcome-message {
        ${config.position.includes('bottom') ? 'bottom: 70px;' : 'top: 70px;'}
        ${config.position.includes('right') ? 'right: 5px;' : 'left: 5px;'}
      }
      
      .wellcomeai-container-${config.position} .wellcomeai-welcome-message::after {
        ${config.position.includes('bottom') ? 'bottom: -8px; border-top: 8px solid white; border-bottom: none;' : 'top: -8px; border-bottom: 8px solid white; border-top: none;'}
      }
      
      .wellcomeai-branding {
        position: absolute;
        bottom: 5px;
        right: 10px;
        font-size: 10px;
        color: #aaa;
        text-decoration: none;
        opacity: 0.7;
        transition: opacity 0.2s;
      }
      
      .wellcomeai-branding:hover {
        opacity: 1;
        color: ${config.primaryColor};
      }
      
      @keyframes wellcomeai-button-pulse {
        0% { box-shadow: 0 0 0 0 rgba(74, 134, 232, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(74, 134, 232, 0); }
        100% { box-shadow: 0 0 0 0 rgba(74, 134, 232, 0); }
      }
      
      .wellcomeai-pulse-animation {
        animation: wellcomeai-button-pulse 2s infinite;
      }
      
      /* Мобильные стили */
      @media (max-width: 480px) {
        .wellcomeai-widget-expanded {
          width: 100vw;
          max-width: 100vw;
          height: 100vh;
          max-height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          right: 0;
          bottom: 0;
          border-radius: 0;
        }
        
        .wellcomeai-widget-header {
          border-radius: 0;
        }
        
        .wellcomeai-widget-container.active .wellcomeai-widget-button {
          transform: scale(0);
          opacity: 0;
        }
      }
    `;
    
    document.head.appendChild(styleEl);
  }

  // Загрузка Font Awesome для иконок
  function loadFontAwesome() {
    if (!document.getElementById('font-awesome-css')) {
      const link = document.createElement('link');
      link.id = 'font-awesome-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      document.head.appendChild(link);
    }
  }

  // Создание HTML структуры виджета
  function createWidgetHTML(config) {
    const widgetContainer = document.createElement('div');
    widgetContainer.className = `wellcomeai-widget-container wellcomeai-container-${config.position}`;
    widgetContainer.id = 'wellcomeai-widget-container';

    widgetContainer.innerHTML = `
      <!-- Кнопка (минимизированное состояние) -->
      <div class="wellcomeai-widget-button" id="wellcomeai-widget-button">
        <i class="fas fa-robot wellcomeai-widget-icon"></i>
      </div>
      
      <!-- Приветственное сообщение -->
      <div class="wellcomeai-welcome-message" id="wellcomeai-welcome-message">
        ${config.welcomeMessage}
      </div>
      
      <!-- Развернутый виджет -->
      <div class="wellcomeai-widget-expanded" id="wellcomeai-widget-expanded">
        <div class="wellcomeai-widget-header">
          <div class="wellcomeai-widget-title">${config.title}</div>
          <button class="wellcomeai-widget-close" id="wellcomeai-widget-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="wellcomeai-widget-content">
          <!-- Основной элемент - круг с иконкой микрофона -->
          <div class="wellcomeai-main-circle" id="wellcomeai-main-circle">
            <i class="fas fa-microphone wellcomeai-mic-icon"></i>
            
            <!-- Аудио визуализация -->
            <div class="wellcomeai-audio-visualization" id="wellcomeai-audio-visualization">
              <div class="wellcomeai-audio-bars" id="wellcomeai-audio-bars"></div>
            </div>
          </div>
          
          <!-- Сообщение -->
          <div class="wellcomeai-message-display" id="wellcomeai-message-display"></div>
          
          ${config.showBranding ? `<a href="https://wellcome-ai.ru" target="_blank" class="wellcomeai-branding">Powered by WellcomeAI</a>` : ''}
        </div>
      </div>
      
      <!-- Модальное окно загрузки -->
      <div id="wellcomeai-loader-modal" class="wellcomeai-loader-modal active">
        <div class="wellcomeai-loader"></div>
      </div>
    `;

    document.body.appendChild(widgetContainer);
    
    return widgetContainer;
  }

  // Основная логика виджета
  function initWidget(assistantId, config) {
    // Проверка параметров
    if (!assistantId) {
      console.error('WellcomeAI: ID ассистента не указан');
      return;
    }
    
    // Создание виджета
    loadFontAwesome();
    createStyles(config);
    const widgetContainer = createWidgetHTML(config);
    
    // Элементы UI
    const widgetButton = document.getElementById('wellcomeai-widget-button');
    const widgetClose = document.getElementById('wellcomeai-widget-close');
    const mainCircle = document.getElementById('wellcomeai-main-circle');
    const audioBars = document.getElementById('wellcomeai-audio-bars');
    const loaderModal = document.getElementById('wellcomeai-loader-modal');
    const messageDisplay = document.getElementById('wellcomeai-message-display');
    const welcomeMessage = document.getElementById('wellcomeai-welcome-message');
    
    // Переменные для обработки аудио
    let audioChunksBuffer = [];
    let audioPlaybackQueue = [];
    let isPlayingAudio = false;
    let hasAudioData = false;
    let audioDataStartTime = 0;
    let minimumAudioLength = 300;
    let reconnecting = false;
    let isListening = false;
    let websocket = null;
    let audioContext = null;
    let mediaStream = null;
    let audioProcessor = null;
    let isConnected = false;
    let isWidgetOpen = false;
    let inactivityTimer = null;
    
    // Определяем текущий хост
    const currentScript = document.currentScript || document.querySelector('script[data-assistant-id]');
    const scriptSrc = currentScript ? currentScript.src : '';
    const hostUrl = scriptSrc ? new URL(scriptSrc).origin : window.location.origin;
    
    // Конфигурация для оптимизации потока аудио
    const AUDIO_CONFIG = {
      silenceThreshold: 0.01,      // Порог для определения тишины
      silenceDuration: 300,        // Длительность тишины для отправки (мс)
      bufferCheckInterval: 50,     // Частота проверки буфера (мс)
      soundDetectionThreshold: 0.02 // Чувствительность к звуку
    };
    
    // Функция логирования
    function log(message, level = 'info') {
      if (window.console && window.console.log) {
        console.log(`[WellcomeAI ${level.toUpperCase()}] ${message}`);
      }
    }
    
    // Создаем аудио-бары для визуализации
    function createAudioBars(count = 20) {
      audioBars.innerHTML = '';
      for (let i = 0; i < count; i++) {
        const bar = document.createElement('div');
        bar.className = 'wellcomeai-audio-bar';
        audioBars.appendChild(bar);
      }
    }
    createAudioBars();
    
    // Функция для полной остановки всех аудио процессов
    function stopAllAudioProcessing() {
      // Останавливаем прослушивание
      isListening = false;
      
      // Останавливаем воспроизведение
      isPlayingAudio = false;
      
      // Очищаем буферы и очереди
      audioChunksBuffer = [];
      audioPlaybackQueue = [];
      
      // Сбрасываем флаги
      hasAudioData = false;
      audioDataStartTime = 0;
      
      // Если есть активное соединение WebSocket, отправляем команду остановки
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        // Очищаем буфер ввода
        websocket.send(JSON.stringify({
          type: "input_audio_buffer.clear",
          event_id: `clear_${Date.now()}`
        }));
        
        // Отменяем любой текущий ответ
        websocket.send(JSON.stringify({
          type: "response.cancel",
          event_id: `cancel_${Date.now()}`
        }));
      }
      
      // Сбрасываем состояние UI
      mainCircle.classList.remove('listening');
      mainCircle.classList.remove('speaking');
      
      // Сбрасываем визуализацию
      resetAudioVisualization();
    }
    
    // Показать сообщение
    function showMessage(message, duration = 5000) {
      if (!message) return;
      
      messageDisplay.textContent = message;
      messageDisplay.classList.add('show');
      
      setTimeout(() => {
        messageDisplay.classList.remove('show');
      }, duration);
    }
    
    // Показать приветственное сообщение
    function showWelcomeMessage(delay = 1000) {
      setTimeout(() => {
        welcomeMessage.classList.add('show');
        
        // Скрыть через 5 секунд
        setTimeout(() => {
          welcomeMessage.classList.remove('show');
        }, 5000);
      }, delay);
    }
    
    // Открыть виджет
    function openWidget() {
      widgetContainer.classList.add('active');
      isWidgetOpen = true;
      
      // Скрываем приветственное сообщение если оно показано
      welcomeMessage.classList.remove('show');
      
      // Запускаем прослушивание при открытии
      if (isConnected && !isListening && !isPlayingAudio && !reconnecting) {
        startListening();
      }
      
      // Убираем пульсацию с кнопки
      widgetButton.classList.remove('wellcomeai-pulse-animation');
      
      // Сбрасываем таймер неактивности
      resetInactivityTimer();
      
      // Отправляем событие аналитики
      sendAnalyticsEvent('widget_opened');
    }
    
    // Закрыть виджет
    function closeWidget() {
      // Останавливаем все аудио процессы
      stopAllAudioProcessing();
      
      // Скрываем виджет
      widgetContainer.classList.remove('active');
      isWidgetOpen = false;
      
      // Отправляем событие аналитики
      sendAnalyticsEvent('widget_closed');
    }
    
    // Инициализация микрофона и AudioContext
    async function initAudio() {
      try {
        log("Запрос разрешения на доступ к микрофону...");
        
        // Проверяем поддержку getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Ваш браузер не поддерживает доступ к микрофону");
        }
        
        // Запрашиваем доступ к микрофону с оптимальными настройками
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 24000
          } 
        });
        
        log("Доступ к микрофону получен");
        
        // Создаем AudioContext с нужной частотой дискретизации
        audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
        log(`AudioContext создан с частотой ${audioContext.sampleRate} Гц`);
        
        // Создаем обработчик аудиопотока
        const streamSource = audioContext.createMediaStreamSource(mediaStream);
        
        // Выбираем размер буфера
        const bufferSize = 2048; // Меньший размер буфера для меньшей задержки
        
        // Проверяем, доступен ли ScriptProcessorNode
        if (audioContext.createScriptProcessor) {
          audioProcessor = audioContext.createScriptProcessor(bufferSize, 1, 1);
          log("Создан ScriptProcessorNode для обработки аудио");
        } else {
          throw new Error("Ваш браузер не поддерживает ScriptProcessorNode");
        }
        
        // Переменные для отслеживания звука
        let isSilent = true;
        let silenceStartTime = Date.now();
        let lastCommitTime = 0;
        let hasSentAudioInCurrentSegment = false;
        
        // Обработчик аудио с оптимизированной логикой
        audioProcessor.onaudioprocess = function(e) {
          if (isListening && websocket && websocket.readyState === WebSocket.OPEN && !reconnecting) {
            // Получаем данные с микрофона
            const inputData = e.inputBuffer.getChannelData(0);
            
            // Вычисляем максимальную амплитуду
            let maxAmplitude = 0;
            for (let i = 0; i < inputData.length; i++) {
              const absValue = Math.abs(inputData[i]);
              maxAmplitude = Math.max(maxAmplitude, absValue);
            }
            
            // Определяем, есть ли звук
            const hasSound = maxAmplitude > AUDIO_CONFIG.soundDetectionThreshold;
            
            // Обновляем визуализацию
            updateAudioVisualization(inputData);
            
            // Преобразуем float32 в int16
            const pcm16Data = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              pcm16Data[i] = Math.max(-32768, Math.min(32767, Math.floor(inputData[i] * 32767)));
            }
            
            // Отправляем данные через WebSocket
            try {
              const message = JSON.stringify({
                type: "input_audio_buffer.append",
                event_id: `audio_${Date.now()}`,
                audio: arrayBufferToBase64(pcm16Data.buffer)
              });
              
              websocket.send(message);
              hasSentAudioInCurrentSegment = true;
              
              // Отмечаем наличие аудиоданных
              if (!hasAudioData && hasSound) {
                hasAudioData = true;
                audioDataStartTime = Date.now();
                log("Начало записи аудиоданных");
              }
              
              // Сбрасываем таймер неактивности
              resetInactivityTimer();
              
            } catch (error) {
              log(`Ошибка отправки аудио: ${error.message}`, "error");
            }
            
            // Логика определения тишины и автоматической отправки
            const now = Date.now();
            
            if (hasSound) {
              // Сбрасываем время начала тишины
              isSilent = false;
              silenceStartTime = now;
              
              // Активируем визуальное состояние прослушивания
              if (!mainCircle.classList.contains('listening') && 
                  !mainCircle.classList.contains('speaking')) {
                mainCircle.classList.add('listening');
              }
            } else if (!isSilent) {
              // Если наступила тишина
              const silenceDuration = now - silenceStartTime;
              
              if (silenceDuration > AUDIO_CONFIG.silenceDuration) {
                isSilent = true;
                
                // Если прошло достаточно времени с последней отправки и были данные
                if (now - lastCommitTime > 1000 && hasSentAudioInCurrentSegment) {
                  // Отправляем буфер с задержкой 
                  setTimeout(() => {
                    // Проверяем снова, не появился ли звук
                    if (isSilent && isListening && !reconnecting) {
                      commitAudioBuffer();
                      lastCommitTime = Date.now();
                      hasSentAudioInCurrentSegment = false;
                    }
                  }, 100);
                }
              }
            }
          }
        };
        
        // Подключаем обработчик
        streamSource.connect(audioProcessor);
        audioProcessor.connect(audioContext.destination);
        
        log("Аудио инициализировано успешно");
        return true;
      } catch (error) {
        log(`Ошибка инициализации аудио: ${error.message}`, "error");
        showMessage("Ошибка доступа к микрофону. Проверьте настройки браузера.");
        return false;
      }
    }
    
    // Функция для отправки аудиобуфера
    function commitAudioBuffer() {
      if (!isListening || !websocket || websocket.readyState !== WebSocket.OPEN || reconnecting) return;
      
      // Проверяем, есть ли в буфере достаточно аудиоданных
      if (!hasAudioData) {
        log("Не отправляем пустой аудиобуфер", "warn");
        return;
      }
      
      // Проверяем минимальную длительность аудио (300мс требуется для корректной работы)
      const audioLength = Date.now() - audioDataStartTime;
      if (audioLength < minimumAudioLength) {
        log(`Аудиобуфер слишком короткий (${audioLength}мс), ожидаем больше данных`, "warn");
        
        // Продолжаем запись еще немного времени
        setTimeout(() => {
          // Повторно пытаемся отправить буфер
          if (isListening && hasAudioData && !reconnecting) {
            log(`Отправка аудиобуфера после дополнительной записи (${Date.now() - audioDataStartTime}мс)`);
            sendCommitBuffer();
          }
        }, minimumAudioLength - audioLength + 50); // Добавляем небольшой запас
        
        return;
      }
      
      // Если все проверки пройдены, отправляем буфер
      sendCommitBuffer();
    }
    
    // Функция для фактической отправки буфера
    function sendCommitBuffer() {
      log("Отправка аудиобуфера");
      
      // Сбрасываем эффект активности
      mainCircle.classList.remove('listening');
      
      // Отправляем команду для завершения буфера
      websocket.send(JSON.stringify({
        type: "input_audio_buffer.commit",
        event_id: `commit_${Date.now()}`
      }));
      
      // Начинаем обработку и сбрасываем флаги
      hasAudioData = false;
      audioDataStartTime = 0;
      
      // Отправляем событие аналитики
      sendAnalyticsEvent('audio_sent');
    }
    
    // Преобразование ArrayBuffer в Base64
    function arrayBufferToBase64(buffer) {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }
    
    // Преобразование Base64 в ArrayBuffer
    function base64ToArrayBuffer(base64) {
      try {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
      } catch (e) {
        log(`Ошибка при декодировании base64: ${e.message}`, "error");
        return new ArrayBuffer(0);
      }
    }
    
    // Обновление визуализации аудио
    function updateAudioVisualization(audioData) {
      const bars = audioBars.querySelectorAll('.wellcomeai-audio-bar');
      const step = Math.floor(audioData.length / bars.length);
      
      for (let i = 0; i < bars.length; i++) {
        // Вычисляем среднее значение амплитуды для этого "отрезка" аудиоданных
        let sum = 0;
        for (let j = 0; j < step; j++) {
          const index = i * step + j;
          if (index < audioData.length) {
            sum += Math.abs(audioData[index]);
          }
        }
        const average = sum / step;
        
        // Нормализуем значение для высоты полосы (от 2px до 30px)
        const height = 2 + Math.min(28, Math.floor(average * 100));
        bars[i].style.height = `${height}px`;
      }
    }
    
    // Сброс визуализации аудио
    function resetAudioVisualization() {
      const bars = audioBars.querySelectorAll('.wellcomeai-audio-bar');
      bars.forEach(bar => {
        bar.style.height = '2px';
      });
    }
    
    // Создаём простой WAV из PCM данных
    function createWavFromPcm(pcmBuffer, sampleRate = 24000) {
      // Создаём заголовок WAV
      const wavHeader = new ArrayBuffer(44);
      const view = new DataView(wavHeader);
      
      // "RIFF" chunk descriptor
      view.setUint8(0, 'R'.charCodeAt(0));
      view.setUint8(1, 'I'.charCodeAt(0));
      view.setUint8(2, 'F'.charCodeAt(0));
      view.setUint8(3, 'F'.charCodeAt(0));
      
      view.setUint32(4, 36 + pcmBuffer.byteLength, true); // Размер всего файла - 8
      
      // "WAVE" формат
      view.setUint8(8, 'W'.charCodeAt(0));
      view.setUint8(9, 'A'.charCodeAt(0));
      view.setUint8(10, 'V'.charCodeAt(0));
      view.setUint8(11, 'E'.charCodeAt(0));
      
      // "fmt " субчанк
      view.setUint8(12, 'f'.charCodeAt(0));
      view.setUint8(13, 'm'.charCodeAt(0));
      view.setUint8(14, 't'.charCodeAt(0));
      view.setUint8(15, ' '.charCodeAt(0));
      
      view.setUint32(16, 16, true); // Размер fmt субчанка
      view.setUint16(20, 1, true);  // Формат аудио (1 = PCM)
      view.setUint16(22, 1, true);  // Число каналов (1 = моно)
      view.setUint32(24, sampleRate, true); // Частота дискретизации
      view.setUint32(28, sampleRate * 2, true); // Байт в секунду (SampleRate * NumChannels * BitsPerSample/8)
      view.setUint16(32, 2, true);  // Байт на сэмпл (NumChannels * BitsPerSample/8)
      view.setUint16(34, 16, true); // Бит на сэмпл
      
      // "data" субчанк
      view.setUint8(36, 'd'.charCodeAt(0));
      view.setUint8(37, 'a'.charCodeAt(0));
      view.setUint8(38, 't'.charCodeAt(0));
      view.setUint8(39, 'a'.charCodeAt(0));
      
      view.setUint32(40, pcmBuffer.byteLength, true); // Размер данных
      
      // Объединяем заголовок и PCM данные
      const wavBuffer = new ArrayBuffer(wavHeader.byteLength + pcmBuffer.byteLength);
      const wavBytes = new Uint8Array(wavBuffer);
      
      wavBytes.set(new Uint8Array(wavHeader), 0);
      wavBytes.set(new Uint8Array(pcmBuffer), wavHeader.byteLength);
      
      return wavBuffer;
    }
    
    // Добавить аудио в очередь воспроизведения
    function addAudioToPlaybackQueue(audioBase64) {
      if (!audioBase64 || typeof audioBase64 !== 'string') return;
      
      // Добавляем аудио в очередь
      audioPlaybackQueue.push(audioBase64);
      
      // Если не запущено воспроизведение, запускаем
      if (!isPlayingAudio) {
        playNextAudio();
      }
    }
    
    // Воспроизведение следующего аудио в очереди
    function playNextAudio() {
      if (audioPlaybackQueue.length === 0) {
        isPlayingAudio = false;
        // Сбрасываем эффект говорения, когда все аудио воспроизведено
        mainCircle.classList.remove('speaking');
        
        // Добавляем пульсацию на кнопку, если есть непрочитанные сообщения и виджет закрыт
        if (!isWidgetOpen) {
          widgetButton.classList.add('wellcomeai-pulse-animation');
        }
        
        // Начинаем слушать снова
        if (isWidgetOpen) {
          setTimeout(() => {
            startListening();
          }, 300);
        }
        return;
      }
      
      isPlayingAudio = true;
      
      // Активируем визуальное состояние говорения
      mainCircle.classList.add('speaking');
      mainCircle.classList.remove('listening');
      
      const audioBase64 = audioPlaybackQueue.shift();
      
      try {
        // Декодируем Base64 в ArrayBuffer
        const audioData = base64ToArrayBuffer(audioBase64);
        
        // Проверяем размер данных
        if (audioData.byteLength === 0) {
          playNextAudio(); // Пропускаем пустой аудио-чанк
          return;
        }
        
        // Предполагаем, что данные в формате PCM16, конвертируем в WAV для воспроизведения
        const wavBuffer = createWavFromPcm(audioData);
        const blob = new Blob([wavBuffer], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(blob);
        
        // Воспроизводим звук
        const audio = new Audio(audioUrl);
        
        audio.oncanplaythrough = function() {
          audio.play().catch(err => {
            log(`Ошибка при воспроизведении: ${err.message}`, "error");
            playNextAudio(); // В случае ошибки переходим к следующему аудио
          });
        };
        
        // После окончания воспроизведения
        audio.onended = function() {
          URL.revokeObjectURL(audioUrl);
          playNextAudio(); // Переходим к следующему аудио
        };
        
        // В случае ошибки
        audio.onerror = function() {
          URL.revokeObjectURL(audioUrl);
          playNextAudio(); // В случае ошибки переходим к следующему аудио
        };
        
        // Сбрасываем таймер неактивности при воспроизведении
        resetInactivityTimer();
        
      } catch (error) {
        log(`Ошибка воспроизведения аудио: ${error.message}`, "error");
        playNextAudio(); // В случае ошибки переходим к следующему аудио
      }
    }
    
    // Подключение к WebSocket серверу
    async function connectWebSocket() {
      try {
        loaderModal.classList.add('active');
        log("Подключение к серверу...");
        
        // Используем WebSocket-соединение с сервером
        const protocol = hostUrl.startsWith('https:') ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${new URL(hostUrl).host}/ws/${assistantId}`;
        
        log(`Подключение к ${wsUrl}`);
        
        // Создаем новое WebSocket соединение
        websocket = new WebSocket(wsUrl);
        
        // Устанавливаем таймаут на открытие соединения
        const connectionTimeout = setTimeout(() => {
          log("Превышено время ожидания соединения", "error");
          websocket.close();
          loaderModal.classList.remove('active');
          showMessage("Не удалось подключиться к серверу");
        }, 15000);
        
        websocket.onopen = function() {
          clearTimeout(connectionTimeout);
          log("Соединение установлено");
          isConnected = true;
          loaderModal.classList.remove('active');
          
          // Показываем приветственное сообщение, если виджет не раскрыт
          if (!isWidgetOpen && config.welcomeMessage) {
            showWelcomeMessage();
          }
          
          // Автоматически начинаем слушать если виджет открыт
          if (isWidgetOpen) {
            startListening();
          }
          
          // Отправляем событие аналитики
          sendAnalyticsEvent('connected');
        };
        
        websocket.onmessage = function(event) {
          try {
            const data = JSON.parse(event.data);
            
            // Обработка различных типов сообщений
            if (data.type === 'error') {
              log(`Ошибка: ${data.error ? data.error.message : 'Неизвестная ошибка'}`, "error");
            } 
            // Обработка текстового ответа
            else if (data.type === 'response.text.delta') {
              if (data.delta) {
                showMessage(data.delta, 10000);
                
                // Если виджет закрыт, добавляем пульсацию на кнопку
                if (!isWidgetOpen) {
                  widgetButton.classList.add('wellcomeai-pulse-animation');
                }
                
                // Сбрасываем таймер неактивности
                resetInactivityTimer();
              }
            }
            // Обработка аудио
            else if (data.type === 'response.audio.delta') {
              if (data.delta) {
                audioChunksBuffer.push(data.delta);
              }
            }
            // Аудио готово для воспроизведения
            else if (data.type === 'response.audio.done') {
              if (audioChunksBuffer.length > 0) {
                const fullAudio = audioChunksBuffer.join('');
                addAudioToPlaybackQueue(fullAudio);
                audioChunksBuffer = [];
              }
            }
            // Ответ завершен
            else if (data.type === 'response.done') {
              // Начинаем снова слушать автоматически, если виджет открыт
              if (isWidgetOpen && !isPlayingAudio && !reconnecting) {
                setTimeout(() => {
                  startListening();
                }, 300);
              }
              
              // Отправляем событие аналитики
              sendAnalyticsEvent('response_received');
            }
          } catch (error) {
            log(`Ошибка обработки сообщения: ${error.message}`, "error");
          }
        };
        
        websocket.onclose = function() {
          log("Соединение закрыто");
          isConnected = false;
          isListening = false;
          reconnecting = false;
          
          // Показываем сообщение пользователю, если виджет открыт
          if (isWidgetOpen) {
            showMessage("Соединение прервано. Переподключение...");
          }
          
          // Пытаемся переподключиться
          setTimeout(() => {
            connectWebSocket();
          }, 3000);
          
          // Отправляем событие аналитики
          sendAnalyticsEvent('disconnected');
        };
        
        websocket.onerror = function(error) {
          log("Ошибка соединения", "error");
          if (isWidgetOpen) {
            showMessage("Ошибка соединения с сервером");
          }
          
          // Отправляем событие аналитики
          sendAnalyticsEvent('connection_error');
        };
        
        return true;
      } catch (error) {
        log(`Ошибка при установке соединения: ${error.message}`, "error");
        loaderModal.classList.remove('active');
        if (isWidgetOpen) {
          showMessage("Не удалось подключиться к серверу");
        }
        return false;
      }
    }
    
    // Начало записи голоса
    async function startListening() {
      if (!isConnected || isPlayingAudio || reconnecting || isListening) {
        return;
      }
      
      isListening = true;
      log("Начало записи голоса");
      
      // Отправляем команду для очистки буфера ввода
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({
          type: "input_audio_buffer.clear",
          event_id: `clear_${Date.now()}`
        }));
      }
      
      // Если аудио еще не инициализировано, делаем это
      if (!audioContext) {
        await initAudio();
      } else if (audioContext.state === 'suspended') {
        // Возобновляем AudioContext если он был приостановлен
        await audioContext.resume();
      }
      
      // Сбрасываем флаги аудио данных
      hasAudioData = false;
      audioDataStartTime = 0;
      
      // Активируем визуальное состояние прослушивания если не воспроизводится аудио
      if (!isPlayingAudio) {
        mainCircle.classList.add('listening');
        mainCircle.classList.remove('speaking');
      }
      
      // Отправляем событие аналитики
      sendAnalyticsEvent('listening_started');
    }
    
    // Таймер автоматического скрытия виджета при неактивности
    function resetInactivityTimer() {
      // Очищаем текущий таймер
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      
      // Если настроен таймаут неактивности и виджет открыт
      if (config.hideAfterInactivity > 0 && isWidgetOpen) {
        inactivityTimer = setTimeout(() => {
          closeWidget();
        }, config.hideAfterInactivity);
      }
    }
    
    // Отправка событий аналитики на сервер (если потребуется)
    function sendAnalyticsEvent(eventType, data = {}) {
      // Формируем данные события
      const eventData = {
        event_type: eventType,
        assistant_id: assistantId,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        ...data
      };
      
      // В текущей версии просто логируем, но можно расширить для отправки на сервер
      log(`Аналитика: ${eventType}`, "debug");
      
      // Для будущего использования - отправка на сервер
      /*
      fetch(`${hostUrl}/api/analytics/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData),
        keepalive: true
      }).catch(e => {
        // Ignore errors to not impact user experience
      });
      */
    }

    // Добавляем обработчики событий для интерфейса
    widgetButton.addEventListener('click', openWidget);
    widgetClose.addEventListener('click', closeWidget);
    
    // Обработчик для основного круга (микрофона)
    mainCircle.addEventListener('click', function() {
      if (!isListening && !isPlayingAudio && isConnected) {
        startListening();
      }
    });
    
    // Настройка начального состояния
    if (config.initialState === 'expanded') {
      setTimeout(() => {
        openWidget();
      }, 1000);
    }
    
    // Создаем WebSocket соединение
    connectWebSocket();
    
    // Отправляем событие инициализации
    sendAnalyticsEvent('widget_initialized');
  }

  // Точка входа
  function initialize() {
    const assistantId = getAssistantId();
    if (!assistantId) return;
    
    const config = getWidgetConfig();
    initWidget(assistantId, config);
  }
  
  // Проверяем, загружен ли DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
