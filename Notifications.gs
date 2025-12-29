/**
 * Уведомления
 */

/**
 * Проверка и отправка уведомлений о задолженности
 */
function checkAndNotifyOverdueDebts() {
  try {
    logInfo('Starting overdue debts check');
    
    const balancesSheet = getSheet(CONFIG.SHEET_NAMES.ACCOUNT_BALANCES);
    const balances = balancesSheet.getDataRange().getValues();
    
    const notifications = [];
    
    for (let i = 1; i < balances.length; i++) {
      const row = balances[i];
      const companyId = row[1];
      const counterpartyId = row[2];
      const balanceType = row[3];
      const overdueAmount = parseFloat(row[8]);
      const oldestUnpaidDate = row[10] ? new Date(row[10]) : null;
      
      if (overdueAmount > 0 && oldestUnpaidDate) {
        const today = new Date();
        const daysPastDue = Math.floor((today - oldestUnpaidDate) / (1000 * 60 * 60 * 24));
        
        // Проверка по дням уведомлений
        if (CONFIG.OVERDUE_NOTIFICATION_DAYS.includes(daysPastDue)) {
          const companyName = getCompanyName(companyId);
          const counterpartyName = getCounterpartyName(counterpartyId);
          
          notifications.push({
            company: companyName,
            counterparty: counterpartyName,
            balanceType: balanceType,
            overdueAmount: overdueAmount,
            daysPastDue: daysPastDue
          });
        }
      }
    }
    
    if (notifications.length > 0) {
      sendOverdueNotificationEmail(notifications);
    }
    
    logInfo(`Overdue debts check completed. Notifications sent: ${notifications.length}`);
    
    return {
      success: true,
      notificationsSent: notifications.length
    };
    
  } catch (error) {
    logError('Failed to check overdue debts', error);
    throw error;
  }
}

/**
 * Отправка email о просроченной задолженности
 */
function sendOverdueNotificationEmail(notifications) {
  const emailAddress = Session.getActiveUser().getEmail();
  const subject = `⚠️ Уведомление о просроченной задолженности - ${new Date().toLocaleDateString()}`;
  
  let body = '<h2>Просроченные задолженности</h2>';
  body += '<table border="1" cellpadding="5" cellspacing="0">';
  body += '<tr><th>Компания</th><th>Контрагент</th><th>Тип</th><th>Сумма</th><th>Дней просрочки</th></tr>';
  
  notifications.forEach(n => {
    const typeRus = n.balanceType === 'payable' ? 'Кредиторская' : 'Дебиторская';
    body += `<tr>`;
    body += `<td>${n.company}</td>`;
    body += `<td>${n.counterparty}</td>`;
    body += `<td>${typeRus}</td>`;
    body += `<td>${n.overdueAmount.toFixed(2)} EUR</td>`;
    body += `<td>${n.daysPastDue}</td>`;
    body += `</tr>`;
  });
  
  body += '</table>';
  body += '<p><i>Это автоматическое уведомление из системы управленческого учета.</i></p>';
  
  MailApp.sendEmail({
    to: emailAddress,
    subject: subject,
    htmlBody: body
  });
  
  logInfo(`Overdue notification email sent to ${emailAddress}`);
}

/**
 * Получить название компании
 */
function getCompanyName(companyId) {
  const row = getRowById(CONFIG.SHEET_NAMES.COMPANIES, companyId);
  return row ? row.rowData[2] : 'Unknown';
}

/**
 * Получить название контрагента
 */
function getCounterpartyName(counterpartyId) {
  const row = getRowById(CONFIG.SHEET_NAMES.COUNTERPARTIES, counterpartyId);
  return row ? row.rowData[2] : 'Unknown';
}

/**
 * Уведомление о превышении кредитного лимита
 */
function checkCreditLimits() {
  const balancesSheet = getSheet(CONFIG.SHEET_NAMES.ACCOUNT_BALANCES);
  const balances = balancesSheet.getDataRange().getValues();
  
  const warnings = [];
  
  for (let i = 1; i < balances.length; i++) {
    const row = balances[i];
    const counterpartyId = row[2];
    const balanceType = row[3];
    const outstandingAmount = parseFloat(row[7]);
    
    if (balanceType === 'receivable') {
      const counterpartyRow = getRowById(CONFIG.SHEET_NAMES.COUNTERPARTIES, counterpartyId);
      if (counterpartyRow) {
        const creditLimit = parseFloat(counterpartyRow.rowData[8]) || 0;
        
        if (creditLimit > 0 && outstandingAmount >= creditLimit * CONFIG.CREDIT_LIMIT_WARNING_THRESHOLD) {
          warnings.push({
            counterparty: counterpartyRow.rowData[2],
            outstanding: outstandingAmount,
            creditLimit: creditLimit,
            percentage: round2((outstandingAmount / creditLimit) * 100)
          });
        }
      }
    }
  }
  
  if (warnings.length > 0) {
    sendCreditLimitWarningEmail(warnings);
  }
  
  return warnings;
}

/**
 * Отправка предупреждения о кредитном лимите
 */
function sendCreditLimitWarningEmail(warnings) {
  const emailAddress = Session.getActiveUser().getEmail();
  const subject = `⚠️ Предупреждение о кредитных лимитах - ${new Date().toLocaleDateString()}`;
  
  let body = '<h2>Предупреждения о кредитных лимитах</h2>';
  body += '<table border="1" cellpadding="5" cellspacing="0">';
  body += '<tr><th>Контрагент</th><th>Задолженность</th><th>Кредитный лимит</th><th>% лимита</th></tr>';
  
  warnings.forEach(w => {
    body += `<tr>`;
    body += `<td>${w.counterparty}</td>`;
    body += `<td>${w.outstanding.toFixed(2)} EUR</td>`;
    body += `<td>${w.creditLimit.toFixed(2)} EUR</td>`;
    body += `<td>${w.percentage}%</td>`;
    body += `</tr>`;
  });
  
  body += '</table>';
  
  MailApp.sendEmail({
    to: emailAddress,
    subject: subject,
    htmlBody: body
  });
}

