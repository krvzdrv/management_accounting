#!/bin/bash
# Pre-commit hook для проверки безопасности
# Установите: cp .pre-commit-hook.sh .git/hooks/pre-commit

echo "🔒 Running security check before commit..."

# Запускаем проверку безопасности
node security-check.js

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Security check failed! Commit aborted."
    echo "Please fix security issues before committing."
    exit 1
fi

echo "✅ Security check passed!"
exit 0

