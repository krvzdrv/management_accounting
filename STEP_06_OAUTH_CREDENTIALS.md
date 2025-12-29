# ШАГ 6: Создание OAuth Credentials

## Что нужно сделать

### 1. Откройте Credentials (Учетные данные)

В Google Cloud Console:
1. В меню слева выберите **APIs & Services** → **Credentials**
   (Или найдите в поиске: "Credentials")

### 2. Создайте OAuth Client ID

1. На странице Credentials нажмите **+ Create Credentials** (вверху страницы)
2. Выберите **OAuth client ID** из выпадающего списка

### 3. Выберите тип приложения

Если появится окно "OAuth consent screen":
- Проверьте что все настроено правильно
- Нажмите **Continue** (или **Back to Dashboard** если уже настроено)

В окне "Create OAuth client ID":

1. **Application type**: Выберите **Desktop app** (Десктопное приложение)

2. **Name**: Введите название, например:
   - `Management Accounting Updater`
   - Или любое другое понятное название

3. Нажмите **Create**

### 4. Сохраните credentials

После создания появится окно с данными:

**Важно!** Вы увидите:
- **Client ID** (длинная строка)
- **Client secret** (длинная строка)

**Что сделать:**
1. **НЕ закрывайте это окно** пока не скопируете данные
2. Скопируйте **Client ID** и **Client secret**
3. Нажмите **OK**

### 5. Создайте файл credentials.json

**Убедитесь что вы в правильной папке:**
```bash
cd "/Volumes/02 Data/work/Alumineu/GitHub/management_accounting"
pwd  # Должен показать путь с management_accounting
```

**Создайте файл credentials.json:**

Откройте файл в редакторе (можно использовать `nano` или любой текстовый редактор):

```bash
nano credentials.json
```

**Вставьте следующий текст** (замените `YOUR_CLIENT_ID` и `YOUR_CLIENT_SECRET` на реальные значения):

```json
{
  "installed": {
    "client_id": "YOUR_CLIENT_ID",
    "project_id": "your-project-id",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "YOUR_CLIENT_SECRET",
    "redirect_uris": ["http://localhost"]
  }
}
```

**Где взять project_id:**
- В Google Cloud Console вверху страницы (рядом с названием проекта)
- Или в URL: `console.cloud.google.com/apis/credentials?project=YOUR_PROJECT_ID`

**Пример заполненного файла:**
```json
{
  "installed": {
    "client_id": "123456789-abcdefghijklmnop.apps.googleusercontent.com",
    "project_id": "management-accounting-123456",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "GOCSPX-abcdefghijklmnopqrstuvwxyz",
    "redirect_uris": ["http://localhost"]
  }
}
```

**Сохраните файл:**
- В `nano`: Нажмите `Ctrl+O` (сохранить), затем `Enter`, затем `Ctrl+X` (выйти)
- В другом редакторе: Сохраните как `credentials.json` в папке проекта

### 6. Установите правильные права доступа

```bash
chmod 600 credentials.json
```

Это ограничит доступ к файлу только для вас (безопасность).

---

## Проверка

После создания файла проверьте:

1. **Файл существует:**
   ```bash
   ls -la credentials.json
   ```
   Должен показать файл с правами `-rw-------`

2. **Файл в правильном формате:**
   ```bash
   cat credentials.json | head -5
   ```
   Должен показать начало JSON файла

3. **Файл НЕ в Git:**
   ```bash
   git status
   ```
   Файл `credentials.json` НЕ должен быть в списке изменений (благодаря `.gitignore`)

---

## Важные замечания

### Безопасность

- ✅ Файл `credentials.json` уже добавлен в `.gitignore`
- ✅ Не коммитьте этот файл в Git
- ✅ Не делитесь этим файлом ни с кем
- ✅ Храните его только на вашем компьютере

### Если потеряете файл

Не страшно! Можете:
1. Вернуться в Google Cloud Console
2. Перейти в **Credentials**
3. Найти ваш OAuth client
4. Скачать или пересоздать credentials

---

## Напишите мне

После создания `credentials.json` напишите:

- **"Готово, credentials.json создан"** - когда файл создан и сохранен
- **"Проблема: [описание]"** - если возникли трудности

**После вашего ответа я перейду к ШАГУ 7 (Проверка и первый запуск)**

