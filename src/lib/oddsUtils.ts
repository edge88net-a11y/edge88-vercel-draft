// Odds formatting utilities for locale-aware odds display

export type OddsFormat = 'american' | 'decimal' | 'fractional';

/**
 * Converts American odds to decimal odds
 * Negative American (e.g. -110): decimal = 1 + (100 / abs(american)) → -110 = 1.91
 * Positive American (e.g. +150): decimal = 1 + (american / 100) → +150 = 2.50
 */
export function americanToDecimal(americanOdds: number): number {
  if (americanOdds > 0) {
    return 1 + (americanOdds / 100);
  } else {
    return 1 + (100 / Math.abs(americanOdds));
  }
}

/**
 * Parse odds string to number (handles +150, -110, 1.85 formats)
 */
export function parseOddsToNumber(odds: string | number): number {
  if (typeof odds === 'number') return odds;
  
  const cleanedOdds = String(odds).trim().replace(/,/g, '.');
  
  // Check if already decimal format (has dot and value between 1.01 and 100)
  if (cleanedOdds.includes('.')) {
    const decimalValue = parseFloat(cleanedOdds);
    if (!isNaN(decimalValue) && decimalValue >= 1.01 && decimalValue <= 100) {
      return decimalValue;
    }
  }
  
  // Parse as American odds
  const numericValue = parseInt(cleanedOdds.replace('+', ''), 10);
  return isNaN(numericValue) ? 0 : numericValue;
}

/**
 * Check if odds are in decimal format
 */
export function isDecimalOdds(odds: string | number): boolean {
  const strOdds = String(odds).trim();
  if (strOdds.includes('.') || strOdds.includes(',')) {
    const value = parseFloat(strOdds.replace(',', '.'));
    return !isNaN(value) && value >= 1.01 && value <= 100;
  }
  return false;
}

/**
 * Convert any odds format to decimal
 */
export function toDecimalOdds(odds: string | number): number {
  const strOdds = String(odds).trim();
  
  // Already decimal
  if (isDecimalOdds(strOdds)) {
    return parseFloat(strOdds.replace(',', '.'));
  }
  
  // Parse American odds
  const numericValue = parseInt(strOdds.replace('+', ''), 10);
  if (isNaN(numericValue) || numericValue === 0) {
    return 1.85; // Default fallback
  }
  
  return americanToDecimal(numericValue);
}

/**
 * Formats odds based on locale
 * Czech (cz) users see decimal odds: 1,91
 * English (en) users see decimal odds: 1.91
 * 
 * NOTE: We now show decimal odds for BOTH locales since they're more universally understood
 * The only difference is comma vs dot as decimal separator
 */
export function formatOdds(odds: string | number, locale: 'en' | 'cz'): string {
  const decimalOdds = toDecimalOdds(odds);
  
  if (locale === 'cz') {
    // Czech format: comma as decimal separator
    return decimalOdds.toFixed(2).replace('.', ',');
  } else {
    // English format: dot as decimal separator
    return decimalOdds.toFixed(2);
  }
}

/**
 * Formats odds for display with label
 * Returns "Kurz: 1,91" for CZ or "Odds: 1.91" for EN
 */
export function formatOddsWithLabel(odds: string | number, locale: 'en' | 'cz'): string {
  const formattedOdds = formatOdds(odds, locale);
  const label = locale === 'cz' ? 'Kurz' : 'Odds';
  return `${label}: ${formattedOdds}`;
}

/**
 * Calculate potential profit from decimal odds and stake
 */
export function calculateProfit(odds: string | number, stake: number): number {
  const decimalOdds = toDecimalOdds(odds);
  return stake * (decimalOdds - 1);
}

/**
 * Calculate total payout from decimal odds and stake
 */
export function calculatePayout(odds: string | number, stake: number): number {
  const decimalOdds = toDecimalOdds(odds);
  return stake * decimalOdds;
}

/**
 * Formats a number with Czech locale conventions
 * - Comma for decimal separator
 * - Space for thousands separator
 */
export function formatNumberCz(value: number, decimals: number = 0): string {
  const formatted = value.toFixed(decimals);
  const [intPart, decPart] = formatted.split('.');
  
  // Add space as thousands separator
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  
  if (decPart) {
    return `${withThousands},${decPart}`;
  }
  return withThousands;
}

/**
 * Formats percentage with locale-aware decimal separator
 */
export function formatPercentage(value: number, locale: 'en' | 'cz'): string {
  const formatted = value.toFixed(1);
  if (locale === 'cz') {
    return formatted.replace('.', ',') + '%';
  }
  return formatted + '%';
}

/**
 * Formats date in Czech format: "1. února 2026"
 */
export function formatDateCz(date: Date): string {
  const months = [
    'ledna', 'února', 'března', 'dubna', 'května', 'června',
    'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day}. ${month} ${year}`;
}

/**
 * Formats date based on locale
 */
export function formatDate(date: Date | string, locale: 'en' | 'cz'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (locale === 'cz') {
    return formatDateCz(d);
  }
  
  // English format: "Feb 1, 2026"
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format currency based on locale
 * CZ: "10 000 Kč" with space as thousands separator
 * EN: "$10,000" with comma as thousands separator
 */
export function formatCurrency(amount: number, locale: 'en' | 'cz', options?: { showSign?: boolean }): string {
  const absAmount = Math.abs(amount);
  const sign = options?.showSign && amount > 0 ? '+' : (amount < 0 ? '-' : '');
  
  if (locale === 'cz') {
    // Czech format: space as thousands separator, Kč suffix
    const formatted = formatNumberCz(absAmount, 0);
    return `${sign}${formatted} Kč`;
  } else {
    // English format: comma as thousands separator, $ prefix
    const formatted = absAmount.toLocaleString('en-US');
    return `${sign}$${formatted}`;
  }
}

/**
 * Format potential profit from a bet
 */
export function formatPotentialProfit(odds: string | number, stake: number, locale: 'en' | 'cz'): string {
  const profit = calculateProfit(odds, stake);
  return formatCurrency(profit, locale, { showSign: true });
}
