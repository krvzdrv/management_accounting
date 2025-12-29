/**
 * Скрипты миграции структуры данных
 * Каждая миграция обновляет структуру с одной версии на другую
 */

/**
 * Получить лист по имени (из Config.gs)
 */
function getSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }
  return sheet;
}

/**
 * Миграция с версии 1.0.0 на 2.0.0
 * Обновление структуры под формат Planfix CSV
 */
function migration_1_0_to_2_0() {
  logInfo('Starting migration 1.0.0 -> 2.0.0');
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Объединяем Sales_Orders и Sales_Order_LINES в Sales
  migrateToFlatSalesStructure(ss);
  
  // 2. Объединяем Purchase_Orders и Purchase_Order_LINES в Purchases
  migrateToFlatPurchasesStructure(ss);
  
  // 3. Обновляем структуру других листов если нужно
  updateOtherSheetsStructure(ss);
  
  logInfo('Migration 1.0.0 -> 2.0.0 completed');
}

/**
 * Миграция продаж в плоскую структуру
 */
function migrateToFlatSalesStructure(ss) {
  try {
    const ordersSheet = ss.getSheetByName('Sales_Orders');
    const linesSheet = ss.getSheetByName('Sales_Order_LINES');
    
    if (!ordersSheet || !linesSheet) {
      logInfo('Sales_Orders or Sales_Order_LINES not found, creating new Sales sheet');
      createSalesSheet(ss);
      return;
    }
    
    // Создаем новый лист Sales
    let salesSheet = ss.getSheetByName('Sales');
    if (!salesSheet) {
      salesSheet = ss.insertSheet('Sales');
    }
    
    // Новые заголовки
    const newHeaders = [
      'order_number', 'order_date', 'realization_date', 'customer_name', 'customer_id',
      'product_name', 'product_id', 'product_type', 'product_color', 'quantity', 'unit',
      'unit_price', 'currency', 'exchange_rate', 'unit_price_pln', 'amount_excl_vat',
      'vat_rate', 'vat_amount', 'amount_incl_vat', 'commission', 'manager',
      'status', 'payment_date', 'notes'
    ];
    
    salesSheet.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);
    formatHeaderRow(salesSheet);
    
    // Получаем данные из старых листов
    const ordersData = ordersSheet.getDataRange().getValues();
    const linesData = linesSheet.getDataRange().getValues();
    
    // Создаем мапу заказов
    const ordersMap = {};
    for (let i = 1; i < ordersData.length; i++) {
      const order = ordersData[i];
      ordersMap[order[0]] = order; // po_id -> order data
    }
    
    // Мигрируем данные
    const newRows = [];
    for (let i = 1; i < linesData.length; i++) {
      const line = linesData[i];
      const orderId = line[1]; // so_id
      const order = ordersMap[orderId];
      
      if (!order) continue;
      
      // Получаем название контрагента и товара из справочников
      const customerName = getCounterpartyName(order[3]); // customer_id
      const productName = getProductName(line[3]); // product_id
      
      newRows.push([
        order[1],           // order_number (so_number)
        order[4],           // order_date (so_date)
        order[4],           // realization_date (используем дату заказа)
        customerName || '', // customer_name
        order[3],           // customer_id
        productName || '',  // product_name
        line[3],            // product_id
        '',                 // product_type
        '',                 // product_color
        line[5],            // quantity
        '',                 // unit
        line[6],            // unit_price_excl_vat
        order[5],           // currency_code
        order[6],           // exchange_rate
        line[6] * order[6], // unit_price_pln (примерно)
        line[8],            // line_amount_excl_vat
        line[7],            // vat_rate
        line[9],            // vat_amount
        line[10],           // line_amount_incl_vat
        0,                  // commission
        order[13] || '',    // created_by -> manager
        order[8],           // status
        null,               // payment_date
        order[12] || ''     // notes
      ]);
    }
    
    // Записываем данные
    if (newRows.length > 0) {
      salesSheet.getRange(2, 1, newRows.length, newHeaders.length).setValues(newRows);
    }
    
    // Форматирование
    formatSalesSheet(salesSheet);
    
    logInfo(`Migrated ${newRows.length} sales records to flat structure`);
    
  } catch (error) {
    logError('Failed to migrate sales structure', error);
    throw error;
  }
}

/**
 * Миграция закупок в плоскую структуру
 */
function migrateToFlatPurchasesStructure(ss) {
  try {
    const ordersSheet = ss.getSheetByName('Purchase_Orders');
    const linesSheet = ss.getSheetByName('Purchase_Order_Lines');
    
    if (!ordersSheet || !linesSheet) {
      logInfo('Purchase_Orders or Purchase_Order_Lines not found, creating new Purchases sheet');
      createPurchasesSheet(ss);
      return;
    }
    
    // Создаем новый лист Purchases
    let purchasesSheet = ss.getSheetByName('Purchases');
    if (!purchasesSheet) {
      purchasesSheet = ss.insertSheet('Purchases');
    }
    
    // Новые заголовки
    const newHeaders = [
      'order_number', 'order_date', 'supplier_name', 'supplier_id', 'product_name',
      'product_id', 'product_type', 'product_color', 'quantity', 'unit', 'unit_price',
      'currency', 'exchange_rate', 'unit_price_base', 'amount_excl_vat', 'vat_rate',
      'vat_amount', 'amount_incl_vat', 'who_paid', 'status', 'payment_date', 'notes'
    ];
    
    purchasesSheet.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);
    formatHeaderRow(purchasesSheet);
    
    // Получаем данные из старых листов
    const ordersData = ordersSheet.getDataRange().getValues();
    const linesData = linesSheet.getDataRange().getValues();
    
    // Создаем мапу заказов
    const ordersMap = {};
    for (let i = 1; i < ordersData.length; i++) {
      const order = ordersData[i];
      ordersMap[order[0]] = order; // po_id -> order data
    }
    
    // Мигрируем данные
    const newRows = [];
    for (let i = 1; i < linesData.length; i++) {
      const line = linesData[i];
      const orderId = line[1]; // po_id
      const order = ordersMap[orderId];
      
      if (!order) continue;
      
      // Получаем название поставщика и товара
      const supplierName = getCounterpartyName(order[3]); // supplier_id
      const productName = getProductName(line[3]); // product_id
      
      newRows.push([
        order[1],           // order_number (po_number)
        order[4],           // order_date (po_date)
        supplierName || '', // supplier_name
        order[3],           // supplier_id
        productName || '',  // product_name
        line[3],            // product_id
        '',                 // product_type
        '',                 // product_color
        line[5],            // quantity
        '',                 // unit
        line[6],            // unit_price_excl_vat
        order[5],           // currency_code
        order[6],           // exchange_rate
        line[6] * order[6], // unit_price_base
        line[8],            // line_amount_excl_vat
        line[7],            // vat_rate
        line[9],            // vat_amount
        line[10],           // line_amount_incl_vat
        '',                 // who_paid (нужно будет заполнить вручную)
        order[8],           // status
        null,               // payment_date
        order[12] || ''     // notes
      ]);
    }
    
    // Записываем данные
    if (newRows.length > 0) {
      purchasesSheet.getRange(2, 1, newRows.length, newHeaders.length).setValues(newRows);
    }
    
    // Форматирование
    formatPurchasesSheet(purchasesSheet);
    
    logInfo(`Migrated ${newRows.length} purchase records to flat structure`);
    
  } catch (error) {
    logError('Failed to migrate purchases structure', error);
    throw error;
  }
}

/**
 * Обновить структуру других листов
 */
function updateOtherSheetsStructure(ss) {
  // Здесь можно добавить обновления других листов если нужно
  logInfo('Other sheets structure update skipped (no changes needed)');
}

/**
 * Вспомогательные функции для получения названий
 */
function getCounterpartyName(counterpartyId) {
  try {
    const sheet = getSheet('Counterparties');
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == counterpartyId) {
        return data[i][2]; // counterparty_name
      }
    }
  } catch (e) {
    // Игнорируем ошибки
  }
  return '';
}

function getProductName(productId) {
  try {
    const sheet = getSheet('Products');
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == productId) {
        return data[i][2]; // product_name
      }
    }
  } catch (e) {
    // Игнорируем ошибки
  }
  return '';
}

/**
 * Форматирование листа Sales
 */
function formatSalesSheet(sheet) {
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

/**
 * Форматирование листа Purchases
 */
function formatPurchasesSheet(sheet) {
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

