'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { InlineWarning } from './WarningBanner';

const inputStyle = {
  width: '100%',
  padding: '0.5rem',
  border: '2px solid #e9ecef',
  borderRadius: '6px',
  fontSize: '0.9rem',
  transition: 'all 0.2s',
  outline: 'none',
};

const labelStyle = {
  fontSize: '0.75rem',
  color: '#6c757d',
  marginBottom: '0.25rem',
  display: 'block',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const focusHandlers = {
  onFocus: (e) => { e.target.style.borderColor = '#667eea'; e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'; },
  onBlur: (e) => { e.target.style.borderColor = '#e9ecef'; e.target.style.boxShadow = 'none'; },
};

export default function DebtCard({ debt, index, warning, isMobile, onUpdate, onRemove }) {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
        border: '2px solid #e9ecef',
        borderRadius: '16px',
        padding: isMobile ? '1rem' : '1.5rem',
        marginBottom: '1rem',
        position: 'relative',
        transition: 'all 0.3s ease',
      }}
    >
      <InlineWarning warning={warning} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ padding: '0.25rem 0.5rem', background: '#667eea', color: 'white', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' }}>
          #{index + 1}
        </span>
        <button
          onClick={() => onRemove(debt.id)}
          style={{ background: '#fee2e2', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.background = '#fecaca'}
          onMouseOut={(e) => e.currentTarget.style.background = '#fee2e2'}
        >
          <Trash2 size={16} color="#ef4444" />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Debt Name</label>
          <input type="text" value={debt.name} onChange={(e) => onUpdate(debt.id, 'name', e.target.value)} placeholder="e.g., Credit Card" style={inputStyle} {...focusHandlers} />
        </div>
        <div>
          <label style={labelStyle}>Balance ($)</label>
          <input
            type="text" inputMode="numeric"
            value={debt.balance ? debt.balance.toLocaleString() : ''}
            onChange={(e) => { const raw = e.target.value.replace(/[^0-9.]/g, ''); onUpdate(debt.id, 'balance', raw === '' ? 0 : parseFloat(raw)); }}
            placeholder="5,000" style={inputStyle} {...focusHandlers}
          />
        </div>
        <div>
          <label style={labelStyle}>Interest Rate (%)</label>
          <input
            type="number"
            value={debt.rate || ''}
            onChange={(e) => onUpdate(debt.id, 'rate', e.target.value === '' ? 0 : parseFloat(e.target.value))}
            placeholder="18.99" step="0.01" style={inputStyle} {...focusHandlers}
          />
        </div>
        <div>
          <label style={labelStyle}>Min Payment ($)</label>
          <input
            type="text" inputMode="numeric"
            value={debt.minPayment ? debt.minPayment.toLocaleString() : ''}
            onChange={(e) => { const raw = e.target.value.replace(/[^0-9.]/g, ''); onUpdate(debt.id, 'minPayment', raw === '' ? 0 : parseFloat(raw)); }}
            placeholder="150" style={inputStyle} {...focusHandlers}
          />
        </div>
      </div>
    </div>
  );
}
