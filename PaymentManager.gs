/**
 * Управление платежами
 */

/**
 * Регистрация платежа
 */
function registerPayment(paymentData) {
  try {
    const paymentsSheet = getSheet(CONFIG.SHEET_NAMES.PAYMENTS);
    const cashSheet = getSheet(CONFIG.SHEET_NAMES.CASH_TRANSACTIONS);
    
    // Генерация ID и номера
    const paymentId = getNextId(CONFIG.SHEET_NAMES.PAYMENTS);
    const paymentNumber = generateDocumentNumber('PAY', getCompanyCode(paymentData.company_id));
    
    // Получение курса валюты
    const exchangeRate = getExchangeRate(
      paymentData.currency_code,
      CONFIG.BASE_CURRENCY,
      paymentData.payment_date
    );
    
    // Проверка остатка документа
    const outstanding = getDocumentOutstanding(
      paymentData.document_type,
      paymentData.document_id
    );
    
    if (paymentData.payment_amount > outstanding) {
      throw new Error(`Payment amount (${paymentData.payment_amount}) exceeds outstanding amount (${outstanding})`);
    }
    
    // Создание транзакции движения денежных средств
    const transactionId = getNextId(CONFIG.SHEET_NAMES.CASH_TRANSACTIONS);
    const transactionType = paymentData.document_type === 'purchase' ? 'outflow' : 'inflow';
    
    cashSheet.appendRow([
      transactionId,
      generateDocumentNumber('CT', getCompanyCode(paymentData.company_id)),
      paymentData.company_id,
      paymentData.payment_date,
      transactionType,
      paymentData.payment_method || 'bank_transfer',
      paymentData.account_from || '',
      paymentData.account_to || '',
      paymentData.counterparty_id,
      paymentData.document_type,
      paymentData.document_id,
      paymentData.currency_code,
      paymentData.payment_amount,
      exchangeRate,
      round2(paymentData.payment_amount * exchangeRate),
      `Payment for ${paymentData.document_type} document`,
      new Date()
    ]);
    
    // Создание записи платежа
    paymentsSheet.appendRow([
      paymentId,
      paymentNumber,
      paymentData.payment_date,
      paymentData.company_id,
      paymentData.counterparty_id,
      paymentData.document_type,
      paymentData.document_id,
      paymentData.currency_code,
      paymentData.payment_amount,
      exchangeRate,
      transactionId,
      paymentData.notes || '',
      new Date()
    ]);
    
    // Обновление статуса документа
    updateDocumentPaymentStatus(
      paymentData.document_type,
      paymentData.document_id
    );
    
    logInfo(`Payment registered: ${paymentNumber} (ID: ${paymentId})`);
    
    return {
      success: true,
      payment_id: paymentId,
      payment_number: paymentNumber,
      transaction_id: transactionId
    };
    
  } catch (error) {
    logError('Failed to register payment', error);
    throw error;
  }
}

/**
 * Получить остаток по документу
 */
function getDocumentOutstanding(documentType, documentId) {
  let documentSheet, totalColumn;
  
  switch(documentType) {
    case 'purchase':
      documentSheet = CONFIG.SHEET_NAMES.PURCHASE_ORDERS;
      totalColumn = 11; // total_amount_incl_vat
      break;
    case 'sale':
      documentSheet = CONFIG.SHEET_NAMES.SALES_ORDERS;
      totalColumn = 11;
      break;
    case 'expense':
      documentSheet = CONFIG.SHEET_NAMES.EXPENSES;
      totalColumn = 10; // amount_incl_vat
      break;
    default:
      throw new Error(`Unknown document type: ${documentType}`);
  }
  
  const docRow = getRowById(documentSheet, documentId);
  if (!docRow) {
    throw new Error(`Document not found: ${documentType} ID ${documentId}`);
  }
  
  const totalAmount = parseFloat(docRow.rowData[totalColumn - 1]);
  
  // Получить сумму платежей
  const paymentsSheet = getSheet(CONFIG.SHEET_NAMES.PAYMENTS);
  const paymentsData = paymentsSheet.getDataRange().getValues();
  
  let paidAmount = 0;
  for (let i = 1; i < paymentsData.length; i++) {
    if (paymentsData[i][5] === documentType && 
        paymentsData[i][6] == documentId) {
      paidAmount += parseFloat(paymentsData[i][8]);
    }
  }
  
  return round2(totalAmount - paidAmount);
}

/**
 * Обновить статус оплаты документа
 */
function updateDocumentPaymentStatus(documentType, documentId) {
  const outstanding = getDocumentOutstanding(documentType, documentId);
  
  let sheetName, statusColumn;
  
  switch(documentType) {
    case 'purchase':
      sheetName = CONFIG.SHEET_NAMES.PURCHASE_ORDERS;
      statusColumn = 9;
      break;
    case 'sale':
      sheetName = CONFIG.SHEET_NAMES.SALES_ORDERS;
      statusColumn = 9;
      break;
    case 'expense':
      sheetName = CONFIG.SHEET_NAMES.EXPENSES;
      statusColumn = 11; // payment_status
      break;
  }
  
  const sheet = getSheet(sheetName);
  const row = getRowById(sheetName, documentId);
  
  let newStatus;
  if (outstanding <= 0.01) { // учет погрешности округления
    newStatus = 'paid';
  } else {
    newStatus = documentType === 'expense' ? 'unpaid' : 'partially_paid';
  }
  
  sheet.getRange(row.rowIndex, statusColumn).setValue(newStatus);
  
  if (documentType !== 'expense') {
    // Обновить modified_at
    sheet.getRange(row.rowIndex, 16).setValue(new Date());
  }
}

/**
 * Получить код компании
 */
function getCompanyCode(companyId) {
  const row = getRowById(CONFIG.SHEET_NAMES.COMPANIES, companyId);
  if (!row) {
    throw new Error(`Company with ID ${companyId} not found`);
  }
  return row.rowData[1]; // company_code column
}

/**
 * Получить условия оплаты контрагента
 */
function getCounterpartyPaymentTerms(counterpartyId) {
  const row = getRowById(CONFIG.SHEET_NAMES.COUNTERPARTIES, counterpartyId);
  if (!row) {
    throw new Error(`Counterparty with ID ${counterpartyId} not found`);
  }
  return parseInt(row.rowData[7]) || 30; // payment_terms column, default 30 days
}

