'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import BalanceChart from './_components/BalanceChart';
import { Metric } from './_components/Cards';
import { Arrow } from './_components/Icons';
import { simulatePlan } from '../lib/finance/debtPlan';
import { addMonths } from '../lib/finance/dates';
import { pointsFrom } from '../lib/chartSeries';
import { SAMPLE_PLAN } from '../lib/sampleData';
import { money, monthShort, yrMo } from '../lib/format';

/** Home page: sample debts on the left, sample plan on the right (mockup layout). */
export default function HeroCard() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const total = SAMPLE_PLAN.debts.reduce((s, d) => s + d.balance, 0);
  const plan = simulatePlan(SAMPLE_PLAN.debts, { strategy: 'avalanche', extraPayment: SAMPLE_PLAN.extraPayment });
  const base = simulatePlan(SAMPLE_PLAN.debts, { strategy: 'avalanche', extraPayment: 0 });

  return (
    <div className="calc-grid">
      <div className="card calc-form">
        <h2>Sample debts</h2>
        <p>Three example debts with {money(SAMPLE_PLAN.extraPayment)} extra a month, paying the highest rate first.</p>
        {SAMPLE_PLAN.debts.map(d => (
          <div className="debtline" key={d.id}>
            <span><strong style={{ fontWeight: 600 }}>{d.name}</strong><br /><span className="note">{d.rate}% APR · {money(d.minPayment)} minimum</span></span>
            <strong>{money(d.balance)}</strong>
          </div>
        ))}
        <div className="debtline"><span>Extra each month</span><strong>{money(SAMPLE_PLAN.extraPayment)}</strong></div>
        <Link className="button block" href="/planner" style={{ marginTop: 18 }}>Use my own numbers <Arrow /></Link>
      </div>
      <div className="card mint">
        <div className="panel-title">
          <h2>See your path forward</h2>
          <span className="badge-outline">Sample plan</span>
        </div>
        <p className="panel-sub">Here&rsquo;s what {money(SAMPLE_PLAN.extraPayment)} extra each month could do for these debts.</p>
        {ready ? (
          <>
            <div className="metrics">
              <Metric value={monthShort(addMonths(new Date(), plan.months))} label="Estimated debt-free month" />
              <Metric value={yrMo(base.months - plan.months)} label="Sooner than minimums only" />
            </div>
            <BalanceChart series={[
              { label: 'With extra payments', color: '#137b57', points: pointsFrom(plan, total) },
              { label: 'Minimums only', color: '#98a9b7', dashed: true, points: pointsFrom(base, total) },
            ]} />
          </>
        ) : <div style={{ minHeight: 560 }} />}
      </div>
    </div>
  );
}
