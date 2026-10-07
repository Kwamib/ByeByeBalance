'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Metric, PageTitle, SectionIntro, GuideCards } from '../_components/Cards';
import { Arrow } from '../_components/Icons';
import { useToast } from '../_components/useToast';
import { loadPlan, savePlan } from '../../lib/storage';
import { money, toNumber } from '../../lib/format';

export default function ProgressApp() {
  const [state, setState] = useState({ status: 'loading', record: null });
  const [balances, setBalances] = useState({});
  const [toast, toastNode] = useToast();

  useEffect(() => {
    const res = loadPlan();
    setState(res);
    if (res.record) setBalances(Object.fromEntries(res.record.plan.debts.map(d => [d.id, String(d.balance)])));
  }, []);

  const errors = useMemo(() => Object.fromEntries(
    Object.entries(balances).filter(([, v]) => { const n = toNumber(v); return !Number.isFinite(n) || n < 0; }).map(([id]) => [id, 'Enter a balance of $0 or more.'])
  ), [balances]);

  const record = state.record;
  const debts = record?.plan.debts || [];
  const history = record?.history || [];
  const total = debts.reduce((s, d) => s + d.balance, 0);
  const first = history[0]?.total ?? total;
  const paid = Math.max(0, first - total);
  const pct = first ? Math.max(0, Math.min(100, (paid / first) * 100)) : 100;

  const onSubmit = e => {
    e.preventDefault();
    if (Object.keys(errors).length) { toast('Fix the highlighted balances first.'); return; }
    const nextDebts = debts.map(d => ({ ...d, balance: toNumber(balances[d.id]) }));
    const nextHistory = [...history, { date: new Date().toISOString(), total: nextDebts.reduce((s, d) => s + d.balance, 0) }];
    const plan = { ...record.plan, debts: nextDebts };
    if (savePlan(plan, nextHistory)) {
      setState({ status: 'saved', record: { ...record, plan, history: nextHistory } });
      toast('Saved on this device');
    } else toast('Device storage is unavailable. Keep this tab open.');
  };

  return (
    <>
      <PageTitle title="One check-in at a time." sub="Update balances from your latest statements, then record a snapshot. Your history stays on this device." />
      <div className="calc-grid wide">
        {record ? (
          <form className="card calc-form" onSubmit={onSubmit} noValidate>
            <h2>Your latest balances</h2>
            <p>Enter each balance from your most recent statement. This also updates your saved plan.</p>
            {debts.map(d => (
              <div className="field" key={d.id}>
                <label htmlFor={`p-${d.id}`}>{d.name} ($)</label>
                <input id={`p-${d.id}`} type="number" inputMode="decimal" min="0" step="0.01" value={balances[d.id] ?? ''} onChange={e => setBalances(b => ({ ...b, [d.id]: e.target.value }))} aria-invalid={errors[d.id] ? 'true' : undefined} />
                {errors[d.id] && <span className="error">{errors[d.id]}</span>}
              </div>
            ))}
            <button type="submit" className="block">Save monthly check-in <Arrow /></button>
          </form>
        ) : (
          <div className="card calc-form">
            <h2>Your latest balances</h2>
            <div className="empty">
              <p>{state.status === 'loading' ? 'Loading…' : 'Save a plan first.'}</p>
              <span className="note">{state.status === 'unavailable' ? 'This browser is blocking storage, so progress can’t be kept here.' : 'Add your debts in the planner and choose Save my plan. Then record check-ins here.'}</span>
            </div>
            <Link href="/planner" className="button block" style={{ marginTop: 18 }}>Go to my plan <Arrow /></Link>
          </div>
        )}
        <div className="card mint">
          <div className="panel-title">
            <h2>Your progress</h2>
            <span className="badge-outline">On this device</span>
          </div>
          <div className="metrics" style={{ marginTop: 8 }}>
            <Metric value={record ? money(total) : '—'} label="Current debt balance" />
            <Metric value={history.length > 1 ? money(paid) : '—'} label="Net balance reduction since first snapshot" />
          </div>
          <div className="panel-block">
            <h3>{history.length > 1 ? `${Math.round(pct)}% balance reduction` : 'Start your progress history'}</h3>
            <div className="progress-bar"><i style={{ width: `${history.length > 1 ? pct : 0}%` }} /></div>
            <p className="note">Balance changes can include payments, interest and new charges.</p>
          </div>
          <div className="panel-block">
            <h3>Check-in history</h3>
            {history.length ? (
              <div className="tablewrap">
                <table>
                  <thead><tr><th>Date</th><th>Total balance</th></tr></thead>
                  <tbody>
                    {[...history].reverse().map(h => <tr key={h.date}><td>{new Date(h.date).toLocaleDateString()}</td><td>{money(h.total)}</td></tr>)}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty" style={{ marginBottom: 10 }}><p>No check-ins yet.</p><span className="note">Save your starting balance today, then return next month.</span></div>
            )}
          </div>
          <Link href="/planner" className="button secondary block">Edit my payoff plan</Link>
        </div>
      </div>
      <section style={{ paddingTop: 8 }}>
        <SectionIntro title="Keep your plan useful">
          <p>A short monthly routine keeps your estimates connected to what actually happened. Your plan and check-ins stay in this browser and don&rsquo;t sync to other devices.</p>
        </SectionIntro>
        <div style={{ marginTop: 24 }}><GuideCards /></div>
      </section>
      {toastNode}
    </>
  );
}
