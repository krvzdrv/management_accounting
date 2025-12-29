# Загрузка проекта на GitHub

## Шаг 1: Проверка безопасности

Перед загрузкой на GitHub убедимся что секретные файлы не попадут в репозиторий.

### Проверьте .gitignore

```bash
cd "/Volumes/02 Data/work/Alumineu/GitHub/management_accounting"
cat .gitignore | grep -E "(\.env|credentials|token)"
```

Должны быть строки:
- `.env`
- `credentials.json`
- `token.json`

### Проверьте что секретные файлы не в Git

```bash
git status
```

Файлы `.env`, `credentials.json`, `token.json` **НЕ должны** появиться в списке.

---

## Шаг 2: Создайте репозиторий на GitHub

### Вариант A: Через веб-интерфейс

1. Откройте [github.com](https://github.com)
2. Войдите в аккаунт
3. Нажмите **+** → **New repository**
4. Заполните:
   - **Repository name**: `management_accounting`
   - **Description**: "Management Accounting System for Alumineu"
   - **Visibility**: **Private** (рекомендуется) или Public
   - **НЕ добавляйте** README, .gitignore, license (они уже есть)
5. Нажмите **Create repository**

### Вариант B: Через GitHub CLI (если установлен)

```bash
gh repo create management_accounting --private --source=. --remote=origin --push
```

---

## Шаг 3: Подключите локальный репозиторий к GitHub

После создания репозитория GitHub покажет инструкции. Выполните:

```bash
cd "/Volumes/02 Data/work/Alumineu/GitHub/management_accounting"

# Добавьте remote (замените YOUR_USERNAME на ваш GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/management_accounting.git

# Или если используете SSH:
# git remote add origin git@github.com:YOUR_USERNAME/management_accounting.git

# Проверьте remote
git remote -v
```

---

## Шаг 4: Добавьте все файлы и загрузите

```bash
# Добавьте все файлы (кроме игнорируемых)
git add .

# Проверьте что секретные файлы НЕ добавлены
git status

# Создайте коммит
git commit -m "Initial commit: Management Accounting System"

# Загрузите на GitHub
git branch -M main
git push -u origin main
```

---

## Шаг 5: Проверка

После загрузки:

1. Откройте ваш репозиторий на GitHub
2. Убедитесь что все файлы загружены:
   - ✅ Все `.gs` файлы
   - ✅ Все `.md` файлы (документация)
   - ✅ `package.json`, `requirements.txt`
   - ✅ `.gitignore`
3. Убедитесь что секретные файлы **НЕ загружены**:
   - ❌ `.env` - не должно быть
   - ❌ `credentials.json` - не должно быть
   - ❌ `token.json` - не должно быть
   - ❌ `node_modules/` - не должно быть

---

## Если возникли проблемы

### Ошибка: "remote origin already exists"

```bash
# Удалите старый remote
git remote remove origin

# Добавьте заново
git remote add origin https://github.com/YOUR_USERNAME/management_accounting.git
```

### Ошибка: "Authentication failed"

1. Используйте Personal Access Token вместо пароля
2. Или настройте SSH ключи
3. Или используйте GitHub CLI

### Ошибка: "Permission denied"

Убедитесь что:
- Репозиторий создан на GitHub
- URL репозитория правильный
- У вас есть права на запись в репозиторий

---

## Обновление .env файла (опционально)

Если хотите указать URL репозитория в `.env`:

```bash
nano .env
```

Добавьте или обновите:
```env
GITHUB_REPO_URL=https://github.com/YOUR_USERNAME/management_accounting
GITHUB_BRANCH=main
```

---

## Напишите мне

После загрузки на GitHub напишите:
- **"Готово, репозиторий создан и код загружен"** - если все работает
- **"Проблема: [описание]"** - если возникли трудности

Или если нужна помощь с каким-то конкретным шагом!

