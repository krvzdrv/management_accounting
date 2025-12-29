/**
 * Расчеты НДС
 */

/**
 * Расчет НДС от суммы без НДС
 */
function calculateVAT(amountExclVAT, vatRate) {
  const vatAmount = round2(amountExclVAT * vatRate / 100);
  const amountInclVAT = round2(amountExclVAT + vatAmount);
  
  return {
    amountExclVAT: round2(amountExclVAT),
    vatAmount: vatAmount,
    amountInclVAT: amountInclVAT
  };
}

/**
 * Расчет суммы без НДС из суммы с НДС
 */
function calculateFromIncludingVAT(amountInclVAT, vatRate) {
  const divisor = 1 + (vatRate / 100);
  const amountExclVAT = round2(amountInclVAT / divisor);
  const vatAmount = round2(amountInclVAT - amountExclVAT);
  
  return {
    amountExclVAT: amountExclVAT,
    vatAmount: vatAmount,
    amountInclVAT: round2(amountInclVAT)
  };
}

/**
 * Получить ставку НДС по ID
 */
function getVATRate(vatId) {
  const row = getRowById(CONFIG.SHEET_NAMES.VAT_RATES, vatId);
  
  if (!row) {
    throw new Error(`VAT rate with ID ${vatId} not found`);
  }
  
  return parseFloat(row.rowData[1]); // vat_rate column
}

/**
 * Получить активную ставку НДС для страны
 */
function getActiveVATRateForCountry(countryCode, date = new Date()) {
  const sheet = getSheet(CONFIG.SHEET_NAMES.VAT_RATES);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const vatRate = row[1];
    const country = row[3];
    const validFrom = new Date(row[4]);
    const validTo = row[5] ? new Date(row[5]) : null;
    const isActive = row[6];
    
    if (country === countryCode && isActive) {
      if (date >= validFrom && (validTo === null || date <= validTo)) {
        return parseFloat(vatRate);
      }
    }
  }
  
  return CONFIG.DEFAULT_VAT_RATE;
}

