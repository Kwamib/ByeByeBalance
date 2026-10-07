/**
 * Single-loan amortization helpers.
 * Assumptions: fixed APR, interest = APR / 12 applied monthly, payments monthly,
 * no fees and no new borrowing.
 */
import { isFiniteNumber } from './money';
import { simulatePlan } from './debtPlan';

/**
 * Level monthly payment that fully repays `principal` in `months` payments.
 * Uses log1p/expm1 so very small rates stay numerically stable, and has an
 * explicit 0% branch.
 */
export function requiredPayment(principal, aprPercent, months) {
  if (!isFiniteNumber(principal) || principal < 0) throw new RangeError('Balance must be a number of zero or more.');
  if (!isFiniteNumber(aprPercent) || aprPercent < 0) throw new RangeError('APR must be a number of zero or more.');
  if (!Number.isInteger(months) || months <= 0) throw new RangeError('Months must be a positive whole number.');
  if (principal === 0) return 0;
  const r = aprPercent / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r) / -Math.expm1(-months * Math.log1p(r));
}

/** Pay off one debt with a fixed monthly payment. */
export function payoffSingle({ balance, apr, payment, maxMonths, startDate }) {
  return simulatePlan([{ id: 'debt', name: 'Debt', balance, rate: apr, minPayment: payment }], {
    strategy: 'avalanche',
    extraPayment: 0,
    maxMonths,
    startDate,
  });
}

/**
 * Compare a current payment against the same payment plus an extra amount.
 * Returns both simulations plus months and interest saved (null if either fails).
 */
export function compareExtraPayment({ balance, apr, payment, extra, maxMonths, startDate }) {
  const current = payoffSingle({ balance, apr, payment, maxMonths, startDate });
  const withExtra = payoffSingle({ balance, apr, payment: payment + (extra || 0), maxMonths, startDate });
  const bothOk = current.ok && withExtra.ok;
  return {
    current,
    withExtra,
    monthsSaved: bothOk ? current.months - withExtra.months : null,
    interestSaved: bothOk ? current.totalInterest - withExtra.totalInterest : null,
  };
}
