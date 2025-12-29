/**
 * Вспомогательные функции
 */

/**
 * Получить следующий ID для таблицы
 */
function getNextId(sheetName, idColumnIndex = 1) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) return 1; // только заголовок
  
  let maxId = 0;
  for (let i = 1; i < data.length; i++) {
    const id = parseInt(data[i][idColumnIndex - 1]);
    if (!isNaN(id) && id > maxId) {
      maxId = id;
    }
  }
  
  return maxId + 1;
}

/**
 * Генерация уникального номера документа
 */
function generateDocumentNumber(prefix, company_code) {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const timestamp = date.getTime();
  
  return `${prefix}-${company_code}-${year}${month}-${timestamp.toString().substr(-6)}`;
}

/**
 * Округление до 2 знаков
 */
function round2(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Форматирование даты для записи
 */
function formatDate(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

/**
 * Получить строку по ID
 */
function getRowById(sheetName, id, idColumnIndex = 1) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idColumnIndex - 1] == id) {
      return {
        rowIndex: i + 1,
        rowData: data[i]
      };
    }
  }
  
  return null;
}

/**
 * Логирование с timestamp
 */
function logInfo(message) {
  Logger.log(`[${new Date().toISOString()}] INFO: ${message}`);
}

function logError(message, error) {
  Logger.log(`[${new Date().toISOString()}] ERROR: ${message}`);
  if (error) {
    Logger.log(error);
  }
}

/**
 * Форматирование заголовка строки
 */
function formatHeaderRow(sheet, row) {
  const range = sheet.getRange(row, 1, 1, sheet.getLastColumn());
  range.setFontWeight('bold');
  range.setBackground('#4285F4');
  range.setFontColor('#FFFFFF');
  range.setHorizontalAlignment('center');
}

/**
 * Установка ширины колонок
 */
function setColumnWidths(sheet, widths) {
  for (let i = 0; i < widths.length; i++) {
    sheet.setColumnWidth(i + 1, widths[i]);
  }
}

/**
 * Получить или создать лист
 */
function getOrCreateSheet(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

