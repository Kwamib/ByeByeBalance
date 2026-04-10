'use client';

import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import DebtCard from './DebtCard';

const CARD = {
  background: 'var(--bg-card)',
  borderRadius: 6,
  border: '1px solid var(--border)',
  padding: '1.25rem 1.5rem',
  marginBottom: '1rem',
};

export default function DebtOverview({ debts, totalDebt, avgRate, monthlyMin, warningMap, isMobile, onUpdate, onRemove, onAdd, onClear }) {
  return (
    <div style={{ ...CARD, padding: isMobile ? '1rem' : '1.5rem' }}>
      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          border: '1px solid var(--border)',
          borderRadius: 5,
          overflow: 'hidden',
          marginBottom: '1.25rem',
        }}
      >
        {[
          { label: 'Total Debt', value: '$' + totalDebt.toLocaleString() },
          { label: 'Avg Rate', value: avgRate.toFixed(1) + '%', color: 'var(--slate)' },
          { label: 'Monthly Min', value: '$' + monthlyMin.toLocaleString() },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              padding: '1rem 1.25rem',
              background: 'var(--bg)',
              borderRight: i < 2 && !isMobile ? '1px solid var(--border)' : 'none',
              borderBottom: isMobile && i < 2 ? '1px solid var(--border)' : 'none',
            }}
          >
            <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
              {stat.label}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '1.35rem', fontWeight: 600, color: stat.color || 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.3px' }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Example notice */}
      {debts.some(d => d.balance > 0) && debts.length > 1 && (
        <div style={{ padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderLeft: '3px solid var(--sage)', borderRadius: 4, marginBottom: '1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Example debts shown</strong> — edit these with your real numbers or click Reset All to start fresh
        </div>
      )}

      {/* Section header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.2px', color: 'var(--text-primary)' }}>
          Your Debts
        </h3>
        <button
          onClick={onClear}
          style={{ padding: '0', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-body)' }}
        >
          <RefreshCw size={12} />
          Reset All
        </button>
      </div>

      {/* Table head */}
      {!isMobile && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.9fr 1fr auto', padding: '0 14px 8px', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
          <span>Name</span><span style={{ textAlign: 'right' }}>Balance</span><span style={{ textAlign: 'right' }}>Rate</span><span style={{ textAlign: 'right' }}>Min Pay</span><span />
        </div>
      )}

      {debts.map((debt, index) => (
        <DebtCard
          key={debt.id}
          debt={debt}
          index={index}
          warning={warningMap[debt.id]}
          isMobile={isMobile}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      ))}

      <button
        onClick={onAdd}
        style={{
          width: '100%',
          padding: '0.65rem',
          background: 'transparent',
          border: '1px dashed var(--border-strong)',
          borderRadius: 4,
          color: 'var(--text-muted)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          marginTop: '0.5rem',
          fontFamily: 'var(--font-body)',
          fontSize: '0.8rem',
          fontWeight: 400,
        }}
        onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--sage)'; e.currentTarget.style.color = 'var(--sage-dark)'; }}
        onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
      >
        <Plus size={14} />
        Add Another Debt
      </button>
    </div>
  );
}
