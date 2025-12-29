# Как получить ссылку для авторизации

## Способ 1: Запустить скрипт (рекомендуется)

Ссылка генерируется каждый раз при запуске скрипта. Выполните:

```bash
cd "/Volumes/02 Data/work/Alumineu/GitHub/management_accounting"
node update-scripts.js
```

Скрипт покажет URL в терминале после строки:
```
Visit this URL to authorize: https://accounts.google.com/...
```

---

## Способ 2: Сформировать URL вручную

URL формируется из следующих параметров:

**Базовый URL:**
```
https://accounts.google.com/o/oauth2/v2/auth
```

**С параметрами:**
```
https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fscript.projects%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.file&response_type=code&client_id=929817317904-f9t4f9sp2h8pf08jp7svev9gij61tjq5.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Foauth2callback
```

---

## Способ 3: Открыть напрямую из терминала

Выполните в терминале:

```bash
open "https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fscript.projects%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.file&response_type=code&client_id=929817317904-f9t4f9sp2h8pf08jp7svev9gij61tjq5.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Foauth2callback"
```

Это откроет URL в браузере автоматически.

---

## Рекомендуемый способ

**Запустите скрипт** - он покажет актуальный URL:

```bash
node update-scripts.js
```

Скопируйте URL из терминала и откройте в браузере.

