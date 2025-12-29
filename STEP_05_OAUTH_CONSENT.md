# ШАГ 5: Настройка OAuth Consent Screen

## Что нужно сделать

### 1. Откройте OAuth Consent Screen

В Google Cloud Console:
1. В меню слева выберите **APIs & Services** → **OAuth consent screen**
   (Или найдите в поиске: "OAuth consent screen")

### 2. Выберите тип приложения

На странице выберите:
- **External** (Внешний) - выберите этот вариант
- Нажмите **Create**

**Примечание:** Если вы видите только "Internal" (Внутренний), это значит что у вас Google Workspace. В этом случае выберите "Internal".

### 3. Заполните информацию о приложении

**App information:**
- **App name**: `Management Accounting Updater` (или любое другое название)
- **User support email**: Ваш email (выберите из списка)
- **App logo**: Можно пропустить (необязательно)

Нажмите **Save and Continue**

### 4. Настройте Scopes (Области доступа)

На странице **Scopes**:

1. Нажмите **Add or Remove Scopes**

2. В открывшемся окне найдите и добавьте следующие scopes:
   - `https://www.googleapis.com/auth/script.projects` - для работы с Apps Script API
   - `https://www.googleapis.com/auth/drive.file` - для доступа к файлам

3. Нажмите **Update**

4. Нажмите **Save and Continue**

### 5. Добавьте тестовых пользователей (если нужно)

Если вы выбрали **External** тип:

1. На странице **Test users** нажмите **Add Users**
2. Добавьте ваш email адрес (тот же, который используете для Google Sheets)
3. Нажмите **Add**
4. Нажмите **Save and Continue**

**Примечание:** Если выбрали "Internal", этот шаг можно пропустить.

### 6. Просмотрите сводку

На странице **Summary** проверьте:
- ✅ App name указан
- ✅ Scopes добавлены (2 штуки)
- ✅ Test users добавлены (если External)

Нажмите **Back to Dashboard**

---

## Проверка

После настройки вы должны увидеть:
- ✅ OAuth consent screen настроен
- ✅ Статус: "Testing" (если External) или "Published" (если Internal)
- ✅ Scopes: 2 области доступа

---

## Напишите мне

После настройки OAuth Consent Screen напишите:

- **"Готово, OAuth настроен"** - когда все шаги выполнены
- **"Проблема: [описание]"** - если возникли трудности

**После вашего ответа я перейду к ШАГУ 6 (Создание OAuth Credentials)**

