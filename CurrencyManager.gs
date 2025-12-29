/**
 * Управление валютами и курсами
 */

/**
 * Получить курс валюты на дату
 */
function getExchangeRate(fromCurrency, toCurrency, date) {
  // Если валюты одинаковые
  if (fromCurrency === toCurrency) {
    return 1.0;
  }
  
  const sheet = getSheet(CONFIG.SHEET_NAMES.EXCHANGE_RATES);
  const data = sheet.getDataRange().getValues();
  
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  let closestRate = null;
  let closestDate = null;
  
  // Поиск курса (начиная со 2-й строки, пропуская заголовок)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const currFrom = row[1]; // currency_from
    const currTo = row[2];   // currency_to
    const rate = row[3];     // rate
    const rateDate = new Date(row[4]); // rate_date
    rateDate.setHours(0, 0, 0, 0);
    
    if (currFrom === fromCurrency && currTo === toCurrency) {
      // Точное совпадение даты
      if (rateDate.getTime() === targetDate.getTime()) {
        return parseFloat(rate);
      }
      
      // Курс не позднее нужной даты
      if (rateDate <= targetDate) {
        if (!closestDate || rateDate > closestDate) {
          closestDate = rateDate;
          closestRate = parseFloat(rate);
        }
      }
    }
  }
  
  if (closestRate !== null) {
    return closestRate;
  }
  
  throw new Error(`Exchange rate not found for ${fromCurrency} to ${toCurrency} on ${formatDate(date)}`);
}

/**
 * Конвертация суммы
 */
function convertAmount(amount, fromCurrency, toCurrency, date) {
  const rate = getExchangeRate(fromCurrency, toCurrency, date);
  return round2(amount * rate);
}

/**
 * Обновление курсов валют из API
 */
function updateExchangeRatesFromAPI() {
  try {
    logInfo('Starting exchange rates update from API');
    
    let rates = null;
    let date = new Date();
    let apiUsed = '';
    
    // Попытка 1: exchangerate.host API
    try {
      const response = UrlFetchApp.fetch(CONFIG.EXCHANGE_RATE_API, {
        'muteHttpExceptions': true
      });
      
      const responseCode = response.getResponseCode();
      logInfo('API response code: ' + responseCode);
      
      if (responseCode === 200) {
        const responseText = response.getContentText();
        logInfo('Response length: ' + responseText.length);
        
        try {
          const data = JSON.parse(responseText);
          logInfo('Parsed JSON successfully');
          logInfo('Response keys: ' + Object.keys(data).join(', '));
          
          // Проверяем разные форматы ответа - НЕ выбрасываем ошибку ни при каких условиях
          if (data.rates && typeof data.rates === 'object' && Object.keys(data.rates).length > 0) {
            rates = data.rates;
            date = new Date(data.date || new Date());
            apiUsed = 'exchangerate.host';
            logInfo('Using exchangerate.host API');
            logInfo('Received rates for ' + Object.keys(data.rates).length + ' currencies');
          } else {
            // Если success=false или нет rates, просто логируем и продолжаем
            logInfo('API response does not contain rates, trying alternative...');
            if (data.success !== undefined) {
              logInfo('API success field: ' + data.success);
            }
          }
        } catch (parseError) {
          logInfo('JSON parse error: ' + parseError.toString());
          logInfo('Response text (first 200 chars): ' + responseText.substring(0, 200));
        }
      } else {
        logInfo(`HTTP ${responseCode}, trying alternative API...`);
      }
    } catch (error) {
      // ВСЕГДА ловим ошибки и продолжаем, не выбрасываем дальше
      logInfo('exchangerate.host API failed, trying alternative...');
      logInfo('Error: ' + error.toString());
    }
    
    // Попытка 2: Альтернативный API (fixer.io через exchangerate.host)
    if (!rates) {
      try {
        const altApiUrl = 'https://api.exchangerate.host/latest?base=EUR&places=4';
        const response = UrlFetchApp.fetch(altApiUrl, {
          'muteHttpExceptions': true
        });
        
        if (response.getResponseCode() === 200) {
          const data = JSON.parse(response.getContentText());
          if (data.rates) {
            rates = data.rates;
            date = new Date(data.date || new Date());
            apiUsed = 'exchangerate.host (alternative)';
            logInfo('Using alternative API');
          }
        }
      } catch (error) {
        logInfo('Alternative API also failed');
        logInfo('Error: ' + error.toString());
      }
    }
    
    // Если API не сработали, сообщаем пользователю
    if (!rates || Object.keys(rates).length === 0) {
      logInfo('All API attempts failed, no rates received');
      const errorMessage = 'Не удалось получить курсы валют из API.\n\n' +
        'Возможные причины:\n' +
        '• Нет подключения к интернету\n' +
        '• API временно недоступен\n' +
        '• Проблемы с доступом к внешним сервисам\n\n' +
        'Решение: Добавьте курсы вручную через меню:\n' +
        '💼 Управленческий учет → 💱 Валюты → Добавить курс вручную';
      
      // Показываем диалог пользователю
      try {
        SpreadsheetApp.getUi().alert(
          'Не удалось обновить курсы',
          errorMessage,
          SpreadsheetApp.getUi().ButtonSet.OK
        );
      } catch (e) {
        // Если UI недоступен (например, при выполнении триггера), просто логируем
        logInfo(errorMessage);
      }
      
      return {
        success: false,
        addedCount: 0,
        apiUsed: 'none',
        message: 'Используйте ручное добавление курсов'
      };
    }
    
    // Добавляем курсы в таблицу
    const sheet = getSheet(CONFIG.SHEET_NAMES.EXCHANGE_RATES);
    let addedCount = 0;
    
    // Получаем список валют из справочника
    const currenciesSheet = getSheet(CONFIG.SHEET_NAMES.CURRENCIES);
    const currencies = currenciesSheet.getDataRange().getValues();
    
    for (let i = 1; i < currencies.length; i++) {
      const currencyCode = currencies[i][0];
      
      if (currencyCode === CONFIG.BASE_CURRENCY) continue;
      if (!rates[currencyCode]) {
        logInfo(`Rate not found for ${currencyCode}`);
        continue;
      }
      
      // Проверяем, есть ли уже курс на эту дату
      const existingRate = checkExistingRate(CONFIG.BASE_CURRENCY, currencyCode, date);
      
      if (!existingRate) {
        const nextId = getNextId(CONFIG.SHEET_NAMES.EXCHANGE_RATES);
        
        sheet.appendRow([
          nextId,
          CONFIG.BASE_CURRENCY,
          currencyCode,
          rates[currencyCode],
          date,
          apiUsed,
          new Date()
        ]);
        
        addedCount++;
        logInfo(`Added rate: ${CONFIG.BASE_CURRENCY}/${currencyCode} = ${rates[currencyCode]}`);
      } else {
        logInfo(`Rate already exists for ${CONFIG.BASE_CURRENCY}/${currencyCode} on ${formatDate(date)}`);
      }
    }
    
    logInfo(`Exchange rates update completed. Added ${addedCount} rates using ${apiUsed}.`);
    
    return {
      success: true,
      addedCount: addedCount,
      apiUsed: apiUsed
    };
    
  } catch (error) {
    logError('Failed to update exchange rates', error);
    
    // Более понятное сообщение об ошибке
    const errorMessage = error.message || error.toString();
    SpreadsheetApp.getUi().alert(
      'Ошибка обновления курсов',
      'Не удалось обновить курсы валют из API.\n\n' +
      'Возможные причины:\n' +
      '• Нет подключения к интернету\n' +
      '• API временно недоступен\n' +
      '• Проблемы с доступом к внешним сервисам\n\n' +
      'Решение: Добавьте курсы вручную через меню или функцию addExchangeRate()\n\n' +
      'Детали ошибки: ' + errorMessage,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
    throw error;
  }
}

/**
 * Проверка существования курса на дату
 */
function checkExistingRate(fromCurrency, toCurrency, date) {
  const sheet = getSheet(CONFIG.SHEET_NAMES.EXCHANGE_RATES);
  const data = sheet.getDataRange().getValues();
  
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rateDate = new Date(row[4]);
    rateDate.setHours(0, 0, 0, 0);
    
    if (row[1] === fromCurrency && 
        row[2] === toCurrency && 
        rateDate.getTime() === checkDate.getTime()) {
      return true;
    }
  }
  
  return false;
}

/**
 * Ручное добавление курса
 */
function addExchangeRate(fromCurrency, toCurrency, rate, date) {
  const sheet = getSheet(CONFIG.SHEET_NAMES.EXCHANGE_RATES);
  const nextId = getNextId(CONFIG.SHEET_NAMES.EXCHANGE_RATES);
  
  sheet.appendRow([
    nextId,
    fromCurrency,
    toCurrency,
    rate,
    date,
    'manual',
    new Date()
  ]);
  
  logInfo(`Manual exchange rate added: ${fromCurrency}/${toCurrency} = ${rate} on ${formatDate(date)}`);
}

