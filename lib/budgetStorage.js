/**
 * Budget persistence and backup files (browser only; nothing leaves the device).
 *
 * Key: byebyebalance:budget:v1 -> { version: 1, budget, savedAt }
 * Backup file: { app: 'byebyebalance', kind: 'backup', version: 1, exportedAt, plan, budget }
 *
 * Pure parse/validate functions are exported for tests. Browser helpers must
 * only be called after hydration (inside useEffect or event handlers).
 */
import { MAX_CENTS } from './budget';
import { PLAN_KEY, parseSaved, sanitizePlan, sanitizeHistory } from './storage';

export const BUDGET_KEY = 'byebyebalance:budget:v1';
export const MAX_BACKUP_BYTES = 512 * 1024;

const cents = v => Number.isSafeInteger(v) && v >= 0 && v <= MAX_CENTS;
const text = (v, fallback) => (typeof v === 'string' && v.trim() ? v.slice(0, 60) : fallback);

export const EMPTY_BUDGET = {
  incomeCents: 0,
  expenses: [],
  debts: [],
  savingsCents: 0,
  extraCents: 0,
};

/** Validate a budget object. Returns a clean copy or null. */
export function sanitizeBudget(b) {
  if (!b || typeof b !== 'object') return null;
  if (![b.incomeCents, b.savingsCents, b.extraCents].every(cents)) return null;
  if (!Array.isArray(b.expenses) || !Array.isArray(b.debts)) return null;
  if (b.expenses.length > 50 || b.debts.length > 50) return null;
  const expenses = [];
  for (const [i, e] of b.expenses.entries()) {
    if (!e || !cents(e.cents)) return null;
    expenses.push({ id: text(e.id, `exp-${i}`), name: text(e.name, 'Expense'), cents: e.cents });
  }
  const debts = [];
  for (const [i, d] of b.debts.entries()) {
    if (!d || !cents(d.minimumCents)) return null;
    debts.push({
      id: text(d.id, `debt-${i}`),
      name: text(d.name, 'Debt'),
      minimumCents: d.minimumCents,
      imported: d.imported === true,
      ...(d.imported === true ? { sourceId: text(String(d.sourceId ?? ''), '') } : {}),
    });
  }
  const ids = [...expenses, ...debts].map(x => x.id);
  if (new Set(ids).size !== ids.length) return null;
  return { incomeCents: b.incomeCents, expenses, debts, savingsCents: b.savingsCents, extraCents: b.extraCents };
}

export function parseBudget(raw) {
  if (!raw) return null;
  try {
    const d = JSON.parse(raw);
    if (!d || d.version !== 1) return null;
    const budget = sanitizeBudget(d.budget);
    return budget ? { budget, savedAt: typeof d.savedAt === 'string' ? d.savedAt : null } : null;
  } catch {
    return null;
  }
}

/* ---------- backup files ---------- */

export function makeBackup({ planRecord, budget }, now = new Date()) {
  return JSON.stringify({
    app: 'byebyebalance',
    kind: 'backup',
    version: 1,
    exportedAt: now.toISOString(),
    plan: planRecord ? { plan: planRecord.plan, history: planRecord.history || [] } : null,
    budget: budget || null,
  }, null, 2);
}

/**
 * Validate a backup file's text before anything is changed.
 * Returns { ok: true, plan, history, budget, summary } or { ok: false, error }.
 */
export function readBackup(textContent, byteLength = textContent.length) {
  if (byteLength > MAX_BACKUP_BYTES) return { ok: false, error: 'That file is too large to be a ByeByeBalance backup.' };
  let d;
  try { d = JSON.parse(textContent); } catch { return { ok: false, error: 'That file isn’t a valid backup (it couldn’t be read).' }; }
  if (!d || d.app !== 'byebyebalance' || d.kind !== 'backup') return { ok: false, error: 'That file isn’t a ByeByeBalance backup.' };
  if (d.version !== 1) return { ok: false, error: 'This backup was made by a newer version of ByeByeBalance.' };
  let plan = null;
  let history = [];
  if (d.plan != null) {
    plan = sanitizePlan(d.plan.plan);
    if (!plan) return { ok: false, error: 'The plan in this backup is damaged, so nothing was changed.' };
    history = sanitizeHistory(d.plan.history);
  }
  let budget = null;
  if (d.budget != null) {
    budget = sanitizeBudget(d.budget);
    if (!budget) return { ok: false, error: 'The budget in this backup is damaged, so nothing was changed.' };
  }
  if (!plan && !budget) return { ok: false, error: 'This backup is empty.' };
  return {
    ok: true,
    plan,
    history,
    budget,
    exportedAt: typeof d.exportedAt === 'string' ? d.exportedAt : null,
    summary: {
      debts: plan ? plan.debts.length : 0,
      checkIns: history.length,
      expenses: budget ? budget.expenses.length : 0,
      budgetDebts: budget ? budget.debts.length : 0,
    },
  };
}

/** Merge: keep current rows, add backup rows whose ids aren't present; take backup numbers only where current ones are empty. */
export function mergeBudgets(current, incoming) {
  const pick = (a, b) => (a > 0 ? a : b);
  const addNew = (mine, theirs) => [...mine, ...theirs.filter(t => !mine.some(m => m.id === t.id))];
  return {
    incomeCents: pick(current.incomeCents, incoming.incomeCents),
    expenses: addNew(current.expenses, incoming.expenses),
    debts: addNew(current.debts, incoming.debts),
    savingsCents: pick(current.savingsCents, incoming.savingsCents),
    extraCents: pick(current.extraCents, incoming.extraCents),
  };
}

/* ---------- browser helpers ---------- */

function store() {
  try {
    const s = window.localStorage;
    s.setItem('__bbb_probe__', '1');
    s.removeItem('__bbb_probe__');
    return s;
  } catch {
    return null;
  }
}

/** { status: 'saved'|'none'|'corrupt'|'unavailable', budget, savedAt } */
export function loadBudget() {
  const s = store();
  if (!s) return { status: 'unavailable', budget: null };
  const raw = s.getItem(BUDGET_KEY);
  if (!raw) return { status: 'none', budget: null };
  const rec = parseBudget(raw);
  return rec ? { status: 'saved', ...rec } : { status: 'corrupt', budget: null };
}

/** Returns 'ok' | 'unavailable' | 'full' | 'invalid'. */
export function saveBudget(budget) {
  const s = store();
  if (!s) return 'unavailable';
  const clean = sanitizeBudget(budget);
  if (!clean) return 'invalid';
  try {
    s.setItem(BUDGET_KEY, JSON.stringify({ version: 1, budget: clean, savedAt: new Date().toISOString() }));
    return 'ok';
  } catch {
    return 'full';
  }
}

/** Write a restored plan record (v2 format) as-is. */
export function writePlanRecord(plan, history) {
  const s = store();
  if (!s) return false;
  try {
    s.setItem(PLAN_KEY, JSON.stringify({ version: 2, plan, history, savedAt: new Date().toISOString() }));
    return parseSaved(s.getItem(PLAN_KEY)) !== null;
  } catch {
    return false;
  }
}
