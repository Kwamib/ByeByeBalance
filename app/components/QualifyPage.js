'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useMobile } from '../hooks/useMobile';
import { calculateDTI, getMaxAffordable } from '../utils/calculations';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CARD = { background: 'white', borderRadius: 20, padding: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', marginBottom: '1.5rem' };
const LABEL = { fontSize: '0.72rem', color: '#64748b', display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 };
const INPUT = { width: '100%', padding: '0.6rem 0.75rem', border: '2px solid #e2e8f0', borderRadius: 8, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' };

function fmt(v) { return '$' + Math.round(v).toLocaleString(); }

export default function QualifyPage() {
  const isMobile = useMobile();
  const [grossIncome, setGrossIncome] = useState(8500);
  const [debts, setDebts] = useState([
    { id: 1, name: 'Credit Card', minPayment: 240 },
    { id: 2, name: 'Car Loan', minPayment: 300 },
    { id: 3, name: 'Student Loan', minPayment: 165 },
  ]);
  const [housing, setHousing] = useState(2200);
  const [downPayment] = useState(80000);
  const [rate] = useState(6.75);
  const [term] = useState(30);
  const [nextId, setNextId] = useState(4);

  const dti = useMemo(() => calculateDTI(grossIncome, debts, housing), [grossIncome, debts, housing]);
  const maxHome = useMemo(() => getMaxAffordable(grossIncome, dti.totalDebtPayments, rate, term) + downPayment, [grossIncome, dti.totalDebtPayments, rate, term, downPayment]);
  const maxHomeDebtFree = useMemo(() => getMaxAffordable(grossIncome, 0, rate, term) + downPayment, [grossIncome, rate, term, downPayment]);
  const dtiIfFree = useMemo(() => grossIncome > 0 ? (housing / grossIncome) * 100 : 0, [grossIncome, housing]);

  const addDebt = () => { setDebts([...debts, { id: nextId, name: '', minPayment: 0 }]); setNextId(n => n + 1); };
  const removeDebt = (id) => { if (debts.length > 1) setDebts(debts.filter(d => d.id !== id)); };
  const updateDebt = (id, field, val) => setDebts(debts.map(d => d.id === id ? { ...d, [field]: val } : d));

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <Header isMobile={isMobile} />

      <div style={{ maxWidth: 1200, margin: isMobile ? '1rem auto' : '2rem auto', padding: isMobile ? '0 1rem' : '0 2rem' }}>
        <div style={{ textAlign: 'center', color: 'white', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: isMobile ? '1.75rem' : '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Can You Qualify?</h2>
          <p style={{ fontSize: isMobile ? '1rem' : '1.1rem', opacity: 0.9 }}>See how your debt affects your mortgage approval — and what to pay off first</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '2rem' }}>
          {/* Left: Inputs */}
          <div>
            <div style={CARD}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: '#1e293b' }}>Your Income</h3>
              <label style={LABEL}>Gross Monthly Income (before taxes)</label>
              <input type="text" inputMode="numeric" value={grossIncome ? grossIncome.toLocaleString() : ''} onChange={e => { const raw = e.target.value.replace(/[^0-9.]/g, ''); setGrossIncome(raw === '' ? 0 : parseFloat(raw)); }} style={INPUT} placeholder="8,500" />
            </div>

            <div style={CARD}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: '#1e293b' }}>Monthly Debts</h3>
              {debts.map(d => (
                <div key={d.id} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label style={LABEL}>Name</label>
                    <input type="text" value={d.name} onChange={e => updateDebt(d.id, 'name', e.target.value)} style={INPUT} />
                  </div>
                  <div style={{ width: 130 }}>
                    <label style={LABEL}>Payment</label>
                    <input type="text" inputMode="numeric" value={d.minPayment ? d.minPayment.toLocaleString() : ''} onChange={e => { const raw = e.target.value.replace(/[^0-9.]/g, ''); updateDebt(d.id, 'minPayment', raw === '' ? 0 : parseFloat(raw)); }} style={INPUT} />
                  </div>
                  <button onClick={() => removeDebt(d.id)} style={{ padding: '0.6rem', background: '#fee2e2', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#dc2626', fontWeight: 700, fontSize: '0.85rem' }}>✕</button>
                </div>
              ))}
              <button onClick={addDebt} style={{ width: '100%', padding: '0.6rem', border: '2px dashed #e2e8f0', borderRadius: 8, background: 'transparent', color: '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Plus size={16} /> Add Debt
              </button>
            </div>

            <div style={CARD}>
              <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
                Proposed Housing Payment <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#94a3b8' }}>(PITI)</span>
                <span style={{ position: 'relative', display: 'inline-flex' }}>
                  <span
                    style={{ width: 18, height: 18, borderRadius: '50%', background: '#e2e8f0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', cursor: 'help', lineHeight: 1 }}
                    onMouseOver={e => { e.currentTarget.nextSibling.style.opacity = '1'; e.currentTarget.nextSibling.style.visibility = 'visible'; }}
                    onMouseOut={e => { e.currentTarget.nextSibling.style.opacity = '0'; e.currentTarget.nextSibling.style.visibility = 'hidden'; }}
                  >i</span>
                  <span style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: 'white', padding: '0.6rem 0.85rem', borderRadius: 10, fontSize: '0.78rem', lineHeight: 1.5, width: 240, textAlign: 'left', fontWeight: 400, opacity: 0, visibility: 'hidden', transition: 'all 0.2s', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                    <strong style={{ display: 'block', marginBottom: 4 }}>PITI stands for:</strong>
                    Principal + Interest + Taxes + Insurance
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 4, display: 'block' }}>This is your total monthly housing cost that lenders use to calculate your DTI ratio.</span>
                    <span style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #1e293b' }} />
                  </span>
                </span>
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 0 }}>Mortgage + property taxes + insurance</p>
              <input type="text" inputMode="numeric" value={housing ? housing.toLocaleString() : ''} onChange={e => { const raw = e.target.value.replace(/[^0-9.]/g, ''); setHousing(raw === '' ? 0 : parseFloat(raw)); }} style={INPUT} placeholder="2,200" />
            </div>
          </div>

          {/* Right: DTI Results */}
          <div>
            {/* DTI Gauge */}
            <div style={CARD}>
              <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', color: '#1e293b' }}>Your Debt-to-Income Ratio</h3>

              {/* Color bar */}
              <div style={{ position: 'relative', height: 36, background: 'linear-gradient(90deg, #059669 0%, #059669 36%, #f59e0b 36%, #f59e0b 43%, #ef4444 43%, #ef4444 55%, #991b1b 55%)', borderRadius: 10, marginBottom: 24, overflow: 'visible' }}>
                <div style={{ position: 'absolute', left: `${Math.min(dti.backEnd, 58)}%`, top: -2, bottom: -2, width: 3, background: '#1e293b', borderRadius: 2, zIndex: 2 }} />
                <div style={{ position: 'absolute', left: `${Math.min(dti.backEnd, 58)}%`, top: -22, transform: 'translateX(-50%)', background: '#1e293b', color: 'white', padding: '2px 8px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700 }}>{dti.backEnd.toFixed(1)}%</div>
              </div>

              {/* Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '1rem', borderRadius: 12, background: `${dti.color}10`, border: `2px solid ${dti.color}30`, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: dti.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', color: 'white', fontWeight: 800, flexShrink: 0 }}>
                  {dti.status === 'Strong' ? '✓' : dti.status === 'Borderline' ? '~' : '✕'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: dti.color, fontSize: '1.1rem' }}>{dti.status}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>{dti.message}</div>
                </div>
              </div>

              {/* Ratios */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Front-End DTI</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: dti.frontEnd <= 28 ? '#059669' : '#ef4444' }}>{dti.frontEnd.toFixed(1)}%</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Target: ≤ 28%</div>
                </div>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Back-End DTI</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: dti.backEnd <= 43 ? '#059669' : '#ef4444' }}>{dti.backEnd.toFixed(1)}%</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Target: ≤ 43%</div>
                </div>
              </div>
            </div>

            {/* Max Affordable */}
            <div style={CARD}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.05rem', color: '#1e293b' }}>What Can You Afford?</h3>
              <div style={{ textAlign: 'center', padding: '1.25rem', background: 'linear-gradient(135deg, #667eea10, #764ba210)', borderRadius: 14, border: '2px solid #667eea30' }}>
                <div style={{ fontSize: '0.7rem', color: '#667eea', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Max Home Price (at 43% DTI)</div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#667eea' }}>{fmt(maxHome)}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>With {fmt(downPayment)} down</div>
              </div>
            </div>

            {/* Power Move */}
            {dti.backEnd > 36 && (
              <div style={{ ...CARD, background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '2px solid #86efac' }}>
                <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.05rem', color: '#047857' }}>💡 The Power Move</h3>
                <div style={{ fontSize: '0.85rem', color: '#047857', lineHeight: 1.6 }}>
                  Pay off all your debts ({fmt(dti.totalDebtPayments)}/mo) and your DTI drops from <strong style={{ color: '#dc2626' }}>{dti.backEnd.toFixed(1)}%</strong> to <strong style={{ color: '#059669' }}>{dtiIfFree.toFixed(1)}%</strong>.
                </div>
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'white', borderRadius: 10, border: '1px solid #86efac', fontSize: '0.8rem', color: '#047857', textAlign: 'center' }}>
                  You could qualify for <strong style={{ fontSize: '1.1rem' }}>{fmt(maxHomeDebtFree)}</strong> — <strong>{fmt(maxHomeDebtFree - maxHome)}</strong> more buying power.
                </div>
                <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                  <Link href="/" style={{ display: 'inline-block', padding: '0.6rem 1.5rem', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', borderRadius: 10, fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}>
                    → Build your debt payoff plan
                  </Link>
                </div>
              </div>
            )}

            {/* Monthly Breakdown */}
            <div style={CARD}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.05rem', color: '#1e293b' }}>Monthly Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {debts.filter(d => d.minPayment > 0).map(d => (
                  <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.75rem', background: '#f8fafc', borderRadius: 8 }}>
                    <span style={{ fontSize: '0.85rem' }}>{d.name || 'Unnamed'}</span>
                    <span style={{ fontWeight: 600, color: '#ef4444' }}>{fmt(d.minPayment)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.75rem', background: '#667eea10', borderRadius: 8, border: '1px solid #667eea30' }}>
                  <span style={{ color: '#667eea', fontWeight: 600, fontSize: '0.85rem' }}>Housing</span>
                  <span style={{ fontWeight: 600, color: '#667eea' }}>{fmt(housing)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#1e293b', borderRadius: 8, marginTop: 4 }}>
                  <span style={{ color: 'white', fontWeight: 600 }}>Total</span>
                  <span style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem' }}>{fmt(dti.totalDebtPayments + housing)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer isMobile={isMobile} />
    </div>
  );
}
