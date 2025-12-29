# Оптимизированная структура под формат Planfix CSV

## Анализ данных из Planfix

Ваши данные имеют **плоскую структуру** - каждая строка это позиция в заказе:
- Номер заказа повторяется для всех позиций одного заказа
- Все данные в одной строке (нет разделения на заголовки и строки)
- Есть все необходимые поля: номер, дата, контрагент, товар, количество, цена, валюта, курс, суммы

## Рекомендуемая оптимизация

### ✅ Можно объединить (упростить):

#### 1. **Sales_Orders + Sales_Order_LINES → Sales** (один лист)
**Причина:** Данные из Planfix уже в плоском формате, каждая строка = позиция заказа

**Структура листа Sales:**
- `order_number` - Номер заказа (Zamówienie)
- `order_date` - Дата заказа (Data)
- `realization_date` - Дата реализации (Data realizacji)
- `customer_name` - Название контрагента (Kontrahent)
- `customer_id` - ID контрагента (из справочника)
- `product_name` - Название товара (Nazwa)
- `product_id` - ID товара (из справочника)
- `product_type` - Тип товара (Typ)
- `product_color` - Цвет (Kolor)
- `quantity` - Количество (Ilość)
- `unit` - Единица измерения (j.m.)
- `unit_price` - Цена за единицу (Cena po rabacie)
- `currency` - Валюта (Waluta)
- `exchange_rate` - Курс валюты (PLN/EUR)
- `unit_price_pln` - Цена в PLN (Cena po rabacie, PLN)
- `amount_excl_vat` - Сумма без НДС (Wartość netto, PLN)
- `vat_amount` - Сумма НДС (рассчитывается)
- `amount_incl_vat` - Сумма с НДС (рассчитывается)
- `commission` - Комиссия (Prowizja, PLN)
- `manager` - Менеджер (Menedżer)
- `status` - Статус оплаты
- `payment_date` - Дата оплаты

#### 2. **Purchase_Orders + Purchase_Order_LINES → Purchases** (один лист)
**Причина:** Если закупки будут в таком же формате

**Структура аналогична Sales, но:**
- `supplier_name` вместо `customer_name`
- `supplier_id` вместо `customer_id`
- `who_paid` - Кто оплатил (для отслеживания финансирования)

### ⚠️ Можно убрать (если не используются):

#### 3. **Intercompany_Loans + Intercompany_Loan_Payments**
**Условие:** Если займы между компаниями не будут учитываться отдельно

**Альтернатива:** Учитывать через Cash_Transactions с типом 'loan'

#### 4. **Intercompany_Loan_Payments** (точно не нужен)
**Причина:** Если нет Intercompany_Loans, то и платежи по ним не нужны

### ✅ Обязательно оставить:

- **Currencies** - нужен
- **Exchange_Rates** - нужен
- **VAT_Rates** - нужен (или можно убрать, если НДС всегда 23%)
- **Companies** - нужен
- **Counterparties** - нужен
- **Products** - нужен
- **Expense_Categories** - нужен
- **Expenses** - нужен
- **Cash_Transactions** - нужен
- **Payments** - нужен
- **Account_Balances** - нужен (для расчетов)

## Итоговая структура (оптимизированная)

### Справочники (7 листов):
1. Currencies
2. Exchange_Rates
3. VAT_Rates (или убрать, если всегда 23%)
4. Companies
5. Counterparties
6. Products
7. Expense_Categories

### Операции (5 листов вместо 9):
8. **Sales** (объединенный Sales_Orders + Sales_Order_LINES)
9. **Purchases** (объединенный Purchase_Orders + Purchase_Order_LINES)
10. Expenses
11. Cash_Transactions
12. Payments

### Отчеты (1 лист):
13. Account_Balances

**Итого: 13 листов вместо 17** (экономия 4 листа)

## Преимущества упрощенной структуры:

✅ Проще импорт данных из CSV  
✅ Меньше листов для управления  
✅ Проще формулы и отчеты  
✅ Соответствует формату ваших данных  
✅ Не влияет на расчеты (можно группировать по номеру заказа)

## Что нужно изменить:

1. Объединить Sales_Orders + Sales_Order_LINES в Sales
2. Объединить Purchase_Orders + Purchase_Order_LINES в Purchases
3. Убрать Intercompany_Loans (если не используется)
4. Убрать Intercompany_Loan_Payments (если не используется)
5. Обновить формулы в отчетах
6. Создать скрипт импорта из CSV

## Вопросы для уточнения:

1. **Закупки** будут в таком же формате (плоская структура)?
2. **Займы между компаниями** нужно учитывать отдельно или через Cash_Transactions?
3. **НДС** всегда 23% или разные ставки?
4. Нужен ли отдельный учет **комиссий менеджеров**?

