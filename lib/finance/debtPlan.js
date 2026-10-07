/**
 * Multi-debt payoff engine (pure, no React).
 *
 * Assumptions, shown to users beside results:
 *  - fixed APR; monthly interest = balance * APR / 12
 *  - one payment per month; no fees, no new charges
 *  - a fixed total monthly budget = sum of minimums + extra payment
 *
 * Each month:
 *  1. interest accrues on every open debt
 *  2. each open debt receives its minimum (capped at what it owes)
 *  3. everything left in the budget (the extra payment, plus minimums freed up
 *     by debts already paid off, plus any unused amount in a payoff month) goes
 *     to debts in strategy order, moving to the next debt when one is cleared
 *
 * Balances never go negative and no debt is ever overpaid.
 */
import { EPSILON, isFiniteNumber } from './money';
import { paymentDate } from './dates';

export const DEFAULT_MAX_MONTHS = 600; // 50 years
export const STRATEGIES = ['snowball', 'avalanche', 'custom'];
const MAX_APR = 100;

/** Field-level validation. Returns [] when every debt is usable. */
export function validateDebtInputs(debts) {
  const errors = [];
  if (!Array.isArray(debts)) return [{ debtId: null, field: null, message: 'Debts must be a list.' }];
  debts.forEach((d, i) => {
    const debtId = d && d.id != null ? d.id : i;
    const label = (d && d.name) || `Debt ${i + 1}`;
    const check = (field, ok, message) => { if (!ok) errors.push({ debtId, field, message: `${label}: ${message}` }); };
    check('balance', isFiniteNumber(d?.balance) && d.balance >= 0, 'balance must be a number of zero or more.');
    check('rate', isFiniteNumber(d?.rate) && d.rate >= 0 && d.rate <= MAX_APR, `APR must be between 0% and ${MAX_APR}%.`);
    check('minPayment', isFiniteNumber(d?.minPayment) && d.minPayment >= 0, 'minimum payment must be a number of zero or more.');
  });
  return errors;
}

/** Debts whose minimum payment does not cover the first month's interest. */
export function underwaterWarnings(debts) {
  return debts
    .filter(d => d.balance > EPSILON && d.minPayment <= d.balance * (d.rate / 100 / 12))
    .map(d => ({
      debtId: d.id,
      debtName: d.name || 'Unnamed debt',
      monthlyInterest: d.balance * (d.rate / 100 / 12),
      message: `${d.name || 'This debt'}'s minimum payment doesn't cover its monthly interest, so on its own it would never be paid off.`,
    }));
}

function orderTargets(open, strategy, customOrder) {
  const byIndex = (a, b) => a.index - b.index;
  if (strategy === 'snowball') {
    return [...open].sort((a, b) => a.balance - b.balance || b.rate - a.rate || byIndex(a, b));
  }
  if (strategy === 'custom') {
    const rank = new Map((customOrder || []).map((id, i) => [id, i]));
    const r = d => (rank.has(d.id) ? rank.get(d.id) : Number.MAX_SAFE_INTEGER);
    return [...open].sort((a, b) => r(a) - r(b) || byIndex(a, b));
  }
  // avalanche (default)
  return [...open].sort((a, b) => b.rate - a.rate || a.balance - b.balance || byIndex(a, b));
}

function failure(code, message, extra = {}) {
  return { ok: false, error: { code, message }, months: null, totalInterest: null, totalPaid: null, schedule: [], debts: [], ...extra };
}

/**
 * Simulate a payoff plan.
 *
 * @param {Array<{id, name, balance, rate, minPayment}>} debts  rate = APR in percent
 * @param {object} opts
 * @param {'snowball'|'avalanche'|'custom'} [opts.strategy='avalanche']
 * @param {number} [opts.extraPayment=0]
 * @param {Array} [opts.customOrder]  debt ids in payoff order (strategy 'custom')
 * @param {number} [opts.maxMonths=600]
 * @param {Date|string} [opts.startDate]  if given, each schedule row gets a calendar date
 */
export function simulatePlan(debts, opts = {}) {
  const { strategy = 'avalanche', extraPayment = 0, customOrder = null, maxMonths = DEFAULT_MAX_MONTHS, startDate = null } = opts;

  const inputErrors = validateDebtInputs(debts);
  if (!isFiniteNumber(extraPayment) || extraPayment < 0) {
    inputErrors.push({ debtId: null, field: 'extraPayment', message: 'Extra payment must be a number of zero or more.' });
  }
  if (!STRATEGIES.includes(strategy)) {
    inputErrors.push({ debtId: null, field: 'strategy', message: `Unknown strategy "${strategy}".` });
  }
  if (inputErrors.length) {
    return failure('INVALID_INPUT', inputErrors[0].message, { fieldErrors: inputErrors });
  }

  const state = debts.map((d, index) => ({
    id: d.id,
    name: d.name,
    index,
    rate: d.rate,
    minPayment: d.minPayment,
    startingBalance: d.balance,
    balance: d.balance > EPSILON ? d.balance : 0,
    interestPaid: 0,
    totalPaid: 0,
    payoffMonth: d.balance > EPSILON ? null : 0,
  }));
  const open = () => state.filter(d => d.balance > 0);
  const warnings = underwaterWarnings(state);

  const monthlyBudget = open().reduce((s, d) => s + d.minPayment, 0) + extraPayment;
  const schedule = [];
  let totalInterest = 0;
  let month = 0;

  const summary = () => ({
    months: month,
    totalInterest,
    totalPaid: state.reduce((s, d) => s + d.totalPaid, 0),
    monthlyBudget,
    debts: state.map(({ index, balance, ...d }) => ({ ...d, endingBalance: balance })),
    schedule,
    warnings,
  });

  while (open().length > 0) {
    if (month >= maxMonths) {
      return failure('SIMULATION_LIMIT',
        `This plan doesn't finish within ${maxMonths / 12} years. Raising the monthly payment, or directing it to the debt that is growing, may help.`,
        { partial: summary() });
    }
    month++;

    // 1. Interest
    let monthInterest = 0;
    for (const d of open()) {
      const i = d.balance * (d.rate / 100 / 12);
      d.balance += i;
      d.interestPaid += i;
      monthInterest += i;
    }
    totalInterest += monthInterest;

    if (monthlyBudget <= monthInterest + EPSILON) {
      const owed = open().reduce((s, d) => s + d.balance, 0);
      if (monthlyBudget + EPSILON < owed) {
        return failure('NON_AMORTIZING',
          month === 1
            ? `Your total monthly payment ($${monthlyBudget.toFixed(2)}) doesn't cover the $${monthInterest.toFixed(2)} of interest charged in the first month, so balances would keep growing.`
            : `Under this payment order, interest grows faster than the payments in month ${month}. A larger payment, or paying the highest-rate debt first, may work.`,
          { partial: summary() });
      }
    }

    // 2. Minimums
    let remaining = monthlyBudget;
    const payments = {};
    for (const d of open()) {
      const pay = Math.min(d.minPayment, d.balance, remaining);
      d.balance -= pay;
      d.totalPaid += pay;
      remaining -= pay;
      payments[d.id] = pay;
    }

    // 3. Extra + freed payments, cascading through targets
    for (const d of orderTargets(open().filter(x => x.balance > EPSILON), strategy, customOrder)) {
      if (remaining <= EPSILON) break;
      const pay = Math.min(remaining, d.balance);
      d.balance -= pay;
      d.totalPaid += pay;
      remaining -= pay;
      payments[d.id] = (payments[d.id] || 0) + pay;
    }

    // Close out paid debts (absorb float dust below a millionth of a cent)
    for (const d of state) {
      if (d.payoffMonth === null && d.balance <= EPSILON) {
        d.balance = 0;
        d.payoffMonth = month;
      }
    }

    const paid = Object.values(payments).reduce((s, x) => s + x, 0);
    const row = {
      month,
      payment: paid,
      interest: monthInterest,
      principal: paid - monthInterest,
      balance: state.reduce((s, d) => s + d.balance, 0),
      balances: Object.fromEntries(state.map(d => [d.id, d.balance])),
      payments,
    };
    if (startDate) row.date = paymentDate(startDate, month);
    schedule.push(row);
  }

  return { ok: true, error: null, ...summary() };
}

/** Same debts, compared across snowball and avalanche. */
export function compareStrategies(debts, opts = {}) {
  const snowball = simulatePlan(debts, { ...opts, strategy: 'snowball' });
  const avalanche = simulatePlan(debts, { ...opts, strategy: 'avalanche' });
  const bothOk = snowball.ok && avalanche.ok;
  return {
    snowball,
    avalanche,
    difference: bothOk
      ? { months: snowball.months - avalanche.months, interest: snowball.totalInterest - avalanche.totalInterest }
      : null,
  };
}
