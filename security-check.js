/**
 * Проверка безопасности проекта
 * Проверяет что чувствительные данные не попали в репозиторий
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SENSITIVE_PATTERNS = [
  /client_id.*=.*['"][^'"]{20,}['"]/i,
  /client_secret.*=.*['"][^'"]{20,}['"]/i,
  /api_key.*=.*['"][^'"]{10,}['"]/i,
  /password.*=.*['"][^'"]{5,}['"]/i,
  /token.*=.*['"][^'"]{20,}['"]/i,
  /secret.*=.*['"][^'"]{10,}['"]/i,
  /GOOGLE_CLIENT_ID.*=.*[^_]{20,}/i,
  /GOOGLE_CLIENT_SECRET.*=.*[^_]{20,}/i,
];

const SENSITIVE_FILES = [
  '.env',
  'credentials.json',
  'token.json',
  'token.pickle',
  '.env.local',
  '.env.production'
];

/**
 * Проверить файл на наличие чувствительных данных
 */
function checkFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return { safe: true };
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    for (const pattern of SENSITIVE_PATTERNS) {
      if (pattern.test(content)) {
        issues.push(`Found sensitive data pattern: ${pattern}`);
      }
    }
    
    return {
      safe: issues.length === 0,
      issues: issues
    };
  } catch (error) {
    return { safe: false, error: error.message };
  }
}

/**
 * Проверить что чувствительные файлы в .gitignore
 */
function checkGitignore() {
  try {
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    const missing = [];
    
    for (const file of SENSITIVE_FILES) {
      if (!gitignore.includes(file)) {
        missing.push(file);
      }
    }
    
    return {
      safe: missing.length === 0,
      missing: missing
    };
  } catch (error) {
    return { safe: false, error: error.message };
  }
}

/**
 * Проверить права доступа к файлам с токенами
 */
function checkFilePermissions() {
  const issues = [];
  
  for (const file of SENSITIVE_FILES) {
    if (fs.existsSync(file)) {
      try {
        const stats = fs.statSync(file);
        const mode = stats.mode.toString(8);
        // Проверяем что файл не доступен всем (не должно быть ---rwxrwxrwx)
        if (mode.endsWith('777') || mode.endsWith('666')) {
          issues.push(`${file} has too open permissions: ${mode}`);
        }
      } catch (error) {
        // Игнорируем ошибки
      }
    }
  }
  
  return {
    safe: issues.length === 0,
    issues: issues
  };
}

/**
 * Проверить что .env не закоммичен в Git
 */
function checkGitTracking() {
  try {
    const tracked = execSync('git ls-files', { encoding: 'utf8' });
    const issues = [];
    
    for (const file of SENSITIVE_FILES) {
      if (tracked.includes(file)) {
        issues.push(`${file} is tracked in Git! Remove it: git rm --cached ${file}`);
      }
    }
    
    return {
      safe: issues.length === 0,
      issues: issues
    };
  } catch (error) {
    // Git не инициализирован или не доступен
    return { safe: true, warning: 'Git not available' };
  }
}

/**
 * Главная функция проверки
 */
function runSecurityCheck() {
  console.log('🔒 Running security check...\n');
  
  let allSafe = true;
  
  // Проверка .gitignore
  console.log('📋 Checking .gitignore...');
  const gitignoreCheck = checkGitignore();
  if (gitignoreCheck.safe) {
    console.log('✅ .gitignore properly configured\n');
  } else {
    console.log('❌ Missing files in .gitignore:', gitignoreCheck.missing);
    allSafe = false;
  }
  
  // Проверка отслеживания в Git
  console.log('🔍 Checking Git tracking...');
  const gitCheck = checkGitTracking();
  if (gitCheck.safe) {
    console.log('✅ No sensitive files tracked in Git\n');
  } else {
    console.log('❌ Sensitive files tracked in Git:');
    gitCheck.issues.forEach(issue => console.log('  -', issue));
    allSafe = false;
  }
  
  // Проверка файлов на чувствительные данные
  console.log('🔎 Checking files for sensitive data...');
  const filesToCheck = [
    'update-scripts.js',
    'update_scripts.py',
    'Config.gs',
    'Main.gs'
  ];
  
  let filesSafe = true;
  for (const file of filesToCheck) {
    if (fs.existsSync(file)) {
      const check = checkFile(file);
      if (!check.safe) {
        console.log(`❌ ${file} may contain sensitive data`);
        if (check.issues) {
          check.issues.forEach(issue => console.log('  -', issue));
        }
        filesSafe = false;
      }
    }
  }
  
  if (filesSafe) {
    console.log('✅ No sensitive data found in code files\n');
  } else {
    allSafe = false;
  }
  
  // Проверка прав доступа
  console.log('🔐 Checking file permissions...');
  const permCheck = checkFilePermissions();
  if (permCheck.safe) {
    console.log('✅ File permissions are secure\n');
  } else {
    console.log('⚠️  File permission issues:');
    permCheck.issues.forEach(issue => console.log('  -', issue));
  }
  
  // Итог
  console.log('\n' + '='.repeat(50));
  if (allSafe) {
    console.log('✅ Security check passed!');
  } else {
    console.log('❌ Security issues found! Please fix them.');
    process.exit(1);
  }
}

if (require.main === module) {
  runSecurityCheck();
}

module.exports = { runSecurityCheck };

