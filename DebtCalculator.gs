/**
 * Расчет задолженностей
 */

/**
 * Обновить балансы по всем контрагентам
 */
function updateAllAccountBalances() {
  try {
    logInfo('Starting account balances update');
    
    const counterpartiesSheet = getSheet(CONFIG.SHEET_NAMES.COUNTERPARTIES);
    const counterparties = counterpartiesSheet.getDataRange().getValues();
    
    const companiesSheet = getSheet(CONFIG.SHEET_NAMES.COMPANIES);
    const companies = companiesSheet.getDataRange().getValues();
    
    const balancesSheet = getSheet(CONFIG.SHEET_NAMES.ACCOUNT_BALANCES);
    
    // Очистить существующие балансы (кроме заголовка)
    if (balancesSheet.getLastRow() > 1) {
      balancesSheet.deleteRows(2, balancesSheet.getLastRow() - 1);
    }
    
    let balanceId = 1;
    
    // Для каждой компании и контрагента
    for (let i = 1; i < companies.length; i++) {
      const companyId = companies[i][0];
      
      for (let j = 1; j < counterparties.length; j++) {
        const counterpartyId = counterparties[j][0];
        const counterpartyType = counterparties[j][3];
        
        // Расчет кредиторской задолженности (мы должны поставщику)
        if (counterpartyType === 'supplier' || counterpartyType === 'both') {
          const payableBalance = calculatePayableBalance(companyId, counterpartyId);
          
          if (payableBalance.outstanding_amount > 0) {
            balancesSheet.appendRow([
              balanceId++,
              companyId,
              counterpartyId,
              'payable',
              payableBalance.currency_code,
              payableBalance.total_amount,
              payableBalance.paid_amount,
              payableBalance.outstanding_amount,
              payableBalance.overdue_amount,
              payableBalance.last_payment_date,
              payableBalance.oldest_unpaid_date,
              new Date()
            ]);
          }
        }
        
        // Расчет дебиторской задолженности (нам должен клиент)
        if (counterpartyType === 'customer' || counterpartyType === 'both') {
          const receivableBalance = calculateReceivableBalance(companyId, counterpartyId);
          
          if (receivableBalance.outstanding_amount > 0) {
            balancesSheet.appendRow([
              balanceId++,
              companyId,
              counterpartyId,
              'receivable',
              receivableBalance.currency_code,
              receivableBalance.total_amount,
              receivableBalance.received_amount,
              receivableBalance.outstanding_amount,
              receivableBalance.overdue_amount,
              receivableBalance.last_payment_date,
              receivableBalance.oldest_unpaid_date,
              new Date()
            ]);
          }
        }
      }
    }
    
    logInfo(`Account balances updated. Total records: ${balanceId - 1}`);
    
    return {
      success: true,
      recordsCreated: balanceId - 1
    };
    
  } catch (error) {
    logError('Failed to update account balances', error);
    throw error;
  }
}

/**
 * Расчет кредиторской задолженности
 */
function calculatePayableBalance(companyId, supplierId) {
  const poSheet = getSheet(CONFIG.SHEET_NAMES.PURCHASE_ORDERS);
  const poData = poSheet.getDataRange().getValues();
  
  const paymentsSheet = getSheet(CONFIG.SHEET_NAMES.PAYMENTS);
  const paymentsData = paymentsSheet.getDataRange().getValues();
  
  let totalAmount = 0;
  let paidAmount = 0;
  let overdueAmount = 0;
  let lastPaymentDate = null;
  let oldestUnpaidDate = null;
  let currencyCode = null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Получить все заказы
  for (let i = 1; i < poData.length; i++) {
    const row = poData[i];
    const poId = row[0];
    const poCompanyId = row[2];
    const poSupplierId = row[3];
    const poStatus = row[8];
    const currency = row[5];
    const total = parseFloat(row[11]);
    const dueDate = new Date(row[7]);
    
    if (poCompanyId == companyId && 
        poSupplierId == supplierId && 
        poStatus !== 'cancelled') {
      
      if (!currencyCode) currencyCode = currency;
      
      // Конвертировать в базовую валюту если нужно
      const exchangeRate = parseFloat(row[6]);
      const totalInBase = round2(total * exchangeRate);
      
      totalAmount += totalInBase;
      
      // Получить платежи по этому заказу
      let poPaidAmount = 0;
      for (let j = 1; j < paymentsData.length; j++) {
        const payment = paymentsData[j];
        if (payment[5] === 'purchase' && payment[6] == poId) {
          const paymentAmount = parseFloat(payment[8]);
          const paymentExRate = parseFloat(payment[9]);
          poPaidAmount += round2(paymentAmount * paymentExRate);
          
          const paymentDate = new Date(payment[2]);
          if (!lastPaymentDate || paymentDate > lastPaymentDate) {
            lastPaymentDate = paymentDate;
          }
        }
      }
      
      paidAmount += poPaidAmount;
      
      const poOutstanding = totalInBase - poPaidAmount;
      
      // Проверка просрочки
      if (poOutstanding > 0.01) {
        const poDate = new Date(row[4]);
        if (!oldestUnpaidDate || poDate < oldestUnpaidDate) {
          oldestUnpaidDate = poDate;
        }
        
        if (dueDate < today) {
          overdueAmount += poOutstanding;
        }
      }
    }
  }
  
  return {
    currency_code: currencyCode || CONFIG.BASE_CURRENCY,
    total_amount: round2(totalAmount),
    paid_amount: round2(paidAmount),
    outstanding_amount: round2(totalAmount - paidAmount),
    overdue_amount: round2(overdueAmount),
    last_payment_date: lastPaymentDate,
    oldest_unpaid_date: oldestUnpaidDate
  };
}

/**
 * Расчет дебиторской задолженности
 */
function calculateReceivableBalance(companyId, customerId) {
  const soSheet = getSheet(CONFIG.SHEET_NAMES.SALES_ORDERS);
  const soData = soSheet.getDataRange().getValues();
  
  const paymentsSheet = getSheet(CONFIG.SHEET_NAMES.PAYMENTS);
  const paymentsData = paymentsSheet.getDataRange().getValues();
  
  let totalAmount = 0;
  let receivedAmount = 0;
  let overdueAmount = 0;
  let lastPaymentDate = null;
  let oldestUnpaidDate = null;
  let currencyCode = null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Аналогично calculatePayableBalance, но для продаж
  for (let i = 1; i < soData.length; i++) {
    const row = soData[i];
    const soId = row[0];
    const soCompanyId = row[2];
    const soCustomerId = row[3];
    const soStatus = row[8];
    const currency = row[5];
    const total = parseFloat(row[11]);
    const dueDate = new Date(row[7]);
    
    if (soCompanyId == companyId && 
        soCustomerId == customerId && 
        soStatus !== 'cancelled') {
      
      if (!currencyCode) currencyCode = currency;
      
      const exchangeRate = parseFloat(row[6]);
      const totalInBase = round2(total * exchangeRate);
      
      totalAmount += totalInBase;
      
      let soPaidAmount = 0;
      for (let j = 1; j < paymentsData.length; j++) {
        const payment = paymentsData[j];
        if (payment[5] === 'sale' && payment[6] == soId) {
          const paymentAmount = parseFloat(payment[8]);
          const paymentExRate = parseFloat(payment[9]);
          soPaidAmount += round2(paymentAmount * paymentExRate);
          
          const paymentDate = new Date(payment[2]);
          if (!lastPaymentDate || paymentDate > lastPaymentDate) {
            lastPaymentDate = paymentDate;
          }
        }
      }
      
      receivedAmount += soPaidAmount;
      
      const soOutstanding = totalInBase - soPaidAmount;
      
      if (soOutstanding > 0.01) {
        const soDate = new Date(row[4]);
        if (!oldestUnpaidDate || soDate < oldestUnpaidDate) {
          oldestUnpaidDate = soDate;
        }
        
        if (dueDate < today) {
          overdueAmount += soOutstanding;
        }
      }
    }
  }
  
  return {
    currency_code: currencyCode || CONFIG.BASE_CURRENCY,
    total_amount: round2(totalAmount),
    received_amount: round2(receivedAmount),
    outstanding_amount: round2(totalAmount - receivedAmount),
    overdue_amount: round2(overdueAmount),
    last_payment_date: lastPaymentDate,
    oldest_unpaid_date: oldestUnpaidDate
  };
}

