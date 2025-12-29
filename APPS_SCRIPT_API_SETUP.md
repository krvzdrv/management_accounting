# Настройка автоматического обновления через Apps Script API

## Обзор

Этот метод позволяет автоматически обновлять файлы в Google Apps Script проекте из GitHub репозитория через Apps Script API.

## Требования

1. ✅ Google Cloud проект с включенным Apps Script API
2. ✅ OAuth 2.0 credentials (Client ID и Client Secret)
3. ✅ Script ID вашего Apps Script проекта
4. ✅ Доступ к GitHub репозиторию

## Шаг 1: Настройка Google Cloud проекта

### 1.1 Создание проекта

1. Откройте [Google Cloud Console](https://console.cloud.google.com)
2. Создайте новый проект или выберите существующий
3. Запомните Project ID

### 1.2 Включение Apps Script API

1. В меню выберите **APIs & Services** → **Library**
2. Найдите **Google Apps Script API**
3. Нажмите **Enable**

### 1.3 Создание OAuth credentials

1. Перейдите в **APIs & Services** → **Credentials**
2. Нажмите **Create Credentials** → **OAuth client ID**
3. Если первый раз - настройте OAuth consent screen:
   - Выберите **External** (для личного использования)
   - Заполните обязательные поля
   - Добавьте scopes:
     - `https://www.googleapis.com/auth/script.projects`
     - `https://www.googleapis.com/auth/drive.file`
4. Выберите тип приложения: **Desktop app**
5. Назовите: "Management Accounting Updater"
6. Нажмите **Create**
7. **Скопируйте Client ID и Client Secret** (понадобятся позже)

## Шаг 2: Получение Script ID

### 2.1 Найти Script ID в Apps Script

1. Откройте ваш проект Apps Script
2. В меню: **Project Settings** (⚙️)
3. Найдите **Script ID** (внизу страницы)
4. **Скопируйте Script ID**

## Шаг 3: Установка зависимостей

### 3.1 Для Node.js (рекомендуется)

Создайте файл `package.json`:
```json
{
  "name": "apps-script-updater",
  "version": "1.0.0",
  "dependencies": {
    "googleapis": "^120.0.0",
    "google-auth-library": "^9.0.0"
  }
}
```

Установите:
```bash
npm install
```

### 3.2 Для Python

```bash
pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib
```

## Шаг 4: Настройка конфигурации

Создайте файл `.env` (не коммитьте в Git!):
```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_SCRIPT_ID=your_script_id_here
GITHUB_REPO_URL=https://github.com/username/repo-name
GITHUB_BRANCH=main
```

## Шаг 5: Авторизация

При первом запуске скрипт откроет браузер для авторизации и создаст файл `token.json` с токеном доступа.

## Использование

После настройки запускайте скрипт обновления:
```bash
node update-scripts.js
# или
python update_scripts.py
```

Скрипт автоматически:
1. Загрузит файлы из GitHub
2. Обновит их в Apps Script проекте
3. Сохранит изменения

## Безопасность

⚠️ **ВАЖНО:**
- Никогда не коммитьте `.env` файл в Git
- Добавьте `.env` и `token.json` в `.gitignore`
- Храните credentials в безопасном месте

## Troubleshooting

### Ошибка: "API not enabled"
- Убедитесь, что Apps Script API включен в Google Cloud Console

### Ошибка: "Permission denied"
- Проверьте, что используете правильный Script ID
- Убедитесь, что у OAuth приложения есть нужные scopes

### Ошибка: "Invalid credentials"
- Проверьте Client ID и Client Secret
- Убедитесь, что OAuth consent screen настроен правильно

