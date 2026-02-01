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
 * Formats odds based on locale
 * Czech (cz) users see decimal odds: 1.91, 2.50
 * English (en) users see American odds: -110, +150
 */
export function formatOdds(americanOdds: string | number, locale: 'en' | 'cz'): string {
  // Parse the American odds
  const oddsStr = String(americanOdds).trim();
  const numericValue = parseInt(oddsStr.replace('+', ''), 10);
  
  if (isNaN(numericValue)) {
    return oddsStr; // Return as-is if can't parse
  }
  
  if (locale === 'cz') {
    // Convert to decimal for Czech users
    const decimal = americanToDecimal(numericValue);
    // Format with comma as decimal separator (Czech format)
    return decimal.toFixed(2).replace('.', ',');
  } else {
    // Return American format for English users
    return numericValue > 0 ? `+${numericValue}` : String(numericValue);
  }
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
