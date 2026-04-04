/**
 * formatCurrency.js
 *
 * Utility functions for formatting numbers and dates consistently
 * across all screens in the app.
 */

/**
 * formatCurrency
 *
 * Converts a raw number into a properly formatted Australian Dollar string.
 * Uses the built-in Intl.NumberFormat API so it handles things like:
 *   - Correct $ symbol placement
 *   - Comma separators for thousands (e.g. $1,200.00)
 *   - Always 2 decimal places (e.g. $7.90 not $7.9)
 *
 * Examples:
 *   formatCurrency(7.9)     → "$7.90"
 *   formatCurrency(1200)    → "$1,200.00"
 *   formatCurrency(0)       → "$0.00"
 */
export function formatCurrency(amount, currency = 'AUD') {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency }).format(amount);
}

/**
 * formatDate
 *
 * Converts an ISO date string (e.g. "2026-04-04T09:15:00.000Z") into a
 * human-readable Australian date format.
 *
 * Examples:
 *   formatDate("2026-04-04T09:15:00.000Z") → "4 Apr 2026"
 */
export function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
