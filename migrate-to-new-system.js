/**
 * Автоматическая миграция на новую систему обновлений
 * Этот скрипт помогает перейти со старой системы на новую
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Задать вопрос пользователю
 */
function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

/**
 * Проверить существование файла
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Создать .env файл интерактивно
 */
async function createEnvFile() {
  console.log('\n📝 Создание файла .env...\n');
  
  if (fileExists('.env')) {
    const overwrite = await question('Файл .env уже существует. Перезаписать? (y/n): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Пропускаем создание .env\n');
      return;
    }
  }
  
  console.log('Введите данные (или нажмите Enter для пропуска):\n');
  
  const clientId = await question('GOOGLE_CLIENT_ID: ');
  const clientSecret = await question('GOOGLE_CLIENT_SECRET: ');
  const scriptId = await question('GOOGLE_SCRIPT_ID: ');
  const repoUrl = await question('GITHUB_REPO_URL (или Enter для текущего репозитория): ');
  const branch = await question('GITHUB_BRANCH (или Enter для "main"): ') || 'main';
  
  const envContent = `# Google OAuth Credentials
GOOGLE_CLIENT_ID=${clientId || 'your_client_id_here'}
GOOGLE_CLIENT_SECRET=${clientSecret || 'your_client_secret_here'}

# Apps Script Project ID
GOOGLE_SCRIPT_ID=${scriptId || 'your_script_id_here'}

# GitHub Repository
GITHUB_REPO_URL=${repoUrl || 'https://github.com/your-username/your-repo'}
GITHUB_BRANCH=${branch}
`;
  
  fs.writeFileSync('.env', envContent);
  console.log('\n✅ Файл .env создан!\n');
}

/**
 * Проверить текущее состояние проекта
 */
function checkCurrentState() {
  console.log('🔍 Проверка текущего состояния...\n');
  
  const state = {
    hasEnv: fileExists('.env'),
    hasCredentials: fileExists('credentials.json'),
    hasToken: fileExists('token.json'),
    hasPackageJson: fileExists('package.json'),
    hasUpdateScript: fileExists('update-scripts.js'),
    hasSecurityCheck: fileExists('security-check.js')
  };
  
  console.log('Текущее состояние:');
  console.log(`  .env: ${state.hasEnv ? '✅' : '❌'}`);
  console.log(`  credentials.json: ${state.hasCredentials ? '✅' : '❌'}`);
  console.log(`  token.json: ${state.hasToken ? '✅' : '❌'}`);
  console.log(`  package.json: ${state.hasPackageJson ? '✅' : '❌'}`);
  console.log(`  update-scripts.js: ${state.hasUpdateScript ? '✅' : '❌'}`);
  console.log(`  security-check.js: ${state.hasSecurityCheck ? '✅' : '❌'}\n`);
  
  return state;
}

/**
 * Установить зависимости
 */
async function installDependencies() {
  if (!fileExists('package.json')) {
    console.log('❌ package.json не найден. Пропускаем установку зависимостей.\n');
    return false;
  }
  
  const install = await question('Установить зависимости npm? (y/n): ');
  if (install.toLowerCase() !== 'y') {
    return false;
  }
  
  console.log('\n📦 Установка зависимостей...');
  const { execSync } = require('child_process');
  
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('\n✅ Зависимости установлены!\n');
    return true;
  } catch (error) {
    console.log('\n❌ Ошибка установки зависимостей:', error.message);
    return false;
  }
}

/**
 * Проверить настройку Google Cloud
 */
function checkGoogleCloudSetup() {
  console.log('\n🔍 Проверка настройки Google Cloud...\n');
  
  if (!fileExists('credentials.json')) {
    console.log('⚠️  credentials.json не найден.');
    console.log('   Следуйте инструкциям в SETUP_AUTO_UPDATE.md');
    console.log('   Шаг 2: Создание OAuth credentials\n');
    return false;
  }
  
  console.log('✅ credentials.json найден\n');
  return true;
}

/**
 * Проверить настройку Apps Script
 */
function checkAppsScriptSetup() {
  console.log('\n🔍 Проверка настройки Apps Script...\n');
  
  if (!fileExists('.env')) {
    console.log('⚠️  .env не найден. Не могу проверить Script ID.\n');
    return false;
  }
  
  const envContent = fs.readFileSync('.env', 'utf8');
  if (envContent.includes('your_script_id')) {
    console.log('⚠️  Script ID не настроен в .env');
    console.log('   Получите Script ID из Apps Script: Project Settings → Script ID\n');
    return false;
  }
  
  console.log('✅ Script ID настроен в .env\n');
  return true;
}

/**
 * Запустить проверку безопасности
 */
async function runSecurityCheck() {
  if (!fileExists('security-check.js')) {
    console.log('⚠️  security-check.js не найден. Пропускаем проверку.\n');
    return;
  }
  
  const run = await question('Запустить проверку безопасности? (y/n): ');
  if (run.toLowerCase() !== 'y') {
    return;
  }
  
  console.log('\n🔒 Запуск проверки безопасности...\n');
  const { execSync } = require('child_process');
  
  try {
    execSync('node security-check.js', { stdio: 'inherit' });
  } catch (error) {
    console.log('\n⚠️  Проверка безопасности выявила проблемы.');
    console.log('   Исправьте их перед продолжением.\n');
  }
}

/**
 * Показать следующие шаги
 */
function showNextSteps(state) {
  console.log('\n' + '='.repeat(60));
  console.log('📋 СЛЕДУЮЩИЕ ШАГИ:');
  console.log('='.repeat(60) + '\n');
  
  if (!state.hasCredentials) {
    console.log('1. Настройте Google Cloud:');
    console.log('   - Откройте Google Cloud Console');
    console.log('   - Включите Apps Script API');
    console.log('   - Создайте OAuth Client ID (Desktop app)');
    console.log('   - Скачайте credentials.json');
    console.log('   См. SETUP_AUTO_UPDATE.md → Шаг 2\n');
  }
  
  if (!state.hasEnv || fs.readFileSync('.env', 'utf8').includes('your_')) {
    console.log('2. Настройте .env файл:');
    console.log('   - Заполните GOOGLE_CLIENT_ID');
    console.log('   - Заполните GOOGLE_CLIENT_SECRET');
    console.log('   - Заполните GOOGLE_SCRIPT_ID (из Apps Script)');
    console.log('   - Заполните GITHUB_REPO_URL\n');
  }
  
  console.log('3. После настройки запустите:');
  console.log('   npm run update');
  console.log('   или');
  console.log('   python update_scripts.py\n');
  
  console.log('4. В Apps Script запустите:');
  console.log('   updateSystem()');
  console.log('   Это обновит структуру таблиц\n');
}

/**
 * Главная функция миграции
 */
async function migrate() {
  console.log('🚀 Автоматическая миграция на новую систему обновлений\n');
  console.log('='.repeat(60) + '\n');
  
  // Проверка текущего состояния
  const state = checkCurrentState();
  
  // Установка зависимостей
  if (state.hasPackageJson && !fileExists('node_modules')) {
    await installDependencies();
  }
  
  // Создание .env
  if (!state.hasEnv) {
    await createEnvFile();
  } else {
    const update = await question('Обновить существующий .env? (y/n): ');
    if (update.toLowerCase() === 'y') {
      await createEnvFile();
    }
  }
  
  // Проверка Google Cloud
  checkGoogleCloudSetup();
  
  // Проверка Apps Script
  checkAppsScriptSetup();
  
  // Проверка безопасности
  await runSecurityCheck();
  
  // Следующие шаги
  showNextSteps(state);
  
  console.log('='.repeat(60));
  console.log('✅ Миграция завершена!');
  console.log('='.repeat(60) + '\n');
  
  rl.close();
}

// Запуск
if (require.main === module) {
  migrate().catch(error => {
    console.error('❌ Ошибка миграции:', error);
    process.exit(1);
  });
}

module.exports = { migrate };

