import { displayBalance, roundCents } from './finance/money';

const whole = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const cents = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function money(x) {
  if (!Number.isFinite(x)) return '—';
  return whole.format(Math.round(x));
}

export function moneyCents(x) {
  if (!Number.isFinite(x)) return '—';
  return cents.format(roundCents(x));
}

/** Remaining balance: never shows $0.00 for a debt that isn't paid off. */
export function balanceCents(x) {
  return cents.format(displayBalance(x));
}

export function percent(x, digits = 1) {
  if (!Number.isFinite(x)) return '—';
  return `${(x * 100).toFixed(digits)}%`;
}

export function monthYear(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function shortMonthYear(date) {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function duration(months) {
  if (!Number.isFinite(months)) return '—';
  const y = Math.floor(months / 12);
  const m = months % 12;
  const ys = y ? `${y} year${y === 1 ? '' : 's'}` : '';
  const ms = m ? `${m} month${m === 1 ? '' : 's'}` : '';
  return [ys, ms].filter(Boolean).join(' ') || '0 months';
}

/** Parse a numeric text input; returns NaN for empty/invalid so validation can catch it. */
export function toNumber(v) {
  if (typeof v === 'number') return v;
  if (v == null) return NaN;
  const s = String(v).replace(/[$,%\s]/g, '');
  if (s === '') return NaN;
  return Number(s);
}

/** "Aug 2029" */
export function monthShort(date) {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/** Chart tick label as in the concept: "Oct 26" (month + 2-digit year). */
export function tickLabel(date) {
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

/** "2 yr 10 mo" (concept style). */
export function yrMo(m) {
  if (!Number.isFinite(m)) return '—';
  if (m === 0) return 'Debt-free';
  const y = Math.floor(m / 12);
  const mo = m % 12;
  return `${y ? `${y} yr ` : ''}${mo ? `${mo} mo` : ''}`.trim();
}
