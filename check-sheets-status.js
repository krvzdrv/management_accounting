/**
 * Скрипт для проверки статуса Google Sheets таблицы
 * Проверяет какие листы уже созданы
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
  SPREADSHEET_ID: '1lY1GZ_biRqCfIGKdt9lOag1isK_Wmz2ARB6GzjJ2plI', // Из check-sheets-connection.js
  TOKEN_PATH: path.join(__dirname, 'token.json'),
  CREDENTIALS_PATH: path.join(__dirname, 'credentials.json')
};

// Ожидаемые листы из Config.gs
const EXPECTED_SHEETS = [
  'Currencies',
  'Exchange_Rates',
  'VAT_Rates',
  'Companies',
  'Counterparties',
  'Products',
  'Expense_Categories',
  'Purchase_Orders',
  'Purchase_Order_Lines',
  'Sales_Orders',
  'Sales_Order_LINES',
  'Expenses',
  'Cash_Transactions',
  'Payments',
  'Intercompany_Loans',
  'Intercompany_Loan_Payments',
  'Account_Balances'
];

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
 * Получить список листов из таблицы
 */
async function getSheets(auth) {
  const sheets = google.sheets({ version: 'v4', auth });
  
  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId: CONFIG.SPREADSHEET_ID
    });
    
    return {
      title: response.data.properties.title,
      sheets: response.data.sheets.map(sheet => ({
        id: sheet.properties.sheetId,
        title: sheet.properties.title,
        index: sheet.properties.index
      }))
    };
  } catch (error) {
    if (error.code === 403) {
      throw new Error('Нет доступа к таблице. Убедитесь что у вас есть права на просмотр таблицы.');
    }
    throw new Error(`Ошибка при получении листов: ${error.message}`);
  }
}

/**
 * Главная функция проверки
 */
async function checkSheetsStatus() {
  try {
    console.log('🔍 Проверка статуса Google Sheets таблицы...\n');
    
    // Авторизация
    console.log('🔐 Авторизация...');
    const auth = await authorize();
    console.log('✅ Авторизован\n');
    
    // Получение информации о таблице
    console.log('📥 Получение информации о таблице...');
    const spreadsheetInfo = await getSheets(auth);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Информация о таблице:');
    console.log('='.repeat(60));
    console.log(`Название: ${spreadsheetInfo.title}`);
    console.log(`Всего листов: ${spreadsheetInfo.sheets.length}`);
    console.log('\n📋 Список листов:');
    console.log('─'.repeat(60));
    
    spreadsheetInfo.sheets.forEach((sheet, index) => {
      console.log(`   ${index + 1}. ${sheet.title}`);
    });
    
    // Проверка ожидаемых листов
    console.log('\n' + '='.repeat(60));
    console.log('📋 Проверка ожидаемых листов:');
    console.log('='.repeat(60));
    
    const existingSheetNames = spreadsheetInfo.sheets.map(s => s.title);
    let foundCount = 0;
    let missingCount = 0;
    const missing = [];
    
    EXPECTED_SHEETS.forEach(expectedName => {
      if (existingSheetNames.includes(expectedName)) {
        console.log(`   ✅ ${expectedName}`);
        foundCount++;
      } else {
        console.log(`   ❌ ${expectedName} - ОТСУТСТВУЕТ`);
        missing.push(expectedName);
        missingCount++;
      }
    });
    
    console.log('\n' + '='.repeat(60));
    if (missingCount === 0) {
      console.log('✅ Все ожидаемые листы присутствуют!');
      console.log('✅ Система полностью инициализирована');
    } else {
      console.log(`⚠️  Отсутствует листов: ${missingCount} из ${EXPECTED_SHEETS.length}`);
      console.log(`✅ Найдено листов: ${foundCount} из ${EXPECTED_SHEETS.length}`);
      console.log('\n💡 Нужно инициализировать систему:');
      console.log('   1. Откройте таблицу:');
      console.log(`      https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}/edit`);
      console.log('   2. Откройте Расширения → Apps Script');
      console.log('   3. Выберите функцию initializeSystem');
      console.log('   4. Нажмите Выполнить (▶️)');
    }
    console.log('='.repeat(60));
    
    // Дополнительные листы
    const extraSheets = existingSheetNames.filter(name => !EXPECTED_SHEETS.includes(name));
    if (extraSheets.length > 0) {
      console.log(`\nℹ️  Дополнительные листы в таблице (${extraSheets.length}):`);
      extraSheets.forEach(name => {
        console.log(`   - ${name}`);
      });
    }
    
    console.log('\n🔗 Ссылки:');
    console.log('─'.repeat(60));
    console.log(`Таблица:`);
    console.log(`   https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}/edit`);
    console.log(`\nApps Script:`);
    console.log(`   https://script.google.com/d/${CONFIG.SCRIPT_ID}/edit`);
    
    console.log('\n');
    
  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    
    if (error.message.includes('доступа')) {
      console.log('\n💡 Решение:');
      console.log('   1. Убедитесь что у вас есть доступ к таблице');
      console.log('   2. Откройте таблицу в браузере');
      console.log('   3. Проверьте права доступа');
    }
    
    process.exit(1);
  }
}

// Запуск
if (require.main === module) {
  checkSheetsStatus();
}

module.exports = { checkSheetsStatus };

