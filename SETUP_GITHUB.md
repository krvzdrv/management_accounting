# Настройка GitHub репозитория (опционально)

## Важно

**GitHub репозиторий НЕ обязателен!** 

Скрипт обновления теперь работает с локальными файлами. GitHub нужен только если вы хотите:
- Хранить код в облаке (резервная копия)
- Работать в команде
- Использовать версионирование в облаке

## Если хотите использовать GitHub

### 1. Создайте репозиторий на GitHub

1. Откройте [github.com](https://github.com)
2. Войдите в аккаунт
3. Нажмите **+** → **New repository**
4. Заполните:
   - **Repository name**: `management_accounting` (или любое другое)
   - **Description**: "Management Accounting System for Alumineu"
   - **Visibility**: Private (рекомендуется) или Public
   - **НЕ добавляйте** README, .gitignore, license (они уже есть)
5. Нажмите **Create repository**

### 2. Подключите локальный репозиторий к GitHub

После создания репозитория GitHub покажет инструкции. Выполните в терминале:

```bash
cd "/Volumes/02 Data/work/Alumineu/GitHub/management_accounting"

# Добавьте remote (замените YOUR_USERNAME на ваш GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/management_accounting.git

# Или если используете SSH:
# git remote add origin git@github.com:YOUR_USERNAME/management_accounting.git

# Проверьте remote
git remote -v
```

### 3. Загрузите код на GitHub

```bash
# Добавьте все файлы (кроме игнорируемых)
git add .

# Создайте коммит
git commit -m "Initial commit: Management Accounting System"

# Загрузите на GitHub
git branch -M main
git push -u origin main
```

### 4. Обновите .env файл

Откройте `.env` и обновите URL репозитория:

```env
GITHUB_REPO_URL=https://github.com/YOUR_USERNAME/management_accounting
GITHUB_BRANCH=main
```

### 5. Проверка

После загрузки:
- Откройте ваш репозиторий на GitHub
- Убедитесь что все файлы загружены
- Убедитесь что `.env`, `credentials.json`, `token.json` НЕ загружены (благодаря `.gitignore`)

---

## Если НЕ хотите использовать GitHub

**Ничего делать не нужно!** 

Скрипт обновления работает с локальными файлами:
- Редактируйте `.gs` файлы на компьютере
- Запускайте `node update-scripts.js`
- Файлы обновятся в Apps Script

**Рекомендация:** Все равно сделайте резервную копию кода (например, на внешний диск или в Google Drive).

---

## Текущий статус

- ✅ Git репозиторий инициализирован локально
- ✅ Скрипт обновления работает с локальными файлами
- ⚠️ GitHub репозиторий не создан (но не обязателен)

**Можете продолжать работу без GitHub!**

