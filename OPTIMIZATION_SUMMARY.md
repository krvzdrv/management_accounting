# Резюме оптимизации структуры

## Что изменилось

### ✅ Объединены листы (упрощение):

1. **Sales_Orders + Sales_Order_LINES → Sales** (один лист)
   - Все данные продаж в одной таблице
   - Каждая строка = позиция в заказе
   - Соответствует формату данных из Planfix

2. **Purchase_Orders + Purchase_Order_LINES → Purchases** (один лист)
   - Аналогично продажам
   - Упрощенная структура для закупок

### ❌ Убраны листы (если не используются):

3. **Intercompany_Loans** - можно убрать, если займы учитываются через Cash_Transactions
4. **Intercompany_Loan_Payments** - можно убрать вместе с Intercompany_Loans

## Итоговая структура

### Было: 17 листов
### Стало: 13 листов (экономия 4 листа)

### Справочники (7 листов):
1. Currencies
2. Exchange_Rates
3. VAT_Rates
4. Companies
5. Counterparties
6. Products
7. Expense_Categories

### Операции (5 листов):
8. **Sales** (объединенный)
9. **Purchases** (объединенный)
10. Expenses
11. Cash_Transactions
12. Payments

### Отчеты (1 лист):
13. Account_Balances

## Преимущества

✅ **Проще импорт** - данные из CSV сразу в нужный формат  
✅ **Меньше листов** - легче ориентироваться  
✅ **Проще формулы** - не нужно связывать заголовки и строки  
✅ **Соответствует данным** - формат Planfix уже плоский  
✅ **Не влияет на расчеты** - можно группировать по номеру заказа

## Как использовать

### 1. Создание оптимизированной структуры:

```javascript
// В Google Apps Script запустите:
setupOptimizedSystem()
```

### 2. Импорт данных из CSV:

**Вариант А:** Если CSV уже в Google Sheets
```javascript
// Скопируйте данные в отдельный лист, например "CSV_Import"
// Затем запустите:
importSalesFromSheet('CSV_Import', 2)
```

**Вариант Б:** Через диалог загрузки файла
```javascript
importSalesFromCSV()
```

### 3. Структура листа Sales:

| Колонка | Описание | Источник CSV |
|---------|----------|--------------|
| order_number | Номер заказа | Zamówienie |
| order_date | Дата заказа | Data |
| realization_date | Дата реализации | Data realizacji |
| customer_name | Контрагент | Kontrahent |
| customer_id | ID контрагента | (из справочника) |
| product_name | Товар | Nazwa |
| product_id | ID товара | (из справочника) |
| product_type | Тип | Typ |
| product_color | Цвет | Kolor |
| quantity | Количество | Ilość |
| unit | Ед. измерения | j.m. |
| unit_price | Цена за ед. | Cena po rabacie |
| currency | Валюта | Waluta |
| exchange_rate | Курс | PLN/EUR |
| unit_price_pln | Цена в PLN | Cena po rabacie, PLN |
| amount_excl_vat | Сумма без НДС | Wartość netto, PLN |
| vat_rate | Ставка НДС | (рассчитывается) |
| vat_amount | Сумма НДС | (рассчитывается) |
| amount_incl_vat | Сумма с НДС | (рассчитывается) |
| commission | Комиссия | Prowizja, PLN |
| manager | Менеджер | Menedżer |
| status | Статус оплаты | (по умолчанию: unpaid) |
| payment_date | Дата оплаты | (заполняется при оплате) |
| notes | Примечания | - |

## Формулы для отчетов

### Группировка по заказам:
```excel
=SUMIF(Sales!A:A; A2; Sales!P:P)
```

### Итого по контрагенту:
```excel
=SUMIF(Sales!D:D; A2; Sales!P:P)
```

### Количество позиций в заказе:
```excel
=COUNTIF(Sales!A:A; A2)
```

## Вопросы для уточнения

1. **Закупки** будут в таком же формате (плоская структура)?
2. **Займы между компаниями** нужно учитывать отдельно?
3. **НДС** всегда 23% или разные ставки?
4. Нужен ли отдельный учет **комиссий менеджеров**?

## Следующие шаги

1. ✅ Создана оптимизированная структура
2. ✅ Создан скрипт импорта из CSV
3. ⏳ Нужно обновить формулы в отчетах (если используются)
4. ⏳ Нужно обновить функции расчета балансов (если используются)

