# Таблица соответствия файлов и кода

## Какой код в какой файл вставлять

Используйте эту таблицу как справочник при установке. Для каждого файла в Google Apps Script скопируйте код из соответствующего файла `.gs`.

| № | Название файла в Google Apps Script | Исходный файл с кодом | Что делает |
|---|-------------------------------------|------------------------|------------|
| 1 | **Config** | `Config.gs` | Конфигурация системы, константы, названия таблиц |
| 2 | **Utils** | `Utils.gs` | Вспомогательные функции (ID, форматирование, логирование) |
| 3 | **CurrencyManager** | `CurrencyManager.gs` | Управление валютами и курсами валют |
| 4 | **VATCalculator** | `VATCalculator.gs` | Расчеты НДС (от суммы без НДС, из суммы с НДС) |
| 5 | **PaymentManager** | `PaymentManager.gs` | Управление платежами, расчет остатков по документам |
| 6 | **DebtCalculator** | `DebtCalculator.gs` | Расчет задолженностей по контрагентам |
| 7 | **Notifications** | `Notifications.gs` | Отправка уведомлений по email о просрочке |
| 8 | **Triggers** | `Triggers.gs` | Настройка автоматических триггеров |
| 9 | **TestDataLoader** | `TestDataLoader.gs` | Загрузка тестовых данных для проверки системы |
| 10 | **Main** | `Main.gs` | Главное меню и функция инициализации системы |
| 11 | **VersionManager** | `VersionManager.gs` | Управление версиями системы |
| 12 | **UpdateManager** | `UpdateManager.gs` | Менеджер обновлений системы |
| 13 | **MigrationScripts** | `MigrationScripts.gs` | Скрипты миграции между версиями |

## Порядок создания файлов

**Важно:** Порядок создания файлов не имеет значения, но рекомендуется создавать их в указанном порядке для удобства.

### Минимальный набор (обязательные файлы):
1. Config
2. Utils
3. Main

### Полный набор (все функции):
Все 13 файлов из таблицы выше (включая систему обновлений).

## Проверка правильности копирования

После создания каждого файла проверьте:

- ✅ Файл создан и переименован правильно
- ✅ Код скопирован полностью (от начала до конца)
- ✅ Нет ошибок синтаксиса (подсветка кода должна быть нормальной)
- ✅ Файл сохранен (Ctrl+S)

## Что делать если код не работает

1. **Проверьте все файлы созданы** - должно быть 13 файлов (или 10 без системы обновлений)
2. **Проверьте названия файлов** - они должны точно совпадать с таблицей выше
3. **Проверьте код скопирован полностью** - от первой до последней строки
4. **Проверьте сохранение** - нажмите Ctrl+S в каждом файле
5. **Проверьте логи** - Вид → Логи в редакторе скриптов

## Зависимости между файлами

```
Config.gs
  └── Используется всеми остальными файлами

Utils.gs
  └── Используется всеми остальными файлами

CurrencyManager.gs
  ├── Использует: Config, Utils
  └── Используется: PaymentManager, DebtCalculator

VATCalculator.gs
  ├── Использует: Config, Utils
  └── Используется: PaymentManager

PaymentManager.gs
  ├── Использует: Config, Utils, CurrencyManager, VATCalculator
  └── Используется: DebtCalculator, Notifications

DebtCalculator.gs
  ├── Использует: Config, Utils, CurrencyManager, PaymentManager
  └── Используется: Notifications

Notifications.gs
  ├── Использует: Config, Utils, DebtCalculator
  └── Используется: Triggers

Triggers.gs
  └── Использует: Config, Utils, CurrencyManager, DebtCalculator, Notifications

TestDataLoader.gs
  └── Использует: Все остальные модули

Main.gs
  └── Использует: Все остальные модули

VersionManager.gs
  └── Использует: Utils
  └── Используется: UpdateManager

UpdateManager.gs
  ├── Использует: Config, Utils, VersionManager
  └── Используется: Main

MigrationScripts.gs
  ├── Использует: Config, Utils, UpdateManager
  └── Используется: UpdateManager
```

## Быстрая проверка установки

Выполните эту команду в редакторе скриптов для проверки:

```javascript
function testInstallation() {
  try {
    getSpreadsheet();
    Logger.log('✓ Config loaded');
    
    getNextId(CONFIG.SHEET_NAMES.COMPANIES);
    Logger.log('✓ Utils loaded');
    
    getExchangeRate('EUR', 'PLN', new Date());
    Logger.log('✓ CurrencyManager loaded');
    
    calculateVAT(100, 23);
    Logger.log('✓ VATCalculator loaded');
    
    Logger.log('✅ All modules loaded successfully!');
  } catch (error) {
    Logger.log('❌ Error: ' + error.message);
  }
}
```

Если все модули загружены, вы увидите сообщения с галочками в логах.

