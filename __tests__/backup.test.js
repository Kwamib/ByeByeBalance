import { readFileSync } from 'fs';
import path from 'path';
import {
  makeBackup, readBackup, applyBackup, noteFirstSave, hasForbiddenKeys, MAX_BACKUP_BYTES,
  exportBackup, readLastBackup, lastBackupStatus,
} from '../lib/backup';
import { PLAN_KEY, HOME_KEY, BACKUP_TIP_KEY, LAST_BACKUP_KEY, parseSaved, clearSaved } from '../lib/storage';
import { BUDGET_KEY, parseBudget } from '../lib/budgetStorage';

const fixture = name => readFileSync(path.join(__dirname, 'fixtures', name), 'utf8');

/** Minimal localStorage stand-in. failOn: key whose setItem throws (like a full quota). */
function fakeStorage(initial = {}, { failOn = null } = {}) {
  const map = new Map(Object.entries(initial));
  return {
    map,
    getItem: k => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { if (k === failOn) throw new Error('QuotaExceededError'); map.set(k, String(v)); },
    removeItem: k => { map.delete(k); },
  };
}

const plan = {
  debts: [
    { id: 'a', name: 'Visa', balance: 5000, rate: 22, minPayment: 150 },
    { id: 'b', name: 'Car', balance: 12000, rate: 6, minPayment: 300 },
  ],
  extraPayment: 200,
  strategy: 'snowball',
  customOrder: ['a', 'b'],
};
const history = [{ date: '2026-09-01T00:00:00.000Z', total: 17000 }];
const budget = {
  incomeCents: 500000,
  expenses: [{ id: 'e1', name: 'Rent', cents: 150000 }],
  debts: [{ id: 'plan-a', name: 'Visa', minimumCents: 15000, imported: true, sourceId: 'a' }],
  savingsCents: 20000,
  extraCents: 10000,
};
const home = { homePrice: 400000, downPayment: 40000, ratePercent: 6.5, loanYears: 30, annualPropertyTax: 4800, annualInsurance: 1500, monthlyMortgageInsurance: 120, monthlyHoa: 0 };
const current = () => JSON.parse(makeBackup({ planRecord: { plan, history }, budget, home }, new Date('2026-11-20T10:00:00Z')));
const read = obj => readBackup(JSON.stringify(obj));

describe('reading backups', () => {
  test('a valid current backup (plan, check-ins, budget and home)', () => {
    const r = readBackup(makeBackup({ planRecord: { plan, history }, budget, home }));
    expect(r.ok).toBe(true);
    expect(r.plan).toEqual(plan);
    expect(r.history).toEqual(history);
    expect(r.budget).toEqual(budget);
    expect(r.home).toEqual(home);
    expect(r.summary).toEqual({ debts: 2, checkIns: 1, expenses: 1, budgetDebts: 1, home: true });
  });

  test('a valid old backup made before this change still imports', () => {
    const raw = fixture('backup-v1-full.json');
    expect(JSON.parse(raw)).not.toHaveProperty('home');
    const r = readBackup(raw);
    expect(r.ok).toBe(true);
    expect(r.exportedAt).toBe('2026-11-01T09:30:00.000Z');
    expect(r.plan.strategy).toBe('custom');
    expect(r.plan.customOrder).toEqual(['debt-2', 'debt-1', 'debt-3']);
    expect(r.plan.debts.map(d => d.balance)).toEqual([4200.5, 13800, 0]);
    expect(r.history).toHaveLength(3);
    expect(r.budget.debts[0]).toEqual({ id: 'plan-debt-1', name: 'Visa card', minimumCents: 12000, imported: true, sourceId: 'debt-1' });
    expect(r.budget.debts[1].imported).toBe(false);
    expect(r.home).toBeNull();
  });

  test('a valid old plan-only backup still imports', () => {
    const r = readBackup(fixture('backup-v1-plan-only.json'));
    expect(r.ok).toBe(true);
    expect(r.budget).toBeNull();
    expect(r.summary).toEqual({ debts: 3, checkIns: 0, expenses: 0, budgetDebts: 0, home: false });
  });

  test('a file that is too large is rejected', () => {
    expect(readBackup('{}', MAX_BACKUP_BYTES + 1)).toEqual({ ok: false, error: 'That file is too large to be a ByeByeBalance backup.' });
    const padded = JSON.stringify({ ...current(), pad: 'x'.repeat(MAX_BACKUP_BYTES) });
    expect(readBackup(padded).error).toMatch(/too large/);
  });

  test('invalid JSON is rejected', () => {
    expect(readBackup('not json').error).toMatch(/couldn’t be read/);
    expect(readBackup('{"app":"byebyebalance",').ok).toBe(false);
    expect(readBackup('').ok).toBe(false);
  });

  test('wrong app, kind or version is rejected', () => {
    expect(read({ ...current(), app: 'other' }).error).toMatch(/isn’t a ByeByeBalance backup/);
    expect(read({ ...current(), kind: 'export' }).ok).toBe(false);
    expect(read({ ...current(), version: 2 }).error).toMatch(/newer version/);
    expect(read({ ...current(), version: '1' }).ok).toBe(false);
    expect(readBackup('[]').ok).toBe(false);
    expect(readBackup('null').ok).toBe(false);
  });

  test('wrong types are rejected, not coerced', () => {
    const cases = [
      b => { b.plan.plan.debts[0].balance = '5000'; },
      b => { b.plan.plan.debts[0].rate = true; },
      b => { b.plan.plan.debts[0].minPayment = null; },
      b => { b.plan.plan.debts[0].name = { text: 'Visa' }; },
      b => { b.plan.plan.debts[0].id = 7; },
      b => { b.plan.plan.extraPayment = '200'; },
      b => { b.plan.plan.strategy = 'fastest'; },
      b => { b.plan.plan.debts = 'Visa'; },
      b => { b.plan.history = [{ date: 'yesterday', total: 1 }]; },
      b => { b.plan.history[0].total = '17000'; },
      b => { b.budget.incomeCents = '500000'; },
      b => { b.budget.expenses[0].cents = 12.5; },
      b => { b.budget.debts[0].imported = 'yes'; },
      b => { b.budget.expenses = {}; },
      b => { b.home.ratePercent = '6.5'; },
      b => { b.plan = 'everything'; },
    ];
    for (const mutate of cases) {
      const b = current();
      mutate(b);
      const r = read(b);
      expect(r.ok).toBe(false);
      expect(r.error).toMatch(/isn’t valid|damaged|isn’t a number/);
    }
  });

  test('out-of-range values are rejected with a clear message', () => {
    const expectError = (mutate, msg) => { const b = current(); mutate(b); expect(read(b).error).toMatch(msg); };
    expectError(b => { b.plan.plan.debts[0].balance = -1; }, /balance is negative/);
    expectError(b => { b.plan.plan.debts[0].balance = 1e12; }, /balance is negative or too large/);
    expectError(b => { b.plan.plan.debts[0].rate = 101; }, /APR is outside 0 to 100/);
    expectError(b => { b.plan.plan.debts[0].rate = -0.5; }, /APR is outside 0 to 100/);
    expectError(b => { b.plan.plan.debts[0].minPayment = -10; }, /minimum payment/);
    expectError(b => { b.plan.plan.extraPayment = -5; }, /extra payment/);
    expectError(b => { b.plan.plan.debts = []; }, /1 to 50 debts/);
    expectError(b => { b.plan.plan.debts = Array.from({ length: 51 }, (_, i) => ({ ...plan.debts[0], id: `d${i}` })); b.plan.plan.customOrder = []; }, /1 to 50 debts/);
    expectError(b => { b.plan.history[0].total = -1; }, /check-in total/);
    expectError(b => { b.budget.savingsCents = -100; }, /negative/);
    expectError(b => { b.home.downPayment = -1; }, /negative/);
    expectError(b => { b.home.ratePercent = 150; }, /outside 0 to 100/);
    // Every message says nothing changed (except the generic file-level ones).
    const b = current(); b.plan.plan.debts[0].rate = 400;
    expect(read(b).error).toMatch(/Nothing was changed\.$/);
  });

  test('a __proto__ key is rejected, at the top level or nested', () => {
    const top = makeBackup({ planRecord: { plan, history }, budget }).replace('"version": 1,', '"version": 1, "__proto__": { "polluted": true },');
    expect(readBackup(top).error).toMatch(/doesn’t use/);
    const nested = makeBackup({ planRecord: { plan, history }, budget }).replace('"name": "Visa",', '"name": "Visa", "__proto__": { "isAdmin": true },');
    expect(readBackup(nested).ok).toBe(false);
    expect({}.polluted).toBeUndefined();
    expect({}.isAdmin).toBeUndefined();
  });

  test('constructor and prototype keys, and forbidden ids, are rejected', () => {
    const b1 = current(); b1.budget.constructor = { prototype: {} };
    expect(read(b1).ok).toBe(false);
    const b2 = current(); b2.home.prototype = 1;
    expect(read(b2).ok).toBe(false);
    const b3 = current(); b3.plan.plan.debts[0].id = '__proto__'; b3.plan.plan.customOrder = ['__proto__', 'b'];
    expect(read(b3).ok).toBe(false);
    expect(hasForbiddenKeys(JSON.parse('{"a":[{"b":{"constructor":1}}]}'))).toBe(true);
    expect(hasForbiddenKeys(current())).toBe(false);
  });

  test('absurdly nested files are rejected', () => {
    const b = current();
    let deep = {};
    const root = deep;
    for (let i = 0; i < 50; i += 1) { deep.x = {}; deep = deep.x; }
    b.extra = root;
    expect(read(b).ok).toBe(false);
  });

  test('imported text stays plain text', () => {
    const b = current();
    b.budget.expenses[0].name = '<img src=x onerror=alert(1)>';
    expect(read(b).budget.expenses[0].name).toBe('<img src=x onerror=alert(1)>');
  });
});

describe('applying backups', () => {
  const existing = () => ({
    [PLAN_KEY]: JSON.stringify({ version: 2, plan: { ...plan, debts: [plan.debts[0]], customOrder: ['a'] }, history: [], savedAt: '2026-10-01T00:00:00.000Z' }),
    [BUDGET_KEY]: JSON.stringify({ version: 1, budget: { ...budget, expenses: [{ id: 'e9', name: 'Gym', cents: 4000 }] }, savedAt: '2026-10-01T00:00:00.000Z' }),
    'byebyebalance-data': '{"debts":[]}',
  });

  test('replace writes plan, check-ins, budget and home in the stored formats', () => {
    const s = fakeStorage(existing());
    const r = applyBackup(readBackup(fixture('backup-v1-full.json')), 'replace', { storage: s });
    expect(r).toEqual({ ok: true });
    const savedPlan = parseSaved(s.getItem(PLAN_KEY));
    expect(savedPlan.plan.debts).toHaveLength(3);
    expect(savedPlan.history).toHaveLength(3);
    expect(parseBudget(s.getItem(BUDGET_KEY)).budget.expenses.map(e => e.name)).toEqual(['Housing', 'Groceries']);
    expect(s.getItem(HOME_KEY)).toBeNull(); // old backup has no home; nothing written
    expect(s.getItem('byebyebalance-data')).toBe('{"debts":[]}'); // other keys untouched
    const withHome = applyBackup(readBackup(makeBackup({ planRecord: null, budget: null, home })), 'replace', { storage: s });
    expect(withHome.ok).toBe(true);
    expect(JSON.parse(s.getItem(HOME_KEY))).toEqual(home);
  });

  test('merge keeps the saved plan and adds budget rows', () => {
    const s = fakeStorage(existing());
    const before = s.getItem(PLAN_KEY);
    expect(applyBackup(readBackup(fixture('backup-v1-full.json')), 'merge', { storage: s }).ok).toBe(true);
    expect(s.getItem(PLAN_KEY)).toBe(before);
    expect(parseBudget(s.getItem(BUDGET_KEY)).budget.expenses.map(e => e.name)).toEqual(['Gym', 'Housing', 'Groceries']);
  });

  test('merge uses the budget on screen when given one', () => {
    const s = fakeStorage(existing());
    const onScreen = { ...budget, expenses: [{ id: 'e5', name: 'Phone', cents: 6000 }] };
    applyBackup(readBackup(fixture('backup-v1-full.json')), 'merge', { storage: s, currentBudget: onScreen });
    expect(parseBudget(s.getItem(BUDGET_KEY)).budget.expenses.map(e => e.name)).toEqual(['Phone', 'Housing', 'Groceries']);
  });

  test('merge fills an empty device with everything', () => {
    const s = fakeStorage();
    expect(applyBackup(readBackup(makeBackup({ planRecord: { plan, history }, budget, home })), 'merge', { storage: s }).ok).toBe(true);
    expect(parseSaved(s.getItem(PLAN_KEY)).plan).toEqual(plan);
    expect(JSON.parse(s.getItem(HOME_KEY))).toEqual(home);
  });

  test.each(['replace', 'merge'])('%s is all or nothing: a failed write leaves every key as it was', mode => {
    const start = { ...existing(), [HOME_KEY]: JSON.stringify(home) };
    const s = fakeStorage(start, { failOn: mode === 'replace' ? HOME_KEY : BUDGET_KEY });
    const incoming = readBackup(makeBackup({ planRecord: { plan, history }, budget, home: { ...home, homePrice: 1 } }));
    const r = applyBackup(incoming, mode, { storage: s });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/nothing was changed/);
    expect(Object.fromEntries(s.map)).toEqual(start);
  });

  test('a failed write on an empty device leaves it empty', () => {
    const s = fakeStorage({}, { failOn: BUDGET_KEY });
    expect(applyBackup(readBackup(makeBackup({ planRecord: { plan, history }, budget })), 'replace', { storage: s }).ok).toBe(false);
    expect(s.map.size).toBe(0);
  });

  test('a merge that would overflow the budget changes nothing', () => {
    const many = n => Array.from({ length: n }, (_, i) => ({ id: `x${n}-${i}`, name: 'Row', cents: 100 }));
    const start = { [BUDGET_KEY]: JSON.stringify({ version: 1, budget: { ...budget, expenses: many(30) } }) };
    const s = fakeStorage(start);
    const r = applyBackup(readBackup(makeBackup({ planRecord: null, budget: { ...budget, expenses: many(31) } })), 'merge', { storage: s });
    expect(r.ok).toBe(false);
    expect(Object.fromEntries(s.map)).toEqual(start);
  });

  test('invalid input is refused without touching storage', () => {
    const s = fakeStorage(existing());
    expect(applyBackup(readBackup('nope'), 'replace', { storage: s }).ok).toBe(false);
    expect(applyBackup(readBackup(fixture('backup-v1-full.json')), 'overwrite', { storage: s }).ok).toBe(false);
    expect(applyBackup(readBackup(fixture('backup-v1-full.json')), 'replace', { storage: null }).ok).toBe(false);
    expect(Object.fromEntries(s.map)).toEqual(existing());
  });
});

describe('first save', () => {
  const origNavigator = global.navigator;
  afterEach(() => { Object.defineProperty(global, 'navigator', { value: origNavigator, configurable: true }); });
  const setNavigator = value => Object.defineProperty(global, 'navigator', { value, configurable: true });

  test('the tip shows once and persistent storage is requested once', () => {
    const persist = jest.fn(() => Promise.resolve(true));
    setNavigator({ storage: { persist } });
    const s = fakeStorage();
    expect(noteFirstSave(s)).toBe(true);
    expect(s.getItem(BACKUP_TIP_KEY)).toBe('1');
    expect(noteFirstSave(s)).toBe(false);
    expect(persist).toHaveBeenCalledTimes(1);
  });

  test('a denied, rejected or unsupported persist() is silent', async () => {
    setNavigator({ storage: { persist: () => Promise.reject(new Error('denied')) } });
    expect(noteFirstSave(fakeStorage())).toBe(true);
    setNavigator({ storage: { persist: () => { throw new Error('nope'); } } });
    expect(noteFirstSave(fakeStorage())).toBe(true);
    setNavigator({});
    expect(noteFirstSave(fakeStorage())).toBe(true);
    setNavigator(undefined);
    expect(noteFirstSave(fakeStorage())).toBe(true);
    await new Promise(r => setTimeout(r, 0)); // no unhandled rejection
  });

  test('no storage means no tip', () => {
    expect(noteFirstSave(null)).toBe(false);
  });
});

describe('last backup badge', () => {
  const now = new Date(2026, 10, 23, 15, 0); // 23 Nov 2026, 3pm local
  const at = (...a) => new Date(...a).toISOString();

  test.each([
    ['no value', null, 'none', 'No backup saved yet'],
    ['today', at(2026, 10, 23, 0, 5), 'fresh', 'Last backup: today'],
    ['yesterday (late evening)', at(2026, 10, 22, 23, 59), 'fresh', 'Last backup: yesterday'],
    ['5 days', at(2026, 10, 18, 9, 0), 'fresh', 'Last backup: 5 days ago'],
    ['30 days', at(2026, 9, 24, 12, 0), 'fresh', 'Last backup: 30 days ago'],
    ['31 days', at(2026, 9, 23, 12, 0), 'stale', 'Last backup: 31 days ago'],
    ['invalid text', 'last tuesday', 'none', 'No backup saved yet'],
    ['wrong type', 12345, 'none', 'No backup saved yet'],
    ['empty string', '', 'none', 'No backup saved yet'],
    ['far future', at(2027, 0, 1), 'none', 'No backup saved yet'],
  ])('%s', (_, raw, tone, text) => {
    expect(lastBackupStatus(raw, now)).toEqual({ tone, text });
  });
});

describe('last backup key', () => {
  const data = { planRecord: { plan, history }, budget, home, empty: false };
  const now = new Date('2026-11-23T15:00:00.000Z');

  test('is set after the export file is created and the download starts', () => {
    const s = fakeStorage();
    const calls = [];
    const download = (name, text) => { calls.push([name, JSON.parse(text).kind, s.getItem(LAST_BACKUP_KEY)]); };
    expect(exportBackup(data, { download, storage: s, now })).toBe('2026-11-23T15:00:00.000Z');
    expect(calls).toEqual([['byebyebalance-backup-2026-11-23.json', 'backup', null]]); // not set before the download
    expect(readLastBackup(s)).toBe('2026-11-23T15:00:00.000Z');
  });

  test('is not set when the download fails or there is nothing to export', () => {
    const s = fakeStorage();
    expect(() => exportBackup(data, { download: () => { throw new Error('blocked'); }, storage: s, now })).toThrow();
    expect(exportBackup({ empty: true }, { download: jest.fn(), storage: s, now })).toBeNull();
    expect(s.getItem(LAST_BACKUP_KEY)).toBeNull();
  });

  test('is not set by restoring a backup', () => {
    const s = fakeStorage();
    expect(applyBackup(readBackup(fixture('backup-v1-full.json')), 'replace', { storage: s }).ok).toBe(true);
    expect(applyBackup(readBackup(fixture('backup-v1-full.json')), 'merge', { storage: s }).ok).toBe(true);
    expect(s.getItem(LAST_BACKUP_KEY)).toBeNull();
  });

  test('is removed by clear saved data', () => {
    const s = fakeStorage({ [LAST_BACKUP_KEY]: now.toISOString(), [BACKUP_TIP_KEY]: '1', [PLAN_KEY]: 'x', unrelated: 'keep' });
    const origWindow = global.window;
    global.window = { localStorage: s };
    try { expect(clearSaved()).toBe(true); } finally { global.window = origWindow; }
    expect(s.getItem(LAST_BACKUP_KEY)).toBeNull();
    expect(s.getItem(BACKUP_TIP_KEY)).toBeNull();
    expect(s.getItem('unrelated')).toBe('keep');
  });
});
