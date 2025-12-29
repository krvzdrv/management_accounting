# ШАГ 3: Установка зависимостей

## Предварительно: Установка Node.js

Перед установкой зависимостей нужно установить Node.js.

### Вариант A: Установить Node.js через Homebrew

```bash
# Если Homebrew еще не установлен:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# После установки Homebrew выполните команду которую он покажет (обычно):
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
eval "$(/opt/homebrew/bin/brew shellenv)"

# Установите Node.js
brew install node

# Проверьте
node --version
npm --version
```

### Вариант B: Скачать установщик Node.js

1. Откройте [nodejs.org](https://nodejs.org/)
2. Скачайте LTS версию (кнопка "Download Node.js (LTS)")
3. Запустите установщик `.pkg`
4. Следуйте инструкциям
5. Откройте новый терминал и проверьте:
   ```bash
   node --version
   ```

### Вариант C: Использовать Python (если Node.js не хотите устанавливать)

Проверьте Python:
```bash
python3 --version
```

Если Python установлен (версия 3.7+), можно использовать Python версию скрипта.

---

## После установки Node.js: Установка зависимостей

**Убедитесь что вы в правильной папке:**
```bash
cd "/Volumes/02 Data/work/Alumineu/GitHub/management_accounting"
pwd  # Должен показать путь с management_accounting
```

**Установите зависимости:**
```bash
npm install
```

**Проверка:**
- ✅ Должна создаться папка `node_modules/`
- ✅ Не должно быть ошибок
- ✅ В конце должно быть "added X packages"

---

## Напишите мне

После выполнения напишите:

- **"Готово, зависимости установлены"** - если npm install прошел успешно
- **"Использую Python"** - если будете использовать Python версию
- **"Проблема: [описание]"** - если возникли ошибки

**После вашего ответа я перейду к ШАГУ 4 (Настройка Google Cloud)**

