# Где найти статус публикации (Publishing status)

## Пошаговая инструкция

### 1. Откройте Google Cloud Console

1. Откройте: https://console.cloud.google.com
2. Войдите в аккаунт Google

### 2. Выберите проект

1. Вверху страницы нажмите на название проекта (или выберите из списка)
2. Выберите проект: **calcium-vial-378411**

### 3. Откройте OAuth Consent Screen

**Способ A: Через меню**
1. В меню слева найдите **"APIs & Services"** (APIs и сервисы)
2. Нажмите на **"OAuth consent screen"** (Экран согласия OAuth)

**Способ B: Прямая ссылка**
Откройте напрямую:
```
https://console.cloud.google.com/apis/credentials/consent?project=calcium-vial-378411
```

### 4. Найдите статус публикации

На странице OAuth Consent Screen вы увидите:

**Вверху страницы:**
- **"Publishing status"** (Статус публикации)
- Текущий статус: **"Testing"** (Тестирование) или **"In production"** (В продакшене)

**Рядом со статусом:**
- Если статус "Testing" - может быть кнопка **"PUBLISH APP"** (Опубликовать приложение)
- Если статус "In production" - может быть кнопка **"BACK TO TESTING"** (Вернуться к тестированию)

---

## Где именно искать

### Вариант 1: Вверху страницы

После открытия OAuth Consent Screen:
- Вверху страницы должно быть название приложения
- Рядом или ниже - **"Publishing status"**
- Статус: **"Testing"** или **"In production"**

### Вариант 2: В боковой панели

Иногда статус показывается в боковой панели или в карточке приложения.

### Вариант 3: В настройках

1. Нажмите **"EDIT APP"** (Редактировать приложение)
2. В меню слева может быть раздел **"Publishing"** (Публикация)
3. Там можно изменить статус

---

## Что вы должны увидеть

На странице OAuth Consent Screen должно быть:

```
App information
├── App name: Management Accounting Updater
├── User support email: volosevich.flexy@gmail.com
└── Publishing status: Testing  [PUBLISH APP]
```

Или:

```
Publishing status: In production
```

---

## Если не видите статус

1. **Проверьте что вы на правильной странице:**
   - URL должен содержать: `/apis/credentials/consent`
   - Не путайте с `/apis/credentials` (это Credentials, не OAuth Consent Screen)

2. **Проверьте что выбран правильный проект:**
   - Вверху страницы должно быть: **calcium-vial-378411**

3. **Попробуйте обновить страницу:**
   - Нажмите F5 или Cmd+R

---

## Скриншот того что должно быть

На странице OAuth Consent Screen должно быть примерно так:

```
┌─────────────────────────────────────────┐
│ OAuth consent screen                    │
│                                         │
│ App information                         │
│ App name: Management Accounting Updater│
│                                         │
│ Publishing status: Testing             │
│ [PUBLISH APP] ← вот эта кнопка         │
│                                         │
│ User type: External                    │
└─────────────────────────────────────────┘
```

---

## Напишите мне

После открытия страницы напишите:

- **"Вижу статус Testing, есть кнопка PUBLISH APP"** - если видите кнопку
- **"Вижу статус Testing, но нет кнопки PUBLISH APP"** - если кнопки нет
- **"Вижу статус In production"** - если уже опубликовано
- **"Не вижу статус публикации"** - если не можете найти
- **"Не могу открыть OAuth Consent Screen"** - если не можете открыть страницу

Или опишите что вы видите на странице - я помогу найти нужный раздел!

