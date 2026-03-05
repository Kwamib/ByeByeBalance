'use client';

import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMobile } from '../hooks/useMobile';
import { calculateMortgage } from '../utils/calculations';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CARD = { background: 'white', borderRadius: 20, padding: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', marginBottom: '1.5rem' };
const LABEL = { fontSize: '0.72rem', color: '#64748b', display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 };
const INPUT = { width: '100%', padding: '0.6rem 0.75rem', border: '2px solid #e2e8f0', borderRadius: 8, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' };

function fmt(v) { return '$' + Math.round(v).toLocaleString(); }
function fmtK(v) { return v >= 1000 ? '$' + Math.round(v / 1000) + 'K' : fmt(v); }

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

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <Header isMobile={isMobile} />

      <div style={{ maxWidth: 1200, margin: isMobile ? '1rem auto' : '2rem auto', padding: isMobile ? '0 1rem' : '0 2rem' }}>
        <div style={{ textAlign: 'center', color: 'white', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: isMobile ? '1.75rem' : '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>The Real Cost of Your Mortgage</h2>
          <p style={{ fontSize: isMobile ? '1rem' : '1.1rem', opacity: 0.9 }}>See what your lender won{"'"}t show you — and how to save tens of thousands</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '2rem' }}>
          {/* Left: Inputs */}
          <div>
            <div style={CARD}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: '#1e293b' }}>Mortgage Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div><label style={LABEL}>Home Price</label><input type="text" inputMode="numeric" value={homePrice ? homePrice.toLocaleString() : ''} onChange={e => { const raw = e.target.value.replace(/[^0-9.]/g, ''); setHomePrice(raw === '' ? 0 : parseFloat(raw)); }} style={INPUT} /></div>
                <div><label style={LABEL}>Down Payment</label><input type="text" inputMode="numeric" value={downPayment ? downPayment.toLocaleString() : ''} onChange={e => { const raw = e.target.value.replace(/[^0-9.]/g, ''); setDownPayment(raw === '' ? 0 : parseFloat(raw)); }} style={INPUT} /></div>
                <div><label style={LABEL}>Interest Rate (%)</label><input type="number" step="0.01" value={rate || ''} onChange={e => setRate(parseFloat(e.target.value) || 0)} style={INPUT} /></div>
                <div>
                  <label style={LABEL}>Loan Term</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[15, 20, 30].map(t => (
                      <button key={t} onClick={() => setTerm(t)} style={{ flex: 1, padding: '0.6rem', border: '2px solid', borderColor: term === t ? '#667eea' : '#e2e8f0', borderRadius: 8, background: term === t ? '#667eea10' : 'white', color: term === t ? '#667eea' : '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>{t}yr</button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Loan Amount</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b' }}>{fmt(loan)}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{homePrice > 0 ? ((downPayment / homePrice) * 100).toFixed(0) : 0}% down</div>
              </div>
            </div>

            <div style={CARD}>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', color: '#1e293b' }}>Extra Monthly Payment</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 0 }}>This is where it gets interesting.</p>
              <input type="range" min={0} max={2000} step={50} value={extra} onChange={e => setExtra(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#667eea' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#667eea' }}>{fmt(extra)}/mo</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[0, 200, 500, 1000].map(v => (
                    <button key={v} onClick={() => setExtra(v)} style={{ padding: '0.3rem 0.6rem', borderRadius: 6, border: '1px solid', borderColor: extra === v ? '#667eea' : '#e2e8f0', background: extra === v ? '#667eea' : 'white', color: extra === v ? 'white' : '#64748b', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>{v === 0 ? 'None' : `+$${v}`}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div>
            {/* Hidden Cost */}
            <div style={{ ...CARD, background: 'linear-gradient(135deg, #fef2f2, #fef2f2)', border: '2px solid #fecaca' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.05rem', color: '#991b1b' }}>💸 The Hidden Cost</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Total Interest</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#dc2626' }}>{fmt(base.totalInterest)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#991b1b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>True Cost of Home</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#991b1b' }}>{fmt(base.totalPaid + downPayment)}</div>
                </div>
              </div>
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'white', borderRadius: 10, border: '1px solid #fecaca', fontSize: '0.8rem', color: '#991b1b', textAlign: 'center', lineHeight: 1.5 }}>
                On a {fmt(homePrice)} home, you{"'"}ll pay <strong>{fmt(base.totalInterest)}</strong> in interest — <strong>{homePrice > 0 ? ((base.totalInterest / homePrice) * 100).toFixed(0) : 0}%</strong> of the home{"'"}s price on top of what you borrowed.
              </div>
            </div>

            {/* Year 1 Breakdown */}
            <div style={CARD}>
              <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.05rem', color: '#1e293b' }}>Year 1: Where Your Money Goes</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ width: 110, height: 110, flexShrink: 0 }}>
                  <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#fee2e2" strokeWidth="12" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#dc2626" strokeWidth="12" strokeDasharray={`${(yr1.interest / (yr1.interest + yr1.principal || 1)) * 251.2} 251.2`} />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: '#dc2626' }} />
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Interest</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#dc2626', marginLeft: 'auto' }}>{fmt(yr1.interest)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: '#fee2e2' }} />
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Principal</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#059669', marginLeft: 'auto' }}>{fmt(yr1.principal)}</span>
                  </div>
                  <div style={{ marginTop: 12, padding: '0.5rem 0.75rem', background: '#fef3c7', borderRadius: 8, fontSize: '0.75rem', color: '#92400e', lineHeight: 1.5 }}>
                    {((yr1.interest / (yr1.interest + yr1.principal || 1)) * 100).toFixed(0)}% of your first year{"'"}s payments go straight to interest.
                  </div>
                </div>
              </div>
            </div>

            {/* Extra Payment Savings */}
            {extra > 0 && (
              <div style={{ ...CARD, background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '2px solid #86efac' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1.05rem', color: '#047857' }}>🎉 With {fmt(extra)}/mo Extra</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  {[
                    { label: 'Interest Saved', value: fmt(base.totalInterest - withExtra.totalInterest) },
                    { label: 'Years Saved', value: ((base.payoffMonths - withExtra.payoffMonths) / 12).toFixed(1) },
                    { label: 'Payoff In', value: (withExtra.payoffMonths / 12).toFixed(1) + 'yr' },
                  ].map(m => (
                    <div key={m.label} style={{ textAlign: 'center', padding: '0.75rem', background: 'white', borderRadius: 10, border: '1px solid #86efac' }}>
                      <div style={{ fontSize: '0.65rem', color: '#047857', fontWeight: 600, textTransform: 'uppercase' }}>{m.label}</div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669' }}>{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Monthly Payment */}
            <div style={CARD}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#667eea' }}>{fmt(base.monthlyPayment)}<span style={{ fontSize: '1rem', fontWeight: 400, color: '#94a3b8' }}>/mo</span></div>
              {extra > 0 && <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 4 }}>+ {fmt(extra)} extra = <strong>{fmt(base.monthlyPayment + extra)}/mo</strong></div>}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ ...CARD, marginTop: '0.5rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: '#1e293b' }}>Balance Over Time</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} /></linearGradient>
                <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#059669" stopOpacity={0.2} /><stop offset="95%" stopColor="#059669" stopOpacity={0.02} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={v => fmtK(v)} />
              <Tooltip formatter={v => fmt(v)} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13 }} />
              <Area type="monotone" dataKey="Min Only" stroke="#ef4444" fill="url(#gB)" strokeWidth={2.5} strokeDasharray="6 4" />
              {extra > 0 && <Area type="monotone" dataKey="With Extra" stroke="#059669" fill="url(#gE)" strokeWidth={2.5} />}
            </AreaChart>
          </ResponsiveContainer>
          {extra > 0 && (
            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#ef4444' }}><div style={{ width: 24, height: 3, background: '#ef4444', borderRadius: 2, opacity: 0.6 }} /> Min only</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#059669' }}><div style={{ width: 24, height: 3, background: '#059669', borderRadius: 2 }} /> With extra</div>
            </div>
          )}
        </div>

        {/* Term Comparison */}
        <div style={CARD}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: '#1e293b' }}>Term Comparison</h3>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
            {[30, 15].map(t => {
              const isCurrent = term === t;
              const data = isCurrent ? base : altTerm;
              return (
                <div key={t} style={{ padding: '1.25rem', borderRadius: 14, border: isCurrent ? '2px solid #667eea' : '2px solid #e2e8f0', background: isCurrent ? '#667eea08' : 'white' }}>
                  <div style={{ fontSize: '0.75rem', color: '#667eea', fontWeight: 700, marginBottom: 8 }}>{t}-YEAR {isCurrent && '← Current'}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>{fmt(data.monthlyPayment)}/mo</div>
                  <div style={{ fontSize: '0.8rem', color: t === 15 ? '#059669' : '#ef4444', marginTop: 4 }}>Total interest: {fmt(data.totalInterest)}</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#fef3c7', borderRadius: 10, border: '1px solid #fde68a', fontSize: '0.8rem', color: '#92400e', lineHeight: 1.5, textAlign: 'center' }}>
            💡 The 15-year costs more monthly but saves <strong>{fmt(Math.abs((term === 30 ? base.totalInterest : altTerm.totalInterest) - (term === 15 ? base.totalInterest : altTerm.totalInterest)))}</strong> in interest.
          </div>
        </div>
      </div>

      <Footer isMobile={isMobile} />
    </div>
  );
}
