'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import BalanceChart from './BalanceChart';
import { Metric, PageTitle, SectionIntro, GuideCards } from './Cards';
import { Arrow } from './Icons';
import { useToast } from './useToast';
import { simulatePlan } from '../../lib/finance/debtPlan';
import { addMonths } from '../../lib/finance/dates';
import { displayBalance } from '../../lib/finance/money';
import { pointsFrom } from '../../lib/chartSeries';
import { toDraft, parseDraft, newDebtId } from '../../lib/planDraft';
import { SAMPLE_PLAN } from '../../lib/sampleData';
import { loadPlan, savePlan } from '../../lib/storage';
import { scheduleCsv, downloadText } from '../../lib/exportCsv';
import { money, monthShort, yrMo } from '../../lib/format';

const dateFor = m => monthShort(addMonths(new Date(), m));
const balanceMoney = b => { const d = displayBalance(b); return d > 0 && d < 0.5 ? '<$1' : money(d); };

export default function Planner({ compare = false }) {
  const [draft, setDraft] = useState(() => toDraft(SAMPLE_PLAN));
  const [source, setSource] = useState('loading');
  const [history, setHistory] = useState([]);
  const [toast, toastNode] = useToast();

  useEffect(() => {
    const { status, record } = loadPlan();
    if (record) { setDraft(toDraft(record.plan)); setHistory(record.history || []); }
    setSource(record ? status : status === 'none' ? 'sample' : status);
  }, []);

  const parsed = useMemo(() => parseDraft(draft), [draft]);
  const ready = source !== 'loading';

  const calc = useMemo(() => {
    if (!ready || !parsed.ok) return null;
    const debts = parsed.plan.debts.filter(d => d.balance > 0);
    const total = debts.reduce((s, d) => s + d.balance, 0);
    const opts = { extraPayment: parsed.plan.extraPayment, startDate: new Date() };
    return {
      debts, total,
      main: simulatePlan(debts, { ...opts, strategy: parsed.plan.strategy }),
      avalanche: simulatePlan(debts, { ...opts, strategy: 'avalanche' }),
      snowball: simulatePlan(debts, { ...opts, strategy: 'snowball' }),
    };
  }, [ready, parsed]);

  const update = (id, key, value) => setDraft(d => ({ ...d, debts: d.debts.map(x => (x.id === id ? { ...x, [key]: value } : x)) }));
  const remove = id => setDraft(d => ({ ...d, debts: d.debts.filter(x => x.id !== id), customOrder: d.customOrder.filter(x => x !== id) }));
  const add = () => {
    const id = newDebtId();
    setDraft(d => ({ ...d, debts: [...d.debts, { id, name: 'New debt', balance: '1000', rate: '10', minPayment: '50' }], customOrder: [...d.customOrder, id] }));
  };

  const onSave = () => {
    if (!parsed.ok) { toast('Fix the highlighted fields before saving.'); return; }
    const total = parsed.plan.debts.reduce((s, d) => s + d.balance, 0);
    const hist = history.length ? history : [{ date: new Date().toISOString(), total }];
    if (savePlan(parsed.plan, hist)) { setHistory(hist); setSource('saved'); toast('Saved on this device'); }
    else toast('Device storage is unavailable. Keep this tab open.');
  };

  const onExport = () => {
    if (!calc?.main.ok) { toast(calc?.main.error?.message || 'Fix your entries first.'); return; }
    downloadText(`byebyebalance-payoff-plan-${new Date().toISOString().slice(0, 10)}.csv`, scheduleCsv(calc.main, calc.debts));
  };

  const intro = source === 'saved' || source === 'migrated'
    ? 'Your saved debts are below. When a debt is paid off, its payment moves to the next one.'
    : 'Start with the editable sample debts, or replace them with your own. When a debt is paid off, its payment moves to the next one.';

  return (
    <>
      <PageTitle
        title={compare ? 'Snowball or avalanche?' : 'A plan for all your debts.'}
        sub={compare ? 'Compare both payoff strategies with your own debts and the same monthly budget.' : 'Add what you owe, choose a strategy, and see when you could be debt-free.'}
      />
      {(source === 'migrated' || source === 'corrupt' || source === 'unavailable') && (
        <div style={{ maxWidth: 760, margin: '8px auto 0', padding: '0 32px' }}>
          {source === 'migrated' && <div className="notice"><p>We brought over the debts you entered on the previous version of ByeByeBalance.</p></div>}
          {source === 'corrupt' && <div className="notice warn"><p>Your saved plan couldn&rsquo;t be read, so you&rsquo;re seeing sample debts. Saving will replace it.</p></div>}
          {source === 'unavailable' && <div className="notice warn"><p>This browser is blocking storage, so the plan can&rsquo;t be saved here.</p></div>}
        </div>
      )}

      <div className="calc-grid wide">
        <div className="card calc-form">
          <h2>Your debts</h2>
          <p>{intro}</p>
          {draft.debts.length === 0 && <div className="empty"><p>No debts yet.</p><span className="note">Add a debt to see your plan.</span></div>}
          {draft.debts.map(d => {
            const e = parsed.errors[d.id] || {};
            const name = d.name || 'Untitled debt';
            return (
              <div className="debt-entry" key={d.id}>
                <div className="debt-entry-head">
                  <h3>{name}</h3>
                  <button type="button" className="small remove" onClick={() => remove(d.id)} aria-label={`Remove ${name}`}>Remove</button>
                </div>
                <div className="field">
                  <label htmlFor={`name-${d.id}`}>Debt name</label>
                  <input id={`name-${d.id}`} value={d.name} maxLength={60} onChange={ev => update(d.id, 'name', ev.target.value)} />
                </div>
                <div className="fields">
                  {[['balance', 'Balance ($)'], ['rate', 'APR (%)'], ['minPayment', 'Minimum ($)']].map(([k, label]) => (
                    <div className="field" key={k}>
                      <label htmlFor={`${k}-${d.id}`}>{label}</label>
                      <input
                        id={`${k}-${d.id}`}
                        type="number"
                        inputMode="decimal"
                        min="0"
                        max={k === 'rate' ? '100' : undefined}
                        step="0.01"
                        value={d[k]}
                        onChange={ev => update(d.id, k, ev.target.value)}
                        aria-invalid={e[k] ? 'true' : undefined}
                      />
                      {e[k] && <span className="error">{e[k]}</span>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          <div className="panel-actions no-print" style={{ marginTop: 14 }}>
            <button type="button" className="secondary block" onClick={add}>Add a debt</button>
            <button type="button" className="block" onClick={onSave} disabled={!ready}>Save my plan <Arrow /></button>
          </div>
          <p className="note" style={{ marginTop: 12, marginBottom: 0 }}>Saved only in this browser. No bank connection.</p>
        </div>

        <div className="card mint">
          <div className="panel-title">
            <h2>See your path forward</h2>
            <span className="badge-outline">{source === 'saved' || source === 'migrated' ? 'Your plan' : 'Sample debts'}</span>
          </div>
          <div className="fields" style={{ marginTop: 8 }}>
            <div className="field">
              <label htmlFor="extra">Extra monthly payment ($)</label>
              <input
                id="extra"
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={draft.extraPayment}
                onChange={ev => setDraft(d => ({ ...d, extraPayment: ev.target.value }))}
                aria-invalid={parsed.errors.extraPayment ? 'true' : undefined}
              />
              {parsed.errors.extraPayment && <span className="error">{parsed.errors.extraPayment}</span>}
            </div>
            <div className="field">
              <label id="strategy-label">Payoff strategy</label>
              <div className="tabs" role="group" aria-labelledby="strategy-label" style={{ marginBottom: 0 }}>
                {[['avalanche', 'Avalanche'], ['snowball', 'Snowball']].map(([id, label]) => (
                  <button key={id} type="button" className={draft.strategy === id ? 'selected' : undefined} aria-pressed={draft.strategy === id} onClick={() => setDraft(d => ({ ...d, strategy: id }))}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div aria-live="polite"><PlanResult calc={calc} parsed={parsed} ready={ready} /></div>
        </div>
      </div>

      <section style={{ paddingTop: 8 }}>
        <div className="grid">
          <div className="card">
            <h3>Compare both strategies</h3>
            {calc && calc.debts.length > 0 ? (
              <>
                <div className="tablewrap">
                  <table>
                    <thead><tr><th>Strategy</th><th>Timeline</th><th>Interest</th></tr></thead>
                    <tbody>
                      {[['Avalanche', calc.avalanche], ['Snowball', calc.snowball]].map(([n, x]) => (
                        <tr key={n}><td>{n}</td><td>{x.ok ? yrMo(x.months) : 'Adjust payment'}</td><td>{x.ok ? money(x.totalInterest) : '—'}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="note" style={{ margin: '14px 0 0' }}>Avalanche pays the highest APR first. Snowball pays the smallest balance first. Both roll freed payments into the next debt.</p>
              </>
            ) : <p>Add a debt to compare strategies.</p>}
          </div>
          <div className="card">
            <h3>Monthly payoff schedule</h3>
            <div className="schedule">
              {calc?.main.ok && calc.debts.length > 0 ? (
                <table>
                  <thead><tr><th>Month</th><th>Payment</th><th>Interest</th><th>Balance</th></tr></thead>
                  <tbody>
                    {calc.main.schedule.map(x => (
                      <tr key={x.month}><td>{x.month}</td><td>{money(x.payment)}</td><td>{money(x.interest)}</td><td>{balanceMoney(x.balance)}</td></tr>
                    ))}
                  </tbody>
                </table>
              ) : <p>No schedule available for this payment.</p>}
            </div>
            <div className="row no-print" style={{ marginTop: 15 }}>
              <button type="button" className="secondary small" onClick={onExport}>Export schedule CSV</button>
              <button type="button" className="secondary small" onClick={() => window.print()}>Print my plan</button>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 8 }}>
        <SectionIntro title="Understand your results">
          <p>Estimates assume fixed APRs, monthly interest (APR ÷ 12), an unchanged total monthly payment, no fees and no new charges. Actual results may vary based on your lenders&rsquo; terms and how they apply payments.</p>
        </SectionIntro>
        <div style={{ marginTop: 24 }}><GuideCards /></div>
      </section>
      {toastNode}
    </>
  );
}

function PlanResult({ calc, parsed, ready }) {
  if (!ready) return <p className="note">Loading your plan…</p>;
  if (!parsed.ok) return <p className="error">Fix the highlighted fields to see your plan.</p>;
  if (!calc.debts.length) return <p>Add a debt with a balance to see your plan.</p>;
  const r = calc.main;
  if (!r.ok) return <p className="error">{r.error.message}</p>;
  return (
    <>
      <div className="metrics">
        <Metric value={money(calc.total)} label="Current debt balance" />
        <Metric value={yrMo(r.months)} label="Estimated payoff time" />
        <Metric value={money(r.totalInterest)} label="Estimated total interest" />
        <Metric value={dateFor(r.months)} label="Estimated payoff month" />
      </div>
      {r.warnings.length > 0 && (
        <div className="notice warn" style={{ marginBottom: 16 }}>
          {r.warnings.map(w => <p key={w.debtId}>{w.debtName}&rsquo;s minimum payment doesn&rsquo;t cover its interest. This plan works only because extra or freed-up payments reach it.</p>)}
        </div>
      )}
      <BalanceChart series={[{ label: 'Your payoff plan', color: '#137b57', points: pointsFrom(r, calc.total) }]} />
      <Link className="button block" href="/progress">Track my progress <Arrow /></Link>
    </>
  );
}
