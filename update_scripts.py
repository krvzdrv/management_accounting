#!/usr/bin/env python3
"""
Автоматическое обновление Apps Script из GitHub
Требует: pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib requests
"""

import os
import json
import pickle
from pathlib import Path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import requests
from dotenv import load_dotenv

# Загрузка переменных окружения
load_dotenv()

# Конфигурация
CONFIG = {
    'CLIENT_ID': os.getenv('GOOGLE_CLIENT_ID'),
    'CLIENT_SECRET': os.getenv('GOOGLE_CLIENT_SECRET'),
    'SCRIPT_ID': os.getenv('GOOGLE_SCRIPT_ID'),
    'GITHUB_REPO': os.getenv('GITHUB_REPO_URL'),
    'GITHUB_BRANCH': os.getenv('GITHUB_BRANCH', 'main'),
    'SCOPES': [
        'https://www.googleapis.com/auth/script.projects',
        'https://www.googleapis.com/auth/drive.file'
    ],
    'TOKEN_FILE': 'token.pickle',
    'CREDENTIALS_FILE': 'credentials.json'
}

# Файлы для обновления
FILES_TO_UPDATE = [
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
]


def get_credentials():
    """Получить авторизованные credentials"""
    creds = None
    
    # Проверяем сохраненный токен
    if os.path.exists(CONFIG['TOKEN_FILE']):
        with open(CONFIG['TOKEN_FILE'], 'rb') as token:
            creds = pickle.load(token)
    
    # Если нет валидных credentials, запрашиваем авторизацию
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(CONFIG['CREDENTIALS_FILE']):
                raise FileNotFoundError(
                    f"Credentials file not found: {CONFIG['CREDENTIALS_FILE']}\n"
                    "Please download OAuth credentials from Google Cloud Console"
                )
            
            flow = InstalledAppFlow.from_client_secrets_file(
                CONFIG['CREDENTIALS_FILE'],
                CONFIG['SCOPES']
            )
            creds = flow.run_local_server(port=0)
        
        # Сохраняем credentials для следующего раза с ограниченными правами
        with open(CONFIG['TOKEN_FILE'], 'wb') as token:
            pickle.dump(creds, token)
        
        # Устанавливаем права доступа: только владелец может читать/писать (Unix)
        import stat
        if os.name != 'nt':  # Не Windows
            os.chmod(CONFIG['TOKEN_FILE'], stat.S_IRUSR | stat.S_IWUSR)
    
    return creds


def fetch_from_github(file_name):
    """Загрузить файл из GitHub"""
    url = f"{CONFIG['GITHUB_REPO']}/raw/{CONFIG['GITHUB_BRANCH']}/{file_name}"
    
    response = requests.get(url)
    response.raise_for_status()
    
    return response.text


def update_script_file(service, file_name, content):
    """Обновить файл в Apps Script проекте"""
    script_name = file_name.replace('.gs', '')
    
    try:
        # Получаем содержимое проекта
        project = service.projects().getContent(scriptId=CONFIG['SCRIPT_ID']).execute()
        
        files = project.get('files', [])
        file_found = False
        
        # Ищем файл в проекте
        for file in files:
            if file.get('name') == script_name and file.get('type') == 'SERVER_JS':
                file_found = True
                file['source'] = content
                break
        
        if not file_found:
            # Создаем новый файл
            files.append({
                'name': script_name,
                'type': 'SERVER_JS',
                'source': content
            })
        
        # Обновляем проект
        service.projects().updateContent(
            scriptId=CONFIG['SCRIPT_ID'],
            body={'files': files}
        ).execute()
        
        print(f"✅ Updated: {file_name}")
        return True
        
    except HttpError as error:
        print(f"❌ Failed to update {file_name}: {error}")
        raise


def update_all_scripts():
    """Главная функция обновления"""
    try:
        print("🚀 Starting script update from GitHub...\n")
        
        # Проверка конфигурации
        if not all([CONFIG['CLIENT_ID'], CONFIG['CLIENT_SECRET'], CONFIG['SCRIPT_ID']]):
            raise ValueError("Missing configuration. Please check .env file")
        
        # Проверка безопасности - убеждаемся что не используем placeholder значения
        if ('your_client_id' in CONFIG['CLIENT_ID'] or 
            'your_client_secret' in CONFIG['CLIENT_SECRET'] or
            'your_script_id' in CONFIG['SCRIPT_ID']):
            raise ValueError("⚠️  SECURITY WARNING: Using placeholder values! Please set real credentials in .env file")
        
        # Проверка что credentials.json существует
        if not os.path.exists(CONFIG['CREDENTIALS_FILE']):
            raise FileNotFoundError(
                f"Credentials file not found: {CONFIG['CREDENTIALS_FILE']}\n"
                "Please download OAuth credentials from Google Cloud Console"
            )
        
        # Авторизация
        print("🔐 Authorizing...")
        creds = get_credentials()
        service = build('script', 'v1', credentials=creds)
        print("✅ Authorized\n")
        
        # Обновление файлов
        updated = 0
        failed = 0
        
        for file_name in FILES_TO_UPDATE:
            try:
                print(f"📥 Fetching {file_name}...")
                content = fetch_from_github(file_name)
                
                print(f"📝 Updating {file_name}...")
                update_script_file(service, file_name, content)
                
                updated += 1
            except Exception as error:
                print(f"❌ Error updating {file_name}: {error}")
                failed += 1
        
        print(f"\n✨ Update complete!")
        print(f"✅ Updated: {updated}")
        print(f"❌ Failed: {failed}")
        print(f"\n🔒 Security reminder: Never commit .env, credentials.json, or token.pickle to Git!")
        
    except Exception as error:
        print(f"💥 Fatal error: {error}")
        raise


if __name__ == '__main__':
    update_all_scripts()

