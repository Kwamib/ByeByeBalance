import { parseSaved, migrateLegacy, sanitizePlan, sanitizeHome } from '../lib/storage';
import { pointsFrom, padSeries } from '../lib/chartSeries';
import { scheduleCsv } from '../lib/exportCsv';
import { parseDraft, toDraft } from '../lib/planDraft';
import { simulatePlan } from '../lib/finance/debtPlan';
import { payoffSingle, requiredPayment } from '../lib/finance/amortization';

const legacyUserData = JSON.stringify({
  debts: [
    { id: 1, name: 'Chase', balance: 4200, rate: 24.99, minPayment: 120 },
    { id: 2, name: 'Auto', balance: 9800, rate: 6.9, minPayment: 310 },
  ],
  extraPayment: 150,
  strategy: 'snowball',
  savedAt: '2026-05-01T12:00:00.000Z',
});

describe('saved data migration', () => {
  test('previous-version data becomes a v2 plan without losing debts', () => {
    const rec = migrateLegacy(legacyUserData);
    expect(rec.version).toBe(2);
    expect(rec.plan.debts.map(d => d.name)).toEqual(['Chase', 'Auto']);
    expect(rec.plan.debts[0].id).toBe('1');
    expect(rec.plan.extraPayment).toBe(150);
    expect(rec.plan.strategy).toBe('snowball');
    expect(rec.plan.customOrder).toEqual(['1', '2']);
  });

  test('the old site’s untouched sample debts are not treated as personal data', () => {
    const untouched = JSON.stringify({
      debts: [
        { id: 1, name: 'Credit Card', balance: 8000, rate: 22.99, minPayment: 240 },
        { id: 2, name: 'Car Loan', balance: 3000, rate: 4.5, minPayment: 300 },
        { id: 3, name: 'Personal Loan', balance: 5000, rate: 12.99, minPayment: 150 },
        { id: 4, name: 'Student Loan', balance: 15000, rate: 6.5, minPayment: 165 },
      ],
      extraPayment: 200,
      strategy: 'snowball',
    });
    expect(migrateLegacy(untouched)).toBeNull();
  });

  test('corrupt, empty and hostile input is rejected', () => {
    expect(migrateLegacy('{not json')).toBeNull();
    expect(migrateLegacy(JSON.stringify({ debts: [] }))).toBeNull();
    expect(parseSaved('{"version":2,"plan":{"debts":[{"balance":"abc","rate":1,"minPayment":1}]}}')).toBeNull();
    expect(parseSaved(JSON.stringify({ version: 2, plan: { debts: [{ id: 'a', name: 'x', balance: -1, rate: 5, minPayment: 1 }] } }))).toBeNull();
    expect(parseSaved(null)).toBeNull();
  });

  test('round trip keeps plan and drops invalid history entries', () => {
    const plan = sanitizePlan({ debts: [{ id: 'a', name: 'A', balance: 100, rate: 0, minPayment: 10 }], extraPayment: 5, strategy: 'custom', customOrder: ['a', 'zzz'] });
    const raw = JSON.stringify({ version: 2, plan, history: [{ date: '2026-01-01T00:00:00Z', total: 100 }, { date: 'nope', total: 1 }, { total: 5 }] });
    const rec = parseSaved(raw);
    expect(rec.plan.customOrder).toEqual(['a']);
    expect(rec.history).toHaveLength(1);
  });

  test('home scenario sanitizing', () => {
    expect(sanitizeHome({ homePrice: 1, downPayment: 0, ratePercent: 6, loanYears: 30, annualPropertyTax: 0, annualInsurance: 0, monthlyMortgageInsurance: 0, monthlyHoa: 0 })).not.toBeNull();
    expect(sanitizeHome({ homePrice: 'x' })).toBeNull();
  });
});

describe('planner draft parsing', () => {
  test('flags bad fields per debt', () => {
    const d = toDraft({ debts: [{ id: 'a', name: '', balance: 100, rate: 5, minPayment: 10 }], extraPayment: 0, strategy: 'avalanche' });
    d.debts[0].rate = '150';
    d.extraPayment = '-3';
    const p = parseDraft(d);
    expect(p.ok).toBe(false);
    expect(p.errors.a.rate).toBeDefined();
    expect(p.errors.extraPayment).toBeDefined();
    expect(p.plan.debts[0].name).toBe('Debt 1');
  });

  test('accepts $ and commas', () => {
    const d = toDraft({ debts: [{ id: 'a', name: 'A', balance: 0, rate: 0, minPayment: 0 }], extraPayment: 0 });
    d.debts[0].balance = '$1,250.50';
    expect(parseDraft(d).plan.debts[0].balance).toBe(1250.5);
  });
});

describe('chart series', () => {
  const fast = payoffSingle({ balance: 1200, apr: 0, payment: 400 });
  const slow = payoffSingle({ balance: 1200, apr: 0, payment: 100 });
  const [f, sl] = padSeries([
    { label: 'fast', points: pointsFrom(fast, 1200) },
    { label: 'slow', points: pointsFrom(slow, 1200) },
  ]);

  test('both series share one timeline and the earlier one stays at zero', () => {
    expect(f.points).toHaveLength(13);
    expect(sl.points).toHaveLength(13);
    expect(f.points[0]).toBe(1200);
    expect(f.points.slice(3)).toEqual(Array(10).fill(0));
    expect(f.payoffIndex).toBe(3);
    expect(sl.payoffIndex).toBe(12);
  });

  test('one-point results still draw', () => {
    const one = payoffSingle({ balance: 50, apr: 0, payment: 100 });
    const [s1] = padSeries([{ label: 'x', points: pointsFrom(one, 50) }]);
    expect(s1.points).toEqual([50, 0]);
  });

  test('failed results produce no series', () => {
    expect(pointsFrom(payoffSingle({ balance: 1000, apr: 50, payment: 1 }), 1000)).toBeNull();
  });
});

describe('CSV export', () => {
  test('cents rounding, dates and per-debt columns', () => {
    const debts = [{ id: 'x', name: 'Card, Visa', balance: 1000, rate: 18, minPayment: 100 }];
    const r = simulatePlan(debts, { startDate: new Date(2026, 0, 31) });
    const csv = scheduleCsv(r, debts).split('\n');
    expect(csv[0]).toContain('"Card, Visa payment"');
    expect(csv[1].startsWith('1,2026-02-28,100.00,15.00,85.00,915.00')).toBe(true);
    expect(csv.some(l => l.startsWith('Total interest,'))).toBe(true);
  });
});

describe('debt-free date payment hits the month exactly', () => {
  test.each([[10000, 18, 24], [5000, 0, 7], [250000, 6.5, 360], [1234.56, 29.99, 13]])('%p at %p%% in %p months', (b, apr, n) => {
    const r = payoffSingle({ balance: b, apr, payment: requiredPayment(b, apr, n) });
    expect(r.months).toBe(n);
  });
});
