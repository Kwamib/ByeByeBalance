'use client';

import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMobile } from '../hooks/useMobile';
import { calculateMortgage } from '../utils/calculations';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CARD = {
  background: 'var(--bg-card)',
  borderRadius: 6,
  border: '1px solid var(--border)',
  padding: '1.25rem 1.5rem',
  marginBottom: '1rem',
};

const LABEL = {
  fontSize: '0.6rem',
  fontWeight: 600,
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  display: 'block',
  marginBottom: 5,
};

const INPUT = {
  width: '100%',
  padding: '9px 11px',
  border: '1px solid var(--border)',
  borderRadius: 4,
  fontSize: '0.9rem',
  fontFamily: 'var(--font-body)',
  color: 'var(--text-primary)',
  background: 'var(--bg)',
  outline: 'none',
  boxSizing: 'border-box',
};

function fmt(v) { return '$' + Math.round(v).toLocaleString(); }
function fmtK(v) { return v >= 1000 ? '$' + Math.round(v / 1000) + 'K' : fmt(v); }

function StatCell({ label, value, sub, color }) {
  return (
    <div style={{ padding: '1rem 1.25rem' }}>
      <div style={LABEL}>{label}</div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: '1.35rem', fontWeight: 600, color: color || 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.3px', lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function MortgagePage() {
  const isMobile = useMobile();
  const [homePrice, setHomePrice] = useState(400000);
  const [downPayment, setDownPayment] = useState(80000);
  const [rate, setRate] = useState(6.75);
  const [term, setTerm] = useState(30);
  const [extra, setExtra] = useState(0);

  const loan = homePrice - downPayment;
  const base = useMemo(() => calculateMortgage(loan, rate, term, 0), [loan, rate, term]);
  const withExtra = useMemo(() => calculateMortgage(loan, rate, term, extra), [loan, rate, term, extra]);
  const altTerm = useMemo(() => calculateMortgage(loan, rate, term === 30 ? 15 : 30, 0), [loan, rate, term]);

  const yr1 = useMemo(() => {
    const p = base.schedule.filter(s => s.month <= 12);
    return { interest: p.reduce((s, x) => s + x.interest, 0), principal: p.reduce((s, x) => s + x.principal, 0) };
  }, [base]);

  const chartData = useMemo(() => {
    const d = [];
    for (let y = 0; y <= term; y++) {
      const m = y * 12;
      const b = base.schedule.find(s => s.month >= m) || base.schedule[base.schedule.length - 1];
      const e = withExtra.schedule.find(s => s.month >= m) || withExtra.schedule[withExtra.schedule.length - 1] || b;
      d.push({ year: `Y${y}`, 'Min Only': b?.balance || 0, 'With Extra': e?.balance || 0 });
    }
    return d;
  }, [base, withExtra, term]);

  const downPct = homePrice > 0 ? ((downPayment / homePrice) * 100).toFixed(0) : 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-body)' }}>
      <Header isMobile={isMobile} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '0 1rem' : '0 2rem' }}>
        {/* Hero */}
        <div style={{ padding: isMobile ? '2rem 0 1.5rem' : '3rem 0 2rem' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--slate)', marginBottom: '0.75rem' }}>
            Mortgage Calculator
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? '2.5rem' : '3.5rem', fontWeight: 600, lineHeight: 1.0, letterSpacing: '-1.5px', color: 'var(--text-primary)', margin: 0 }}>
            The real cost<br />of your{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--slate)' }}>mortgage.</em>
          </h1>
          <p style={{ fontSize: '0.9rem', fontWeight: 300, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '1rem', marginBottom: 0, maxWidth: 400 }}>
            See what your lender won&apos;t show you — and how to save tens of thousands.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
          {/* Left: Inputs */}
          <div>
            <div style={CARD}>
              <h3 style={{ margin: '0 0 1rem', fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, letterSpacing: '-0.2px', color: 'var(--text-primary)' }}>
                Mortgage Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <div>
                  <label style={LABEL}>Home Price</label>
                  <input type="text" inputMode="numeric" value={homePrice ? homePrice.toLocaleString() : ''} onChange={e => { const raw = e.target.value.replace(/[^0-9.]/g, ''); setHomePrice(raw === '' ? 0 : parseFloat(raw)); }} style={INPUT} />
                </div>
                <div>
                  <label style={LABEL}>Down Payment</label>
                  <input type="text" inputMode="numeric" value={downPayment ? downPayment.toLocaleString() : ''} onChange={e => { const raw = e.target.value.replace(/[^0-9.]/g, ''); setDownPayment(raw === '' ? 0 : parseFloat(raw)); }} style={INPUT} />
                </div>
                <div>
                  <label style={LABEL}>Interest Rate (%)</label>
                  <input type="number" step="0.01" value={rate || ''} onChange={e => setRate(parseFloat(e.target.value) || 0)} style={INPUT} />
                </div>
                <div>
                  <label style={LABEL}>Loan Term</label>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {[15, 20, 30].map(t => (
                      <button key={t} onClick={() => setTerm(t)} style={{ flex: 1, padding: '8px 4px', border: '1px solid', borderColor: term === t ? 'var(--slate)' : 'var(--border)', borderRadius: 4, background: term === t ? 'var(--slate-light)' : 'var(--bg)', color: term === t ? 'var(--slate)' : 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontWeight: term === t ? 500 : 400, fontSize: '0.8rem', cursor: 'pointer' }}>
                        {t}yr
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Loan amount result */}
              <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                <StatCell label="Loan Amount" value={fmt(loan)} sub={`${downPct}% down`} />
                <StatCell label="Monthly Payment" value={fmt(base.monthlyPayment) + '/mo'} color="var(--slate)" />
                <StatCell label="Total Interest" value={fmt(base.totalInterest)} color="var(--warn)" />
              </div>
            </div>

            {/* Extra payment */}
            <div style={CARD}>
              <h3 style={{ margin: '0 0 0.25rem', fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
                Extra Monthly Payment
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 0.875rem' }}>This is where it gets interesting.</p>
              <input type="range" min={0} max={2000} step={50} value={extra} onChange={e => setExtra(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--slate)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--slate)', fontVariantNumeric: 'tabular-nums' }}>{fmt(extra)}/mo</span>
                <div style={{ display: 'flex', gap: 5 }}>
                  {[0, 200, 500, 1000].map(v => (
                    <button key={v} onClick={() => setExtra(v)} style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid', borderColor: extra === v ? 'var(--slate)' : 'var(--border)', background: extra === v ? 'var(--slate)' : 'var(--bg)', color: extra === v ? 'white' : 'var(--text-muted)', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                      {v === 0 ? 'None' : `+$${v}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div>
            {/* Hidden cost */}
            <div style={{ ...CARD, borderColor: 'var(--warn)', background: 'var(--warn-light)' }}>
              <h3 style={{ margin: '0 0 1rem', fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--warn)', letterSpacing: '-0.2px' }}>
                The Hidden Cost
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <div style={{ textAlign: 'center', padding: '0.875rem', background: 'var(--bg)', borderRadius: 4, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--warn)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 5 }}>Total Interest</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '1.35rem', fontWeight: 600, color: 'var(--warn)', fontVariantNumeric: 'tabular-nums' }}>{fmt(base.totalInterest)}</div>
                </div>
                <div style={{ textAlign: 'center', padding: '0.875rem', background: 'var(--bg)', borderRadius: 4, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--warn)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 5 }}>True Cost of Home</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '1.35rem', fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{fmt(base.totalPaid + downPayment)}</div>
                </div>
              </div>
              <div style={{ marginTop: '0.875rem', padding: '0.75rem', background: 'var(--bg)', borderRadius: 4, border: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5 }}>
                On a {fmt(homePrice)} home, you&apos;ll pay <strong style={{ color: 'var(--warn)' }}>{fmt(base.totalInterest)}</strong> in interest — <strong>{homePrice > 0 ? ((base.totalInterest / homePrice) * 100).toFixed(0) : 0}%</strong> of the home&apos;s price on top of what you borrowed.
              </div>
            </div>

            {/* Year 1 */}
            <div style={CARD}>
              <h3 style={{ margin: '0 0 0.875rem', fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
                Year 1: Where Your Money Goes
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: 90, height: 90, flexShrink: 0 }}>
                  <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="12" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--warn)" strokeWidth="12" strokeDasharray={`${(yr1.interest / (yr1.interest + yr1.principal || 1)) * 251.2} 251.2`} />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--warn)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Interest</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--warn)', marginLeft: 'auto', fontVariantNumeric: 'tabular-nums' }}>{fmt(yr1.interest)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--sage)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Principal</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--sage-dark)', marginLeft: 'auto', fontVariantNumeric: 'tabular-nums' }}>{fmt(yr1.principal)}</span>
                  </div>
                  <div style={{ marginTop: 10, padding: '6px 10px', background: 'var(--warn-light)', border: '1px solid var(--border)', borderRadius: 4, fontSize: '0.72rem', color: 'var(--warn)', lineHeight: 1.4 }}>
                    {((yr1.interest / (yr1.interest + yr1.principal || 1)) * 100).toFixed(0)}% of your first year&apos;s payments go straight to interest.
                  </div>
                </div>
              </div>
            </div>

            {/* Extra payment savings */}
            {extra > 0 && (
              <div style={{ ...CARD, borderColor: 'var(--sage)', background: 'var(--sage-light)' }}>
                <h3 style={{ margin: '0 0 0.875rem', fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--sage-dark)', letterSpacing: '-0.2px' }}>
                  With {fmt(extra)}/mo Extra
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {[
                    { label: 'Interest Saved', value: fmt(base.totalInterest - withExtra.totalInterest) },
                    { label: 'Years Saved', value: ((base.payoffMonths - withExtra.payoffMonths) / 12).toFixed(1) + 'yr' },
                    { label: 'Payoff In', value: (withExtra.payoffMonths / 12).toFixed(1) + 'yr' },
                  ].map(m => (
                    <div key={m.label} style={{ textAlign: 'center', padding: '0.75rem 0.5rem', background: 'var(--bg)', borderRadius: 4, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.6rem', color: 'var(--sage-dark)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>{m.label}</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--sage-dark)', fontVariantNumeric: 'tabular-nums' }}>{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Term comparison */}
            <div style={CARD}>
              <h3 style={{ margin: '0 0 0.875rem', fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
                Term Comparison
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.75rem' }}>
                {[30, 15].map(t => {
                  const isCurrent = term === t;
                  const data = isCurrent ? base : altTerm;
                  return (
                    <div key={t} style={{ padding: '1rem', borderRadius: 4, border: '1px solid', borderColor: isCurrent ? 'var(--slate)' : 'var(--border)', background: isCurrent ? 'var(--slate-light)' : 'var(--bg)' }}>
                      <div style={{ fontSize: '0.6rem', color: isCurrent ? 'var(--slate)' : 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
                        {t}-Year {isCurrent && '← Current'}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{fmt(data.monthlyPayment)}/mo</div>
                      <div style={{ fontSize: '0.75rem', color: t === 15 ? 'var(--sage-dark)' : 'var(--warn)', marginTop: 4 }}>Total interest: {fmt(data.totalInterest)}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: '0.875rem', padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderLeft: '3px solid var(--sage)', borderRadius: 4, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                The 15-year costs more monthly but saves <strong style={{ color: 'var(--sage-dark)' }}>{fmt(Math.abs((term === 30 ? base.totalInterest : altTerm.totalInterest) - (term === 15 ? base.totalInterest : altTerm.totalInterest)))}</strong> in interest.
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ ...CARD, marginTop: '0.5rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, letterSpacing: '-0.2px', color: 'var(--text-primary)' }}>
            Balance Over Time
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C0714A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#C0714A" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7A9E87" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#7A9E87" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#D8D3C8" />
              <XAxis dataKey="year" stroke="#8A9A9A" fontSize={11} />
              <YAxis stroke="#8A9A9A" fontSize={11} tickFormatter={v => fmtK(v)} />
              <Tooltip formatter={v => fmt(v)} contentStyle={{ borderRadius: 4, border: '1px solid #D8D3C8', fontSize: 12, fontFamily: 'var(--font-body)', background: '#EFECE4' }} />
              <Area type="monotone" dataKey="Min Only" stroke="#C0714A" fill="url(#gB)" strokeWidth={2} strokeDasharray="5 4" />
              {extra > 0 && <Area type="monotone" dataKey="With Extra" stroke="#7A9E87" fill="url(#gE)" strokeWidth={2} />}
            </AreaChart>
          </ResponsiveContainer>
          {extra > 0 && (
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--warn)' }}><div style={{ width: 20, height: 2, background: 'var(--warn)', borderRadius: 2 }} /> Min only</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--sage-dark)' }}><div style={{ width: 20, height: 2, background: 'var(--sage)', borderRadius: 2 }} /> With extra</div>
            </div>
          )}
        </div>
      </div>

      <Footer isMobile={isMobile} />
    </div>
  );
}
