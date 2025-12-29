/**
 * Скрипт для проверки состояния Apps Script проекта
 * Показывает какие файлы есть в проекте
 */

const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const fs = require('fs').promises;
const path = require('path');

// Загрузка конфигурации из .env
require('dotenv').config();

const CONFIG = {
  CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  SCRIPT_ID: process.env.GOOGLE_SCRIPT_ID,
  TOKEN_PATH: path.join(__dirname, 'token.json'),
  CREDENTIALS_PATH: path.join(__dirname, 'credentials.json')
};

/**
 * Авторизация в Google через OAuth2
 */
async function authorize() {
  const oAuth2Client = new OAuth2Client(
    CONFIG.CLIENT_ID,
    CONFIG.CLIENT_SECRET,
    'http://localhost:3000/oauth2callback'
  );
  
  // Проверяем сохраненный токен
  try {
    const token = await fs.readFile(CONFIG.TOKEN_PATH);
    const credentials = JSON.parse(token);
    oAuth2Client.setCredentials(credentials);
    
    // Проверяем, не истек ли токен
    if (credentials.expiry_date && credentials.expiry_date > Date.now()) {
      return oAuth2Client;
    }
    
    // Обновляем токен если истек
    const newToken = await oAuth2Client.refreshAccessToken();
    oAuth2Client.setCredentials(newToken.credentials);
    await fs.writeFile(CONFIG.TOKEN_PATH, JSON.stringify(newToken.credentials, null, 2));
    return oAuth2Client;
    
  } catch (err) {
    throw new Error('Токен не найден. Запустите сначала update-scripts.js для авторизации.');
  }
}

/**
 * Получить список файлов из Apps Script проекта
 */
async function getProjectFiles(auth) {
  const script = google.script({ version: 'v1', auth: auth });
  
  try {
    const project = await script.projects.getContent({
      scriptId: CONFIG.SCRIPT_ID
    });
    
    return project.data.files || [];
  } catch (error) {
    throw new Error(`Ошибка при получении файлов: ${error.message}`);
  }
}

/**
 * Главная функция проверки
 */
async function checkScripts() {
  try {
    console.log('🔍 Проверка Apps Script проекта...\n');
    
    // Проверка конфигурации
    if (!CONFIG.CLIENT_ID || !CONFIG.CLIENT_SECRET || !CONFIG.SCRIPT_ID) {
      throw new Error('Отсутствует конфигурация. Проверьте .env файл');
    }
    
    if (CONFIG.SCRIPT_ID.includes('your_script_id')) {
      throw new Error('⚠️  Script ID не настроен в .env файле');
    }
    
    console.log(`📋 Script ID: ${CONFIG.SCRIPT_ID}\n`);
    
    // Авторизация
    console.log('🔐 Авторизация...');
    const auth = await authorize();
    console.log('✅ Авторизован\n');
    
    // Получение файлов
    console.log('📥 Получение списка файлов из проекта...');
    const files = await getProjectFiles(auth);
    
    console.log(`\n📊 Найдено файлов в проекте: ${files.length}\n`);
    
    // Ожидаемые файлы
    const expectedFiles = [
      'Config',
      'Utils',
      'Main',
      'CurrencyManager',
      'VATCalculator',
      'PaymentManager',
      'DebtCalculator',
      'Notifications',
      'Triggers',
      'VersionManager',
      'UpdateManager',
      'MigrationScripts',
      'CSVImporter',
      'OptimizedSetup'
    ];
    
    // Группировка файлов
    const serverFiles = files.filter(f => f.type === 'SERVER_JS');
    const htmlFiles = files.filter(f => f.type === 'HTML');
    const otherFiles = files.filter(f => f.type !== 'SERVER_JS' && f.type !== 'HTML');
    
    console.log('📝 Файлы скриптов (SERVER_JS):');
    console.log('─'.repeat(60));
    
    if (serverFiles.length === 0) {
      console.log('   ❌ Файлы скриптов не найдены');
    } else {
      const fileNames = serverFiles.map(f => f.name || '(без имени)').sort();
      fileNames.forEach((name, index) => {
        const isExpected = expectedFiles.includes(name);
        const status = isExpected ? '✅' : '⚠️ ';
        console.log(`   ${status} ${name}`);
      });
    }
    
    if (htmlFiles.length > 0) {
      console.log(`\n🌐 HTML файлы (${htmlFiles.length}):`);
      htmlFiles.forEach(f => {
        console.log(`   - ${f.name || '(без имени)'}`);
      });
    }
    
    if (otherFiles.length > 0) {
      console.log(`\n📄 Другие файлы (${otherFiles.length}):`);
      otherFiles.forEach(f => {
        console.log(`   - ${f.name || '(без имени)'} (${f.type})`);
      });
    }
    
    // Проверка ожидаемых файлов
    console.log('\n' + '='.repeat(60));
    console.log('📋 Проверка ожидаемых файлов:');
    console.log('='.repeat(60));
    
    const foundFiles = serverFiles.map(f => f.name).filter(Boolean);
    let allFound = true;
    let missingCount = 0;
    
    expectedFiles.forEach(expectedName => {
      if (foundFiles.includes(expectedName)) {
        console.log(`   ✅ ${expectedName}`);
      } else {
        console.log(`   ❌ ${expectedName} - ОТСУТСТВУЕТ`);
        allFound = false;
        missingCount++;
      }
    });
    
    console.log('\n' + '='.repeat(60));
    if (allFound) {
      console.log('✅ Все ожидаемые файлы присутствуют в проекте!');
    } else {
      console.log(`⚠️  Отсутствует файлов: ${missingCount} из ${expectedFiles.length}`);
      console.log('\n💡 Рекомендация: Запустите обновление:');
      console.log('   npm run update');
      console.log('   или');
      console.log('   node update-scripts.js');
    }
    console.log('='.repeat(60));
    
    // Дополнительная информация
    const extraFiles = foundFiles.filter(name => !expectedFiles.includes(name));
    if (extraFiles.length > 0) {
      console.log(`\nℹ️  Дополнительные файлы в проекте (${extraFiles.length}):`);
      extraFiles.forEach(name => {
        console.log(`   - ${name}`);
      });
    }
    
    console.log(`\n🔗 Ссылка на проект:`);
    console.log(`   https://script.google.com/d/${CONFIG.SCRIPT_ID}/edit`);
    
  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    process.exit(1);
  }
}

// Запуск
if (require.main === module) {
  checkScripts();
}

module.exports = { checkScripts };

