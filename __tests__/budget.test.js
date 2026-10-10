import { parseCents, computeBudget, breakdown, importDebts, diffWithPlan, csvCell, budgetCsv } from '../lib/budget';
import { sanitizeBudget, parseBudget, makeBackup, readBackup, mergeBudgets, MAX_BACKUP_BYTES } from '../lib/budgetStorage';

describe('parseCents', () => {
  test('accepts dollars, commas, $ and up to two decimals', () => {
    expect(parseCents('6200')).toBe(620000);
    expect(parseCents('$1,250.5')).toBe(125050);
    expect(parseCents('0.07')).toBe(7);
    expect(parseCents('')).toBe(0);
    expect(parseCents(300)).toBe(30000);
  });
  test('rejects negatives, junk, three decimals, NaN and huge values', () => {
    ['-5', 'abc', '1.234', '.', '1e5', 'Infinity'].forEach(v => expect(parseCents(v)).toBeNull());
    expect(parseCents(NaN)).toBeNull();
    expect(parseCents('999999999999')).toBeNull();
  });
  test('no float drift: 0.1 + 0.2 in cents is exact', () => {
    expect(parseCents('0.1') + parseCents('0.2')).toBe(30);
  });
});

describe('computeBudget', () => {
  const base = { incomeCents: 620000, expenseCents: [180000, 25000, 60000, 28000, 65000, 18000, 24000], minimumCents: [30000, 26000, 15000], savingsCents: 40000 };

  test('mockup example with minimums: surplus and buffer', () => {
    const b = computeBudget({ ...base, extraCents: 30000 });
    expect(b.livingCents).toBe(400000);
    expect(b.minimumsCents).toBe(71000);
    expect(b.surplusCents).toBe(620000 - 400000 - 71000 - 40000); // $1,090
    expect(b.bufferCents).toBe(109000 - 30000);
    expect(b.extraTooHigh).toBe(false);
  });

  test('minimums are counted once, extra is separate', () => {
    const b = computeBudget({ ...base, extraCents: 0 });
    const withExtra = computeBudget({ ...base, extraCents: 10000 });
    expect(withExtra.surplusCents).toBe(b.surplusCents);
    expect(withExtra.bufferCents).toBe(b.bufferCents - 10000);
  });

  test('zero income and shortfall', () => {
    const z = computeBudget({});
    expect(z.surplusCents).toBe(0);
    const s = computeBudget({ incomeCents: 100000, expenseCents: [150000] });
    expect(s.shortfall).toBe(true);
    expect(s.surplusCents).toBe(-50000);
    expect(computeBudget({ incomeCents: 100000, expenseCents: [150000], extraCents: 100 }).extraTooHigh).toBe(true);
  });

  test('extra larger than surplus is flagged', () => {
    expect(computeBudget({ incomeCents: 100000, expenseCents: [90000], extraCents: 20000 }).extraTooHigh).toBe(true);
  });

  test('breakdown shares never exceed the bar', () => {
    const segs = breakdown(computeBudget({ ...base, extraCents: 30000 }));
    const total = segs.reduce((s, x) => s + x.share, 0);
    expect(total).toBeLessThanOrEqual(1.000001);
    segs.forEach(s => expect(s.share).toBeGreaterThanOrEqual(0));
  });
});

describe('importing debts from My plan', () => {
  const plan = [
    { id: 'a', name: 'Visa', balance: 5000, rate: 22, minPayment: 150 },
    { id: 'b', name: 'Car', balance: 9000, rate: 6, minPayment: 310.5 },
  ];
  const manual = { id: 'm1', name: 'Student loan', minimumCents: 20000, imported: false };

  test('imports minimums (not balances) and keeps manual rows', () => {
    const rows = importDebts([manual], plan);
    expect(rows).toHaveLength(3);
    expect(rows.find(r => r.sourceId === 'b').minimumCents).toBe(31050);
    expect(rows.some(r => r.minimumCents === 900000)).toBe(false);
    expect(rows[0]).toEqual(manual);
  });

  test('importing twice updates instead of duplicating', () => {
    const once = importDebts([], plan);
    const twice = importDebts(once, [{ ...plan[0], minPayment: 175 }, plan[1]]);
    expect(twice).toHaveLength(2);
    expect(twice.find(r => r.sourceId === 'a').minimumCents).toBe(17500);
  });

  test('detects changed and deleted source debts without altering anything', () => {
    const rows = importDebts([manual], plan);
    const d = diffWithPlan(rows, [{ ...plan[0], minPayment: 200 }]);
    expect(d.changed.map(c => c.row.sourceId)).toEqual(['a']);
    expect(d.removed.map(r => r.sourceId)).toEqual(['b']);
    expect(rows.find(r => r.sourceId === 'a').minimumCents).toBe(15000);
  });
});

describe('CSV', () => {
  test('neutralizes spreadsheet formulas and escapes delimiters', () => {
    expect(csvCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`);
    expect(csvCell('+1')).toBe("'+1");
    expect(csvCell('-cmd')).toBe("'-cmd");
    expect(csvCell('@SUM(A1)')).toBe("'@SUM(A1)");
    expect(csvCell('Rent, apt')).toBe('"Rent, apt"');
    expect(csvCell('Groceries')).toBe('Groceries');
  });
  test('budget CSV rows and totals', () => {
    const state = { expenses: [{ name: '=evil', cents: 1000 }], debts: [{ name: 'Visa', minimumCents: 15000 }] };
    const totals = computeBudget({ incomeCents: 100000, expenseCents: [1000], minimumCents: [15000], savingsCents: 0, extraCents: 5000 });
    const csv = budgetCsv(state, totals, new Date('2026-10-09T12:00:00Z')).split('\n');
    expect(csv[0]).toBe('Section,Item,Monthly amount (USD)');
    expect(csv).toContain("Living expense,'=evil,10.00");
    expect(csv).toContain('Result,Available before extra debt payment,840.00');
    expect(csv).toContain('Result,Left after extra payment,790.00');
  });
});

describe('budget storage and backups', () => {
  const budget = {
    incomeCents: 620000,
    expenses: [{ id: 'e1', name: 'Housing', cents: 180000 }],
    debts: [{ id: 'plan-a', sourceId: 'a', name: 'Visa', minimumCents: 15000, imported: true }],
    savingsCents: 40000,
    extraCents: 30000,
  };
  const planRecord = { plan: { debts: [{ id: 'a', name: 'Visa', balance: 5000, rate: 22, minPayment: 150 }], extraPayment: 300, strategy: 'avalanche', customOrder: ['a'] }, history: [{ date: '2026-09-01T00:00:00Z', total: 5200 }] };

  test('sanitize rejects bad numbers and duplicate ids', () => {
    expect(sanitizeBudget(budget)).toEqual(budget);
    expect(sanitizeBudget({ ...budget, incomeCents: -1 })).toBeNull();
    expect(sanitizeBudget({ ...budget, incomeCents: 1.5 })).toBeNull();
    expect(sanitizeBudget({ ...budget, expenses: [...budget.expenses, { id: 'e1', name: 'x', cents: 1 }] })).toBeNull();
  });

  test('stored record round-trips; wrong version or junk is ignored', () => {
    expect(parseBudget(JSON.stringify({ version: 1, budget })).budget).toEqual(budget);
    expect(parseBudget(JSON.stringify({ version: 9, budget }))).toBeNull();
    expect(parseBudget('{oops')).toBeNull();
  });

  test('backup round-trip restores plan, history and budget', () => {
    const r = readBackup(makeBackup({ planRecord, budget }));
    expect(r.ok).toBe(true);
    expect(r.budget).toEqual(budget);
    expect(r.plan.debts[0].name).toBe('Visa');
    expect(r.history).toHaveLength(1);
    expect(r.summary).toEqual({ debts: 1, checkIns: 1, expenses: 1, budgetDebts: 1 });
  });

  test('corrupted, foreign, future, oversized or empty backups are rejected', () => {
    expect(readBackup('not json').ok).toBe(false);
    expect(readBackup(JSON.stringify({ app: 'other', kind: 'backup', version: 1 })).ok).toBe(false);
    expect(readBackup(JSON.stringify({ app: 'byebyebalance', kind: 'backup', version: 2, budget })).ok).toBe(false);
    expect(readBackup('{}', MAX_BACKUP_BYTES + 1).ok).toBe(false);
    expect(readBackup(JSON.stringify({ app: 'byebyebalance', kind: 'backup', version: 1, plan: null, budget: null })).ok).toBe(false);
    const bad = JSON.parse(makeBackup({ planRecord, budget }));
    bad.budget.expenses[0].cents = -100;
    expect(readBackup(JSON.stringify(bad)).ok).toBe(false);
  });

  test('names are kept as plain text (rendered by React, never as HTML)', () => {
    const b = { ...budget, expenses: [{ id: 'x', name: '<img src=x onerror=alert(1)>', cents: 100 }] };
    expect(readBackup(makeBackup({ planRecord: null, budget: b })).budget.expenses[0].name).toBe('<img src=x onerror=alert(1)>');
  });

  test('merge keeps current rows and adds new ones', () => {
    const current = { ...budget, expenses: [{ id: 'e1', name: 'Rent', cents: 150000 }], incomeCents: 0 };
    const m = mergeBudgets(current, { ...budget, expenses: [...budget.expenses, { id: 'e2', name: 'Gym', cents: 5000 }] });
    expect(m.expenses.map(e => e.name)).toEqual(['Rent', 'Gym']);
    expect(m.incomeCents).toBe(620000);
  });
});
