/**
 * Backup files: everything saved on this device in one JSON file.
 * Nothing is uploaded; files are created and read in the browser.
 *
 * File format (version 1, unchanged; `home` was added as an optional field):
 *   { app: 'byebyebalance', kind: 'backup', version: 1, exportedAt,
 *     plan: { plan, history } | null, budget | null, home? | null }
 *
 * Imported files are untrusted. readBackup() parses with JSON.parse only,
 * rejects forbidden keys, and checks exact types and ranges before the
 * existing sanitizers make clean copies. These checks apply to backup files
 * only; loading saved data (including the old site's migration) is unchanged.
 *
 * Pure functions are exported for tests. Browser helpers must only be called
 * after hydration (inside useEffect or event handlers).
 */
import { MAX_CENTS } from './budget';
import {
  PLAN_KEY, HOME_KEY, BACKUP_TIP_KEY, LAST_BACKUP_KEY,
  parseSaved, sanitizePlan, sanitizeHistory, sanitizeHome, loadPlan, loadHome,
} from './storage';
import { BUDGET_KEY, EMPTY_BUDGET, sanitizeBudget, parseBudget, mergeBudgets, loadBudget } from './budgetStorage';

export const MAX_BACKUP_BYTES = 512 * 1024;
export const BACKUP_TIP =
  'Saved on this device. Tip: export a backup file so clearing browser data can’t erase your plan.';

const MAX_AMOUNT = MAX_CENTS / 100; // same $100M ceiling the budget uses
const MAX_ROWS = 50;
const MAX_HISTORY = 240;
const MAX_TEXT = 200; // generous; the sanitizers trim names to their stored length
const MAX_DEPTH = 8; // a real backup is 5 levels deep
const FORBIDDEN = new Set(['__proto__', 'constructor', 'prototype']);
const STRATEGIES = ['snowball', 'avalanche', 'custom'];
const HOME_FIELDS = ['homePrice', 'downPayment', 'ratePercent', 'loanYears', 'annualPropertyTax', 'annualInsurance', 'monthlyMortgageInsurance', 'monthlyHoa'];

const MSG = {
  tooLarge: 'That file is too large to be a ByeByeBalance backup.',
  unreadable: 'That file isn’t a valid backup (it couldn’t be read).',
  foreign: 'That file isn’t a ByeByeBalance backup.',
  newer: 'This backup was made by a newer version of ByeByeBalance.',
  forbidden: 'This backup contains data ByeByeBalance doesn’t use, so nothing was changed.',
  empty: 'This backup is empty.',
};
const damaged = (part, reason) => `The ${part} in this backup isn’t valid: ${reason}. Nothing was changed.`;

const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const inRange = (v, lo, hi) => isNum(v) && v >= lo && v <= hi;
const isText = v => typeof v === 'string' && v.length <= MAX_TEXT;
const isId = v => typeof v === 'string' && v.length > 0 && v.length <= 100 && !FORBIDDEN.has(v);

/** True when any object key (at any depth) is __proto__, constructor or prototype, or nesting is absurd. */
export function hasForbiddenKeys(value, depth = 0) {
  if (value === null || typeof value !== 'object') return false;
  if (depth > MAX_DEPTH) return true;
  if (Array.isArray(value)) return value.some(v => hasForbiddenKeys(v, depth + 1));
  return Object.keys(value).some(k => FORBIDDEN.has(k) || hasForbiddenKeys(value[k], depth + 1));
}

/* ---------- strict checks: return a reason string, or null when valid ---------- */

function checkPlan(p) {
  if (!isObj(p) || !Array.isArray(p.debts)) return 'the debts list is missing';
  if (p.debts.length === 0 || p.debts.length > MAX_ROWS) return `it must have 1 to ${MAX_ROWS} debts`;
  const ids = new Set();
  for (const d of p.debts) {
    if (!isObj(d) || !isId(d.id) || !isText(d.name)) return 'a debt is missing its name or id';
    if (ids.has(d.id)) return 'two debts share the same id';
    ids.add(d.id);
    if (![d.balance, d.rate, d.minPayment].every(isNum)) return 'a balance, APR or payment isn’t a number';
    if (!inRange(d.balance, 0, MAX_AMOUNT)) return 'a balance is negative or too large';
    if (!inRange(d.rate, 0, 100)) return 'an APR is outside 0 to 100';
    if (!inRange(d.minPayment, 0, MAX_AMOUNT)) return 'a minimum payment is negative or too large';
  }
  if (!inRange(p.extraPayment, 0, MAX_AMOUNT)) return 'the extra payment is negative, too large or not a number';
  if (!STRATEGIES.includes(p.strategy)) return 'the payoff strategy isn’t recognized';
  if (p.customOrder !== undefined) {
    if (!Array.isArray(p.customOrder) || p.customOrder.length > MAX_ROWS) return 'the debt order is damaged';
    if (!p.customOrder.every(id => typeof id === 'string' && ids.has(id))) return 'the debt order refers to unknown debts';
  }
  return null;
}

function checkHistory(h) {
  if (h === undefined) return null;
  if (!Array.isArray(h) || h.length > MAX_HISTORY) return 'the check-in history is damaged';
  for (const e of h) {
    if (!isObj(e) || typeof e.date !== 'string' || e.date.length > 40 || Number.isNaN(Date.parse(e.date))) return 'a check-in date isn’t valid';
    if (!inRange(e.total, 0, MAX_AMOUNT * MAX_ROWS)) return 'a check-in total is negative, too large or not a number';
  }
  return null;
}

function checkBudget(b) {
  const cents = v => Number.isSafeInteger(v) && v >= 0 && v <= MAX_CENTS;
  if (!isObj(b) || !Array.isArray(b.expenses) || !Array.isArray(b.debts)) return 'the expenses or debt payments are missing';
  if (![b.incomeCents, b.savingsCents, b.extraCents].every(cents)) return 'income, savings or extra payment is negative, too large or not a whole number of cents';
  if (b.expenses.length > MAX_ROWS || b.debts.length > MAX_ROWS) return `it has more than ${MAX_ROWS} rows`;
  for (const e of b.expenses) {
    if (!isObj(e) || !isId(e.id) || !isText(e.name)) return 'an expense is missing its name or id';
    if (!cents(e.cents)) return 'an expense amount is negative, too large or not a number';
  }
  for (const d of b.debts) {
    if (!isObj(d) || !isId(d.id) || !isText(d.name)) return 'a debt payment is missing its name or id';
    if (!cents(d.minimumCents)) return 'a debt payment is negative, too large or not a number';
    if (d.imported !== undefined && typeof d.imported !== 'boolean') return 'a debt payment is damaged';
    if (d.sourceId !== undefined && !isId(d.sourceId)) return 'a debt payment is damaged';
  }
  return null;
}

function checkHome(h) {
  if (!isObj(h)) return 'the home numbers are missing';
  if (!HOME_FIELDS.every(f => isNum(h[f]))) return 'a home number isn’t a number';
  if (!HOME_FIELDS.every(f => h[f] >= 0)) return 'a home number is negative';
  if (h.ratePercent > 100) return 'the mortgage rate is outside 0 to 100';
  if (h.loanYears > 100) return 'the loan length is too long';
  if (HOME_FIELDS.some(f => f !== 'ratePercent' && f !== 'loanYears' && h[f] > MAX_AMOUNT)) return 'a home amount is too large';
  return null;
}

/* ---------- file format ---------- */

export function makeBackup({ planRecord, budget, home }, now = new Date()) {
  return JSON.stringify({
    app: 'byebyebalance',
    kind: 'backup',
    version: 1,
    exportedAt: now.toISOString(),
    plan: planRecord ? { plan: planRecord.plan, history: planRecord.history || [] } : null,
    budget: (budget && sanitizeBudget(budget)) || null,
    home: (home && sanitizeHome(home)) || null,
  }, null, 2);
}

/**
 * Validate a backup file's text before anything is changed.
 * Returns { ok: true, plan, history, budget, home, exportedAt, summary } or { ok: false, error }.
 */
export function readBackup(textContent, byteLength = textContent.length) {
  if (typeof textContent !== 'string') return { ok: false, error: MSG.unreadable };
  if (byteLength > MAX_BACKUP_BYTES || textContent.length > MAX_BACKUP_BYTES) return { ok: false, error: MSG.tooLarge };
  let d;
  try { d = JSON.parse(textContent); } catch { return { ok: false, error: MSG.unreadable }; }
  if (!isObj(d) || d.app !== 'byebyebalance' || d.kind !== 'backup') return { ok: false, error: MSG.foreign };
  if (hasForbiddenKeys(d)) return { ok: false, error: MSG.forbidden };
  if (d.version !== 1) {
    return { ok: false, error: typeof d.version === 'number' && d.version > 1 ? MSG.newer : MSG.foreign };
  }

  let plan = null;
  let history = [];
  if (d.plan != null) {
    if (!isObj(d.plan)) return { ok: false, error: damaged('plan', 'it’s damaged') };
    const why = checkPlan(d.plan.plan) || checkHistory(d.plan.history);
    if (why) return { ok: false, error: damaged('plan', why) };
    plan = sanitizePlan(d.plan.plan);
    history = sanitizeHistory(d.plan.history);
    if (!plan) return { ok: false, error: damaged('plan', 'it’s damaged') };
  }

  let budget = null;
  if (d.budget != null) {
    const why = checkBudget(d.budget);
    if (why) return { ok: false, error: damaged('budget', why) };
    budget = sanitizeBudget(d.budget);
    if (!budget) return { ok: false, error: damaged('budget', 'two rows share the same id') };
  }

  let home = null;
  if (d.home != null) {
    const why = checkHome(d.home);
    if (why) return { ok: false, error: damaged('home numbers', why) };
    home = sanitizeHome(d.home);
    if (!home) return { ok: false, error: damaged('home numbers', 'they’re damaged') };
  }

  if (!plan && !budget && !home) return { ok: false, error: MSG.empty };
  return {
    ok: true,
    plan,
    history,
    budget,
    home,
    exportedAt: typeof d.exportedAt === 'string' && !Number.isNaN(Date.parse(d.exportedAt)) ? d.exportedAt : null,
    summary: {
      debts: plan ? plan.debts.length : 0,
      checkIns: history.length,
      expenses: budget ? budget.expenses.length : 0,
      budgetDebts: budget ? budget.debts.length : 0,
      home: !!home,
    },
  };
}

/* ---------- restore (all or nothing) ---------- */

function browserStore() {
  try {
    const s = window.localStorage;
    s.setItem('__bbb_probe__', '1');
    s.removeItem('__bbb_probe__');
    return s;
  } catch {
    return null;
  }
}

const readJson = raw => { try { return JSON.parse(raw); } catch { return null; } };

/**
 * Write a validated backup (from readBackup) to storage.
 * mode 'replace': the backup's plan, budget and home replace what is saved.
 * mode 'merge': keep the saved plan and home (fill them only when absent);
 *   merge budget rows into `currentBudget` (or the saved budget).
 * Every value is built and validated first; the writes are then checked by
 * reading them back. On any failure, every key is put back exactly as it was.
 * Returns { ok: true } or { ok: false, error }.
 */
export function applyBackup(backup, mode, { storage = browserStore(), currentBudget = null, now = new Date() } = {}) {
  const fail = { ok: false, error: 'Your data couldn’t be restored on this device, so nothing was changed.' };
  if (!storage || !backup || !backup.ok || (mode !== 'replace' && mode !== 'merge')) return fail;

  let before;
  try { before = [PLAN_KEY, BUDGET_KEY, HOME_KEY].map(k => [k, storage.getItem(k)]); } catch { return fail; }
  const saved = Object.fromEntries(before);
  const savedAt = now.toISOString();

  // Build every value before writing anything.
  const writes = [];
  if (backup.plan && (mode === 'replace' || !parseSaved(saved[PLAN_KEY]))) {
    const plan = sanitizePlan(backup.plan);
    if (!plan) return fail;
    writes.push([PLAN_KEY, JSON.stringify({ version: 2, plan, history: sanitizeHistory(backup.history), savedAt })]);
  }
  if (backup.budget) {
    const base = mode === 'merge'
      ? (currentBudget && sanitizeBudget(currentBudget)) || parseBudget(saved[BUDGET_KEY])?.budget || EMPTY_BUDGET
      : null;
    const next = sanitizeBudget(base ? mergeBudgets(base, backup.budget) : backup.budget);
    if (!next) return { ok: false, error: 'Merging would make the budget too long, so nothing was changed. Try Replace instead.' };
    writes.push([BUDGET_KEY, JSON.stringify({ version: 1, budget: next, savedAt })]);
  }
  if (backup.home && (mode === 'replace' || !sanitizeHome(readJson(saved[HOME_KEY])))) {
    const home = sanitizeHome(backup.home);
    if (!home) return fail;
    writes.push([HOME_KEY, JSON.stringify(home)]);
  }

  const verify = {
    [PLAN_KEY]: raw => parseSaved(raw) !== null,
    [BUDGET_KEY]: raw => parseBudget(raw) !== null,
    [HOME_KEY]: raw => sanitizeHome(readJson(raw)) !== null,
  };
  try {
    for (const [k, v] of writes) storage.setItem(k, v);
    for (const [k, v] of writes) {
      const raw = storage.getItem(k);
      if (raw !== v || !verify[k](raw)) throw new Error('verify failed');
    }
    return { ok: true };
  } catch {
    for (const [k, raw] of before) {
      try {
        if (raw === null) storage.removeItem(k);
        else storage.setItem(k, raw);
      } catch { /* best effort; the original value is still in place if this write never happened */ }
    }
    return fail;
  }
}

/* ---------- browser helpers ---------- */

/** Everything saved on this device. `budgetOverride` lets /budget use the budget on screen. */
export function collectBackupData(budgetOverride = null) {
  const planRecord = loadPlan().record;
  const budget = budgetOverride || loadBudget().budget || null;
  const home = loadHome();
  return { planRecord, budget, home, empty: !planRecord && !budget && !home };
}

/**
 * Build the backup file and start the download, then record when it happened.
 * The last-backup time is written only after download() returns without
 * throwing. Restoring never calls this. Returns the stored ISO string, or null.
 */
export function exportBackup(data, { download, storage = browserStore(), now = new Date() }) {
  if (!data || data.empty) return null;
  const file = makeBackup(data, now);
  download(`byebyebalance-backup-${now.toISOString().slice(0, 10)}.json`, file);
  const stamp = now.toISOString();
  try { storage?.setItem(LAST_BACKUP_KEY, stamp); } catch { /* the download still happened */ }
  return stamp;
}

export function readLastBackup(storage = browserStore()) {
  try { return storage ? storage.getItem(LAST_BACKUP_KEY) : null; } catch { return null; }
}

const DAY = 24 * 60 * 60 * 1000;
const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/**
 * Badge for the last backup. `raw` is the stored value.
 * Returns { tone: 'none' | 'fresh' | 'stale', text }. Calendar days, local time.
 * Missing, unreadable or far-future values count as no backup.
 */
export function lastBackupStatus(raw, now = new Date()) {
  const none = { tone: 'none', text: 'No backup saved yet' };
  if (typeof raw !== 'string' || raw.length > 40) return none;
  const t = Date.parse(raw);
  if (Number.isNaN(t) || t - now.getTime() > DAY) return none;
  const days = Math.max(0, Math.round((startOfDay(now) - startOfDay(new Date(t))) / DAY));
  const ago = days === 0 ? 'today' : days === 1 ? 'yesterday' : `${days} days ago`;
  return { tone: days <= 30 ? 'fresh' : 'stale', text: `Last backup: ${ago}` };
}

/** Ask the browser to keep this site's storage. Denied or unsupported does nothing. */
export function requestPersistentStorage() {
  try {
    const p = typeof navigator !== 'undefined' && navigator.storage && typeof navigator.storage.persist === 'function'
      ? navigator.storage.persist()
      : null;
    if (p && typeof p.catch === 'function') p.catch(() => {});
  } catch { /* unsupported */ }
}

/**
 * Call after any successful save. The first time, it records a flag, asks for
 * persistent storage, and returns true so the page can show the backup tip once.
 */
export function noteFirstSave(storage = browserStore()) {
  if (!storage) return false;
  try {
    if (storage.getItem(BACKUP_TIP_KEY)) return false;
    storage.setItem(BACKUP_TIP_KEY, '1');
  } catch {
    return false;
  }
  requestPersistentStorage();
  return true;
}
