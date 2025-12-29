/**
 * Управление версиями системы
 * Отслеживает текущую версию и управляет обновлениями
 */

const VERSION_CONFIG = {
  CURRENT_VERSION: '2.0.0',
  VERSION_HISTORY: [
    {
      version: '1.0.0',
      date: '2024-01-01',
      description: 'Начальная версия системы'
    },
    {
      version: '2.0.0',
      date: '2025-01-15',
      description: 'Оптимизированная структура под формат Planfix CSV'
    }
  ]
};

/**
 * Получить текущую версию системы из Properties
 */
function getCurrentVersion() {
  const properties = PropertiesService.getScriptProperties();
  const version = properties.getProperty('SYSTEM_VERSION');
  return version || '1.0.0';
}

/**
 * Установить версию системы
 */
function setCurrentVersion(version) {
  const properties = PropertiesService.getScriptProperties();
  properties.setProperty('SYSTEM_VERSION', version);
  logInfo(`Version updated to: ${version}`);
}

/**
 * Проверить, нужны ли обновления
 */
function checkForUpdates() {
  const currentVersion = getCurrentVersion();
  const latestVersion = VERSION_CONFIG.CURRENT_VERSION;
  
  if (currentVersion !== latestVersion) {
    return {
      needsUpdate: true,
      currentVersion: currentVersion,
      latestVersion: latestVersion,
      updates: getUpdatesBetweenVersions(currentVersion, latestVersion)
    };
  }
  
  return {
    needsUpdate: false,
    currentVersion: currentVersion,
    latestVersion: latestVersion
  };
}

/**
 * Получить список обновлений между версиями
 */
function getUpdatesBetweenVersions(fromVersion, toVersion) {
  const updates = [];
  let foundStart = false;
  
  for (const update of VERSION_CONFIG.VERSION_HISTORY) {
    if (update.version === fromVersion) {
      foundStart = true;
      continue;
    }
    if (foundStart) {
      updates.push(update);
      if (update.version === toVersion) {
        break;
      }
    }
  }
  
  return updates;
}

/**
 * Получить информацию о версии
 */
function getVersionInfo() {
  return {
    current: getCurrentVersion(),
    latest: VERSION_CONFIG.CURRENT_VERSION,
    history: VERSION_CONFIG.VERSION_HISTORY
  };
}

