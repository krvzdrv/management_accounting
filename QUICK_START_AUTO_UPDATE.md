# Быстрый старт: Автоматическое обновление

## За 5 минут

### 1. Установите зависимости

**Node.js:**
```bash
npm install
```

**Python:**
```bash
pip install -r requirements.txt
```

### 2. Настройте Google Cloud

1. Откройте [Google Cloud Console](https://console.cloud.google.com)
2. Создайте проект
3. Включите **Apps Script API**
4. Создайте **OAuth 2.0 Client ID** (Desktop app)
5. Скачайте credentials как `credentials.json`

### 3. Получите Script ID

1. Откройте Apps Script проект
2. Project Settings → Script ID
3. Скопируйте ID

### 4. Создайте `.env` файл

```env
GOOGLE_CLIENT_ID=ваш_client_id
GOOGLE_CLIENT_SECRET=ваш_client_secret
GOOGLE_SCRIPT_ID=ваш_script_id
GITHUB_REPO_URL=https://github.com/username/repo-name
GITHUB_BRANCH=main
```

### 5. Запустите обновление

**Node.js:**
```bash
npm run update
```

**Python:**
```bash
python update_scripts.py
```

При первом запуске:
- Откроется браузер для авторизации
- Введите код авторизации
- Создастся `token.json`

### 6. Готово!

Теперь просто запускайте `npm run update` когда нужно обновить скрипты.

## Автоматизация

Добавьте в cron/Task Scheduler для автоматического обновления каждый день.

## Подробная инструкция

См. [SETUP_AUTO_UPDATE.md](SETUP_AUTO_UPDATE.md)

