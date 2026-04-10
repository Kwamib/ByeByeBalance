'use client';

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { InlineWarning } from './WarningBanner';

const LABEL = {
  fontSize: '0.6rem',
  fontWeight: 600,
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  display: 'block',
  marginBottom: 4,
};

const INPUT = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid var(--border)',
  borderRadius: 4,
  fontSize: '0.875rem',
  fontFamily: 'var(--font-body)',
  color: 'var(--text-primary)',
  background: 'var(--bg)',
  outline: 'none',
  transition: 'border-color 0.15s',
};

export default function DebtCard({ debt, index, warning, isMobile, onUpdate, onRemove }) {
  const [focused, setFocused] = useState(null);

  const focusStyle = (field) => focused === field
    ? { ...INPUT, borderColor: 'var(--slate)', boxShadow: '0 0 0 3px var(--slate-light)' }
    : INPUT;

  return (
    <div
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 4,
        padding: isMobile ? '1rem' : '12px 14px',
        marginTop: 5,
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      <InlineWarning warning={warning} />

      {isMobile ? (
        // Mobile: card layout
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Debt #{index + 1}
            </span>
            <button
              onClick={() => onRemove(debt.id)}
              style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}
            >
              <Trash2 size={13} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={LABEL}>Debt Name</label>
              <input type="text" value={debt.name} onChange={(e) => onUpdate(debt.id, 'name', e.target.value)} placeholder="e.g., Credit Card" style={focusStyle('name')} onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} />
            </div>
            <div>
              <label style={LABEL}>Balance ($)</label>
              <input type="text" inputMode="numeric" value={debt.balance ? debt.balance.toLocaleString() : ''} onChange={(e) => { const raw = e.target.value.replace(/[^0-9.]/g, ''); onUpdate(debt.id, 'balance', raw === '' ? 0 : parseFloat(raw)); }} placeholder="5,000" style={focusStyle('balance')} onFocus={() => setFocused('balance')} onBlur={() => setFocused(null)} />
            </div>
            <div>
              <label style={LABEL}>Rate (%)</label>
              <input type="number" value={debt.rate || ''} onChange={(e) => onUpdate(debt.id, 'rate', e.target.value === '' ? 0 : parseFloat(e.target.value))} placeholder="18.99" step="0.01" style={focusStyle('rate')} onFocus={() => setFocused('rate')} onBlur={() => setFocused(null)} />
            </div>
            <div>
              <label style={LABEL}>Min Payment ($)</label>
              <input type="text" inputMode="numeric" value={debt.minPayment ? debt.minPayment.toLocaleString() : ''} onChange={(e) => { const raw = e.target.value.replace(/[^0-9.]/g, ''); onUpdate(debt.id, 'minPayment', raw === '' ? 0 : parseFloat(raw)); }} placeholder="150" style={focusStyle('minPay')} onFocus={() => setFocused('minPay')} onBlur={() => setFocused(null)} />
            </div>
          </div>
        </div>
      ) : (
        // Desktop: row layout
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.9fr 1fr auto', gap: '0.75rem', alignItems: 'center' }}>
          <input type="text" value={debt.name} onChange={(e) => onUpdate(debt.id, 'name', e.target.value)} placeholder="Credit Card" style={{ ...focusStyle('name'), fontWeight: 500 }} onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} />
          <input type="text" inputMode="numeric" value={debt.balance ? debt.balance.toLocaleString() : ''} onChange={(e) => { const raw = e.target.value.replace(/[^0-9.]/g, ''); onUpdate(debt.id, 'balance', raw === '' ? 0 : parseFloat(raw)); }} placeholder="5,000" style={{ ...focusStyle('balance'), textAlign: 'right' }} onFocus={() => setFocused('balance')} onBlur={() => setFocused(null)} />
          <input type="number" value={debt.rate || ''} onChange={(e) => onUpdate(debt.id, 'rate', e.target.value === '' ? 0 : parseFloat(e.target.value))} placeholder="18.9" step="0.01" style={{ ...focusStyle('rate'), textAlign: 'right', color: 'var(--text-secondary)' }} onFocus={() => setFocused('rate')} onBlur={() => setFocused(null)} />
          <input type="text" inputMode="numeric" value={debt.minPayment ? debt.minPayment.toLocaleString() : ''} onChange={(e) => { const raw = e.target.value.replace(/[^0-9.]/g, ''); onUpdate(debt.id, 'minPayment', raw === '' ? 0 : parseFloat(raw)); }} placeholder="150" style={{ ...focusStyle('minPay'), textAlign: 'right' }} onFocus={() => setFocused('minPay')} onBlur={() => setFocused(null)} />
          <button
            onClick={() => onRemove(debt.id)}
            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', flexShrink: 0 }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--warn)'; e.currentTarget.style.color = 'var(--warn)'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
