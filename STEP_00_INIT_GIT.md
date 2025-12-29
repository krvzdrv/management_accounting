# Инициализация Git репозитория

## Что нужно сделать

### 1. Инициализируйте Git репозиторий

```bash
cd "/Volumes/02 Data/work/Alumineu/GitHub/management_accounting"
git init
```

### 2. Проверьте .gitignore

Убедитесь что файл `.gitignore` существует и содержит правильные правила:

```bash
cat .gitignore
```

Должны быть строки:
- `credentials.json`
- `token.json`
- `.env`
- `node_modules/`

### 3. Добавьте файлы в Git

```bash
# Добавьте все файлы (кроме игнорируемых)
git add .

# Проверьте что секретные файлы НЕ добавлены
git status
```

**Важно:** Файлы `credentials.json`, `token.json`, `.env` **НЕ должны** появиться в `git status`.

### 4. Создайте первый коммит

```bash
git commit -m "Initial commit: Management Accounting System"
```

### 5. (Опционально) Подключите к GitHub

Если у вас уже есть репозиторий на GitHub:

```bash
git remote add origin https://github.com/your-username/management_accounting.git
git branch -M main
git push -u origin main
```

Если репозитория на GitHub еще нет:
1. Создайте новый репозиторий на GitHub
2. Скопируйте URL репозитория
3. Выполните команды выше с вашим URL

---

## Проверка

После инициализации проверьте:

```bash
# Проверьте статус
git status

# Проверьте что секретные файлы игнорируются
ls -la credentials.json token.json .env 2>/dev/null | wc -l
# Должно показать количество файлов, но они не должны быть в git status
```

---

## Важно

**Никогда не коммитьте:**
- ❌ `credentials.json`
- ❌ `token.json`
- ❌ `.env`
- ❌ `node_modules/`

**Всегда коммитьте:**
- ✅ Все `.gs` файлы (скрипты)
- ✅ Все `.md` файлы (документация)
- ✅ `package.json`, `requirements.txt`
- ✅ `.gitignore`

