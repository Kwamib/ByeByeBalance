/**
 * Money helpers.
 *
 * Rounding model: all calculations keep full floating-point precision
 * internally. Values are rounded to cents only at the edges (display,
 * schedules, CSV exports) using round-half-away-from-zero.
 */

export const EPSILON = 1e-9;

export function isFiniteNumber(x) {
  return typeof x === 'number' && Number.isFinite(x);
}

export function roundCents(x) {
  if (!isFiniteNumber(x)) return x;
  const sign = x < 0 ? -1 : 1;
  return (sign * Math.round(Math.abs(x) * 100 + EPSILON)) / 100;
}

/**
 * Round a remaining balance for display without ever showing $0.00
 * for a debt that is not actually paid off yet.
 */
export function displayBalance(x) {
  if (!isFiniteNumber(x) || x <= EPSILON) return 0;
  const r = roundCents(x);
  return r === 0 ? 0.01 : r;
}
