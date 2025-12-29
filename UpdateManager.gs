/**
 * Менеджер обновлений системы
 * Управляет обновлением скриптов и структуры таблиц
 */

/**
 * Главная функция обновления системы
 */
function updateSystem() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Проверка версии
    const updateCheck = checkForUpdates();
    
    if (!updateCheck.needsUpdate) {
      ui.alert(
        'Система актуальна',
        `Текущая версия: ${updateCheck.currentVersion}\nПоследняя версия: ${updateCheck.latestVersion}`,
        ui.ButtonSet.OK
      );
      return;
    }
    
    // Показываем информацию об обновлениях
    let updateMessage = `Доступно обновление:\n\n`;
    updateMessage += `Текущая версия: ${updateCheck.currentVersion}\n`;
    updateMessage += `Новая версия: ${updateCheck.latestVersion}\n\n`;
    updateMessage += `Изменения:\n`;
    
    updateCheck.updates.forEach(update => {
      updateMessage += `• ${update.version} (${update.date}): ${update.description}\n`;
    });
    
    updateMessage += `\nПродолжить обновление?`;
    
    const response = ui.alert(
      'Обновление системы',
      updateMessage,
      ui.ButtonSet.YES_NO
    );
    
    if (response !== ui.Button.YES) {
      return;
    }
    
    // Создаем резервную копию
    logInfo('Creating backup before update...');
    createBackup();
    
    // Выполняем миграции
    logInfo('Running migrations...');
    runMigrations(updateCheck.currentVersion, updateCheck.latestVersion);
    
    // Обновляем версию
    setCurrentVersion(updateCheck.latestVersion);
    
    ui.alert(
      'Обновление завершено',
      `Система успешно обновлена до версии ${updateCheck.latestVersion}`,
      ui.ButtonSet.OK
    );
    
    logInfo(`System updated from ${updateCheck.currentVersion} to ${updateCheck.latestVersion}`);
    
  } catch (error) {
    logError('Update failed', error);
    ui.alert(
      'Ошибка обновления',
      `Произошла ошибка при обновлении:\n${error.message}\n\nПроверьте логи для подробностей.`,
      ui.ButtonSet.OK
    );
    throw error;
  }
}

/**
 * Выполнить миграции между версиями
 */
function runMigrations(fromVersion, toVersion) {
  const migrations = getMigrationsForVersions(fromVersion, toVersion);
  
  for (const migration of migrations) {
    logInfo(`Running migration: ${migration.name}`);
    
    try {
      migration.execute();
      logInfo(`Migration ${migration.name} completed successfully`);
    } catch (error) {
      logError(`Migration ${migration.name} failed`, error);
      throw new Error(`Migration failed: ${migration.name} - ${error.message}`);
    }
  }
}

/**
 * Получить миграции для диапазона версий
 */
function getMigrationsForVersions(fromVersion, toVersion) {
  const allMigrations = getAllMigrations();
  const migrations = [];
  let foundStart = false;
  
  for (const migration of allMigrations) {
    if (migration.fromVersion === fromVersion) {
      foundStart = true;
    }
    if (foundStart) {
      migrations.push(migration);
      if (migration.toVersion === toVersion) {
        break;
      }
    }
  }
  
  return migrations;
}

/**
 * Получить все доступные миграции
 */
function getAllMigrations() {
  return [
    {
      name: 'migration_1_0_to_2_0',
      fromVersion: '1.0.0',
      toVersion: '2.0.0',
      description: 'Обновление структуры под формат Planfix CSV',
      execute: migration_1_0_to_2_0
    }
    // Добавляйте новые миграции здесь
  ];
}

/**
 * Создать резервную копию перед обновлением
 */
function createBackup() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HH-mm-ss');
    const backupName = `Backup_${today}`;
    
    // Создаем копию таблицы
    const backup = ss.copy(backupName);
    
    logInfo(`Backup created: ${backupName}`);
    
    // Сохраняем информацию о резервной копии
    const properties = PropertiesService.getScriptProperties();
    properties.setProperty('LAST_BACKUP_NAME', backupName);
    properties.setProperty('LAST_BACKUP_DATE', new Date().toISOString());
    
    return backup;
  } catch (error) {
    logError('Failed to create backup', error);
    throw error;
  }
}

/**
 * Обновить структуру листа (добавить/изменить колонки)
 */
function updateSheetStructure(sheetName, newHeaders, options = {}) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      // Лист не существует - создаем новый
      if (options.createIfNotExists !== false) {
        sheet = ss.insertSheet(sheetName);
        sheet.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);
        formatHeaderRow(sheet);
        sheet.setFrozenRows(1);
        logInfo(`Sheet created: ${sheetName}`);
        return;
      } else {
        throw new Error(`Sheet "${sheetName}" not found`);
      }
    }
    
    // Получаем текущие заголовки
    const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Проверяем, нужны ли изменения
    const needsUpdate = !arraysEqual(currentHeaders, newHeaders);
    
    if (!needsUpdate && !options.forceUpdate) {
      logInfo(`Sheet "${sheetName}" structure is up to date`);
      return;
    }
    
    // Добавляем новые колонки
    const newColumns = [];
    const columnMap = {};
    
    for (let i = 0; i < newHeaders.length; i++) {
      const header = newHeaders[i];
      const currentIndex = currentHeaders.indexOf(header);
      
      if (currentIndex === -1) {
        // Новая колонка
        newColumns.push({
          index: i,
          header: header,
          defaultValue: options.defaultValues && options.defaultValues[header] ? options.defaultValues[header] : ''
        });
      } else {
        columnMap[i] = currentIndex;
      }
    }
    
    // Если есть новые колонки, добавляем их
    if (newColumns.length > 0) {
      const lastCol = sheet.getLastColumn();
      const dataRows = sheet.getLastRow() - 1; // Минус заголовок
      
      // Добавляем колонки справа
      for (const newCol of newColumns) {
        const insertCol = lastCol + newColumns.indexOf(newCol) + 1;
        sheet.insertColumnAfter(lastCol + newColumns.indexOf(newCol));
        sheet.getRange(1, insertCol).setValue(newCol.header);
        
        // Заполняем значениями по умолчанию
        if (dataRows > 0 && newCol.defaultValue !== '') {
          sheet.getRange(2, insertCol, dataRows, 1).setValue(newCol.defaultValue);
        }
      }
      
      logInfo(`Added ${newColumns.length} new columns to "${sheetName}"`);
    }
    
    // Переупорядочиваем колонки если нужно
    if (options.reorderColumns && Object.keys(columnMap).length > 0) {
      reorderSheetColumns(sheet, newHeaders, currentHeaders);
    }
    
    // Обновляем форматирование заголовков
    formatHeaderRow(sheet);
    
    logInfo(`Sheet "${sheetName}" structure updated`);
    
  } catch (error) {
    logError(`Failed to update sheet structure: ${sheetName}`, error);
    throw error;
  }
}

/**
 * Переупорядочить колонки листа
 */
function reorderSheetColumns(sheet, newHeaders, currentHeaders) {
  // Это сложная операция, требующая копирования данных
  // Пока оставляем как есть, можно реализовать позже если нужно
  logInfo('Column reordering skipped (not implemented)');
}

/**
 * Сравнить массивы
 */
function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

/**
 * Форматирование заголовков листа
 */
function formatHeaderRow(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285F4');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setHorizontalAlignment('center');
}

/**
 * Установить ширину колонок
 */
function setColumnWidths(sheet, widths) {
  for (let i = 0; i < widths.length; i++) {
    sheet.setColumnWidth(i + 1, widths[i]);
  }
}

/**
 * Обновить формулы в листе
 */
function updateSheetFormulas(sheetName, formulaUpdates) {
  try {
    const sheet = getSheet(sheetName);
    
    for (const update of formulaUpdates) {
      const range = sheet.getRange(update.range);
      
      if (update.action === 'set') {
        range.setFormula(update.formula);
      } else if (update.action === 'copy') {
        const sourceRange = sheet.getRange(update.sourceRange);
        range.setFormula(sourceRange.getFormula());
      }
    }
    
    logInfo(`Formulas updated in "${sheetName}"`);
  } catch (error) {
    logError(`Failed to update formulas in "${sheetName}"`, error);
    throw error;
  }
}

