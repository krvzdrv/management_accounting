/**
 * ОПТИМИЗИРОВАННАЯ НАСТРОЙКА СИСТЕМЫ
 * Под формат данных из Planfix (плоская структура)
 * 
 * ИСПОЛЬЗОВАНИЕ:
 * 1. Скопируйте весь этот файл в Google Apps Script
 * 2. Запустите функцию setupOptimizedSystem()
 * 3. Готово! Все таблицы созданы и настроены
 */

function setupOptimizedSystem() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ui = SpreadsheetApp.getUi();
    
    const response = ui.alert(
      'Настройка оптимизированной системы',
      'Это создаст упрощенную структуру под формат Planfix CSV. Продолжить?',
      ui.ButtonSet.YES_NO
    );
    
    if (response !== ui.Button.YES) {
      return;
    }
    
    Logger.log('Начало настройки оптимизированной системы...');
    
    // Создаем справочники
    createCurrenciesSheet(ss);
    createExchangeRatesSheet(ss);
    createVATRatesSheet(ss);
    createCompaniesSheet(ss);
    createCounterpartiesSheet(ss);
    createProductsSheet(ss);
    createExpenseCategoriesSheet(ss);
    
    // Создаем упрощенные транзакционные таблицы
    createSalesSheet(ss);  // Объединенный Sales_Orders + Sales_Order_LINES
    createPurchasesSheet(ss);  // Объединенный Purchase_Orders + Purchase_Order_Lines
    createExpensesSheet(ss);
    createCashTransactionsSheet(ss);
    createPaymentsSheet(ss);
    
    // Займы между компаниями (оставляем, так как нужны)
    createIntercompanyLoansSheet(ss);
    createIntercompanyLoanPaymentsSheet(ss);
    
    // Создаем отчетные таблицы
    createAccountBalancesSheet(ss);
    
    ui.alert('Успех', 'Оптимизированная система успешно настроена! Все таблицы созданы.', ui.ButtonSet.OK);
    Logger.log('Настройка завершена успешно');
    
  } catch (error) {
    Logger.log('Ошибка: ' + error.toString());
    SpreadsheetApp.getUi().alert('Ошибка', 'Ошибка настройки: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// ========== СПРАВОЧНИКИ (без изменений) ==========

function createCurrenciesSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'Currencies');
  sheet.clear();
  
  const headers = [['currency_code', 'currency_name', 'symbol', 'is_base_currency', 'is_active']];
  const data = [
    ['EUR', 'Евро', '€', true, true],
    ['PLN', 'Злотый', 'zł', false, true],
    ['USD', 'Доллар США', '$', false, true]
  ];
  
  sheet.getRange(1, 1, headers.length, headers[0].length).setValues(headers);
  sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
  
  formatHeaderRow(sheet);
  setColumnWidths(sheet, [100, 120, 80, 120, 80]);
  sheet.setFrozenRows(1);
}

function createExchangeRatesSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'Exchange_Rates');
  sheet.clear();
  
  const headers = [['rate_id', 'currency_from', 'currency_to', 'rate', 'rate_date', 'source', 'created_at']];
  const today = new Date();
  
  const data = [
    [1, 'EUR', 'PLN', 4.35, today, 'manual', today],
    [2, 'EUR', 'USD', 1.08, today, 'manual', today]
  ];
  
  sheet.getRange(1, 1, headers.length, headers[0].length).setValues(headers);
  sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
  
  formatHeaderRow(sheet);
  setColumnWidths(sheet, [80, 120, 120, 100, 120, 100, 150]);
  sheet.getRange('E:E').setNumberFormat('dd.mm.yyyy');
  sheet.getRange('G:G').setNumberFormat('dd.mm.yyyy HH:mm');
  sheet.setFrozenRows(1);
}

function createVATRatesSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'VAT_Rates');
  sheet.clear();
  
  const headers = [['vat_id', 'vat_rate', 'vat_description', 'country_code', 'valid_from', 'valid_to', 'is_active']];
  const today = new Date();
  
  const data = [
    [1, 23, 'Стандартная ставка', 'PL', today, null, true],
    [2, 8, 'Пониженная ставка', 'PL', today, null, true],
    [3, 0, 'Без НДС', 'PL', today, null, true]
  ];
  
  sheet.getRange(1, 1, headers.length, headers[0].length).setValues(headers);
  sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
  
  formatHeaderRow(sheet);
  setColumnWidths(sheet, [80, 80, 150, 100, 120, 120, 80]);
  sheet.getRange('E:F').setNumberFormat('dd.mm.yyyy');
  sheet.setFrozenRows(1);
}

function createCompaniesSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'Companies');
  sheet.clear();
  
  const headers = [['company_id', 'company_code', 'company_name', 'tax_number', 'country_code', 'is_active']];
  const data = [
    [1, 'ALUM', 'Alumineu', 'PL1234567890', 'PL', true],
    [2, 'VERS', 'Versatrade', 'PL0987654321', 'PL', true],
    [3, 'FLEX', 'Flexy', 'BY123456789', 'BY', true]
  ];
  
  sheet.getRange(1, 1, headers.length, headers[0].length).setValues(headers);
  sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
  
  formatHeaderRow(sheet);
  setColumnWidths(sheet, [100, 100, 150, 150, 100, 80]);
  sheet.setFrozenRows(1);
}

function createCounterpartiesSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'Counterparties');
  sheet.clear();
  
  const headers = [['counterparty_id', 'counterparty_code', 'counterparty_name', 'counterparty_type', 'tax_number', 'country_code', 'currency_default', 'payment_terms', 'credit_limit', 'is_active', 'created_at']];
  const today = new Date();
  
  const data = [
    [1, 'FLEXY', 'Flexy', 'supplier', 'BY987654321', 'BY', 'EUR', 30, 50000, true, today],
    [2, 'MEDIATOR', 'Посредник', 'supplier', 'PL111222333', 'PL', 'EUR', 14, 20000, true, today],
    [3, 'FACTORY', 'Завод', 'supplier', 'PL444555666', 'PL', 'EUR', 30, 100000, true, today],
    [4, 'CLIENT1', 'Клиент 1', 'customer', 'PL777888999', 'PL', 'EUR', 30, 30000, true, today]
  ];
  
  sheet.getRange(1, 1, headers.length, headers[0].length).setValues(headers);
  sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
  
  formatHeaderRow(sheet);
  setColumnWidths(sheet, [120, 120, 150, 120, 120, 100, 120, 100, 100, 80, 150]);
  sheet.getRange('K:K').setNumberFormat('dd.mm.yyyy HH:mm');
  sheet.setFrozenRows(1);
}

function createProductsSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'Products');
  sheet.clear();
  
  const headers = [['product_id', 'product_code', 'product_name', 'product_category', 'unit_of_measure', 'vat_rate_default', 'is_active']];
  
  sheet.getRange(1, 1, headers.length, headers[0].length).setValues(headers);
  
  formatHeaderRow(sheet);
  setColumnWidths(sheet, [100, 120, 250, 180, 120, 120, 80]);
  sheet.setFrozenRows(1);
}

function createExpenseCategoriesSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'Expense_Categories');
  sheet.clear();
  
  const headers = [['category_id', 'category_code', 'category_name', 'parent_category_id', 'vat_rate_default', 'is_active']];
  
  const data = [
    [1, 'RENT', 'Аренда', null, 23, true],
    [2, 'TRANSPORT', 'Транспорт', null, 23, true],
    [3, 'SALARY', 'Зарплата', null, 0, true],
    [4, 'MARKETING', 'Маркетинг', null, 23, true],
    [5, 'UTILITIES', 'Коммунальные услуги', null, 8, true]
  ];
  
  sheet.getRange(1, 1, headers.length, headers[0].length).setValues(headers);
  sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
  
  formatHeaderRow(sheet);
  setColumnWidths(sheet, [100, 120, 200, 150, 120, 80]);
  sheet.setFrozenRows(1);
}

// ========== УПРОЩЕННЫЕ ТРАНЗАКЦИОННЫЕ ТАБЛИЦЫ ==========

function createSalesSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'Sales');
  sheet.clear();
  
  // Объединенная структура: заголовок + строки в одном листе
  const headers = [
    'order_number',        // Номер заказа (Zamówienie)
    'order_date',         // Дата заказа (Data)
    'realization_date',    // Дата реализации (Data realizacji)
    'customer_name',      // Название контрагента (Kontrahent)
    'customer_id',        // ID контрагента (из справочника)
    'product_name',       // Название товара (Nazwa)
    'product_id',         // ID товара (из справочника)
    'product_type',       // Тип товара (Typ)
    'product_color',      // Цвет (Kolor)
    'quantity',           // Количество (Ilość)
    'unit',               // Единица измерения (j.m.)
    'unit_price',         // Цена за единицу (Cena po rabacie)
    'currency',           // Валюта (Waluta)
    'exchange_rate',      // Курс валюты (PLN/EUR)
    'unit_price_pln',     // Цена в PLN (Cena po rabacie, PLN)
    'amount_excl_vat',    // Сумма без НДС (Wartość netto, PLN)
    'vat_rate',           // Ставка НДС (%)
    'vat_amount',         // Сумма НДС (рассчитывается)
    'amount_incl_vat',    // Сумма с НДС (рассчитывается)
    'commission',         // Комиссия (Prowizja, PLN)
    'manager',            // Менеджер (Menedżer)
    'status',             // Статус оплаты
    'payment_date',       // Дата оплаты
    'notes'               // Примечания
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Формулы для расчетов
  const formulaRow = 2;
  sheet.getRange(formulaRow, 18).setFormula('=Q' + formulaRow + '*P' + formulaRow + '/100'); // vat_amount
  sheet.getRange(formulaRow, 19).setFormula('=P' + formulaRow + '+R' + formulaRow); // amount_incl_vat
  
  formatHeaderRow(sheet);
  setColumnWidths(sheet, [120, 100, 120, 200, 100, 250, 100, 100, 100, 80, 80, 100, 80, 100, 100, 120, 80, 120, 120, 100, 150, 100, 100, 200]);
  
  sheet.getRange('B:C').setNumberFormat('dd.mm.yyyy');
  sheet.getRange('W:W').setNumberFormat('dd.mm.yyyy');
  sheet.getRange('K:K').setNumberFormat('#,##0.00');
  sheet.getRange('L:L').setNumberFormat('#,##0.00');
  sheet.getRange('N:O').setNumberFormat('#,##0.00');
  sheet.getRange('P:R').setNumberFormat('#,##0.00');
  sheet.getRange('S:T').setNumberFormat('#,##0.00');
  sheet.setFrozenRows(1);
}

function createPurchasesSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'Purchases');
  sheet.clear();
  
  // Аналогичная структура для закупок
  const headers = [
    'order_number',        // Номер заказа
    'order_date',         // Дата заказа
    'supplier_name',      // Название поставщика
    'supplier_id',        // ID поставщика
    'product_name',       // Название товара
    'product_id',         // ID товара
    'product_type',       // Тип товара
    'product_color',      // Цвет
    'quantity',           // Количество
    'unit',               // Единица измерения
    'unit_price',         // Цена за единицу
    'currency',           // Валюта
    'exchange_rate',      // Курс валюты
    'unit_price_base',    // Цена в базовой валюте
    'amount_excl_vat',    // Сумма без НДС
    'vat_rate',           // Ставка НДС (%)
    'vat_amount',         // Сумма НДС (рассчитывается)
    'amount_incl_vat',    // Сумма с НДС (рассчитывается)
    'who_paid',           // Кто оплатил (для отслеживания финансирования)
    'status',             // Статус оплаты
    'payment_date',       // Дата оплаты
    'notes'               // Примечания
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Формулы для расчетов
  const formulaRow = 2;
  sheet.getRange(formulaRow, 17).setFormula('=O' + formulaRow + '*P' + formulaRow + '/100'); // vat_amount
  sheet.getRange(formulaRow, 18).setFormula('=O' + formulaRow + '+Q' + formulaRow); // amount_incl_vat
  
  formatHeaderRow(sheet);
  setColumnWidths(sheet, [120, 100, 200, 100, 250, 100, 100, 100, 80, 80, 100, 80, 100, 100, 120, 80, 120, 120, 120, 100, 100, 200]);
  
  sheet.getRange('B:B').setNumberFormat('dd.mm.yyyy');
  sheet.getRange('U:U').setNumberFormat('dd.mm.yyyy');
  sheet.getRange('I:I').setNumberFormat('#,##0.00');
  sheet.getRange('J:J').setNumberFormat('#,##0.00');
  sheet.getRange('K:K').setNumberFormat('#,##0.00');
  sheet.getRange('M:N').setNumberFormat('#,##0.00');
  sheet.getRange('O:Q').setNumberFormat('#,##0.00');
  sheet.getRange('R:R').setNumberFormat('#,##0.00');
  sheet.setFrozenRows(1);
}

function createExpensesSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'Expenses');
  sheet.clear();
  
  const headers = [['expense_id', 'expense_number', 'company_id', 'expense_date', 'category_id', 'supplier_id', 'description', 'currency_code', 'exchange_rate', 'amount_excl_vat', 'vat_rate', 'vat_amount', 'amount_incl_vat', 'payment_status', 'payment_date', 'notes', 'created_at']];
  
  sheet.getRange(1, 1, 1, headers[0].length).setValues(headers);
  
  // Формулы для расчетов
  const formulaRow = 2;
  sheet.getRange(formulaRow, 12).setFormula('=J' + formulaRow + '*K' + formulaRow + '/100'); // vat_amount
  sheet.getRange(formulaRow, 13).setFormula('=J' + formulaRow + '+L' + formulaRow); // amount_incl_vat
  
  formatHeaderRow(sheet);
  setColumnWidths(sheet, [100, 150, 100, 100, 100, 100, 250, 100, 100, 120, 80, 120, 150, 120, 120, 200, 150]);
  sheet.getRange('D:D').setNumberFormat('dd.mm.yyyy');
  sheet.getRange('O:O').setNumberFormat('dd.mm.yyyy');
  sheet.getRange('J:J').setNumberFormat('#,##0.00');
  sheet.getRange('K:K').setNumberFormat('0');
  sheet.getRange('L:M').setNumberFormat('#,##0.00');
  sheet.getRange('Q:Q').setNumberFormat('dd.mm.yyyy HH:mm');
  sheet.setFrozenRows(1);
}

function createCashTransactionsSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'Cash_Transactions');
  sheet.clear();
  
  const headers = [['transaction_id', 'transaction_number', 'company_id', 'transaction_date', 'transaction_type', 'payment_method', 'account_from', 'account_to', 'counterparty_id', 'related_document_type', 'related_document_number', 'currency_code', 'amount', 'exchange_rate', 'amount_base_currency', 'description', 'created_at']];
  
  sheet.getRange(1, 1, 1, headers[0].length).setValues(headers);
  
  // Формула для конвертации в базовую валюту
  const formulaRow = 2;
  sheet.getRange(formulaRow, 15).setFormula('=M' + formulaRow + '*N' + formulaRow); // amount_base_currency
  
  formatHeaderRow(sheet);
  setColumnWidths(sheet, [120, 150, 100, 100, 120, 120, 120, 120, 100, 150, 120, 100, 120, 100, 150, 250, 150]);
  sheet.getRange('D:D').setNumberFormat('dd.mm.yyyy');
  sheet.getRange('M:M').setNumberFormat('#,##0.00');
  sheet.getRange('N:O').setNumberFormat('#,##0.00');
  sheet.getRange('Q:Q').setNumberFormat('dd.mm.yyyy HH:mm');
  sheet.setFrozenRows(1);
}

function createPaymentsSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'Payments');
  sheet.clear();
  
  const headers = [['payment_id', 'payment_number', 'payment_date', 'company_id', 'counterparty_id', 'document_type', 'document_number', 'currency_code', 'payment_amount', 'exchange_rate', 'cash_transaction_id', 'notes', 'created_at']];
  
  sheet.getRange(1, 1, 1, headers[0].length).setValues(headers);
  
  formatHeaderRow(sheet);
  setColumnWidths(sheet, [100, 150, 100, 100, 100, 120, 120, 100, 120, 100, 150, 200, 150]);
  sheet.getRange('C:C').setNumberFormat('dd.mm.yyyy');
  sheet.getRange('I:I').setNumberFormat('#,##0.00');
  sheet.getRange('J:J').setNumberFormat('#,##0.00');
  sheet.getRange('M:M').setNumberFormat('dd.mm.yyyy HH:mm');
  sheet.setFrozenRows(1);
}

function createIntercompanyLoansSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'Intercompany_Loans');
  sheet.clear();
  
  const headers = [['loan_id', 'loan_number', 'loan_date', 'lender_company_id', 'borrower_company_id', 'currency_code', 'loan_amount', 'interest_rate', 'repayment_due_date', 'status', 'created_at']];
  
  sheet.getRange(1, 1, 1, headers[0].length).setValues(headers);
  
  formatHeaderRow(sheet);
  setColumnWidths(sheet, [100, 150, 100, 100, 100, 100, 120, 100, 120, 100, 150]);
  sheet.getRange('C:C').setNumberFormat('dd.mm.yyyy');
  sheet.getRange('I:I').setNumberFormat('dd.mm.yyyy');
  sheet.getRange('G:G').setNumberFormat('#,##0.00');
  sheet.getRange('H:H').setNumberFormat('0.00');
  sheet.getRange('K:K').setNumberFormat('dd.mm.yyyy HH:mm');
  sheet.setFrozenRows(1);
}

function createIntercompanyLoanPaymentsSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'Intercompany_Loan_Payments');
  sheet.clear();
  
  const headers = [['payment_id', 'loan_id', 'payment_date', 'payment_amount', 'cash_transaction_id', 'created_at']];
  
  sheet.getRange(1, 1, 1, headers[0].length).setValues(headers);
  
  formatHeaderRow(sheet);
  setColumnWidths(sheet, [100, 100, 100, 120, 150, 150]);
  sheet.getRange('C:C').setNumberFormat('dd.mm.yyyy');
  sheet.getRange('D:D').setNumberFormat('#,##0.00');
  sheet.getRange('F:F').setNumberFormat('dd.mm.yyyy HH:mm');
  sheet.setFrozenRows(1);
}

function createAccountBalancesSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'Account_Balances');
  sheet.clear();
  
  const headers = [['balance_id', 'company_id', 'counterparty_id', 'balance_type', 'currency_code', 'total_amount', 'paid_amount', 'outstanding_amount', 'overdue_amount', 'last_payment_date', 'oldest_unpaid_date', 'calculated_at']];
  
  sheet.getRange(1, 1, 1, headers[0].length).setValues(headers);
  
  formatHeaderRow(sheet);
  setColumnWidths(sheet, [100, 100, 100, 120, 100, 150, 150, 150, 150, 120, 120, 150]);
  sheet.getRange('F:I').setNumberFormat('#,##0.00');
  sheet.getRange('J:K').setNumberFormat('dd.mm.yyyy');
  sheet.getRange('L:L').setNumberFormat('dd.mm.yyyy HH:mm');
  sheet.setFrozenRows(1);
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

function getOrCreateSheet(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

function formatHeaderRow(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285F4');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setHorizontalAlignment('center');
}

function setColumnWidths(sheet, widths) {
  for (let i = 0; i < widths.length; i++) {
    sheet.setColumnWidth(i + 1, widths[i]);
  }
}

