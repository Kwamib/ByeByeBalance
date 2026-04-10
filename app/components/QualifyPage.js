'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useMobile } from '../hooks/useMobile';
import { calculateDTI, getMaxAffordable } from '../utils/calculations';
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

  const backOk = dti.backEnd <= 43;
  const frontOk = dti.frontEnd <= 28;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-body)' }}>
      <Header isMobile={isMobile} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '0 1rem' : '0 2rem' }}>
        {/* Hero */}
        <div style={{ padding: isMobile ? '2rem 0 1.5rem' : '3rem 0 2rem' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--sage)', marginBottom: '0.75rem' }}>
            DTI / Qualify Calculator
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? '2.5rem' : '3.5rem', fontWeight: 600, lineHeight: 1.0, letterSpacing: '-1.5px', color: 'var(--text-primary)', margin: 0 }}>
            Can you<br />
            <em style={{ fontStyle: 'italic', color: 'var(--sage)' }}>qualify?</em>
          </h1>
          <p style={{ fontSize: '0.9rem', fontWeight: 300, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '1rem', marginBottom: 0, maxWidth: 400 }}>
            See how your debt affects mortgage approval — and what to pay off first.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
          {/* Left */}
          <div>
            <div style={CARD}>
              <h3 style={{ margin: '0 0 1rem', fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
                Your Income
              </h3>
              <label style={LABEL}>Gross Monthly Income (before taxes)</label>
              <input type="text" inputMode="numeric" value={grossIncome ? grossIncome.toLocaleString() : ''} onChange={e => { const raw = e.target.value.replace(/[^0-9.]/g, ''); setGrossIncome(raw === '' ? 0 : parseFloat(raw)); }} style={INPUT} placeholder="8,500" />
            </div>

            <div style={CARD}>
              <h3 style={{ margin: '0 0 1rem', fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
                Monthly Debts
              </h3>
              {debts.map(d => (
                <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <input type="text" value={d.name} onChange={e => updateDebt(d.id, 'name', e.target.value)} placeholder="Debt name" style={INPUT} />
                  <input type="text" inputMode="numeric" value={d.minPayment ? d.minPayment.toLocaleString() : ''} onChange={e => { const raw = e.target.value.replace(/[^0-9.]/g, ''); updateDebt(d.id, 'minPayment', raw === '' ? 0 : parseFloat(raw)); }} placeholder="Payment" style={INPUT} />
                  <button
                    onClick={() => removeDebt(d.id)}
                    style={{ padding: '8px', background: 'none', border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem', lineHeight: 1, flexShrink: 0 }}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--warn)'; e.currentTarget.style.color = 'var(--warn)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >✕</button>
                </div>
              ))}
              <button
                onClick={addDebt}
                style={{ width: '100%', padding: '8px', border: '1px dashed var(--border-strong)', borderRadius: 4, background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--sage)'; e.currentTarget.style.color = 'var(--sage-dark)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <Plus size={14} /> Add Debt
              </button>
            </div>

            <div style={CARD}>
              <h3 style={{ margin: '0 0 0.25rem', fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.2px', display: 'flex', alignItems: 'center', gap: 8 }}>
                Proposed Housing Payment
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-muted)', letterSpacing: 0 }}>(PITI)</span>
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.875rem' }}>Mortgage + property taxes + insurance</p>
              <input type="text" inputMode="numeric" value={housing ? housing.toLocaleString() : ''} onChange={e => { const raw = e.target.value.replace(/[^0-9.]/g, ''); setHousing(raw === '' ? 0 : parseFloat(raw)); }} style={INPUT} placeholder="2,200" />
            </div>
          </div>

          {/* Right: DTI Results */}
          <div>
            {/* DTI Gauge */}
            <div style={CARD}>
              <h3 style={{ margin: '0 0 1.25rem', fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
                Your DTI Ratio
              </h3>

              {/* Two big numbers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ padding: '1rem', background: 'var(--bg)', borderRadius: 4, border: '1px solid', borderColor: backOk ? 'var(--border)' : 'var(--warn)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>Back-End DTI</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '2.25rem', fontWeight: 600, color: backOk ? 'var(--sage-dark)' : 'var(--warn)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-1px', lineHeight: 1 }}>
                    {dti.backEnd.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>Target: ≤ 43%</div>
                </div>
                <div style={{ padding: '1rem', background: 'var(--bg)', borderRadius: 4, border: '1px solid', borderColor: frontOk ? 'var(--border)' : 'var(--warn)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>Front-End DTI</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '2.25rem', fontWeight: 600, color: frontOk ? 'var(--sage-dark)' : 'var(--warn)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-1px', lineHeight: 1 }}>
                    {dti.frontEnd.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>Target: ≤ 28%</div>
                </div>
              </div>

              {/* Track */}
              <div style={{ height: 5, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
                <div style={{ height: '100%', width: `${Math.min(dti.backEnd, 100)}%`, background: backOk ? 'var(--sage)' : 'var(--warn)', borderRadius: 99, transition: 'width 0.3s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                <span>0%</span><span>28%</span><span>43%</span><span>100%</span>
              </div>

              {/* Status */}
              <div style={{ padding: '12px 14px', borderRadius: 4, background: backOk ? 'var(--success-light)' : 'var(--warn-light)', border: '1px solid', borderColor: backOk ? 'var(--sage)' : 'var(--warn)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: backOk ? 'var(--sage-dark)' : 'var(--warn)', marginBottom: 3 }}>
                  {backOk ? '✓ You likely qualify' : '✗ DTI too high to qualify'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {dti.message}
                </div>
              </div>
            </div>

            {/* Max Affordable */}
            <div style={CARD}>
              <h3 style={{ margin: '0 0 0.875rem', fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
                What Can You Afford?
              </h3>
              <div style={{ textAlign: 'center', padding: '1.25rem', background: 'var(--bg)', borderRadius: 4, border: '1px solid var(--slate)', borderColor: 'var(--slate)' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--slate)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 5 }}>Max Home Price (at 43% DTI)</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '2rem', fontWeight: 600, color: 'var(--slate)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.5px' }}>{fmt(maxHome)}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>With {fmt(downPayment)} down</div>
              </div>
            </div>

            {/* Power Move */}
            {dti.backEnd > 36 && (
              <div style={{ ...CARD, borderColor: 'var(--sage)', background: 'var(--sage-light)' }}>
                <h3 style={{ margin: '0 0 0.75rem', fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--sage-dark)', letterSpacing: '-0.2px' }}>
                  The Power Move
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--sage-dark)', lineHeight: 1.6 }}>
                  Pay off all your debts ({fmt(dti.totalDebtPayments)}/mo) and your DTI drops from{' '}
                  <strong style={{ color: 'var(--warn)' }}>{dti.backEnd.toFixed(1)}%</strong> to{' '}
                  <strong style={{ color: 'var(--sage-dark)' }}>{dtiIfFree.toFixed(1)}%</strong>.
                </div>
                <div style={{ marginTop: '0.75rem', padding: '10px 14px', background: 'var(--bg)', borderRadius: 4, border: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5 }}>
                  You could qualify for <strong style={{ color: 'var(--slate)', fontSize: '1rem' }}>{fmt(maxHomeDebtFree)}</strong> — <strong>{fmt(maxHomeDebtFree - maxHome)}</strong> more buying power.
                </div>
                <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                  <Link href="/" style={{ display: 'inline-block', padding: '8px 18px', background: 'var(--text-primary)', color: 'var(--bg)', borderRadius: 4, fontWeight: 500, fontSize: '0.8rem', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>
                    Build your debt payoff plan →
                  </Link>
                </div>
              </div>
            )}

            {/* Monthly Breakdown */}
            <div style={CARD}>
              <h3 style={{ margin: '0 0 0.875rem', fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
                Monthly Breakdown
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {debts.filter(d => d.minPayment > 0).map(d => (
                  <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg)', borderRadius: 4, border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{d.name || 'Unnamed'}</span>
                    <span style={{ fontWeight: 500, fontSize: '0.8rem', color: 'var(--warn)', fontVariantNumeric: 'tabular-nums' }}>{fmt(d.minPayment)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--slate-light)', borderRadius: 4, border: '1px solid var(--slate)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--slate)', fontWeight: 500 }}>Housing (PITI)</span>
                  <span style={{ fontWeight: 500, fontSize: '0.8rem', color: 'var(--slate)', fontVariantNumeric: 'tabular-nums' }}>{fmt(housing)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--text-primary)', borderRadius: 4 }}>
                  <span style={{ color: 'white', fontWeight: 500, fontSize: '0.8rem' }}>Total</span>
                  <span style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', fontVariantNumeric: 'tabular-nums' }}>{fmt(dti.totalDebtPayments + housing)}</span>
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
