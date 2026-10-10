'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PageTitle, Metric } from '../_components/Cards';
import { Arrow } from '../_components/Icons';
import { HandMark } from '../_components/Logo';
import { useToast } from '../_components/useToast';
import { parseCents, computeBudget, breakdown, importDebts, diffWithPlan, budgetCsv } from '../../lib/budget';
import { BUDGET_KEY, EMPTY_BUDGET, loadBudget, saveBudget, makeBackup, readBackup, mergeBudgets, writePlanRecord } from '../../lib/budgetStorage';
import { PLAN_KEY, loadPlan, savePlan, sanitizePlan } from '../../lib/storage';
import { downloadText } from '../../lib/exportCsv';

const DEFAULT_EXPENSES = ['Housing', 'Utilities', 'Groceries', 'Transportation', 'Childcare', 'Insurance', 'Other spending'];
const EXAMPLE = {
  income: '6200',
  savings: '400',
  extra: '300',
  expenses: [['Housing', '1800'], ['Utilities', '250'], ['Groceries', '600'], ['Transportation', '280'], ['Childcare', '650'], ['Insurance', '180'], ['Other spending', '240']],
  debts: [['Credit card', '300'], ['Car loan', '260'], ['Personal loan', '150']],
};
const COLORS = { living: '#137b57', minimums: '#538cba', savings: '#8cc5ad', extra: '#c6a258', left: '#dfe7e3' };
const HOUSING_DEBT = /mortgage|home|house|rent/i;

let uid = 0;
const newId = p => `${p}-${Date.now().toString(36)}-${(uid += 1)}`;
const fmt = c => (c / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: c % 100 ? 2 : 0 });
const whole = c => (c / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const str = c => (c ? String(c / 100) : '');

function emptyDraft() {
  return {
    income: '', savings: '', extra: '',
    expenses: DEFAULT_EXPENSES.map(name => ({ id: newId('exp'), name, amount: '' })),
    debts: [],
  };
}
function toDraft(b) {
  return {
    income: str(b.incomeCents), savings: str(b.savingsCents), extra: str(b.extraCents),
    expenses: b.expenses.map(e => ({ id: e.id, name: e.name, amount: str(e.cents) })),
    debts: b.debts.map(d => ({ id: d.id, name: d.name, amount: str(d.minimumCents), imported: d.imported, sourceId: d.sourceId })),
  };
}
function fromDraft(d) {
  const errors = {};
  const c = (key, v) => { const x = parseCents(v); if (x === null) errors[key] = 'Enter an amount of $0 or more.'; return x ?? 0; };
  const budget = {
    incomeCents: c('income', d.income),
    savingsCents: c('savings', d.savings),
    extraCents: c('extra', d.extra),
    expenses: d.expenses.map(e => ({ id: e.id, name: e.name.trim() || 'Expense', cents: c(e.id, e.amount) })),
    debts: d.debts.map(x => ({ id: x.id, name: x.name.trim() || 'Debt', minimumCents: c(x.id, x.amount), imported: !!x.imported, ...(x.imported ? { sourceId: x.sourceId } : {}) })),
  };
  return { budget, errors, ok: Object.keys(errors).length === 0 };
}
const isBlank = d => !d.income && !d.savings && !d.extra && d.expenses.every(e => !e.amount) && d.debts.length === 0;

function Money({ id, label, value, onChange, error, hideLabel, ...rest }) {
  return (
    <div className="field budget-money">
      <label htmlFor={id} className={hideLabel ? 'visually-hidden' : undefined}>{label}</label>
      <div className="money-input" data-invalid={error ? 'true' : undefined}>
        <span aria-hidden="true">$</span>
        <input id={id} type="text" inputMode="decimal" autoComplete="off" placeholder="0" value={value} onChange={e => onChange(e.target.value)}
          aria-invalid={error ? 'true' : undefined} aria-describedby={error ? `${id}-err` : undefined} {...rest} />
      </div>
      {error && <span id={`${id}-err`} className="error">{error}</span>}
    </div>
  );
}

export default function BudgetApp() {
  const [draft, setDraft] = useState(emptyDraft);
  const [ready, setReady] = useState(false);
  const [storage, setStorage] = useState('ok'); // ok | unavailable | corrupt
  const [saveState, setSaveState] = useState(''); // '' | saved | error message
  const [plan, setPlan] = useState(null); // saved plan record from My plan
  const [picker, setPicker] = useState(null); // { selected: Set } while choosing debts to import
  const [restore, setRestore] = useState(null); // validated backup awaiting confirmation
  const [otherTab, setOtherTab] = useState(false);
  const [toast, toastNode] = useToast();
  const touched = useRef(false);
  const fileRef = useRef(null);

  const refreshPlan = useCallback(() => setPlan(loadPlan().record), []);

  useEffect(() => {
    const res = loadBudget();
    if (res.budget) setDraft(toDraft(res.budget));
    setStorage(res.status === 'unavailable' ? 'unavailable' : res.status === 'corrupt' ? 'corrupt' : 'ok');
    refreshPlan();
    setReady(true);
    const onStorage = e => {
      if (e.key === BUDGET_KEY) setOtherTab(true);
      if (e.key === PLAN_KEY) refreshPlan();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refreshPlan]);

  const parsed = useMemo(() => fromDraft(draft), [draft]);
  const totals = useMemo(() => computeBudget({
    incomeCents: parsed.budget.incomeCents,
    expenseCents: parsed.budget.expenses.map(e => e.cents),
    minimumCents: parsed.budget.debts.map(d => d.minimumCents),
    savingsCents: parsed.budget.savingsCents,
    extraCents: parsed.budget.extraCents,
  }), [parsed]);
  const segments = breakdown(totals);
  const planDebts = plan?.plan.debts.filter(d => d.balance > 0) ?? [];
  const diff = useMemo(() => diffWithPlan(parsed.budget.debts, plan?.plan.debts ?? []), [parsed, plan]);
  const housingTwice = parsed.budget.debts.some(d => HOUSING_DEBT.test(d.name) && d.minimumCents > 0)
    && parsed.budget.expenses.some(e => /housing|rent|mortgage/i.test(e.name) && e.cents > 0);

  // Autosave after the person edits something (never on first load).
  useEffect(() => {
    if (!ready || !touched.current || storage === 'unavailable') return undefined;
    if (!parsed.ok) { setSaveState('Not saved yet: fix the highlighted amounts.'); return undefined; }
    const t = setTimeout(() => {
      const r = saveBudget(parsed.budget);
      setSaveState(r === 'ok' ? 'saved' : r === 'full' ? 'Couldn’t save: this browser’s storage is full.' : 'Couldn’t save on this device.');
    }, 400);
    return () => clearTimeout(t);
  }, [parsed, ready, storage]);

  // Flush a pending save if the tab is hidden or closed before the debounce fires.
  const latest = useRef(null);
  latest.current = parsed;
  useEffect(() => {
    const flush = () => {
      if (touched.current && latest.current?.ok && storage !== 'unavailable') saveBudget(latest.current.budget);
    };
    const onHide = () => { if (document.visibilityState === 'hidden') flush(); };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onHide);
    return () => { window.removeEventListener('pagehide', flush); document.removeEventListener('visibilitychange', onHide); };
  }, [storage]);

  const edit = fn => { touched.current = true; setDraft(fn); };
  const setField = k => v => edit(d => ({ ...d, [k]: v }));
  const setRow = (list, id, key) => v => edit(d => ({ ...d, [list]: d[list].map(r => (r.id === id ? { ...r, [key]: v } : r)) }));
  const removeRow = (list, id) => edit(d => ({ ...d, [list]: d[list].filter(r => r.id !== id) }));

  const loadExample = () => edit(() => ({
    income: EXAMPLE.income, savings: EXAMPLE.savings, extra: EXAMPLE.extra,
    expenses: EXAMPLE.expenses.map(([name, amount]) => ({ id: newId('exp'), name, amount })),
    debts: EXAMPLE.debts.map(([name, amount]) => ({ id: newId('debt'), name, amount, imported: false })),
  }));

  const openPicker = () => {
    refreshPlan();
    const rec = loadPlan().record;
    if (!rec) { toast('Save a plan in My plan first, or add payments by hand.'); return; }
    setPicker({ selected: new Set(rec.plan.debts.filter(d => d.balance > 0).map(d => String(d.id))) });
  };
  const doImport = () => {
    const chosen = planDebts.filter(d => picker.selected.has(String(d.id)));
    const rows = importDebts(parsed.budget.debts, chosen);
    edit(d => ({ ...d, debts: rows.map(r => ({ id: r.id, name: r.name, amount: str(r.minimumCents), imported: r.imported, sourceId: r.sourceId })) }));
    setPicker(null);
    toast(`${chosen.length} debt${chosen.length === 1 ? '' : 's'} imported from My plan`);
  };
  const refreshFromPlan = () => {
    const rows = importDebts(parsed.budget.debts, diff.changed.map(c => c.debt));
    edit(d => ({ ...d, debts: rows.map(r => ({ id: r.id, name: r.name, amount: str(r.minimumCents), imported: r.imported, sourceId: r.sourceId })) }));
  };
  const dropRemoved = () => edit(d => ({ ...d, debts: d.debts.filter(r => !diff.removed.some(x => x.id === r.id)) }));

  const extraCents = parsed.budget.extraCents;
  const extraBlocked = !parsed.ok || totals.extraTooHigh || extraCents <= 0;
  const sendExtra = () => {
    const rec = loadPlan().record;
    if (!rec) { toast('Save a plan in My plan first.'); return; }
    const next = sanitizePlan({ ...rec.plan, extraPayment: extraCents / 100 });
    if (next && savePlan(next, rec.history)) { refreshPlan(); toast(`My plan’s extra payment is now ${fmt(extraCents)} a month`); }
    else toast('Couldn’t update My plan on this device.');
  };

  const onBackupFile = async e => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const res = readBackup(await file.text(), file.size);
    if (!res.ok) { toast(res.error); return; }
    setRestore(res);
  };
  const applyRestore = mode => {
    const r = restore;
    if (r.plan && (mode === 'replace' || !plan)) writePlanRecord(r.plan, r.history);
    if (r.budget) {
      const next = mode === 'merge' ? mergeBudgets(parsed.budget, r.budget) : r.budget;
      if (saveBudget(next) === 'ok') setDraft(toDraft(next));
    }
    refreshPlan();
    setRestore(null);
    toast(mode === 'merge' ? 'Backup merged' : 'Backup restored');
  };

  const shortfall = totals.surplusCents < 0;
  const noMinimums = totals.minimumsCents === 0;
  const today = new Date();

  return (
    <>
      <PageTitle title="Your money, with a plan." sub="Make room for everyday life, and see what’s left for paying down debt." />
      <div className="budget-note no-print">
        <span>Your entries stay in this browser.</span>
        {ready && isBlank(draft) && <button type="button" className="link-button" onClick={loadExample}>Load example numbers</button>}
        {saveState === 'saved' && <span className="saved-dot">Saved on this device</span>}
        {saveState && saveState !== 'saved' && <span className="error">{saveState}</span>}
      </div>
      {(storage !== 'ok' || otherTab) && (
        <div className="budget-notices no-print">
          {storage === 'unavailable' && <div className="notice warn"><p>This browser is blocking storage, so your budget works here but can’t be saved.</p></div>}
          {storage === 'corrupt' && <div className="notice warn"><p>Your saved budget couldn’t be read. Your next change will replace it.</p></div>}
          {otherTab && <div className="notice"><p>Your budget was changed in another tab. <button type="button" className="link-button" onClick={() => window.location.reload()}>Reload to see it</button></p></div>}
        </div>
      )}

      {/* Print-only summary */}
      <div className="print-only print-summary">
        <div className="brand print-brand"><HandMark />ByeByeBalance</div>
        <h1>Monthly budget</h1>
        <p>{today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} · Generated {today.toLocaleDateString()}</p>
      </div>

      <div className="calc-grid wide budget-grid">
        <div className="budget-steps">
          <section className="card budget-step" aria-labelledby="s1">
            <h2 id="s1"><span className="step-num">01</span> Monthly take-home income</h2>
            <Money id="income" label="Income after taxes" value={draft.income} onChange={setField('income')} error={parsed.errors.income} />
          </section>

          <section className="card budget-step" aria-labelledby="s2">
            <h2 id="s2"><span className="step-num">02</span> Everyday expenses</h2>
            <div className="budget-rows">
              {draft.expenses.map((e, i) => (
                <div className="budget-row" key={e.id}>
                  <label className="visually-hidden" htmlFor={`n-${e.id}`}>Expense {i + 1} name</label>
                  <input id={`n-${e.id}`} className="row-name" value={e.name} maxLength={60} onChange={ev => setRow('expenses', e.id, 'name')(ev.target.value)} />
                  <Money id={e.id} hideLabel label={`${e.name || 'Expense'} per month`} value={e.amount} onChange={setRow('expenses', e.id, 'amount')} error={parsed.errors[e.id]} />
                  <button type="button" className="row-remove no-print" onClick={() => removeRow('expenses', e.id)} aria-label={`Remove ${e.name || 'expense'}`}>×</button>
                </div>
              ))}
            </div>
            <button type="button" className="secondary small no-print" onClick={() => edit(d => ({ ...d, expenses: [...d.expenses, { id: newId('exp'), name: '', amount: '' }] }))}>+ Add expense</button>
            <p className="note" style={{ marginTop: 14, marginBottom: 0 }}>Monthly amounts. Leave out debt payments; they go in step 03.</p>
          </section>

          <section className="card budget-step" aria-labelledby="s3">
            <div className="step-head">
              <h2 id="s3"><span className="step-num">03</span> Debt minimum payments</h2>
              <button type="button" className="secondary small no-print" onClick={openPicker}>Import from My plan</button>
            </div>

            {picker && (
              <div className="import-preview" role="group" aria-label="Choose debts to import">
                <p style={{ margin: '0 0 10px', color: 'var(--ink)', fontWeight: 600 }}>Import these minimum payments?</p>
                {planDebts.map(d => {
                  const id = String(d.id);
                  const already = parsed.budget.debts.some(r => r.sourceId === id);
                  return (
                    <label key={id} className="import-choice">
                      <input type="checkbox" checked={picker.selected.has(id)} onChange={() => setPicker(p => { const s = new Set(p.selected); if (s.has(id)) s.delete(id); else s.add(id); return { selected: s }; })} />
                      <span>{d.name}</span>
                      <span className="note">{fmt(Math.round(d.minPayment * 100))}/mo{already ? ' · will update' : ''}</span>
                    </label>
                  );
                })}
                <p className="note">Importing again updates these debts instead of adding copies. Balances aren’t counted, only monthly minimums.</p>
                <div className="row">
                  <button type="button" className="small" onClick={doImport} disabled={picker.selected.size === 0}>Import selected</button>
                  <button type="button" className="secondary small" onClick={() => setPicker(null)}>Cancel</button>
                </div>
              </div>
            )}

            {(diff.changed.length > 0 || diff.removed.length > 0) && (
              <div className="notice no-print" style={{ marginBottom: 12 }}>
                <p>
                  My plan changed since you imported.
                  {diff.changed.length > 0 && <> {diff.changed.length} payment{diff.changed.length === 1 ? '' : 's'} updated. <button type="button" className="link-button" onClick={refreshFromPlan}>Refresh</button></>}
                  {diff.removed.length > 0 && <> {diff.removed.length} debt{diff.removed.length === 1 ? ' was' : 's were'} removed there. <button type="button" className="link-button" onClick={dropRemoved}>Remove here too</button></>}
                </p>
              </div>
            )}

            {draft.debts.length === 0 && !picker && (
              <p style={{ margin: '0 0 12px' }}>{plan ? 'Import your minimums from My plan, or add them by hand.' : 'Save a plan in My plan to import your debts, or add payments by hand.'}</p>
            )}
            <div className="budget-rows">
              {draft.debts.map((d, i) => (
                <div className="budget-row" key={d.id}>
                  {d.imported ? (
                    <span className="row-name row-static">{d.name}<span className="tag">From My plan</span></span>
                  ) : (
                    <>
                      <label className="visually-hidden" htmlFor={`n-${d.id}`}>Debt {i + 1} name</label>
                      <input id={`n-${d.id}`} className="row-name" value={d.name} placeholder="Debt name" maxLength={60} onChange={ev => setRow('debts', d.id, 'name')(ev.target.value)} />
                    </>
                  )}
                  <Money id={d.id} hideLabel label={`${d.name || 'Debt'} minimum payment`} value={d.amount} onChange={setRow('debts', d.id, 'amount')} error={parsed.errors[d.id]} readOnly={d.imported} />
                  <button type="button" className="row-remove no-print" onClick={() => removeRow('debts', d.id)} aria-label={`Remove ${d.name || 'debt'}`}>×</button>
                </div>
              ))}
            </div>
            <button type="button" className="secondary small no-print" onClick={() => edit(d => ({ ...d, debts: [...d.debts, { id: newId('debt'), name: '', amount: '', imported: false }] }))}>+ Add a payment by hand</button>
            {housingTwice && <div className="notice warn" style={{ marginTop: 12 }}><p>You have a housing expense and a mortgage or rent payment here. If they’re the same bill, remove one so it isn’t counted twice.</p></div>}
          </section>

          <section className="card budget-step" aria-labelledby="s4">
            <h2 id="s4"><span className="step-num">04</span> Savings</h2>
            <Money id="savings" label="Monthly savings contributions" value={draft.savings} onChange={setField('savings')} error={parsed.errors.savings} />
          </section>
        </div>

        <div className="budget-side">
          <div className="card mint snapshot" id="snapshot" aria-live="polite">
            <div className="panel-title">
              <h2>Your monthly snapshot</h2>
              <span className="badge-outline">On this device</span>
            </div>
            <p className={`snapshot-total${shortfall ? ' is-short' : ''}`}>{shortfall ? `−${whole(-totals.surplusCents)}` : whole(totals.surplusCents)}</p>
            <p className="snapshot-sub">{shortfall ? 'Short each month. Your costs are more than your take-home income.' : 'Available each month before extra debt payments.'}</p>
            {noMinimums && totals.incomeCents > 0 && <p className="note snapshot-hint">Add your debt minimums in step 03 for an accurate number.</p>}

            <div className="budget-bar" role="img" aria-label={segments.filter(s => s.cents > 0).map(s => `${s.label} ${fmt(s.cents)}`).join(', ') || 'No amounts yet'}>
              {segments.map(s => <i key={s.key} style={{ width: `${s.share * 100}%`, background: COLORS[s.key] }} />)}
            </div>
            <ul className="budget-legend">
              {segments.map(s => <li key={s.key}><span className="dot" style={{ background: COLORS[s.key] }} />{s.label}</li>)}
            </ul>

            <table className="snapshot-table">
              <tbody>
                <tr><th scope="row">Take-home income</th><td>{fmt(totals.incomeCents)}</td></tr>
                <tr><th scope="row">Living expenses</th><td>−{fmt(totals.livingCents)}</td></tr>
                <tr><th scope="row">Debt minimums</th><td>−{fmt(totals.minimumsCents)}</td></tr>
                <tr><th scope="row">Savings</th><td>−{fmt(totals.savingsCents)}</td></tr>
                <tr className="total"><th scope="row">Available</th><td>{totals.surplusCents < 0 ? '−' : ''}{fmt(Math.abs(totals.surplusCents))}</td></tr>
              </tbody>
            </table>

            <div className="panel-block purpose">
              <h3>Give your surplus a purpose</h3>
              <Money id="extra" label="Extra debt payment each month" value={draft.extra} onChange={setField('extra')} error={parsed.errors.extra || (totals.extraTooHigh && extraCents > 0 ? `That’s more than the ${whole(Math.max(0, totals.surplusCents))} available.` : undefined)} />
              <p className="note">Left after extra payment: <strong>{totals.bufferCents < 0 ? '−' : ''}{fmt(Math.abs(totals.bufferCents))}</strong></p>
              <button type="button" className="block no-print" onClick={sendExtra} disabled={extraBlocked || !plan}>
                Use {extraCents > 0 ? fmt(extraCents) : 'it'} in My plan <Arrow />
              </button>
              <p className="note" style={{ margin: '10px 0 0' }}>
                {plan ? <>Sets My plan’s extra payment to this amount{plan.plan.extraPayment ? ` (now ${fmt(Math.round(plan.plan.extraPayment * 100))})` : ''}. Minimums aren’t counted twice.</> : <>Save a plan in <Link href="/planner">My plan</Link> first.</>}
              </p>
            </div>
          </div>

          <div className="card no-print">
            <h3>Keep your plan handy</h3>
            <p>Print your monthly overview, or save a backup file to bring your plan and budget to another device.</p>
            <div className="export-grid">
              <button type="button" onClick={() => window.print()}>Print / Save PDF</button>
              <button type="button" className="secondary" onClick={() => downloadText(`byebyebalance-budget-${today.toISOString().slice(0, 10)}.csv`, budgetCsv(parsed.budget, totals, today))} disabled={!parsed.ok}>Download CSV</button>
              <button type="button" className="secondary" onClick={() => downloadText(`byebyebalance-backup-${today.toISOString().slice(0, 10)}.json`, makeBackup({ planRecord: plan, budget: parsed.ok ? parsed.budget : null }), 'application/json')}>Export backup</button>
              <button type="button" className="secondary" onClick={() => fileRef.current?.click()}>Import backup</button>
              <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onBackupFile} />
            </div>
            {restore && (
              <div className="import-preview" style={{ marginTop: 14 }}>
                <p style={{ margin: '0 0 6px', fontWeight: 600, color: 'var(--ink)' }}>Restore this backup?</p>
                <p className="note" style={{ margin: '0 0 10px' }}>
                  {restore.exportedAt ? `Saved ${new Date(restore.exportedAt).toLocaleDateString()}. ` : ''}
                  {restore.summary.debts} debts and {restore.summary.checkIns} check-ins in My plan; {restore.summary.expenses} expenses and {restore.summary.budgetDebts} debt payments in the budget.
                </p>
                <p className="note"><strong>Replace</strong> swaps your current plan and budget for the backup. <strong>Merge</strong> keeps what you have and adds rows that aren’t here yet.</p>
                <div className="row">
                  <button type="button" className="small" onClick={() => applyRestore('replace')}>Replace</button>
                  <button type="button" className="secondary small" onClick={() => applyRestore('merge')}>Merge</button>
                  <button type="button" className="secondary small" onClick={() => setRestore(null)}>Cancel</button>
                </div>
              </div>
            )}
            <p className="note" style={{ marginTop: 12, marginBottom: 0 }}>CSV opens in Excel or Google Sheets. Print uses your browser’s print dialog. Backups stay on your device until you move them.</p>
          </div>
        </div>
      </div>

      <section className="no-print" style={{ paddingTop: 8 }}>
        <p className="note">Estimates only, not financial advice. Your budget lives in this browser on this device. It doesn’t sync, and clearing browser data removes it, so export a backup if you switch devices. <Link href="/privacy">Manage saved data</Link></p>
      </section>
      <a className="mobile-total no-print" href="#snapshot" aria-hidden="true" tabIndex={-1}>
        <span>{shortfall ? 'Short each month' : 'Available each month'}</span>
        <strong className={shortfall ? 'is-short' : undefined}>{shortfall ? `−${whole(-totals.surplusCents)}` : whole(totals.surplusCents)}</strong>
      </a>
      {toastNode}
    </>
  );
}
