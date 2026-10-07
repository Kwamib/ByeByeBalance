/**
 * Independently verified cases for lib/finance.
 * Reference values were computed with closed-form formulas or a separate
 * month-by-month script, not by this implementation.
 * Rounding model: unrounded internally, so tolerances are ±$0.01.
 */
import {
  simulatePlan, compareStrategies, underwaterWarnings,
  requiredPayment, payoffSingle, compareExtraPayment,
  housingCost, mortgagePayment, affordability,
  addMonths, paymentDate, roundCents, displayBalance,
} from '../lib/finance';

const CENT = 2; // toBeCloseTo precision: within $0.005

describe('single debt payoff (brief reference cases)', () => {
  test('$1,200 at 0% APR, $100/month: 12 months, $0 interest', () => {
    const r = payoffSingle({ balance: 1200, apr: 0, payment: 100 });
    expect(r.ok).toBe(true);
    expect(r.months).toBe(12);
    expect(r.totalInterest).toBe(0);
  });

  test('$10,000 at 18% APR, $300/month: 47 payments, ~$3,967.21 interest', () => {
    const r = payoffSingle({ balance: 10000, apr: 18, payment: 300 });
    expect(r.months).toBe(47);
    expect(r.totalInterest).toBeCloseTo(3967.21, CENT);
  });

  test('same debt at $400/month: 32 payments, ~$2,627.93; saves 15 months and $1,339.28', () => {
    const c = compareExtraPayment({ balance: 10000, apr: 18, payment: 300, extra: 100 });
    expect(c.withExtra.months).toBe(32);
    expect(c.withExtra.totalInterest).toBeCloseTo(2627.93, CENT);
    expect(c.monthsSaved).toBe(15);
    expect(c.interestSaved).toBeCloseTo(1339.28, CENT);
  });

  test('required payment to clear $10,000 at 18% in 24 months is ~$499.241', () => {
    expect(requiredPayment(10000, 18, 24)).toBeCloseTo(499.241, 3);
    const r = payoffSingle({ balance: 10000, apr: 18, payment: requiredPayment(10000, 18, 24) });
    expect(r.months).toBe(24);
  });

  test('required payment: 0% branch, tiny rates and validation', () => {
    expect(requiredPayment(1200, 0, 12)).toBe(100);
    expect(requiredPayment(1200, 1e-10, 12)).toBeCloseTo(100, 6);
    expect(requiredPayment(0, 18, 12)).toBe(0);
    expect(() => requiredPayment(1000, 18, 0)).toThrow();
    expect(() => requiredPayment(1000, 18, 12.5)).toThrow();
    expect(() => requiredPayment(-1, 18, 12)).toThrow();
  });
});

describe('multi-debt plan', () => {
  test('freed payments roll over: $100 + $1,000 at 0%, $100/$50 minimums, no extra -> 8 months', () => {
    const debts = [
      { id: 'a', name: 'A', balance: 100, rate: 0, minPayment: 100 },
      { id: 'b', name: 'B', balance: 1000, rate: 0, minPayment: 50 },
    ];
    for (const strategy of ['snowball', 'avalanche', 'custom']) {
      const r = simulatePlan(debts, { strategy });
      expect(r.months).toBe(8);
      expect(r.totalPaid).toBeCloseTo(1100, CENT);
    }
  });

  test('unused funds in a payoff month go to the next debt', () => {
    const debts = [
      { id: 'a', name: 'A', balance: 30, rate: 0, minPayment: 10 },
      { id: 'b', name: 'B', balance: 200, rate: 0, minPayment: 10 },
    ];
    const r = simulatePlan(debts, { strategy: 'snowball', extraPayment: 80 });
    // Month 1: budget $100. A: $10 min + $20 extra = paid. B: $10 min + $60 leftover.
    expect(r.schedule[0].payments.a).toBeCloseTo(30, CENT);
    expect(r.schedule[0].payments.b).toBeCloseTo(70, CENT);
    expect(r.schedule[0].payment).toBeCloseTo(100, CENT);
  });

  test('fixed budget every month except the last; no negative balances or overpayment', () => {
    const debts = [
      { id: 1, name: 'Card', balance: 8000, rate: 22.99, minPayment: 240 },
      { id: 2, name: 'Car', balance: 3000, rate: 4.5, minPayment: 300 },
      { id: 3, name: 'Personal', balance: 5000, rate: 12.99, minPayment: 150 },
    ];
    const r = simulatePlan(debts, { strategy: 'avalanche', extraPayment: 200 });
    expect(r.ok).toBe(true);
    r.schedule.slice(0, -1).forEach(row => expect(row.payment).toBeCloseTo(890, 6));
    r.schedule.forEach(row => Object.values(row.balances).forEach(b => expect(b).toBeGreaterThanOrEqual(0)));
    r.debts.forEach(d => expect(d.totalPaid).toBeCloseTo(d.startingBalance + d.interestPaid, 6));
    expect(r.debts.find(d => d.id === 1).payoffMonth).toBeLessThan(r.debts.find(d => d.id === 3).payoffMonth);
  });

  test('custom order is respected', () => {
    const debts = [
      { id: 'x', name: 'X', balance: 2000, rate: 5, minPayment: 50 },
      { id: 'y', name: 'Y', balance: 2000, rate: 20, minPayment: 50 },
    ];
    const r = simulatePlan(debts, { strategy: 'custom', customOrder: ['x', 'y'], extraPayment: 300 });
    const x = r.debts.find(d => d.id === 'x');
    const y = r.debts.find(d => d.id === 'y');
    expect(x.payoffMonth).toBeLessThan(y.payoffMonth);
  });

  test('avalanche never costs more interest than snowball here', () => {
    const debts = [
      { id: 1, name: 'Card', balance: 8000, rate: 22.99, minPayment: 240 },
      { id: 2, name: 'Car', balance: 3000, rate: 4.5, minPayment: 300 },
      { id: 3, name: 'Student', balance: 15000, rate: 6.5, minPayment: 165 },
    ];
    const c = compareStrategies(debts, { extraPayment: 200 });
    expect(c.difference.interest).toBeGreaterThanOrEqual(0);
  });

  test('empty list and all-zero balances return a finished plan', () => {
    expect(simulatePlan([]).months).toBe(0);
    const r = simulatePlan([{ id: 1, name: 'Done', balance: 0, rate: 10, minPayment: 50 }]);
    expect(r.ok).toBe(true);
    expect(r.months).toBe(0);
    expect(r.schedule).toEqual([]);
  });

  test('invalid inputs are reported, not simulated', () => {
    const bad = [
      [{ id: 1, name: 'A', balance: -5, rate: 10, minPayment: 50 }],
      [{ id: 1, name: 'A', balance: 500, rate: NaN, minPayment: 50 }],
      [{ id: 1, name: 'A', balance: 500, rate: 101, minPayment: 50 }],
      [{ id: 1, name: 'A', balance: 500, rate: 10, minPayment: Infinity }],
    ];
    bad.forEach(debts => {
      const r = simulatePlan(debts);
      expect(r.ok).toBe(false);
      expect(r.error.code).toBe('INVALID_INPUT');
    });
    expect(simulatePlan([{ id: 1, name: 'A', balance: 500, rate: 10, minPayment: 50 }], { extraPayment: -1 }).error.code).toBe('INVALID_INPUT');
  });

  test('non-amortizing budget is an error, never a silently raised payment', () => {
    const r = simulatePlan([{ id: 1, name: 'Card', balance: 10000, rate: 24, minPayment: 150 }]);
    expect(r.ok).toBe(false);
    expect(r.error.code).toBe('NON_AMORTIZING');
  });

  test('an underwater debt can still be cleared when extra/freed payments reach it', () => {
    const debts = [
      { id: 1, name: 'Card', balance: 10000, rate: 24, minPayment: 150 },
      { id: 2, name: 'Car', balance: 1000, rate: 0, minPayment: 200 },
    ];
    expect(underwaterWarnings(debts)).toHaveLength(1);
    const r = simulatePlan(debts, { strategy: 'avalanche', extraPayment: 100 });
    expect(r.ok).toBe(true);
  });

  test('long plans hit the simulation limit with a neutral message', () => {
    const r = simulatePlan([{ id: 1, name: 'Slow', balance: 100000, rate: 0, minPayment: 10 }], { maxMonths: 600 });
    expect(r.ok).toBe(false);
    expect(r.error.code).toBe('SIMULATION_LIMIT');
  });

  test('schedule rows get month-safe calendar dates', () => {
    const r = payoffSingle({ balance: 1200, apr: 0, payment: 100, startDate: new Date(2026, 0, 31) });
    const months = r.schedule.map(row => row.date.getMonth());
    expect(months).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0]);
    expect(r.schedule[0].date.getDate()).toBe(28); // Feb 28, 2026
  });
});

describe('dates and rounding', () => {
  test('addMonths clamps month-end and never skips a month', () => {
    expect(addMonths(new Date(2026, 0, 31), 1)).toEqual(new Date(2026, 1, 28));
    expect(addMonths(new Date(2028, 0, 31), 1)).toEqual(new Date(2028, 1, 29));
    expect(addMonths(new Date(2026, 2, 31), -1)).toEqual(new Date(2026, 1, 28));
    expect(addMonths(new Date(2026, 10, 30), 3)).toEqual(new Date(2027, 1, 28));
    expect(paymentDate(new Date(2026, 4, 31), 1)).toEqual(new Date(2026, 5, 30));
  });

  test('cents rounding and no premature $0.00', () => {
    expect(roundCents(1.005)).toBe(1.01);
    expect(roundCents(-2.345)).toBe(-2.35);
    expect(displayBalance(0.004)).toBe(0.01);
    expect(displayBalance(0)).toBe(0);
    expect(displayBalance(1e-12)).toBe(0);
  });
});

describe('mortgage', () => {
  const base = { homePrice: 400000, downPayment: 80000, ratePercent: 6.5, loanYears: 30 };

  test('$400k home, $80k down, 6.5%, 30 years: P&I ~$2,022.62', () => {
    expect(mortgagePayment(320000, 6.5, 30)).toBeCloseTo(2022.62, CENT);
  });

  test('with $4,800 tax, $1,800 insurance, $75 HOA, no MI: total ~$2,647.62', () => {
    const r = housingCost({ ...base, annualPropertyTax: 4800, annualInsurance: 1800, monthlyHoa: 75, monthlyMortgageInsurance: 0 });
    expect(r.ok).toBe(true);
    expect(r.principal).toBe(320000);
    expect(r.totalMonthly).toBeCloseTo(2647.62, CENT);
  });

  test('0% mortgage divides principal evenly', () => {
    const r = housingCost({ ...base, ratePercent: 0 });
    expect(r.principalAndInterest).toBeCloseTo(320000 / 360, 6);
    expect(r.totalLoanInterest).toBeCloseTo(0, 6);
  });

  test('full cash purchase: no loan, but taxes, insurance and HOA still apply', () => {
    const r = housingCost({ ...base, downPayment: 400000, annualPropertyTax: 4800, annualInsurance: 1800, monthlyHoa: 75 });
    expect(r.principal).toBe(0);
    expect(r.principalAndInterest).toBe(0);
    expect(r.totalLoanInterest).toBe(0);
    expect(r.totalMonthly).toBeCloseTo(625, 6);
  });

  test('invalid scenarios are rejected with field errors', () => {
    const cases = [
      { homePrice: 0 }, { downPayment: -1 }, { downPayment: 500000 },
      { loanYears: 15.5 }, { ratePercent: -1 }, { annualPropertyTax: NaN }, { monthlyHoa: -10 },
    ];
    cases.forEach(c => {
      const r = housingCost({ ...base, ...c });
      expect(r.ok).toBe(false);
      expect(r.errors.length).toBeGreaterThan(0);
    });
  });
});

describe('affordability', () => {
  test('ratios and remaining cash', () => {
    const r = affordability({
      grossMonthlyIncome: 10000,
      takeHomeMonthlyIncome: 7500,
      monthlyHousingCost: 2647.62,
      otherMonthlyDebtPayments: 500,
      otherMonthlyLivingExpenses: 2000,
    });
    expect(r.housingRatio).toBeCloseTo(0.264762, 6);
    expect(r.totalDebtToIncome).toBeCloseTo(0.314762, 6);
    expect(r.remainingMonthlyCash).toBeCloseTo(2352.38, CENT);
    expect(r.withinPlanningTarget).toBe(true);
    expect(r).not.toHaveProperty('approved');
  });

  test('editable target and validation', () => {
    const r = affordability({ grossMonthlyIncome: 10000, takeHomeMonthlyIncome: 7500, monthlyHousingCost: 3000, otherMonthlyDebtPayments: 800, dtiTarget: 0.36 });
    expect(r.withinPlanningTarget).toBe(false);
    expect(affordability({ grossMonthlyIncome: 0, takeHomeMonthlyIncome: 0, monthlyHousingCost: 1000 }).ok).toBe(false);
  });
});
