/**
 * Настройка триггеров
 */

/**
 * Установка всех триггеров при инициализации
 */
function setupAllTriggers() {
  // Удалить существующие триггеры
  deleteAllTriggers();
  
  // Ежедневное обновление курсов валют (в 9:00)
  ScriptApp.newTrigger('updateExchangeRatesFromAPI')
    .timeBased()
    .atHour(9)
    .everyDays(1)
    .create();
  
  // Ежедневное обновление балансов (в 10:00)
  ScriptApp.newTrigger('updateAllAccountBalances')
    .timeBased()
    .atHour(10)
    .everyDays(1)
    .create();
  
  // Проверка просроченной задолженности (в 11:00)
  ScriptApp.newTrigger('checkAndNotifyOverdueDebts')
    .timeBased()
    .atHour(11)
    .everyDays(1)
    .create();
  
  // Проверка кредитных лимитов (в 12:00)
  ScriptApp.newTrigger('checkCreditLimits')
    .timeBased()
    .atHour(12)
    .everyDays(1)
    .create();
  
  logInfo('All triggers have been set up successfully');
}

/**
 * Удалить все триггеры проекта
 */
function deleteAllTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  logInfo('All triggers have been deleted');
}

/**
 * Список всех активных триггеров
 */
function listAllTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    Logger.log(`Function: ${trigger.getHandlerFunction()}, Event: ${trigger.getEventType()}`);
  });
}

