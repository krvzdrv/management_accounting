/**
 * Загрузка тестовых данных для проверки системы
 * Запустите функцию loadTestData() для заполнения таблиц примерами
 */

/**
 * Загрузить все тестовые данные
 */
function loadTestData() {
  try {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      'Загрузка тестовых данных',
      'Это добавит тестовые данные во все таблицы. Продолжить?',
      ui.ButtonSet.YES_NO
    );
    
    if (response !== ui.Button.YES) {
      return;
    }
    
    logInfo('Starting test data load');
    
    // Загружаем данные в правильном порядке (сначала справочники)
    loadTestCurrencies();
    loadTestExchangeRates();
    loadTestVATRates();
    loadTestCompanies();
    loadTestCounterparties();
    loadTestProducts();
    loadTestExpenseCategories();
    
    // Затем транзакции
    loadTestPurchaseOrders();
    loadTestSalesOrders();
    loadTestExpenses();
    loadTestCashTransactions();
    loadTestPayments();
    
    // Обновляем балансы
    updateAllAccountBalances();
    
    ui.alert('Успех', 'Тестовые данные успешно загружены!', ui.ButtonSet.OK);
    logInfo('Test data load completed');
    
  } catch (error) {
    logError('Failed to load test data', error);
    SpreadsheetApp.getUi().alert('Ошибка', `Ошибка загрузки данных: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Загрузить тестовые валюты
 */
function loadTestCurrencies() {
  const sheet = getSheet(CONFIG.SHEET_NAMES.CURRENCIES);
  const existingData = sheet.getDataRange().getValues();
  
  // Проверяем, есть ли уже данные
  if (existingData.length > 1) {
    logInfo('Currencies already have data, skipping');
    return;
  }
  
  const data = [
    ['EUR', 'Евро', '€', true, true],
    ['PLN', 'Злотый', 'zł', false, true],
    ['USD', 'Доллар США', '$', false, true]
  ];
  
  sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
  logInfo(`Loaded ${data.length} currencies`);
}

/**
 * Загрузить тестовые курсы валют
 */
function loadTestExchangeRates() {
  const sheet = getSheet(CONFIG.SHEET_NAMES.EXCHANGE_RATES);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const data = [
    [1, 'EUR', 'PLN', 4.35, today, 'manual', new Date()],
    [2, 'EUR', 'USD', 1.08, today, 'manual', new Date()],
    [3, 'EUR', 'PLN', 4.34, yesterday, 'manual', yesterday],
    [4, 'EUR', 'USD', 1.07, yesterday, 'manual', yesterday]
  ];
  
  sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
  logInfo(`Loaded ${data.length} exchange rates`);
}

/**
 * Загрузить тестовые ставки НДС
 */
function loadTestVATRates() {
  const sheet = getSheet(CONFIG.SHEET_NAMES.VAT_RATES);
  const existingData = sheet.getDataRange().getValues();
  
  if (existingData.length > 1) {
    logInfo('VAT rates already have data, skipping');
    return;
  }
  
  const today = new Date();
  const data = [
    [1, 23, 'Стандартная ставка', 'PL', today, null, true],
    [2, 8, 'Пониженная ставка', 'PL', today, null, true],
    [3, 0, 'Без НДС', 'PL', today, null, true]
  ];
  
  sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
  logInfo(`Loaded ${data.length} VAT rates`);
}

/**
 * Загрузить тестовые компании
 */
function loadTestCompanies() {
  const sheet = getSheet(CONFIG.SHEET_NAMES.COMPANIES);
  const existingData = sheet.getDataRange().getValues();
  
  if (existingData.length > 1) {
    logInfo('Companies already have data, skipping');
    return;
  }
  
  const data = [
    [1, 'ALUM', 'Alumineu', 'PL1234567890', 'PL', true],
    [2, 'VERS', 'Versatrade', 'PL0987654321', 'PL', true],
    [3, 'FLEX', 'Flexy', 'BY123456789', 'BY', true]
  ];
  
  sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
  logInfo(`Loaded ${data.length} companies`);
}

/**
 * Загрузить тестовых контрагентов
 */
function loadTestCounterparties() {
  const sheet = getSheet(CONFIG.SHEET_NAMES.COUNTERPARTIES);
  const existingData = sheet.getDataRange().getValues();
  
  if (existingData.length > 1) {
    logInfo('Counterparties already have data, skipping');
    return;
  }
  
  const today = new Date();
  const data = [
    [1, 'FLEXY', 'Flexy', 'supplier', 'BY987654321', 'BY', 'EUR', 30, 50000, true, today],
    [2, 'MEDIATOR', 'Посредник', 'supplier', 'PL111222333', 'PL', 'EUR', 14, 20000, true, today],
    [3, 'FACTORY', 'Завод', 'supplier', 'PL444555666', 'PL', 'EUR', 30, 100000, true, today],
    [4, 'CLIENT1', 'Клиент 1', 'customer', 'PL777888999', 'PL', 'EUR', 30, 30000, true, today],
    [5, 'CLIENT2', 'Клиент 2', 'customer', 'PL000111222', 'PL', 'EUR', 45, 50000, true, today],
    [6, 'CLIENT3', 'Клиент 3', 'customer', 'PL333444555', 'PL', 'EUR', 30, 25000, true, today]
  ];
  
  sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
  logInfo(`Loaded ${data.length} counterparties`);
}

/**
 * Загрузить тестовые товары
 */
function loadTestProducts() {
  const sheet = getSheet(CONFIG.SHEET_NAMES.PRODUCTS);
  const existingData = sheet.getDataRange().getValues();
  
  if (existingData.length > 1) {
    logInfo('Products already have data, skipping');
    return;
  }
  
  const data = [
    [1, 'PROF-20x20', 'Профиль алюминиевый 20x20', 'Алюминиевые профили', 'м', 23, true],
    [2, 'PROF-30x30', 'Профиль алюминиевый 30x30', 'Алюминиевые профили', 'м', 23, true],
    [3, 'PROF-40x40', 'Профиль алюминиевый 40x40', 'Алюминиевые профили', 'м', 23, true],
    [4, 'PROF-50x50', 'Профиль алюминиевый 50x50', 'Алюминиевые профили', 'м', 23, true],
    [5, 'PROF-60x60', 'Профиль алюминиевый 60x60', 'Алюминиевые профили', 'м', 23, true],
    [6, 'CONN-20', 'Соединитель для профиля 20x20', 'Фурнитура', 'шт', 23, true],
    [7, 'CONN-30', 'Соединитель для профиля 30x30', 'Фурнитура', 'шт', 23, true],
    [8, 'SCREW-M4', 'Винт M4x20', 'Крепеж', 'шт', 23, true],
    [9, 'SCREW-M5', 'Винт M5x25', 'Крепеж', 'шт', 23, true],
    [10, 'GASKET', 'Уплотнитель', 'Расходные материалы', 'м', 8, true]
  ];
  
  sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
  logInfo(`Loaded ${data.length} products`);
}

/**
 * Загрузить тестовые категории расходов
 */
function loadTestExpenseCategories() {
  const sheet = getSheet(CONFIG.SHEET_NAMES.EXPENSE_CATEGORIES);
  const existingData = sheet.getDataRange().getValues();
  
  if (existingData.length > 1) {
    logInfo('Expense categories already have data, skipping');
    return;
  }
  
  const data = [
    [1, 'RENT', 'Аренда', null, 23, true],
    [2, 'TRANSPORT', 'Транспорт', null, 23, true],
    [3, 'SALARY', 'Зарплата', null, 0, true],
    [4, 'MARKETING', 'Маркетинг', null, 23, true],
    [5, 'UTILITIES', 'Коммунальные услуги', null, 8, true],
    [6, 'OFFICE', 'Офисные расходы', null, 23, true],
    [7, 'PROFESSIONAL', 'Профессиональные услуги', null, 23, true]
  ];
  
  sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
  logInfo(`Loaded ${data.length} expense categories`);
}

/**
 * Загрузить тестовые закупки
 */
function loadTestPurchaseOrders() {
  const poSheet = getSheet(CONFIG.SHEET_NAMES.PURCHASE_ORDERS);
  const linesSheet = getSheet(CONFIG.SHEET_NAMES.PURCHASE_ORDER_LINES);
  
  const today = new Date();
  const date1 = new Date(today);
  date1.setDate(date1.getDate() - 15);
  const date2 = new Date(today);
  date2.setDate(date2.getDate() - 10);
  const date3 = new Date(today);
  date3.setDate(date3.getDate() - 5);
  
  // Закупка 1: от Flexy
  const po1Id = getNextId(CONFIG.SHEET_NAMES.PURCHASE_ORDERS);
  const po1DueDate = new Date(date1);
  po1DueDate.setDate(po1DueDate.getDate() + 30);
  
  poSheet.appendRow([
    po1Id,
    `PO-ALUM-${date1.getFullYear()}${String(date1.getMonth() + 1).padStart(2, '0')}-001`,
    1, // company_id Alumineu
    1, // supplier_id Flexy
    date1,
    'EUR',
    1.0,
    po1DueDate,
    'partially_paid',
    5000.00,
    1150.00,
    6150.00,
    'Закупка профилей от Flexy',
    Session.getActiveUser().getEmail(),
    date1,
    date1
  ]);
  
  // Строки заказа 1
  linesSheet.appendRow([getNextId(CONFIG.SHEET_NAMES.PURCHASE_ORDER_LINES), po1Id, 1, 1, 'Профиль 20x20', 100, 25.00, 23, 2500.00, 575.00, 3075.00]);
  linesSheet.appendRow([getNextId(CONFIG.SHEET_NAMES.PURCHASE_ORDER_LINES), po1Id, 2, 2, 'Профиль 30x30', 50, 50.00, 23, 2500.00, 575.00, 3075.00]);
  
  // Закупка 2: от Посредника (оплатила Versatrade)
  const po2Id = getNextId(CONFIG.SHEET_NAMES.PURCHASE_ORDERS);
  const po2DueDate = new Date(date2);
  po2DueDate.setDate(po2DueDate.getDate() + 14);
  
  poSheet.appendRow([
    po2Id,
    `PO-ALUM-${date2.getFullYear()}${String(date2.getMonth() + 1).padStart(2, '0')}-002`,
    1, // company_id Alumineu
    2, // supplier_id Посредник
    date2,
    'EUR',
    1.0,
    po2DueDate,
    'paid',
    3000.00,
    690.00,
    3690.00,
    'Закупка через посредника',
    Session.getActiveUser().getEmail(),
    date2,
    date2
  ]);
  
  linesSheet.appendRow([getNextId(CONFIG.SHEET_NAMES.PURCHASE_ORDER_LINES), po2Id, 1, 3, 'Профиль 40x40', 30, 100.00, 23, 3000.00, 690.00, 3690.00]);
  
  // Закупка 3: от Завода (оплатила Versatrade)
  const po3Id = getNextId(CONFIG.SHEET_NAMES.PURCHASE_ORDERS);
  const po3DueDate = new Date(date3);
  po3DueDate.setDate(po3DueDate.getDate() + 30);
  
  poSheet.appendRow([
    po3Id,
    `PO-ALUM-${date3.getFullYear()}${String(date3.getMonth() + 1).padStart(2, '0')}-003`,
    1, // company_id Alumineu
    3, // supplier_id Завод
    date3,
    'EUR',
    1.0,
    po3DueDate,
    'confirmed',
    8000.00,
    1840.00,
    9840.00,
    'Изготовление профилей на заводе',
    Session.getActiveUser().getEmail(),
    date3,
    date3
  ]);
  
  linesSheet.appendRow([getNextId(CONFIG.SHEET_NAMES.PURCHASE_ORDER_LINES), po3Id, 1, 4, 'Профиль 50x50', 40, 200.00, 23, 8000.00, 1840.00, 9840.00]);
  
  logInfo(`Loaded 3 purchase orders`);
}

/**
 * Загрузить тестовые продажи
 */
function loadTestSalesOrders() {
  const soSheet = getSheet(CONFIG.SHEET_NAMES.SALES_ORDERS);
  const linesSheet = getSheet(CONFIG.SHEET_NAMES.SALES_ORDER_LINES);
  
  const today = new Date();
  const date1 = new Date(today);
  date1.setDate(date1.getDate() - 12);
  const date2 = new Date(today);
  date2.setDate(date2.getDate() - 8);
  const date3 = new Date(today);
  date3.setDate(date3.getDate() - 3);
  
  // Продажа 1: Клиенту 1
  const so1Id = getNextId(CONFIG.SHEET_NAMES.SALES_ORDERS);
  const so1DueDate = new Date(date1);
  so1DueDate.setDate(so1DueDate.getDate() + 30);
  
  soSheet.appendRow([
    so1Id,
    `SO-ALUM-${date1.getFullYear()}${String(date1.getMonth() + 1).padStart(2, '0')}-001`,
    1, // company_id Alumineu
    4, // customer_id Клиент 1
    date1,
    'EUR',
    1.0,
    so1DueDate,
    'paid',
    3750.00,
    862.50,
    4612.50,
    'Продажа профилей',
    Session.getActiveUser().getEmail(),
    date1,
    date1
  ]);
  
  linesSheet.appendRow([getNextId(CONFIG.SHEET_NAMES.SALES_ORDER_LINES), so1Id, 1, 1, 'Профиль 20x20', 50, 50.00, 23, 2500.00, 575.00, 3075.00]);
  linesSheet.appendRow([getNextId(CONFIG.SHEET_NAMES.SALES_ORDER_LINES), so1Id, 2, 6, 'Соединитель', 25, 50.00, 23, 1250.00, 287.50, 1537.50]);
  
  // Продажа 2: Клиенту 2 (в PLN)
  const so2Id = getNextId(CONFIG.SHEET_NAMES.SALES_ORDERS);
  const so2DueDate = new Date(date2);
  so2DueDate.setDate(so2DueDate.getDate() + 45);
  
  soSheet.appendRow([
    so2Id,
    `SO-ALUM-${date2.getFullYear()}${String(date2.getMonth() + 1).padStart(2, '0')}-002`,
    1, // company_id Alumineu
    5, // customer_id Клиент 2
    date2,
    'PLN',
    0.23, // курс к EUR
    so2DueDate,
    'partially_paid',
    13043.48, // 3000 EUR в PLN
    3000.00,
    16043.48,
    'Продажа в злотых',
    Session.getActiveUser().getEmail(),
    date2,
    date2
  ]);
  
  linesSheet.appendRow([getNextId(CONFIG.SHEET_NAMES.SALES_ORDER_LINES), so2Id, 1, 2, 'Профиль 30x30', 30, 434.78, 23, 13043.48, 3000.00, 16043.48]);
  
  // Продажа 3: Клиенту 3
  const so3Id = getNextId(CONFIG.SHEET_NAMES.SALES_ORDERS);
  const so3DueDate = new Date(date3);
  so3DueDate.setDate(so3DueDate.getDate() + 30);
  
  soSheet.appendRow([
    so3Id,
    `SO-ALUM-${date3.getFullYear()}${String(date3.getMonth() + 1).padStart(2, '0')}-003`,
    1, // company_id Alumineu
    6, // customer_id Клиент 3
    date3,
    'EUR',
    1.0,
    so3DueDate,
    'confirmed',
    6000.00,
    1380.00,
    7380.00,
    'Крупная продажа',
    Session.getActiveUser().getEmail(),
    date3,
    date3
  ]);
  
  linesSheet.appendRow([getNextId(CONFIG.SHEET_NAMES.SALES_ORDER_LINES), so3Id, 1, 3, 'Профиль 40x40', 20, 300.00, 23, 6000.00, 1380.00, 7380.00]);
  
  logInfo(`Loaded 3 sales orders`);
}

/**
 * Загрузить тестовые расходы
 */
function loadTestExpenses() {
  const sheet = getSheet(CONFIG.SHEET_NAMES.EXPENSES);
  
  const today = new Date();
  const dates = [
    new Date(today.getFullYear(), today.getMonth(), 1), // начало месяца
    new Date(today.getFullYear(), today.getMonth(), 5),
    new Date(today.getFullYear(), today.getMonth(), 10),
    new Date(today.getFullYear(), today.getMonth(), 15),
    new Date(today.getFullYear(), today.getMonth(), 20)
  ];
  
  const data = [
    [getNextId(CONFIG.SHEET_NAMES.EXPENSES), `EXP-ALUM-${dates[0].getFullYear()}${String(dates[0].getMonth() + 1).padStart(2, '0')}-001`, 1, dates[0], 1, null, 'Аренда склада', 'EUR', 1.0, 2000.00, 23, 460.00, 2460.00, 'paid', dates[0], 'Ежемесячная аренда', dates[0]],
    [getNextId(CONFIG.SHEET_NAMES.EXPENSES), `EXP-ALUM-${dates[1].getFullYear()}${String(dates[1].getMonth() + 1).padStart(2, '0')}-002`, 1, dates[1], 2, null, 'Доставка товара', 'EUR', 1.0, 500.00, 23, 115.00, 615.00, 'paid', dates[1], 'Транспортные расходы', dates[1]],
    [getNextId(CONFIG.SHEET_NAMES.EXPENSES), `EXP-ALUM-${dates[2].getFullYear()}${String(dates[2].getMonth() + 1).padStart(2, '0')}-003`, 1, dates[2], 3, null, 'Зарплата сотрудников', 'EUR', 1.0, 5000.00, 0, 0.00, 5000.00, 'paid', dates[2], 'Зарплата за месяц', dates[2]],
    [getNextId(CONFIG.SHEET_NAMES.EXPENSES), `EXP-ALUM-${dates[3].getFullYear()}${String(dates[3].getMonth() + 1).padStart(2, '0')}-004`, 1, dates[3], 4, null, 'Реклама в интернете', 'EUR', 1.0, 800.00, 23, 184.00, 984.00, 'unpaid', null, 'Маркетинговая кампания', dates[3]],
    [getNextId(CONFIG.SHEET_NAMES.EXPENSES), `EXP-ALUM-${dates[4].getFullYear()}${String(dates[4].getMonth() + 1).padStart(2, '0')}-005`, 1, dates[4], 5, null, 'Электричество', 'EUR', 1.0, 300.00, 8, 24.00, 324.00, 'paid', dates[4], 'Коммунальные услуги', dates[4]]
  ];
  
  sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
  logInfo(`Loaded ${data.length} expenses`);
}

/**
 * Загрузить тестовые движения денег
 */
function loadTestCashTransactions() {
  const sheet = getSheet(CONFIG.SHEET_NAMES.CASH_TRANSACTIONS);
  
  const today = new Date();
  const dates = [
    new Date(today.getFullYear(), today.getMonth(), 2),
    new Date(today.getFullYear(), today.getMonth(), 6),
    new Date(today.getFullYear(), today.getMonth(), 11),
    new Date(today.getFullYear(), today.getMonth(), 16),
    new Date(today.getFullYear(), today.getMonth(), 21)
  ];
  
  const data = [
    [getNextId(CONFIG.SHEET_NAMES.CASH_TRANSACTIONS), `CT-ALUM-001`, 1, dates[0], 'inflow', 'bank_transfer', '', 'ALUM-BANK', 4, 'sale', 1, 'EUR', 4612.50, 1.0, 4612.50, 'Оплата от Клиента 1', dates[0]],
    [getNextId(CONFIG.SHEET_NAMES.CASH_TRANSACTIONS), `CT-ALUM-002`, 1, dates[1], 'outflow', 'bank_transfer', 'ALUM-BANK', '', 1, 'purchase', 1, 'EUR', 2000.00, 1.0, 2000.00, 'Частичная оплата Flexy', dates[1]],
    [getNextId(CONFIG.SHEET_NAMES.CASH_TRANSACTIONS), `CT-VERS-001`, 2, dates[2], 'outflow', 'bank_transfer', 'VERS-BANK', '', 2, 'purchase', 2, 'EUR', 3690.00, 1.0, 3690.00, 'Versatrade оплатила заказ от Посредника', dates[2]],
    [getNextId(CONFIG.SHEET_NAMES.CASH_TRANSACTIONS), `CT-VERS-002`, 2, dates[3], 'outflow', 'bank_transfer', 'VERS-BANK', '', 3, 'purchase', 3, 'EUR', 5000.00, 1.0, 5000.00, 'Versatrade оплатила часть заказа от Завода', dates[3]],
    [getNextId(CONFIG.SHEET_NAMES.CASH_TRANSACTIONS), `CT-VERS-003`, 2, dates[4], 'inflow', 'bank_transfer', '', 'VERS-BANK', 1, 'loan', null, 'EUR', 2000.00, 1.0, 2000.00, 'Возмещение от Alumineu', dates[4]]
  ];
  
  sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
  logInfo(`Loaded ${data.length} cash transactions`);
}

/**
 * Загрузить тестовые платежи
 */
function loadTestPayments() {
  const sheet = getSheet(CONFIG.SHEET_NAMES.PAYMENTS);
  
  const today = new Date();
  const dates = [
    new Date(today.getFullYear(), today.getMonth(), 2),
    new Date(today.getFullYear(), today.getMonth(), 6),
    new Date(today.getFullYear(), today.getMonth(), 11),
    new Date(today.getFullYear(), today.getMonth(), 16)
  ];
  
  // Получаем ID транзакций (они должны быть созданы после Cash_Transactions)
  const cashSheet = getSheet(CONFIG.SHEET_NAMES.CASH_TRANSACTIONS);
  const cashData = cashSheet.getDataRange().getValues();
  
  // ID транзакций находятся в первой колонке, начиная со второй строки (индекс 1)
  const transactionIds = [];
  for (let i = 1; i < cashData.length && i <= 5; i++) {
    transactionIds.push(cashData[i][0]);
  }
  
  const data = [
    [getNextId(CONFIG.SHEET_NAMES.PAYMENTS), `PAY-ALUM-001`, dates[0], 1, 4, 'sale', 1, 'EUR', 4612.50, 1.0, transactionIds[0], 'Оплата продажи SO-001', dates[0]],
    [getNextId(CONFIG.SHEET_NAMES.PAYMENTS), `PAY-ALUM-002`, dates[1], 1, 1, 'purchase', 1, 'EUR', 2000.00, 1.0, transactionIds[1], 'Частичная оплата PO-001', dates[1]],
    [getNextId(CONFIG.SHEET_NAMES.PAYMENTS), `PAY-VERS-001`, dates[2], 2, 2, 'purchase', 2, 'EUR', 3690.00, 1.0, transactionIds[2], 'Оплата заказа от Посредника', dates[2]],
    [getNextId(CONFIG.SHEET_NAMES.PAYMENTS), `PAY-VERS-002`, dates[3], 2, 3, 'purchase', 3, 'EUR', 5000.00, 1.0, transactionIds[3], 'Частичная оплата заказа от Завода', dates[3]]
  ];
  
  sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
  logInfo(`Loaded ${data.length} payments`);
  
  // Обновляем статусы документов после создания платежей
  updateDocumentPaymentStatus('sale', 1);
  updateDocumentPaymentStatus('purchase', 1);
  updateDocumentPaymentStatus('purchase', 2);
  updateDocumentPaymentStatus('purchase', 3);
}

