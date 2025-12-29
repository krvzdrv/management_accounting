# Копирование credentials.json

## Что нужно сделать

Google Cloud уже создал файл с credentials. Нужно скопировать его в папку проекта.

### Способ 1: Через терминал (рекомендуется)

```bash
# Перейдите в папку проекта
cd "/Volumes/02 Data/work/Alumineu/GitHub/management_accounting"

# Скопируйте файл
cp "/Users/vladimirvolosevich/Downloads/client_secret_929817317904-f9t4f9sp2h8jp7svev9gij61tjq5.apps.googleusercontent.com.json" credentials.json

# Установите права доступа (безопасность)
chmod 600 credentials.json

# Проверьте что файл создан
ls -la credentials.json

# Проверьте что Git его игнорирует
git status
```

Файл `credentials.json` НЕ должен появиться в `git status` (благодаря `.gitignore`).

### Способ 2: Через Finder

1. Откройте Finder
2. Перейдите в папку Downloads
3. Найдите файл: `client_secret_929817317904-f9t4f9sp2h8jp7svev9gij61tjq5.apps.googleusercontent.com.json`
4. Скопируйте его (Cmd+C)
5. Перейдите в папку проекта: `/Volumes/02 Data/work/Alumineu/GitHub/management_accounting`
6. Вставьте файл (Cmd+V)
7. Переименуйте его в `credentials.json`

### Проверка

После копирования выполните:

```bash
cd "/Volumes/02 Data/work/Alumineu/GitHub/management_accounting"
ls -la credentials.json
```

Должно показать файл с правами доступа.

---

## Напишите мне

После копирования файла напишите:

- **"Готово, credentials.json скопирован"** - когда файл на месте
- **"Проблема: [описание]"** - если возникли трудности

