# Пошаговая настройка автоматического обновления

## Быстрый старт

### Шаг 1: Подготовка Google Cloud

1. Откройте [Google Cloud Console](https://console.cloud.google.com)
2. Создайте проект или выберите существующий
3. Включите **Google Apps Script API**:
   - APIs & Services → Library
   - Найдите "Google Apps Script API"
   - Нажмите Enable

### Шаг 2: Создание OAuth credentials

1. **Настройте OAuth consent screen:**
   - APIs & Services → OAuth consent screen
   - Выберите "External"
   - Заполните обязательные поля:
     - App name: "Management Accounting Updater"
     - User support email: ваш email
     - Developer contact: ваш email
   - Добавьте scopes:
     - `https://www.googleapis.com/auth/script.projects`
     - `https://www.googleapis.com/auth/drive.file`
   - Сохраните

2. **Создайте OAuth Client ID:**
   - APIs & Services → Credentials
   - Create Credentials → OAuth client ID
   - Application type: **Desktop app**
   - Name: "Management Accounting Updater"
   - Create
   - **Скопируйте Client ID и Client Secret**

3. **Скачайте credentials:**
   - Нажмите на созданный OAuth client
   - Download JSON
   - Сохраните как `credentials.json` в корне проекта

### Шаг 3: Получение Script ID

1. Откройте ваш Apps Script проект
2. Project Settings (⚙️)
3. Найдите **Script ID** (внизу)
4. **Скопируйте Script ID**

### Шаг 4: Настройка проекта

#### Вариант A: Node.js (рекомендуется)

1. **Установите зависимости:**
   ```bash
   npm install
   ```

2. **Создайте файл `.env`:**
   ```env
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   GOOGLE_SCRIPT_ID=your_script_id_here
   GITHUB_REPO_URL=https://github.com/your-username/your-repo
   GITHUB_BRANCH=main
   ```

3. **Создайте файл `credentials.json`** (из шага 2):
   ```json
   {
     "installed": {
       "client_id": "your_client_id",
       "client_secret": "your_client_secret",
       "auth_uri": "https://accounts.google.com/o/oauth2/auth",
       "token_uri": "https://oauth2.googleapis.com/token",
       "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
       "redirect_uris": ["http://localhost"]
     }
   }
   ```

#### Вариант B: Python

1. **Установите зависимости:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Создайте файл `.env`** (как в варианте A)

3. **Создайте файл `credentials.json`** (как в варианте A)

### Шаг 5: Первый запуск

#### Node.js:
```bash
npm run update
```

#### Python:
```bash
python update_scripts.py
```

**При первом запуске:**
1. Откроется браузер
2. Войдите в Google аккаунт
3. Разрешите доступ приложению
4. Создастся файл `token.json` (или `token.pickle` для Python)

### Шаг 6: Автоматизация (опционально)

#### Через cron (Linux/Mac):
```bash
# Обновление каждый день в 2:00
0 2 * * * cd /path/to/project && npm run update
```

#### Через Task Scheduler (Windows):
1. Создайте задачу
2. Действие: запуск программы
3. Программа: `node` (или `python`)
4. Аргументы: `update-scripts.js` (или `update_scripts.py`)
5. Рабочая папка: путь к проекту

#### Через GitHub Actions:
См. `.github/workflows/update-scripts.yml` (создать при необходимости)

## Проверка работы

После первого запуска проверьте:
1. ✅ Файлы обновились в Apps Script проекте
2. ✅ В логах нет ошибок
3. ✅ `token.json` создан (для повторных запусков)

## Troubleshooting

### Ошибка: "API not enabled"
- Убедитесь, что Apps Script API включен в Google Cloud Console

### Ошибка: "Invalid credentials"
- Проверьте формат `credentials.json`
- Убедитесь, что Client ID и Secret правильные

### Ошибка: "Permission denied"
- Проверьте Script ID
- Убедитесь, что используете тот же Google аккаунт

### Ошибка: "File not found" (GitHub)
- Проверьте URL репозитория в `.env`
- Убедитесь, что файлы существуют в репозитории

## Безопасность

⚠️ **ВАЖНО:**
- Никогда не коммитьте `.env`, `credentials.json`, `token.json` в Git
- Никогда не коммитьте файлы с токенами или ключами
- Все чувствительные файлы уже в `.gitignore`
- Храните credentials в безопасном месте
- Используйте `npm run security-check` перед коммитом
- См. [SECURITY.md](SECURITY.md) для подробной информации о безопасности

## Использование

После настройки просто запускайте:
```bash
npm run update
# или
python update_scripts.py
```

Скрипт автоматически:
1. Загрузит все файлы из GitHub
2. Обновит их в Apps Script проекте
3. Сохранит изменения

## Интеграция с системой обновлений

После автоматического обновления скриптов запустите в Apps Script:
```javascript
updateSystem()
```

Это обновит структуру таблиц согласно новой версии.

