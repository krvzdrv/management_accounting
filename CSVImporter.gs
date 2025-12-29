/**
 * Импорт данных продаж из CSV формата Planfix
 */

/**
 * Получить лист по имени
 */
function getSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(`Лист "${sheetName}" не найден`);
  }
  return sheet;
}

/**
 * Округление до 2 знаков
 */
function round2(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Импорт закупок из CSV файла (аналогично продажам)
 */
function importPurchasesFromSheet(sourceSheetName, startRow = 2) {
  try {
    const sourceSheet = getSheet(sourceSheetName);
    const targetSheet = getSheet('Purchases');
    
    const data = sourceSheet.getDataRange().getValues();
    if (data.length < startRow) {
      throw new Error('Нет данных для импорта');
    }
    
    const headers = data[0];
    
    // Маппинг колонок (адаптируйте под вашу структуру закупок)
    const orderNumberCol = headers.indexOf('Номер заказа') || headers.indexOf('Order Number') || headers.indexOf('Zamówienie');
    const orderDateCol = headers.indexOf('Дата') || headers.indexOf('Date') || headers.indexOf('Data');
    const supplierCol = headers.indexOf('Поставщик') || headers.indexOf('Supplier') || headers.indexOf('Kontrahent');
    const productCol = headers.indexOf('Товар') || headers.indexOf('Product') || headers.indexOf('Nazwa');
    const typeCol = headers.indexOf('Тип') || headers.indexOf('Type') || headers.indexOf('Typ');
    const colorCol = headers.indexOf('Цвет') || headers.indexOf('Color') || headers.indexOf('Kolor');
    const quantityCol = headers.indexOf('Количество') || headers.indexOf('Quantity') || headers.indexOf('Ilość');
    const unitCol = headers.indexOf('Ед. измерения') || headers.indexOf('Unit') || headers.indexOf('j.m.');
    const priceCol = headers.indexOf('Цена') || headers.indexOf('Price') || headers.indexOf('Cena po rabacie');
    const currencyCol = headers.indexOf('Валюта') || headers.indexOf('Currency') || headers.indexOf('Waluta');
    const rateCol = headers.indexOf('Курс') || headers.indexOf('Exchange Rate') || headers.indexOf('PLN/EUR');
    const amountCol = headers.indexOf('Сумма без НДС') || headers.indexOf('Amount excl VAT') || headers.indexOf('Wartość netto');
    const vatRateCol = headers.indexOf('НДС %') || headers.indexOf('VAT Rate') || headers.indexOf('VAT_Rate');
    const whoPaidCol = headers.indexOf('Кто оплатил') || headers.indexOf('Who Paid') || headers.indexOf('Kto zapłacił');
    
    // Получаем справочники
    const counterpartiesSheet = getSheet('Counterparties');
    const counterparties = counterpartiesSheet.getDataRange().getValues();
    const counterpartiesMap = {};
    for (let i = 1; i < counterparties.length; i++) {
      counterpartiesMap[counterparties[i][2]] = counterparties[i][0];
    }
    
    const productsSheet = getSheet('Products');
    const products = productsSheet.getDataRange().getValues();
    const productsMap = {};
    for (let i = 1; i < products.length; i++) {
      productsMap[products[i][2]] = products[i][0];
    }
    
    const companiesSheet = getSheet('Companies');
    const companies = companiesSheet.getDataRange().getValues();
    const companiesMap = {};
    for (let i = 1; i < companies.length; i++) {
      companiesMap[companies[i][2]] = companies[i][0]; // название -> ID
    }
    
    let importedCount = 0;
    
    for (let i = startRow - 1; i < data.length; i++) {
      const row = data[i];
      
      if (!row[orderNumberCol]) continue;
      
      const orderNumber = row[orderNumberCol];
      const orderDate = parseDate(row[orderDateCol]);
      const supplierName = row[supplierCol] || '';
      const productName = row[productCol] || '';
      const productType = row[typeCol] || '';
      const productColor = row[colorCol] || '';
      const quantity = parseNumber(row[quantityCol]);
      const unit = row[unitCol] || '';
      const unitPrice = parseNumber(row[priceCol]);
      const currency = row[currencyCol] || 'EUR';
      const exchangeRate = parseNumber(row[rateCol]) || 1.0;
      const amountExclVAT = parseNumber(row[amountCol]);
      
      // Ставка НДС из данных или по умолчанию 23%
      let vatRate = 23;
      if (vatRateCol !== -1 && row[vatRateCol]) {
        vatRate = parseNumber(row[vatRateCol]);
      }
      
      const whoPaid = row[whoPaidCol] || '';
      
      const supplierId = counterpartiesMap[supplierName] || '';
      const productId = productsMap[productName] || '';
      const whoPaidCompanyId = companiesMap[whoPaid] || '';
      
      const vatAmount = round2(amountExclVAT * vatRate / 100);
      const amountInclVAT = round2(amountExclVAT + vatAmount);
      const unitPriceBase = round2(unitPrice * exchangeRate);
      
      targetSheet.appendRow([
        orderNumber,
        orderDate,
        supplierName,
        supplierId,
        productName,
        productId,
        productType,
        productColor,
        quantity,
        unit,
        unitPrice,
        currency,
        exchangeRate,
        unitPriceBase,
        amountExclVAT,
        vatRate,
        vatAmount,
        amountInclVAT,
        whoPaid,
        'unpaid',
        null,
        ''
      ]);
      
      importedCount++;
    }
    
    SpreadsheetApp.getUi().alert('Успех', `Импортировано ${importedCount} строк закупок`, SpreadsheetApp.getUi().ButtonSet.OK);
    
    return {
      success: true,
      imported: importedCount
    };
    
  } catch (error) {
    Logger.log('Ошибка импорта закупок: ' + error.toString());
    SpreadsheetApp.getUi().alert('Ошибка', 'Ошибка импорта закупок: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

/**
 * Импорт продаж из CSV файла
 */
function importSalesFromCSV() {
  const ui = SpreadsheetApp.getUi();
  
  // Запрос на выбор файла
  const html = HtmlService.createHtmlOutput(`
    <input type="file" id="fileInput" accept=".csv">
    <button onclick="uploadFile()">Загрузить</button>
    <script>
      function uploadFile() {
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function(e) {
            google.script.run.processSalesCSV(e.target.result);
          };
          reader.readAsText(file);
        }
      }
    </script>
  `).setWidth(400).setHeight(100);
  
  ui.showModalDialog(html, 'Импорт продаж из CSV');
}

/**
 * Обработка CSV данных продаж
 */
function processSalesCSV(csvContent) {
  try {
    const lines = csvContent.split('\n');
    if (lines.length < 2) {
      throw new Error('CSV файл пуст или содержит только заголовки');
    }
    
    const sheet = getSheet('Sales');
    const headers = lines[0].split(',');
    
    // Парсинг CSV с учетом кавычек и запятых внутри значений
    const rows = parseCSV(csvContent);
    
    if (rows.length < 2) {
      throw new Error('Нет данных для импорта');
    }
    
    // Маппинг колонок CSV на структуру таблицы
    const csvHeaders = rows[0];
    const csvData = rows.slice(1);
    
    let importedCount = 0;
    let skippedCount = 0;
    
    // Получаем справочники для поиска ID
    const counterpartiesSheet = getSheet('Counterparties');
    const counterparties = counterpartiesSheet.getDataRange().getValues();
    const counterpartiesMap = {};
    for (let i = 1; i < counterparties.length; i++) {
      counterpartiesMap[counterparties[i][2]] = counterparties[i][0]; // название -> ID
    }
    
    const productsSheet = getSheet('Products');
    const products = productsSheet.getDataRange().getValues();
    const productsMap = {};
    for (let i = 1; i < products.length; i++) {
      productsMap[products[i][2]] = products[i][0]; // название -> ID
    }
    
    // Обработка каждой строки
    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      if (row.length < csvHeaders.length) continue;
      
      try {
        // Маппинг данных
        const orderNumber = getCSVValue(row, csvHeaders, 'Zamówienie');
        const orderDate = parseDate(getCSVValue(row, csvHeaders, 'Data'));
        const realizationDate = parseDate(getCSVValue(row, csvHeaders, 'Data realizacji'));
        const customerName = getCSVValue(row, csvHeaders, 'Kontrahent');
        const productName = getCSVValue(row, csvHeaders, 'Nazwa');
        const productType = getCSVValue(row, csvHeaders, 'Typ');
        const productColor = getCSVValue(row, csvHeaders, 'Kolor');
        const quantity = parseNumber(getCSVValue(row, csvHeaders, 'Ilość'));
        const unit = getCSVValue(row, csvHeaders, 'j.m.');
        const unitPrice = parseNumber(getCSVValue(row, csvHeaders, 'Cena po rabacie'));
        const currency = getCSVValue(row, csvHeaders, 'Waluta');
        const exchangeRate = parseNumber(getCSVValue(row, csvHeaders, 'PLN/EUR'));
        const unitPricePLN = parseNumber(getCSVValue(row, csvHeaders, 'Cena po rabacie, PLN'));
        const amountExclVAT = parseNumber(getCSVValue(row, csvHeaders, 'Wartość netto, PLN'));
        const commission = parseNumber(getCSVValue(row, csvHeaders, 'Prowizja, PLN'));
        const manager = getCSVValue(row, csvHeaders, 'Menedżer');
        
        // Поиск ID контрагента и товара
        const customerId = counterpartiesMap[customerName] || '';
        const productId = productsMap[productName] || '';
        
        // Ставка НДС из CSV (если есть колонка) или по умолчанию 23%
        let vatRate = 23;
        const vatRateCol = csvHeaders.indexOf('VAT Rate') || csvHeaders.indexOf('VAT_Rate') || csvHeaders.indexOf('НДС %');
        if (vatRateCol !== -1 && row[vatRateCol]) {
          vatRate = parseNumber(row[vatRateCol]);
        }
        
        const vatAmount = round2(amountExclVAT * vatRate / 100);
        const amountInclVAT = round2(amountExclVAT + vatAmount);
        
        // Добавление строки
        sheet.appendRow([
          orderNumber,
          orderDate,
          realizationDate,
          customerName,
          customerId,
          productName,
          productId,
          productType,
          productColor,
          quantity,
          unit,
          unitPrice,
          currency,
          exchangeRate,
          unitPricePLN,
          amountExclVAT,
          vatRate,
          vatAmount,
          amountInclVAT,
          commission,
          manager,
          'unpaid', // статус по умолчанию
          null,     // дата оплаты
          ''        // примечания
        ]);
        
        importedCount++;
      } catch (error) {
        skippedCount++;
        Logger.log(`Ошибка обработки строки ${i + 1}: ${error.message}`);
      }
    }
    
    SpreadsheetApp.getUi().alert(
      'Импорт завершен',
      `Импортировано: ${importedCount} строк\nПропущено: ${skippedCount} строк`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
    return {
      success: true,
      imported: importedCount,
      skipped: skippedCount
    };
    
  } catch (error) {
    Logger.log('Ошибка импорта: ' + error.toString());
    SpreadsheetApp.getUi().alert('Ошибка', 'Ошибка импорта: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

/**
 * Парсинг CSV с учетом кавычек
 */
function parseCSV(csvContent) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;
  
  for (let i = 0; i < csvContent.length; i++) {
    const char = csvContent[i];
    const nextChar = csvContent[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Двойные кавычки - экранирование
        currentField += '"';
        i++; // Пропускаем следующую кавычку
      } else {
        // Переключение состояния кавычек
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Конец поля
      currentRow.push(currentField.trim());
      currentField = '';
    } else if (char === '\n' && !inQuotes) {
      // Конец строки
      currentRow.push(currentField.trim());
      rows.push(currentRow);
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }
  
  // Последняя строка
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }
  
  return rows;
}

/**
 * Получить значение из CSV строки по названию колонки
 */
function getCSVValue(row, headers, columnName) {
  const index = headers.indexOf(columnName);
  if (index === -1 || index >= row.length) {
    return '';
  }
  return row[index] || '';
}

/**
 * Парсинг даты из формата Planfix
 */
function parseDate(dateString) {
  if (!dateString || dateString.trim() === '') {
    return new Date();
  }
  
  // Формат: "07.03.2025 17:30:00" или "2025.03"
  try {
    // Пробуем полный формат
    if (dateString.includes(' ')) {
      const parts = dateString.split(' ');
      const datePart = parts[0];
      const dateParts = datePart.split('.');
      if (dateParts.length === 3) {
        return new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));
      }
    }
    
    // Формат "2025.03" - берем первый день месяца
    if (dateString.includes('.')) {
      const parts = dateString.split('.');
      if (parts.length === 2) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
      }
    }
    
    return new Date(dateString);
  } catch (e) {
    Logger.log('Ошибка парсинга даты: ' + dateString);
    return new Date();
  }
}

/**
 * Парсинг числа с запятой как разделителем
 */
function parseNumber(numberString) {
  if (!numberString || numberString.trim() === '') {
    return 0;
  }
  
  // Заменяем запятую на точку
  const normalized = numberString.toString().replace(',', '.');
  const parsed = parseFloat(normalized);
  
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Упрощенный импорт через вставку данных в лист
 * Используйте эту функцию, если файл уже в Google Sheets
 */
function importSalesFromSheet(sourceSheetName, startRow = 2) {
  try {
    const sourceSheet = getSheet(sourceSheetName);
    const targetSheet = getSheet('Sales');
    
    const data = sourceSheet.getDataRange().getValues();
    if (data.length < startRow) {
      throw new Error('Нет данных для импорта');
    }
    
    // Получаем заголовки
    const headers = data[0];
    
    // Маппинг колонок
    const orderNumberCol = headers.indexOf('Zamówienie');
    const orderDateCol = headers.indexOf('Data');
    const realizationDateCol = headers.indexOf('Data realizacji');
    const customerCol = headers.indexOf('Kontrahent');
    const productCol = headers.indexOf('Nazwa');
    const typeCol = headers.indexOf('Typ');
    const colorCol = headers.indexOf('Kolor');
    const quantityCol = headers.indexOf('Ilość');
    const unitCol = headers.indexOf('j.m.');
    const priceCol = headers.indexOf('Cena po rabacie');
    const currencyCol = headers.indexOf('Waluta');
    const rateCol = headers.indexOf('PLN/EUR');
    const pricePLNCol = headers.indexOf('Cena po rabacie, PLN');
    const amountCol = headers.indexOf('Wartość netto, PLN');
    const commissionCol = headers.indexOf('Prowizja, PLN');
    const managerCol = headers.indexOf('Menedżer');
    
    // Получаем справочники
    const counterpartiesSheet = getSheet('Counterparties');
    const counterparties = counterpartiesSheet.getDataRange().getValues();
    const counterpartiesMap = {};
    for (let i = 1; i < counterparties.length; i++) {
      counterpartiesMap[counterparties[i][2]] = counterparties[i][0];
    }
    
    const productsSheet = getSheet('Products');
    const products = productsSheet.getDataRange().getValues();
    const productsMap = {};
    for (let i = 1; i < products.length; i++) {
      productsMap[products[i][2]] = products[i][0];
    }
    
    let importedCount = 0;
    
    // Обработка данных
    for (let i = startRow - 1; i < data.length; i++) {
      const row = data[i];
      
      if (!row[orderNumberCol]) continue; // Пропускаем пустые строки
      
      const orderNumber = row[orderNumberCol];
      const orderDate = parseDate(row[orderDateCol]);
      const realizationDate = parseDate(row[realizationDateCol]);
      const customerName = row[customerCol] || '';
      const productName = row[productCol] || '';
      const productType = row[typeCol] || '';
      const productColor = row[colorCol] || '';
      const quantity = parseNumber(row[quantityCol]);
      const unit = row[unitCol] || '';
      const unitPrice = parseNumber(row[priceCol]);
      const currency = row[currencyCol] || 'PLN';
      const exchangeRate = parseNumber(row[rateCol]);
      const unitPricePLN = parseNumber(row[pricePLNCol]);
      const amountExclVAT = parseNumber(row[amountCol]);
      const commission = parseNumber(row[commissionCol]);
      const manager = row[managerCol] || '';
      
      const customerId = counterpartiesMap[customerName] || '';
      const productId = productsMap[productName] || '';
      
      // Ставка НДС из данных (если есть колонка) или по умолчанию 23%
      let vatRate = 23;
      const vatRateCol = headers.indexOf('VAT Rate') || headers.indexOf('VAT_Rate') || headers.indexOf('НДС %');
      if (vatRateCol !== -1 && row[vatRateCol]) {
        vatRate = parseNumber(row[vatRateCol]);
      }
      
      const vatAmount = round2(amountExclVAT * vatRate / 100);
      const amountInclVAT = round2(amountExclVAT + vatAmount);
      
      targetSheet.appendRow([
        orderNumber,
        orderDate,
        realizationDate,
        customerName,
        customerId,
        productName,
        productId,
        productType,
        productColor,
        quantity,
        unit,
        unitPrice,
        currency,
        exchangeRate,
        unitPricePLN,
        amountExclVAT,
        vatRate,
        vatAmount,
        amountInclVAT,
        commission,
        manager,
        'unpaid',
        null,
        ''
      ]);
      
      importedCount++;
    }
    
    SpreadsheetApp.getUi().alert('Успех', `Импортировано ${importedCount} строк продаж`, SpreadsheetApp.getUi().ButtonSet.OK);
    
    return {
      success: true,
      imported: importedCount
    };
    
  } catch (error) {
    Logger.log('Ошибка импорта: ' + error.toString());
    SpreadsheetApp.getUi().alert('Ошибка', 'Ошибка импорта: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

