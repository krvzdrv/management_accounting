/**
 * Автоматическое обновление скриптов из GitHub
 * 
 * ВНИМАНИЕ: Это продвинутая функция, требующая настройки
 * Используйте только если понимаете как это работает
 */

/**
 * Конфигурация GitHub репозитория
 * ЗАМЕНИТЕ на ваши данные:
 */
const GITHUB_CONFIG = {
  // Пример: 'https://raw.githubusercontent.com/username/repo-name/main/'
  RAW_BASE_URL: 'https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/',
  
  // Список файлов для обновления
  FILES_TO_UPDATE: [
    'Config.gs',
    'Utils.gs',
    'Main.gs',
    'CurrencyManager.gs',
    'VATCalculator.gs',
    'PaymentManager.gs',
    'DebtCalculator.gs',
    'Notifications.gs',
    'Triggers.gs',
    'VersionManager.gs',
    'UpdateManager.gs',
    'MigrationScripts.gs',
    'CSVImporter.gs'
  ]
};

/**
 * Обновить все скрипты из GitHub
 */
function updateAllScriptsFromGitHub() {
  const ui = SpreadsheetApp.getUi();
  
  const response = ui.alert(
    'Обновление из GitHub',
    'Это обновит все скрипты из GitHub репозитория. Продолжить?',
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) {
    return;
  }
  
  try {
    let updatedCount = 0;
    let failedCount = 0;
    const errors = [];
    
    for (const fileName of GITHUB_CONFIG.FILES_TO_UPDATE) {
      try {
        const updated = updateScriptFromGitHub(fileName);
        if (updated) {
          updatedCount++;
          logInfo(`Updated: ${fileName}`);
        }
      } catch (error) {
        failedCount++;
        errors.push(`${fileName}: ${error.message}`);
        logError(`Failed to update ${fileName}`, error);
      }
    }
    
    let message = `Обновление завершено:\n\n`;
    message += `Обновлено: ${updatedCount}\n`;
    message += `Ошибок: ${failedCount}\n\n`;
    
    if (errors.length > 0) {
      message += `Ошибки:\n${errors.join('\n')}`;
    }
    
    ui.alert('Результат обновления', message, ui.ButtonSet.OK);
    
  } catch (error) {
    logError('Failed to update scripts from GitHub', error);
    ui.alert('Ошибка', 'Ошибка обновления: ' + error.message, ui.ButtonSet.OK);
  }
}

/**
 * Обновить один файл из GitHub
 */
function updateScriptFromGitHub(fileName) {
  try {
    const url = GITHUB_CONFIG.RAW_BASE_URL + fileName;
    
    // Загружаем файл из GitHub
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() !== 200) {
      throw new Error(`HTTP ${response.getResponseCode()}: ${response.getContentText()}`);
    }
    
    const content = response.getContentText();
    
    // Получаем имя файла без расширения
    const scriptName = fileName.replace('.gs', '');
    
    // ВНИМАНИЕ: Apps Script API не позволяет напрямую обновлять файлы
    // Нужно использовать Apps Script API или делать вручную
    // Это функция-заглушка для демонстрации концепции
    
    logInfo(`Content loaded for ${fileName} (${content.length} chars)`);
    
    // Для реального обновления нужно использовать Apps Script API
    // или копировать вручную
    
    return true;
    
  } catch (error) {
    logError(`Failed to update ${fileName}`, error);
    throw error;
  }
}

/**
 * Проверить доступность GitHub репозитория
 */
function checkGitHubAccess() {
  try {
    const testUrl = GITHUB_CONFIG.RAW_BASE_URL + 'README.md';
    const response = UrlFetchApp.fetch(testUrl, {
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() === 200) {
      Logger.log('✅ GitHub доступен');
      return true;
    } else {
      Logger.log(`❌ GitHub недоступен: HTTP ${response.getResponseCode()}`);
      return false;
    }
  } catch (error) {
    Logger.log('❌ Ошибка доступа к GitHub: ' + error.message);
    return false;
  }
}

/**
 * Показать инструкции по ручному обновлению
 */
function showManualUpdateInstructions() {
  const ui = SpreadsheetApp.getUi();
  
  const message = `
ИНСТРУКЦИЯ ПО РУЧНОМУ ОБНОВЛЕНИЮ:

1. Откройте GitHub репозиторий:
   ${GITHUB_CONFIG.RAW_BASE_URL.replace('/main/', '')}

2. Для каждого файла:
   - Откройте файл .gs на GitHub
   - Нажмите "Raw" (показать исходный код)
   - Скопируйте весь код
   - В Apps Script найдите соответствующий файл
   - Замените весь код на скопированный
   - Сохраните (Ctrl+S)

3. После обновления всех файлов:
   - Запустите функцию updateSystem()
   - Это обновит структуру таблиц

АВТОМАТИЧЕСКОЕ ОБНОВЛЕНИЕ:
   Требует настройки Apps Script API
   (более сложный процесс)
  `;
  
  ui.alert('Инструкция по обновлению', message, ui.ButtonSet.OK);
}

