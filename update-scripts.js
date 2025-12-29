/**
 * Автоматическое обновление Apps Script из GitHub
 * Требует: npm install googleapis google-auth-library
 */

const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');

// Загрузка конфигурации из .env
require('dotenv').config();

const CONFIG = {
  CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  SCRIPT_ID: process.env.GOOGLE_SCRIPT_ID,
  GITHUB_REPO: process.env.GITHUB_REPO_URL,
  GITHUB_BRANCH: process.env.GITHUB_BRANCH || 'main',
  TOKEN_PATH: path.join(__dirname, 'token.json'),
  CREDENTIALS_PATH: path.join(__dirname, 'credentials.json')
};

// Файлы для обновления
const FILES_TO_UPDATE = [
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
  'CSVImporter.gs',
  'OptimizedSetup.gs'
];

/**
 * Загрузить файл из локальной папки
 */
async function fetchFromLocal(fileName) {
  const filePath = path.join(__dirname, fileName);
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    throw new Error(`File not found: ${filePath}`);
  }
}

/**
 * Загрузить файл из GitHub
 */
async function fetchFromGitHub(fileName) {
  if (!CONFIG.GITHUB_REPO || CONFIG.GITHUB_REPO.includes('your-username')) {
    throw new Error('GitHub repository not configured');
  }
  
  return new Promise((resolve, reject) => {
    const url = `${CONFIG.GITHUB_REPO}/raw/${CONFIG.GITHUB_BRANCH}/${fileName}`;
    
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Загрузить файл (сначала из локальной папки, потом из GitHub)
 */
async function fetchFile(fileName) {
  // Сначала пробуем локальную папку
  try {
    return await fetchFromLocal(fileName);
  } catch (localError) {
    // Если локально не найдено, пробуем GitHub
    try {
      return await fetchFromGitHub(fileName);
    } catch (githubError) {
      throw new Error(`Failed to fetch ${fileName} from local or GitHub: ${localError.message}`);
    }
  }
}

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
    // Нет сохраненного токена - запрашиваем новый
    return getNewToken(oAuth2Client);
  }
}

/**
 * Получить новый токен
 */
async function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/script.projects',
      'https://www.googleapis.com/auth/drive.file'
    ],
  });
  
    console.log('\n🔐 Authorization required!');
    console.log('Visit this URL to authorize:', authUrl);
    console.log('Enter the code from that page here: ');
    console.log('⚠️  Keep this code private and do not share it!\n');
  
  // Для автоматизации можно использовать readline или встроенный сервер
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  return new Promise((resolve) => {
    rl.question('Enter the code: ', async (code) => {
      rl.close();
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
      
    // Сохраняем токен с ограниченными правами доступа (только для владельца)
    await fs.writeFile(CONFIG.TOKEN_PATH, JSON.stringify(tokens, null, 2));
    
    // Устанавливаем права доступа: только владелец может читать/писать
    if (process.platform !== 'win32') {
      await fs.chmod(CONFIG.TOKEN_PATH, 0o600);
    }
    
    console.log('Token stored to', CONFIG.TOKEN_PATH);
      
      resolve(oAuth2Client);
    });
  });
}

/**
 * Обновить файл в Apps Script проекте
 */
async function updateScriptFile(auth, fileName, content) {
  const script = google.script({ version: 'v1', auth: auth });
  
  // Получаем имя файла без расширения
  const scriptName = fileName.replace('.gs', '');
  
  try {
    // Получаем список файлов проекта
    const project = await script.projects.getContent({
      scriptId: CONFIG.SCRIPT_ID
    });
    
    // Ищем файл в проекте
    let fileFound = false;
    const files = project.data.files || [];
    
    for (const file of files) {
      if (file.name === scriptName && file.type === 'SERVER_JS') {
        fileFound = true;
        // Обновляем содержимое файла
        file.source = content;
        break;
      }
    }
    
    if (!fileFound) {
      // Создаем новый файл
      files.push({
        name: scriptName,
        type: 'SERVER_JS',
        source: content
      });
    }
    
    // Обновляем проект
    await script.projects.updateContent({
      scriptId: CONFIG.SCRIPT_ID,
      requestBody: {
        files: files
      }
    });
    
    console.log(`✅ Updated: ${fileName}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Failed to update ${fileName}:`, error.message);
    throw error;
  }
}

/**
 * Главная функция обновления
 */
async function updateAllScripts() {
  try {
    console.log('🚀 Starting script update...\n');
    
    // Проверка конфигурации
    if (!CONFIG.CLIENT_ID || !CONFIG.CLIENT_SECRET || !CONFIG.SCRIPT_ID) {
      throw new Error('Missing configuration. Please check .env file');
    }
    
    // Проверка безопасности - убеждаемся что не используем placeholder значения
    if (CONFIG.CLIENT_ID.includes('your_client_id') || 
        CONFIG.CLIENT_SECRET.includes('your_client_secret') ||
        CONFIG.SCRIPT_ID.includes('your_script_id')) {
      throw new Error('⚠️  SECURITY WARNING: Using placeholder values! Please set real credentials in .env file');
    }
    
    // Проверка что credentials.json существует
    try {
      await fs.access(CONFIG.CREDENTIALS_PATH);
    } catch (error) {
      throw new Error(`Credentials file not found: ${CONFIG.CREDENTIALS_PATH}\nPlease download OAuth credentials from Google Cloud Console`);
    }
    
    // Авторизация
    console.log('🔐 Authorizing...');
    const auth = await authorize();
    console.log('✅ Authorized\n');
    
    // Обновление файлов
    let updated = 0;
    let failed = 0;
    
    for (const fileName of FILES_TO_UPDATE) {
      try {
        console.log(`📥 Fetching ${fileName}...`);
        const content = await fetchFile(fileName);
        
        console.log(`📝 Updating ${fileName}...`);
        await updateScriptFile(auth, fileName, content);
        
        updated++;
      } catch (error) {
        console.error(`❌ Error updating ${fileName}:`, error.message);
        failed++;
      }
    }
    
    console.log(`\n✨ Update complete!`);
    console.log(`✅ Updated: ${updated}`);
    console.log(`❌ Failed: ${failed}`);
    
    // Предупреждение о безопасности
    console.log(`\n🔒 Security reminder: Never commit .env, credentials.json, or token.json to Git!`);
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

// Запуск
if (require.main === module) {
  updateAllScripts();
}

module.exports = { updateAllScripts };

