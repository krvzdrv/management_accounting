/**
 * Конфигурационные параметры системы управленческого учета
 */

const CONFIG = {
  BASE_CURRENCY: 'EUR',
  DEFAULT_VAT_RATE: 23,
  CREDIT_LIMIT_WARNING_THRESHOLD: 0.8, // 80% от лимита
  OVERDUE_NOTIFICATION_DAYS: [7, 14, 30], // дни для уведомлений
  
  SHEET_NAMES: {
    CURRENCIES: 'Currencies',
    EXCHANGE_RATES: 'Exchange_Rates',
    VAT_RATES: 'VAT_Rates',
    COMPANIES: 'Companies',
    COUNTERPARTIES: 'Counterparties',
    PRODUCTS: 'Products',
    EXPENSE_CATEGORIES: 'Expense_Categories',
    PURCHASE_ORDERS: 'Purchase_Orders',
    PURCHASE_ORDER_LINES: 'Purchase_Order_Lines',
    SALES_ORDERS: 'Sales_Orders',
    SALES_ORDER_LINES: 'Sales_Order_LINES',
    EXPENSES: 'Expenses',
    CASH_TRANSACTIONS: 'Cash_Transactions',
    PAYMENTS: 'Payments',
    INTERCOMPANY_LOANS: 'Intercompany_Loans',
    INTERCOMPANY_LOAN_PAYMENTS: 'Intercompany_Loan_Payments',
    ACCOUNT_BALANCES: 'Account_Balances'
  },
  
  EXCHANGE_RATE_API: 'https://api.exchangerate.host/latest?base=EUR'
};

/**
 * Получить spreadsheet
 */
function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Получить лист по имени
 */
function getSheet(sheetName) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }
  
  return sheet;
}

