/**
 * Главное меню и инициализация системы
 */

/**
 * Создание меню при открытии таблицы
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  ui.createMenu('💼 Управленческий учет')
    .addSubMenu(ui.createMenu('📊 Справочники')
      .addItem('Добавить валюту', 'showAddCurrencyDialog')
      .addItem('Добавить контрагента', 'showAddCounterpartyDialog')
      .addItem('Добавить товар', 'showAddProductDialog'))
    .addSeparator()
    .addSubMenu(ui.createMenu('💱 Валюты')
      .addItem('Обновить курсы (API)', 'updateExchangeRatesFromAPI')
      .addItem('Добавить курс вручную', 'showAddExchangeRateDialog'))
    .addSeparator()
    .addSubMenu(ui.createMenu('💰 Задолженности')
      .addItem('Обновить балансы', 'updateAllAccountBalances')
      .addItem('Проверить просрочку', 'checkAndNotifyOverdueDebts')
      .addItem('Проверить кредитные лимиты', 'checkCreditLimits'))
    .addSeparator()
    .addSubMenu(ui.createMenu('⚙️ Настройки')
      .addItem('Обновить систему', 'updateSystem')
      .addItem('Проверить версию', 'showVersionInfo')
      .addSeparator()
      .addItem('Установить триггеры', 'setupAllTriggers')
      .addItem('Удалить триггеры', 'deleteAllTriggers')
      .addItem('Список триггеров', 'listAllTriggers')
      .addItem('Инициализация системы', 'initializeSystem'))
    .addSeparator()
    .addSubMenu(ui.createMenu('🧪 Тестирование')
      .addItem('Загрузить тестовые данные', 'loadTestData'))
    .addToUi();
}

/**
 * Инициализация системы (создание всех таблиц)
 */
function initializeSystem() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Инициализация системы',
    'Это создаст все необходимые таблицы. Продолжить?',
    ui.ButtonSet.YES_NO
  );
  
  if (response == ui.Button.YES) {
    try {
      createAllSheets();
      setupAllTriggers();
      ui.alert('Успех', 'Система успешно инициализирована!', ui.ButtonSet.OK);
    } catch (error) {
      ui.alert('Ошибка', `Ошибка инициализации: ${error.message}`, ui.ButtonSet.OK);
      logError('System initialization failed', error);
    }
  }
}

/**
 * Создание всех таблиц системы
 */
function createAllSheets() {
  const ss = getSpreadsheet();
  
  // Справочники
  createSheetIfNotExists(ss, CONFIG.SHEET_NAMES.CURRENCIES, [
    'currency_code', 'currency_name', 'symbol', 'is_base_currency', 'is_active'
  ]);
  
  createSheetIfNotExists(ss, CONFIG.SHEET_NAMES.EXCHANGE_RATES, [
    'rate_id', 'currency_from', 'currency_to', 'rate', 'rate_date', 'source', 'created_at'
  ]);
  
  createSheetIfNotExists(ss, CONFIG.SHEET_NAMES.VAT_RATES, [
    'vat_id', 'vat_rate', 'vat_description', 'country_code', 'valid_from', 'valid_to', 'is_active'
  ]);
  
  createSheetIfNotExists(ss, CONFIG.SHEET_NAMES.COMPANIES, [
    'company_id', 'company_code', 'company_name', 'tax_number', 'country_code', 'is_active'
  ]);
  
  createSheetIfNotExists(ss, CONFIG.SHEET_NAMES.COUNTERPARTIES, [
    'counterparty_id', 'counterparty_code', 'counterparty_name', 'counterparty_type', 
    'tax_number', 'country_code', 'currency_default', 'payment_terms', 'credit_limit', 
    'is_active', 'created_at'
  ]);
  
  createSheetIfNotExists(ss, CONFIG.SHEET_NAMES.PRODUCTS, [
    'product_id', 'product_code', 'product_name', 'product_category', 'unit_of_measure', 
    'vat_rate_default', 'is_active'
  ]);
  
  createSheetIfNotExists(ss, CONFIG.SHEET_NAMES.EXPENSE_CATEGORIES, [
    'category_id', 'category_code', 'category_name', 'parent_category_id', 
    'vat_rate_default', 'is_active'
  ]);
  
  // Транзакционные таблицы
  createSheetIfNotExists(ss, CONFIG.SHEET_NAMES.PURCHASE_ORDERS, [
    'po_id', 'po_number', 'company_id', 'supplier_id', 'po_date', 'currency_code', 
    'exchange_rate', 'payment_due_date', 'status', 'total_amount_excl_vat', 
    'total_vat_amount', 'total_amount_incl_vat', 'notes', 'created_by', 'created_at', 'modified_at'
  ]);
  
  createSheetIfNotExists(ss, CONFIG.SHEET_NAMES.PURCHASE_ORDER_LINES, [
    'po_line_id', 'po_id', 'line_number', 'product_id', 'product_description', 
    'quantity', 'unit_price_excl_vat', 'vat_rate', 'line_amount_excl_vat', 
    'vat_amount', 'line_amount_incl_vat'
  ]);
  
  createSheetIfNotExists(ss, CONFIG.SHEET_NAMES.SALES_ORDERS, [
    'so_id', 'so_number', 'company_id', 'customer_id', 'so_date', 'currency_code', 
    'exchange_rate', 'payment_due_date', 'status', 'total_amount_excl_vat', 
    'total_vat_amount', 'total_amount_incl_vat', 'notes', 'created_by', 'created_at', 'modified_at'
  ]);
  
  createSheetIfNotExists(ss, CONFIG.SHEET_NAMES.SALES_ORDER_LINES, [
    'so_line_id', 'so_id', 'line_number', 'product_id', 'product_description', 
    'quantity', 'unit_price_excl_vat', 'vat_rate', 'line_amount_excl_vat', 
    'vat_amount', 'line_amount_incl_vat'
  ]);
  
  createSheetIfNotExists(ss, CONFIG.SHEET_NAMES.EXPENSES, [
    'expense_id', 'expense_number', 'company_id', 'expense_date', 'category_id', 
    'supplier_id', 'description', 'currency_code', 'exchange_rate', 'amount_excl_vat', 
    'vat_rate', 'vat_amount', 'amount_incl_vat', 'payment_status', 'payment_date', 
    'notes', 'created_at'
  ]);
  
  createSheetIfNotExists(ss, CONFIG.SHEET_NAMES.CASH_TRANSACTIONS, [
    'transaction_id', 'transaction_number', 'company_id', 'transaction_date', 
    'transaction_type', 'payment_method', 'account_from', 'account_to', 
    'counterparty_id', 'related_document_type', 'related_document_id', 'currency_code', 
    'amount', 'exchange_rate', 'amount_base_currency', 'description', 'created_at'
  ]);
  
  createSheetIfNotExists(ss, CONFIG.SHEET_NAMES.PAYMENTS, [
    'payment_id', 'payment_number', 'payment_date', 'company_id', 'counterparty_id', 
    'document_type', 'document_id', 'currency_code', 'payment_amount', 'exchange_rate', 
    'cash_transaction_id', 'notes', 'created_at'
  ]);
  
  createSheetIfNotExists(ss, CONFIG.SHEET_NAMES.INTERCOMPANY_LOANS, [
    'loan_id', 'loan_number', 'loan_date', 'lender_company_id', 'borrower_company_id', 
    'currency_code', 'loan_amount', 'interest_rate', 'repayment_due_date', 'status', 'created_at'
  ]);
  
  createSheetIfNotExists(ss, CONFIG.SHEET_NAMES.INTERCOMPANY_LOAN_PAYMENTS, [
    'payment_id', 'loan_id', 'payment_date', 'payment_amount', 'cash_transaction_id', 'created_at'
  ]);
  
  createSheetIfNotExists(ss, CONFIG.SHEET_NAMES.ACCOUNT_BALANCES, [
    'balance_id', 'company_id', 'counterparty_id', 'balance_type', 'currency_code', 
    'total_amount', 'paid_amount', 'outstanding_amount', 'overdue_amount', 
    'last_payment_date', 'oldest_unpaid_date', 'calculated_at'
  ]);
  
  logInfo('All sheets created successfully');
}

/**
 * Создать таблицу если не существует
 */
function createSheetIfNotExists(spreadsheet, sheetName, headers) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    formatHeaderRow(sheet, 1);
    sheet.setFrozenRows(1);
    logInfo(`Sheet created: ${sheetName}`);
  }
  
  return sheet;
}

/**
 * Показать информацию о версии
 */
function showVersionInfo() {
  const versionInfo = getVersionInfo();
  const ui = SpreadsheetApp.getUi();
  
  let message = `Текущая версия: ${versionInfo.current}\n`;
  message += `Последняя версия: ${versionInfo.latest}\n\n`;
  
  if (versionInfo.current !== versionInfo.latest) {
    message += `⚠️ Доступно обновление!\n\n`;
  }
  
  message += `История версий:\n`;
  versionInfo.history.forEach(v => {
    message += `• ${v.version} (${v.date}): ${v.description}\n`;
  });
  
  ui.alert('Информация о версии', message, ui.ButtonSet.OK);
}

/**
 * Заглушки для диалогов (можно расширить позже)
 */
function showAddCurrencyDialog() {
  SpreadsheetApp.getUi().alert('Функция в разработке', 'Добавьте валюту вручную в лист Currencies', SpreadsheetApp.getUi().ButtonSet.OK);
}

function showAddCounterpartyDialog() {
  SpreadsheetApp.getUi().alert('Функция в разработке', 'Добавьте контрагента вручную в лист Counterparties', SpreadsheetApp.getUi().ButtonSet.OK);
}

function showAddProductDialog() {
  SpreadsheetApp.getUi().alert('Функция в разработке', 'Добавьте товар вручную в лист Products', SpreadsheetApp.getUi().ButtonSet.OK);
}

function showAddExchangeRateDialog() {
  const ui = SpreadsheetApp.getUi();
  
  // Получаем список валют
  const currenciesSheet = getSheet(CONFIG.SHEET_NAMES.CURRENCIES);
  const currencies = currenciesSheet.getDataRange().getValues();
  const currencyList = [];
  for (let i = 1; i < currencies.length; i++) {
    currencyList.push(currencies[i][0]);
  }
  
  // Запрашиваем данные
  const fromCurrencyResponse = ui.prompt(
    'Добавить курс валюты',
    'Введите код валюты ОТ которой конвертируем (например: EUR):',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (fromCurrencyResponse.getSelectedButton() !== ui.Button.OK) {
    return;
  }
  
  const fromCurrency = fromCurrencyResponse.getResponseText().toUpperCase().trim();
  
  const toCurrencyResponse = ui.prompt(
    'Добавить курс валюты',
    'Введите код валюты К которой конвертируем (например: PLN):',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (toCurrencyResponse.getSelectedButton() !== ui.Button.OK) {
    return;
  }
  
  const toCurrency = toCurrencyResponse.getResponseText().toUpperCase().trim();
  
  const rateResponse = ui.prompt(
    'Добавить курс валюты',
    `Введите курс (сколько ${toCurrency} за 1 ${fromCurrency}):`,
    ui.ButtonSet.OK_CANCEL
  );
  
  if (rateResponse.getSelectedButton() !== ui.Button.OK) {
    return;
  }
  
  const rate = parseFloat(rateResponse.getResponseText().replace(',', '.'));
  
  if (isNaN(rate) || rate <= 0) {
    ui.alert('Ошибка', 'Некорректное значение курса. Используйте число больше нуля.', ui.ButtonSet.OK);
    return;
  }
  
  // Используем сегодняшнюю дату
  const date = new Date();
  
  try {
    addExchangeRate(fromCurrency, toCurrency, rate, date);
    ui.alert('Успех', `Курс добавлен: ${fromCurrency}/${toCurrency} = ${rate}`, ui.ButtonSet.OK);
  } catch (error) {
    ui.alert('Ошибка', 'Не удалось добавить курс: ' + error.message, ui.ButtonSet.OK);
  }
}

