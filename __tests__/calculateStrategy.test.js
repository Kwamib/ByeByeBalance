import { calculateStrategy } from '../lib/calculateStrategy';

// Sample debts used across tests
const sampleDebts = [
  { id: 1, name: 'Credit Card', balance: 8000, rate: 22.99, minPayment: 240 },
  { id: 2, name: 'Car Loan', balance: 3000, rate: 4.5, minPayment: 300 },
  { id: 3, name: 'Personal Loan', balance: 5000, rate: 12.99, minPayment: 150 },
  { id: 4, name: 'Student Loan', balance: 15000, rate: 6.5, minPayment: 165 }
];

describe('calculateStrategy', () => {

  // ─── Basic Functionality ───────────────────────────────────────────

  test('returns results with required fields', () => {
    const result = calculateStrategy(sampleDebts, 'snowball', 200);
    expect(result).toHaveProperty('totalMonths');
    expect(result).toHaveProperty('totalInterest');
    expect(result).toHaveProperty('workingDebts');
    expect(result).toHaveProperty('chartData');
  });

  test('all debts reach zero balance', () => {
    const result = calculateStrategy(sampleDebts, 'snowball', 200);
    result.workingDebts.forEach(debt => {
      expect(debt.currentBalance).toBe(0);
    });
  });

  test('total months is a positive integer', () => {
    const result = calculateStrategy(sampleDebts, 'snowball', 200);
    expect(result.totalMonths).toBeGreaterThan(0);
    expect(Number.isInteger(result.totalMonths)).toBe(true);
  });

  test('total interest is positive', () => {
    const result = calculateStrategy(sampleDebts, 'snowball', 200);
    expect(result.totalInterest).toBeGreaterThan(0);
  });

  // ─── Strategy Comparison ───────────────────────────────────────────

  test('avalanche pays less or equal interest than snowball', () => {
    const snowball = calculateStrategy(sampleDebts, 'snowball', 200);
    const avalanche = calculateStrategy(sampleDebts, 'avalanche', 200);
    expect(avalanche.totalInterest).toBeLessThanOrEqual(snowball.totalInterest);
  });

  test('avalanche finishes in fewer or equal months than snowball', () => {
    const snowball = calculateStrategy(sampleDebts, 'snowball', 200);
    const avalanche = calculateStrategy(sampleDebts, 'avalanche', 200);
    expect(avalanche.totalMonths).toBeLessThanOrEqual(snowball.totalMonths);
  });

  // ─── Extra Payments ────────────────────────────────────────────────

  test('extra payments reduce total months', () => {
    const noExtra = calculateStrategy(sampleDebts, 'snowball', 0);
    const withExtra = calculateStrategy(sampleDebts, 'snowball', 200);
    expect(withExtra.totalMonths).toBeLessThan(noExtra.totalMonths);
  });

  test('extra payments reduce total interest', () => {
    const noExtra = calculateStrategy(sampleDebts, 'snowball', 0);
    const withExtra = calculateStrategy(sampleDebts, 'snowball', 200);
    expect(withExtra.totalInterest).toBeLessThan(noExtra.totalInterest);
  });

  test('larger extra payment pays off faster than smaller', () => {
    const small = calculateStrategy(sampleDebts, 'snowball', 100);
    const large = calculateStrategy(sampleDebts, 'snowball', 500);
    expect(large.totalMonths).toBeLessThan(small.totalMonths);
  });

  // ─── Snowball Strategy Order ───────────────────────────────────────

  test('snowball pays off smallest balance first', () => {
    const result = calculateStrategy(sampleDebts, 'snowball', 200);
    // Car Loan ($3,000) is smallest balance — should be paid off first
    const carLoan = result.workingDebts.find(d => d.name === 'Car Loan');
    const otherDebts = result.workingDebts.filter(d => d.name !== 'Car Loan');

    otherDebts.forEach(debt => {
      if (debt.monthPaidOff) {
        expect(carLoan.monthPaidOff).toBeLessThanOrEqual(debt.monthPaidOff);
      }
    });
  });

  // ─── Avalanche Strategy Order ──────────────────────────────────────

  test('avalanche directs extra payments to highest rate debt', () => {
    // Use debts with similar payoff timelines so extra payment targeting is the deciding factor
    const debts = [
      { id: 1, name: 'High Rate', balance: 5000, rate: 24.99, minPayment: 100 },
      { id: 2, name: 'Low Rate', balance: 5000, rate: 4.99, minPayment: 100 },
    ];
    const result = calculateStrategy(debts, 'avalanche', 200);
    const highRate = result.workingDebts.find(d => d.name === 'High Rate');
    const lowRate = result.workingDebts.find(d => d.name === 'Low Rate');

    // Avalanche should pay off the high rate debt first
    expect(highRate.monthPaidOff).toBeLessThan(lowRate.monthPaidOff);
  });

  // ─── Edge Cases ────────────────────────────────────────────────────

  test('handles single debt', () => {
    const singleDebt = [{ id: 1, name: 'Card', balance: 1000, rate: 18, minPayment: 50 }];
    const result = calculateStrategy(singleDebt, 'snowball', 0);
    expect(result.totalMonths).toBeGreaterThan(0);
    expect(result.workingDebts[0].currentBalance).toBe(0);
  });

  test('handles zero extra payment', () => {
    const result = calculateStrategy(sampleDebts, 'snowball', 0);
    expect(result.totalMonths).toBeGreaterThan(0);
    result.workingDebts.forEach(debt => {
      expect(debt.currentBalance).toBe(0);
    });
  });

  test('handles very large extra payment (pays off quickly)', () => {
    const result = calculateStrategy(sampleDebts, 'snowball', 10000);
    expect(result.totalMonths).toBeLessThan(10);
  });

  test('does not exceed 360 months', () => {
    const tinyPayment = [{ id: 1, name: 'Huge Debt', balance: 500000, rate: 25, minPayment: 100 }];
    const result = calculateStrategy(tinyPayment, 'snowball', 0);
    expect(result.totalMonths).toBeLessThanOrEqual(360);
  });

  // ─── Chart Data ────────────────────────────────────────────────────

  test('chart data has entries', () => {
    const result = calculateStrategy(sampleDebts, 'snowball', 200);
    expect(result.chartData.length).toBeGreaterThan(0);
  });

  test('chart data first entry is month M1', () => {
    const result = calculateStrategy(sampleDebts, 'snowball', 200);
    expect(result.chartData[0].month).toBe('M1');
  });

  // ─── Interest Tracking ─────────────────────────────────────────────

  test('individual interest sums to total interest', () => {
    const result = calculateStrategy(sampleDebts, 'snowball', 200);
    const sumIndividual = result.workingDebts.reduce((sum, d) => sum + d.individualInterest, 0);
    expect(Math.round(sumIndividual)).toBe(Math.round(result.totalInterest));
  });

  test('each debt tracks its paid off month', () => {
    const result = calculateStrategy(sampleDebts, 'snowball', 200);
    result.workingDebts.forEach(debt => {
      expect(debt.monthPaidOff).not.toBeNull();
      expect(debt.monthPaidOff).toBeGreaterThan(0);
    });
  });
});
