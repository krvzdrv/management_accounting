# Как открыть URL авторизации из терминала

## Способ 1: Скопировать и вставить в браузер (самый простой)

### На Mac:

1. **В терминале:**
   - Найдите строку с URL (после "Visit this URL to authorize:")
   - Выделите URL мышкой (или тройной клик для выделения всей строки)
   - Нажмите **Cmd+C** для копирования

2. **Откройте браузер:**
   - Откройте Chrome, Safari или Firefox
   - Нажмите **Cmd+L** (или кликните в адресную строку)
   - Нажмите **Cmd+V** для вставки
   - Нажмите **Enter**

### Пример URL:
```
https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=...
```

---

## Способ 2: Открыть напрямую из терминала (Mac)

### Команда для Mac:

```bash
open "https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fscript.projects%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.file&response_type=code&client_id=929817317904-f9t4f9sp2h8pf08jp7svev9gij61tjq5.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Foauth2callback"
```

**Но проще скопировать URL из терминала!**

---

## Способ 3: Использовать команду open с URL из переменной

Если URL очень длинный, можно:

1. **Скопировать URL из терминала** (Cmd+C после выделения)
2. **Вставить в команду:**
   ```bash
   open "ВСТАВЬТЕ_СЮДА_URL"
   ```

Или просто:
```bash
open "https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fscript.projects%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.file&response_type=code&client_id=929817317904-f9t4f9sp2h8pf08jp7svev9gij61tjq5.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Foauth2callback"
```

---

## Способ 4: Модифицировать скрипт для автоматического открытия

Можно модифицировать скрипт `update-scripts.js` чтобы он автоматически открывал браузер. Но это требует изменения кода.

---

## Рекомендуемый способ

**Самый простой способ:**

1. В терминале найдите строку:
   ```
   Visit this URL to authorize: https://accounts.google.com/...
   ```

2. **Выделите URL:**
   - Тройной клик на строке с URL (выделит всю строку)
   - Или выделите мышкой только URL часть

3. **Скопируйте:**
   - **Cmd+C** (или правая кнопка мыши → Copy)

4. **Откройте браузер:**
   - Нажмите **Cmd+Space** (Spotlight)
   - Введите "Chrome" или "Safari"
   - Нажмите Enter

5. **Вставьте URL:**
   - Нажмите **Cmd+L** (фокус на адресную строку)
   - Нажмите **Cmd+V** (вставить)
   - Нажмите **Enter**

---

## Быстрая команда для Mac

Если хотите открыть напрямую из терминала, выполните:

```bash
open "https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fscript.projects%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.file&response_type=code&client_id=929817317904-f9t4f9sp2h8pf08jp7svev9gij61tjq5.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Foauth2callback"
```

Но **проще скопировать URL из терминала** где он уже показан!

---

## После открытия URL

1. Авторизуйтесь в Google
2. Разрешите доступ
3. Скопируйте код из URL адресной строки
4. Вставьте код в терминал

---

## Напишите мне

После открытия URL и авторизации напишите:
- **"URL открыт, авторизовался"** - если все работает
- **"Проблема: [описание]"** - если возникли трудности

