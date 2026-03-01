/**
 * ByeByeBalance — Formatters
 * 
 * Safe formatting functions that handle edge cases
 * (infinity, NaN, extremely large values).
 */

/**
 * Format a number as currency. Returns '$—' for invalid/extreme values.
 */
export function formatMoney(value) {
  if (!isFinite(value) || Math.abs(value) > 999_999_999) return '$—';
  return '$' + Math.round(value).toLocaleString();
}

/**
 * Format months into a human-readable duration.
 * Returns '50+ years' for extreme values.
 */
export function formatMonths(months) {
  if (!isFinite(months) || months >= 600) return '50+ years';
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''}`;
  const y = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${y}y ${rem}m` : `${y} year${y !== 1 ? 's' : ''}`;
}

/**
 * Format a date for display. Returns '50+ years' if too far in the future.
 */
export function formatDate(date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return 'Unknown';
  const monthsAway = Math.round((date - new Date()) / (30 * 24 * 60 * 60 * 1000));
  if (monthsAway >= 600) return '50+ years';
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/**
 * Format money with cents for small differences (< $100).
 * Shows 'less than $1' for sub-dollar amounts.
 */
export function formatMoneyPrecise(value) {
  if (!isFinite(value) || Math.abs(value) > 999_999_999) return '$—';
  if (Math.abs(value) < 1) return 'less than $1';
  if (Math.abs(value) < 100) return '$' + value.toFixed(2);
  return '$' + Math.round(value).toLocaleString();
}

/**
 * Generate CSV content from calculation results.
 */
export function generateCSV(results, debts, strategy, extraPayment) {
  let csv = 'Debt Payoff Plan\n';
  csv += `Generated,${new Date().toLocaleDateString()}\n`;
  csv += `Strategy,${strategy === 'snowball' ? 'Snowball (Lowest balance first)' : 'Avalanche (Highest rate first)'}\n`;
  csv += `Extra Monthly Payment,${extraPayment}\n`;
  csv += `Debt-Free Date,${results.debtFreeDate.toLocaleDateString()}\n`;
  csv += `Total Months,${results.totalMonths}\n`;
  csv += `Total Interest Paid,${Math.round(results.totalInterest)}\n`;
  csv += `Interest Saved,${Math.round(results.interestSaved || 0)}\n\n`;
  csv += 'PAYOFF ORDER\nOrder,Debt Name,Original Balance,Interest Rate,Interest Paid\n';
  results.schedule.forEach(debt => {
    csv += `${debt.order},"${debt.name || 'Unnamed Debt'}",${debt.originalBalance},${debt.rate}%,${debt.interestPaid}\n`;
  });
  csv += '\nCURRENT DEBT DETAILS\nName,Balance,Rate,Min Payment\n';
  debts.forEach(debt => {
    csv += `"${debt.name || ''}",${debt.balance || 0},${debt.rate || 0},${debt.minPayment || 0}\n`;
  });
  return csv;
}
