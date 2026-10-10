/**
 * Monthly budget math. Pure functions, no React.
 *
 * Money is integer cents everywhere in this module so totals never drift.
 *   surplus = income - living expenses - debt minimums - savings
 *   buffer  = surplus - extra debt payment
 * Debt balances are never counted here; only monthly minimum payments.
 */

export const MAX_CENTS = 100_000_000_00; // $100M ceiling for any single entry

/** Parse what someone typed ("$1,250.5", "300", "") into cents. Returns null if invalid. */
export function parseCents(input) {
  if (typeof input === 'number') {
    if (!Number.isFinite(input) || input < 0) return null;
    return Math.round(input * 100);
  }
  const s = String(input ?? '').replace(/[$,\s]/g, '');
  if (s === '') return 0;
  if (!/^\d*(\.\d{0,2})?$/.test(s) || s === '.') return null;
  const [whole, frac = ''] = s.split('.');
  const cents = Number(whole || '0') * 100 + Number((frac + '00').slice(0, 2));
  return Number.isSafeInteger(cents) && cents <= MAX_CENTS ? cents : null;
}

export function sumCents(rows) {
  return rows.reduce((s, r) => s + (r ?? 0), 0);
}

/**
 * @param {{incomeCents:number, expenseCents:number[], minimumCents:number[], savingsCents:number, extraCents:number}} b
 */
export function computeBudget({ incomeCents = 0, expenseCents = [], minimumCents = [], savingsCents = 0, extraCents = 0 }) {
  const livingCents = sumCents(expenseCents);
  const minimumsCents = sumCents(minimumCents);
  const surplusCents = incomeCents - livingCents - minimumsCents - savingsCents;
  const bufferCents = surplusCents - extraCents;
  return {
    incomeCents,
    livingCents,
    minimumsCents,
    savingsCents,
    extraCents,
    surplusCents,
    bufferCents,
    shortfall: surplusCents < 0,
    extraTooHigh: extraCents > Math.max(0, surplusCents),
  };
}

/** Bar segments as shares of income (for the breakdown graphic). */
export function breakdown(b) {
  const base = Math.max(b.incomeCents, b.livingCents + b.minimumsCents + b.savingsCents + Math.max(0, b.extraCents), 1);
  const seg = (key, label, cents) => ({ key, label, cents, share: Math.max(0, cents) / base });
  const left = Math.max(0, b.bufferCents);
  return [
    seg('living', 'Living expenses', b.livingCents),
    seg('minimums', 'Debt minimums', b.minimumsCents),
    seg('savings', 'Savings', b.savingsCents),
    seg('extra', 'Extra debt payment', Math.min(b.extraCents, Math.max(0, b.surplusCents))),
    seg('left', 'Left over', left),
  ];
}

/* ---------- importing debts from the saved plan ---------- */

/**
 * Upsert plan debts into budget debt rows by source id. Manual rows are kept.
 * Never appends duplicates: an imported row with the same sourceId is updated.
 * @param {Array} rows   current budget debt rows
 * @param {Array} picked plan debts the person selected [{id,name,minPayment}]
 */
export function importDebts(rows, picked) {
  const next = rows.map(r => ({ ...r }));
  for (const d of picked) {
    const sourceId = String(d.id);
    const minimumCents = parseCents(d.minPayment) ?? 0;
    const i = next.findIndex(r => r.sourceId === sourceId);
    const row = { id: `plan-${sourceId}`, sourceId, name: d.name || 'Debt', minimumCents, imported: true };
    if (i >= 0) next[i] = { ...next[i], ...row };
    else next.push(row);
  }
  return next;
}

/**
 * Compare imported rows with the current saved plan.
 * Returns { changed: [{row, debt}], removed: [row] } — nothing is altered here.
 */
export function diffWithPlan(rows, planDebts) {
  const byId = new Map((planDebts || []).map(d => [String(d.id), d]));
  const changed = [];
  const removed = [];
  for (const r of rows) {
    if (!r.imported) continue;
    const d = byId.get(r.sourceId);
    if (!d) removed.push(r);
    else if (parseCents(d.minPayment) !== r.minimumCents || (d.name || 'Debt') !== r.name) changed.push({ row: r, debt: d });
  }
  return { changed, removed };
}

/* ---------- CSV (spreadsheet-safe) ---------- */

/** Escape a cell and neutralize spreadsheet formula injection (=, +, -, @, tab, CR). */
export function csvCell(v) {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const dollars = c => (c / 100).toFixed(2);

export function budgetCsv(state, totals, generatedAt = new Date()) {
  const lines = [['Section', 'Item', 'Monthly amount (USD)']];
  lines.push(['Income', 'Take-home income', dollars(totals.incomeCents)]);
  state.expenses.forEach(e => lines.push(['Living expense', e.name, dollars(e.cents)]));
  state.debts.forEach(d => lines.push(['Debt minimum', d.name, dollars(d.minimumCents)]));
  lines.push(['Savings', 'Savings contributions', dollars(totals.savingsCents)]);
  lines.push(['Total', 'Living expenses', dollars(totals.livingCents)]);
  lines.push(['Total', 'Debt minimums', dollars(totals.minimumsCents)]);
  lines.push(['Result', 'Available before extra debt payment', dollars(totals.surplusCents)]);
  lines.push(['Result', 'Extra debt payment', dollars(totals.extraCents)]);
  lines.push(['Result', 'Left after extra payment', dollars(totals.bufferCents)]);
  lines.push(['', `Generated ${generatedAt.toISOString().slice(0, 10)} by ByeByeBalance. Estimates only.`, '']);
  return lines.map(r => r.map(csvCell).join(',')).join('\n');
}
