'use client';

import Link from 'next/link';
import { useState } from 'react';
import BalanceChart from '../_components/BalanceChart';
import { GuideCards, Metric } from '../_components/Cards';
import { Arrow } from '../_components/Icons';
import { CalendarArt, CoinsArt } from '../_components/Illustrations';
import { payoffSingle, requiredPayment } from '../../lib/finance/amortization';
import { addMonths } from '../../lib/finance/dates';
import { pointsFrom } from '../../lib/chartSeries';
import { money, monthShort, yrMo, toNumber } from '../../lib/format';

const dateFor = m => monthShort(addMonths(new Date(), m));
const fmtMoney = v => { const n = toNumber(v); return Number.isFinite(n) ? `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}` : v; };
const fmtPct = v => { const n = toNumber(v); return Number.isFinite(n) ? `${n}%` : v; };

const COPY = {
  extra: {
    title: 'What could an extra payment change?',
    sub: 'Explore how a little more each month could bring your debt-free date closer.',
    intro: 'Enter your current debt details to see how an extra payment could make a difference.',
    button: 'Compare my payments',
  },
  credit: {
    title: 'How long will your card take to pay off?',
    sub: 'See your payoff date and total interest, and what a little extra each month could change.',
    intro: 'Enter your card balance, APR and the amount you pay each month.',
    button: 'Compare my payments',
  },
  date: {
    title: 'When could you be debt-free?',
    sub: 'Choose a timeline and see the monthly payment it would take to get there.',
    intro: 'Enter your balance, APR and how many months you’d like to be done in.',
    button: 'Calculate my payment',
  },
};

function MoneyField({ id, label, value, onChange, error, kind = 'money' }) {
  const fmt = kind === 'pct' ? fmtPct : kind === 'int' ? v => v : fmtMoney;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        inputMode={kind === 'int' ? 'numeric' : 'decimal'}
        autoComplete="off"
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={e => onChange(fmt(e.target.value))}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
      />
      {error && <span id={`${id}-err`} className="error">{error}</span>}
    </div>
  );
}

function validate(kind, f) {
  const v = { balance: toNumber(f.balance), apr: toNumber(f.apr) };
  const e = {};
  if (!Number.isFinite(v.balance) || v.balance <= 0 || v.balance > 10000000) e.balance = 'Enter a balance from $1 to $10,000,000.';
  if (!Number.isFinite(v.apr) || v.apr < 0 || v.apr > 100) e.apr = 'Enter an APR from 0% to 100%.';
  if (kind === 'date') {
    v.months = toNumber(f.months);
    if (!Number.isInteger(v.months) || v.months < 1 || v.months > 600) e.months = 'Enter a whole number of months from 1 to 600.';
  } else {
    v.payment = toNumber(f.payment);
    v.extra = String(f.additional).trim() === '' ? 0 : toNumber(f.additional);
    if (!Number.isFinite(v.payment) || v.payment <= 0) e.payment = 'Enter a monthly payment above $0.';
    if (!Number.isFinite(v.extra) || v.extra < 0) e.additional = 'Enter $0 or more.';
  }
  return { v, e };
}

function compute(kind, v) {
  if (kind === 'date') return { payment: requiredPayment(v.balance, v.apr, v.months), v };
  return {
    base: payoffSingle({ balance: v.balance, apr: v.apr, payment: v.payment }),
    r: payoffSingle({ balance: v.balance, apr: v.apr, payment: v.payment + v.extra }),
    v,
  };
}

export default function SingleDebtCalc({ kind }) {
  const copy = COPY[kind];
  const target = kind === 'date';
  const [f, setF] = useState({ balance: '$10,000', apr: '18%', months: '24', payment: '$300', additional: '$100' });
  const [errors, setErrors] = useState({});
  const [out, setOut] = useState(null);
  const set = k => val => setF(s => ({ ...s, [k]: val }));
  const extraShown = money(Math.max(0, toNumber(f.additional) || 0));

  const run = e => {
    e.preventDefault();
    const { v, e: errs } = validate(kind, f);
    setErrors(errs);
    setOut(Object.keys(errs).length ? null : compute(kind, v));
  };

  return (
    <>
      <div className="page-title">
        <h1>{copy.title}</h1>
        <p>{copy.sub}</p>
      </div>

      <div className="calc-grid">
        <form className="card calc-form" onSubmit={run} noValidate>
          <h2>Your debt</h2>
          <p>{copy.intro}</p>
          <MoneyField id="balance" label="Balance" value={f.balance} onChange={set('balance')} error={errors.balance} />
          <MoneyField id="apr" label="APR" kind="pct" value={f.apr} onChange={set('apr')} error={errors.apr} />
          {target ? (
            <MoneyField id="months" label="Target timeline (months)" kind="int" value={f.months} onChange={set('months')} error={errors.months} />
          ) : (
            <>
              <MoneyField id="payment" label="Monthly payment" value={f.payment} onChange={set('payment')} error={errors.payment} />
              <MoneyField id="additional" label="Extra monthly payment" value={f.additional} onChange={set('additional')} error={errors.additional} />
            </>
          )}
          <button type="submit" className="block">{copy.button} <Arrow /></button>
        </form>

        <div className="card mint" aria-live="polite">
          <div className="panel-title">
            <h2>{target ? 'See your target payment' : 'See your path forward'}</h2>
            <span className="badge-outline">{out ? 'Your estimate' : 'Illustrative preview'}</span>
          </div>
          {out ? <Result kind={kind} out={out} /> : (
            <>
              <p style={{ fontSize: 16.5, margin: 0 }}>
                {target ? 'Here’s what choosing a timeline could show you.' : `Here’s what an extra ${extraShown} each month could do for you.`}
              </p>
              <div className="preview-cards">
                <div className="preview-card">
                  <CalendarArt />
                  <h3>{target ? 'Pick your date' : 'Pay off sooner'}</h3>
                  <p className="sub">{target ? 'Set a timeline that fits' : 'Compare your payoff dates'}</p>
                  <p>{target ? 'Choose how many months you’d like to be done in and see when that lands.' : 'See how adding an extra payment each month could help you become debt-free faster.'}</p>
                </div>
                <div className="preview-card">
                  <CoinsArt />
                  <h3>{target ? 'Know your payment' : 'Pay less interest'}</h3>
                  <p className="sub">{target ? 'See the monthly amount' : 'See your estimated savings'}</p>
                  <p>{target ? 'Find the payment it takes to reach your date, and the interest along the way.' : 'Find out how a higher monthly payment could reduce the amount of interest you pay over time.'}</p>
                </div>
              </div>
            </>
          )}
          <Link className="button block" href="/planner">Build my full debt payoff plan <Arrow /></Link>
        </div>
      </div>

      <section>
        <div className="section-intro">
          <h2>Understand your results</h2>
          <p>
            Extra payments go toward your principal balance, which can help you pay off debt sooner and reduce the total
            interest you pay. This calculator uses a simplified fixed-rate, fixed-payment model to show illustrative results.
            Actual results may vary based on your lender’s terms, payment allocation, and other factors.
          </p>
        </div>
        <div style={{ marginTop: 28 }}><GuideCards /></div>
      </section>
    </>
  );
}

function Result({ kind, out }) {
  if (kind === 'date') {
    const r = payoffSingle({ balance: out.v.balance, apr: out.v.apr, payment: out.payment });
    return (
      <>
        <p style={{ fontSize: 16.5 }}>A {out.v.months}-month plan at {out.v.apr}% APR, rounded up to the next dollar.</p>
        <div className="metrics">
          <Metric value={money(Math.ceil(out.payment))} label="Estimated monthly payment" />
          <Metric value={dateFor(out.v.months)} label="Target payoff month" />
          <Metric value={money(r.totalInterest)} label="Estimated total interest" />
          <Metric value={money(r.totalPaid)} label="Estimated total paid" />
        </div>
        <BalanceChart series={[{ label: 'Your payoff plan', color: '#137b57', points: pointsFrom(r, out.v.balance) }]} />
      </>
    );
  }
  const { base, r, v } = out;
  if (!r.ok) {
    return (
      <p className="error" style={{ fontSize: 16 }}>
        {r.error.code === 'NON_AMORTIZING'
          ? `This payment doesn’t cover the first month’s interest (about ${money(v.balance * v.apr / 1200)}), so the balance would grow. Try a larger payment.`
          : r.error.message}
      </p>
    );
  }
  const baseOk = base.ok;
  return (
    <>
      <p style={{ fontSize: 16.5 }}>{baseOk ? `Here’s what an extra ${money(v.extra)} each month could do for you.` : 'Your current payment alone wouldn’t pay this off. Here’s the plan with the extra amount.'}</p>
      <div className="metrics">
        <Metric value={baseOk ? yrMo(Math.max(0, base.months - r.months)) : yrMo(r.months)} label={baseOk ? 'Sooner than your current payment' : 'Payoff timeline'} />
        <Metric value={baseOk ? money(Math.max(0, base.totalInterest - r.totalInterest)) : money(r.totalInterest)} label={baseOk ? 'Estimated interest saved' : 'Estimated total interest'} />
        <Metric value={dateFor(r.months)} label="Estimated payoff month" />
        <Metric value={money(v.payment + v.extra)} label="Monthly payment" />
      </div>
      <BalanceChart
        series={[
          { label: 'With extra payments', color: '#137b57', points: pointsFrom(r, v.balance) },
          ...(baseOk ? [{ label: 'Current payment', color: '#98a9b7', dashed: true, points: pointsFrom(base, v.balance) }] : []),
        ]}
      />
    </>
  );
}
