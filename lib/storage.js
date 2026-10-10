/**
 * Device-local persistence (browser localStorage only — nothing leaves the device).
 *
 * Keys:
 *   byebyebalance:v2      { version: 2, plan, history, savedAt }
 *   byebyebalance:home:v1 home-buying scenario shared by mortgage/affordability pages
 *   byebyebalance-data    legacy (v1) auto-saved data from the previous site; migrated once
 *
 * Pure functions (parse/migrate/validate) are exported for tests.
 * Only call the load/save helpers after hydration (inside useEffect).
 */
import { LEGACY_DEFAULT_DEBTS } from './sampleData';

export const PLAN_KEY = 'byebyebalance:v2';
export const HOME_KEY = 'byebyebalance:home:v1';
export const LEGACY_KEY = 'byebyebalance-data';
const STRATEGIES = ['snowball', 'avalanche', 'custom'];

const num = x => typeof x === 'number' && Number.isFinite(x);

export function sanitizeDebt(d, i) {
  if (!d || typeof d !== 'object') return null;
  const balance = Number(d.balance);
  const rate = Number(d.rate);
  const minPayment = Number(d.minPayment);
  if (![balance, rate, minPayment].every(num) || balance < 0 || rate < 0 || rate > 100 || minPayment < 0) return null;
  return {
    id: d.id != null ? String(d.id) : `debt-${i + 1}`,
    name: typeof d.name === 'string' ? d.name.slice(0, 80) : `Debt ${i + 1}`,
    balance,
    rate,
    minPayment,
  };
}

export function sanitizePlan(p) {
  if (!p || typeof p !== 'object' || !Array.isArray(p.debts)) return null;
  const debts = p.debts.map(sanitizeDebt);
  if (debts.some(d => d === null) || debts.length === 0 || debts.length > 50) return null;
  const ids = new Set(debts.map(d => d.id));
  if (ids.size !== debts.length) debts.forEach((d, i) => { d.id = `debt-${i + 1}`; });
  const extraPayment = num(Number(p.extraPayment)) && Number(p.extraPayment) >= 0 ? Number(p.extraPayment) : 0;
  const strategy = STRATEGIES.includes(p.strategy) ? p.strategy : 'avalanche';
  const customOrder = Array.isArray(p.customOrder)
    ? p.customOrder.map(String).filter(id => debts.some(d => d.id === id))
    : [];
  debts.forEach(d => { if (!customOrder.includes(d.id)) customOrder.push(d.id); });
  return { debts, extraPayment, strategy, customOrder };
}

export function sanitizeHistory(h) {
  if (!Array.isArray(h)) return [];
  return h
    .filter(e => e && typeof e.date === 'string' && !Number.isNaN(Date.parse(e.date)) && num(e.total) && e.total >= 0)
    .map(e => ({ date: e.date, total: e.total }))
    .slice(-240);
}

/** Parse the v2 record. Returns null when absent or unusable. */
export function parseSaved(raw) {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    if (!data || data.version !== 2) return null;
    const plan = sanitizePlan(data.plan);
    if (!plan) return null;
    return { version: 2, plan, history: sanitizeHistory(data.history), savedAt: typeof data.savedAt === 'string' ? data.savedAt : null };
  } catch {
    return null;
  }
}

function isLegacyDefault(debts) {
  if (debts.length !== LEGACY_DEFAULT_DEBTS.length) return false;
  return debts.every((d, i) => {
    const s = LEGACY_DEFAULT_DEBTS[i];
    return d.name === s.name && d.balance === s.balance && d.rate === s.rate && d.minPayment === s.minPayment;
  });
}

/**
 * Migrate the old site's auto-saved record. The old site saved its pre-filled
 * sample debts too, so an untouched sample is NOT treated as personal data.
 */
export function migrateLegacy(raw) {
  if (!raw) return null;
  try {
    const old = JSON.parse(raw);
    if (!old || !Array.isArray(old.debts)) return null;
    const usable = old.debts.filter(d => d && Number(d.balance) > 0);
    if (usable.length === 0 || isLegacyDefault(old.debts)) return null;
    const plan = sanitizePlan({
      debts: usable,
      extraPayment: old.extraPayment,
      strategy: old.strategy,
    });
    if (!plan) return null;
    return { version: 2, plan, history: [], savedAt: typeof old.savedAt === 'string' ? old.savedAt : null, migrated: true };
  } catch {
    return null;
  }
}

export function sanitizeHome(h) {
  if (!h || typeof h !== 'object') return null;
  const fields = ['homePrice', 'downPayment', 'ratePercent', 'loanYears', 'annualPropertyTax', 'annualInsurance', 'monthlyMortgageInsurance', 'monthlyHoa'];
  const out = {};
  for (const f of fields) {
    const v = Number(h[f]);
    if (!num(v) || v < 0) return null;
    out[f] = v;
  }
  out.loanYears = Math.round(out.loanYears);
  return out;
}

/* ---------- browser helpers (call after hydration) ---------- */

function store() {
  try {
    const s = window.localStorage;
    const probe = '__bbb_probe__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

export function storageAvailable() {
  return store() !== null;
}

/** Returns { status: 'saved'|'migrated'|'none'|'corrupt'|'unavailable', record } */
export function loadPlan() {
  const s = store();
  if (!s) return { status: 'unavailable', record: null };
  const raw = s.getItem(PLAN_KEY);
  if (raw) {
    const rec = parseSaved(raw);
    return rec ? { status: 'saved', record: rec } : { status: 'corrupt', record: null };
  }
  const migrated = migrateLegacy(s.getItem(LEGACY_KEY));
  if (migrated) {
    try { s.setItem(PLAN_KEY, JSON.stringify(migrated)); } catch { /* keep legacy key */ }
    return { status: 'migrated', record: migrated };
  }
  return { status: 'none', record: null };
}

export function savePlan(plan, history = []) {
  const s = store();
  if (!s) return false;
  const clean = sanitizePlan(plan);
  if (!clean) return false;
  try {
    s.setItem(PLAN_KEY, JSON.stringify({ version: 2, plan: clean, history: sanitizeHistory(history), savedAt: new Date().toISOString() }));
    return true;
  } catch {
    return false;
  }
}

export function clearSaved() {
  const s = store();
  if (!s) return false;
  try {
    s.removeItem(PLAN_KEY);
    s.removeItem(LEGACY_KEY);
    s.removeItem(HOME_KEY);
    s.removeItem('byebyebalance:budget:v1');
    return true;
  } catch {
    return false;
  }
}

export function loadHome() {
  const s = store();
  if (!s) return null;
  try { return sanitizeHome(JSON.parse(s.getItem(HOME_KEY))); } catch { return null; }
}

export function saveHome(home) {
  const s = store();
  const clean = sanitizeHome(home);
  if (!s || !clean) return false;
  try { s.setItem(HOME_KEY, JSON.stringify(clean)); return true; } catch { return false; }
}
