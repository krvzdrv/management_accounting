# ШАГ 2: Установка Node.js (или использование Python)

## Вариант A: Установить Node.js (рекомендуется)

### Способ 1: Через Homebrew (Mac)

```bash
# Установите Homebrew если еще не установлен
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Установите Node.js
brew install node

# Проверьте установку
node --version
npm --version
```

### Способ 2: Скачать установщик

1. Откройте [nodejs.org](https://nodejs.org/)
2. Скачайте LTS версию (рекомендуется)
3. Запустите установщик
4. Следуйте инструкциям установщика
5. Проверьте:
   ```bash
   node --version
   ```

### Способ 3: Через nvm (Node Version Manager)

```bash
# Установите nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Перезапустите терминал или выполните:
source ~/.zshrc

# Установите Node.js
nvm install --lts
nvm use --lts

# Проверьте
node --version
```

---

## Вариант B: Использовать Python (если не хотите устанавливать Node.js)

Если у вас уже установлен Python 3, можно использовать Python версию скрипта.

**Проверьте Python:**
```bash
python3 --version
```

Если Python установлен (версия 3.7+), можно использовать `update_scripts.py` вместо `update-scripts.js`.

---

## Что сделать

**Выберите вариант:**

1. **Установить Node.js** - если хотите использовать JavaScript версию
2. **Использовать Python** - если Python уже установлен

---

## Напишите мне

После выбора варианта напишите:

- **"Готово, Node.js установлен"** - если установили Node.js
- **"Использую Python"** - если будете использовать Python версию
- **"Проблема: [описание]"** - если возникли проблемы

**После вашего ответа я перейду к ШАГУ 3**

