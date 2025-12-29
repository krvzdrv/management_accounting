/**
 * Скрипт для проверки связи Google Sheets таблицы с Apps Script проектом
 * Помогает найти таблицу, связанную с проектом
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
  
  try {
    const token = await fs.readFile(CONFIG.TOKEN_PATH);
    const credentials = JSON.parse(token);
    oAuth2Client.setCredentials(credentials);
    
    if (credentials.expiry_date && credentials.expiry_date > Date.now()) {
      return oAuth2Client;
    }
    
    const newToken = await oAuth2Client.refreshAccessToken();
    oAuth2Client.setCredentials(newToken.credentials);
    await fs.writeFile(CONFIG.TOKEN_PATH, JSON.stringify(newToken.credentials, null, 2));
    return oAuth2Client;
    
  } catch (err) {
    throw new Error('Токен не найден. Запустите сначала update-scripts.js для авторизации.');
  }
}

/**
 * Получить информацию о проекте
 */
async function getProjectInfo(auth) {
  const script = google.script({ version: 'v1', auth: auth });
  
  try {
    const project = await script.projects.get({
      scriptId: CONFIG.SCRIPT_ID
    });
    
    return project.data;
  } catch (error) {
    throw new Error(`Ошибка при получении информации о проекте: ${error.message}`);
  }
}

/**
 * Главная функция проверки
 */
async function checkConnection() {
  try {
    console.log('🔍 Проверка связи Google Sheets с Apps Script проектом...\n');
    
    if (!CONFIG.SCRIPT_ID || CONFIG.SCRIPT_ID.includes('your_script_id')) {
      throw new Error('Script ID не настроен в .env файле');
    }
    
    console.log(`📋 Script ID: ${CONFIG.SCRIPT_ID}\n`);
    
    // Авторизация
    console.log('🔐 Авторизация...');
    const auth = await authorize();
    console.log('✅ Авторизован\n');
    
    // Получение информации о проекте
    console.log('📥 Получение информации о проекте...');
    const projectInfo = await getProjectInfo(auth);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Информация о проекте:');
    console.log('='.repeat(60));
    console.log(`Название: ${projectInfo.title || '(не указано)'}`);
    console.log(`Создан: ${projectInfo.createTime || '(неизвестно)'}`);
    console.log(`Обновлен: ${projectInfo.updateTime || '(неизвестно)'}`);
    
    // Проверка типа проекта
    if (projectInfo.parentId) {
      console.log(`\n📎 Тип проекта: Привязан к Google Drive файлу`);
      console.log(`Parent ID: ${projectInfo.parentId}`);
      console.log(`\n✅ Проект привязан к файлу в Google Drive`);
      console.log(`\n💡 Чтобы найти таблицу:`);
      console.log(`   1. Откройте Google Drive`);
      console.log(`   2. Найдите файл с ID: ${projectInfo.parentId}`);
      console.log(`   3. Или используйте прямую ссылку:`);
      console.log(`      https://drive.google.com/drive/folders/${projectInfo.parentId}`);
    } else {
      console.log(`\n📎 Тип проекта: Standalone (не привязан к файлу)`);
      console.log(`\n⚠️  Проект не привязан к Google Sheets таблице`);
      console.log(`\n💡 Что делать:`);
      console.log(`   1. Создайте новую Google Таблицу или откройте существующую`);
      console.log(`   2. В таблице: Расширения → Apps Script`);
      console.log(`   3. Скопируйте все файлы из этого проекта в проект таблицы`);
      console.log(`   4. Или используйте скрипт обновления для копирования файлов`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🔗 Ссылки:');
    console.log('='.repeat(60));
    console.log(`Apps Script проект:`);
    console.log(`   https://script.google.com/d/${CONFIG.SCRIPT_ID}/edit`);
    
    if (projectInfo.parentId) {
      console.log(`\nGoogle Drive файл:`);
      console.log(`   https://drive.google.com/file/d/${projectInfo.parentId}/view`);
    }
    
    console.log('\n');
    
  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    process.exit(1);
  }
}

// Запуск
if (require.main === module) {
  checkConnection();
}

module.exports = { checkConnection };

