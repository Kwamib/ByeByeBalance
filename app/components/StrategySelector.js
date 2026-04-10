'use client';

import React from 'react';
import { STRATEGIES, EXTRA_PAYMENT_PRESETS } from '../utils/constants';

const CARD = {
  background: 'var(--bg-card)',
  borderRadius: 6,
  border: '1px solid var(--border)',
  padding: '1.25rem 1.5rem',
};

const LBL = {
  fontSize: '0.6rem',
  fontWeight: 600,
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  display: 'block',
  marginBottom: 5,
};

const INP = {
  width: '100%',
  padding: '9px 11px',
  border: '1px solid var(--border)',
  borderRadius: 4,
  fontSize: '0.875rem',
  fontFamily: 'var(--font-body)',
  color: 'var(--text-primary)',
  background: 'var(--bg)',
  outline: 'none',
  boxSizing: 'border-box',
  fontVariantNumeric: 'tabular-nums',
};

export default function StrategySelector({ strategy, extraPayment, isMobile, onStrategyChange, onExtraChange, onCalculate }) {
  return (
    <div style={CARD}>
      <h3 style={{ margin: '0 0 0.75rem', fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.2px', color: 'var(--text-primary)' }}>
        Strategy
      </h3>

      {/* Strategy Toggle */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid var(--border)', borderRadius: 5, overflow: 'hidden' }}>
        {STRATEGIES.map((strat, i) => (
          <div
            key={strat.id}
            onClick={() => onStrategyChange(strat.id)}
            style={{
              padding: '1rem 1.25rem',
              cursor: 'pointer',
              background: strategy === strat.id ? 'var(--sage-light)' : 'var(--bg)',
              borderRight: i === 0 ? '1px solid var(--border)' : 'none',
              transition: 'background 0.15s',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: strategy === strat.id ? 'var(--sage-dark)' : 'var(--text-primary)' }}>{strat.label}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>{strat.desc}</div>
          </div>
        ))}
      </div>

      {/* Strategy tip */}
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: 0, lineHeight: 1.5 }}>
        {strategy === 'snowball' ? '💡 Smallest balance first — quick wins keep you motivated.' : '💡 Highest interest first — saves the most money.'}
      </p>

      {/* Extra Payment */}
      <div style={{ marginTop: '1.25rem' }}>
        <label style={LBL}>Extra Monthly Payment</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            inputMode="numeric"
            value={extraPayment ? extraPayment.toLocaleString() : ''}
            onChange={(e) => { const raw = e.target.value.replace(/[^0-9.]/g, ''); onExtraChange(raw === '' ? 0 : parseFloat(raw)); }}
            placeholder="0"
            style={{ ...INP, flex: 1 }}
          />
          <button
            onClick={onCalculate}
            style={{
              padding: '9px 20px',
              background: 'var(--text-primary)',
              color: 'var(--bg)',
              border: 'none',
              borderRadius: 4,
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              fontSize: '0.8rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Calculate
          </button>
        </div>

        {/* Presets */}
        <div style={{ display: 'flex', gap: 5, marginTop: '0.5rem', alignItems: 'center' }}>
          {EXTRA_PAYMENT_PRESETS.map(amount => (
            <button
              key={amount}
              onClick={() => onExtraChange(amount)}
              style={{
                padding: '5px 10px',
                borderRadius: 4,
                border: '1px solid',
                borderColor: extraPayment === amount ? 'var(--sage)' : 'var(--border)',
                background: extraPayment === amount ? 'var(--sage-light)' : 'transparent',
                color: extraPayment === amount ? 'var(--sage-dark)' : 'var(--text-muted)',
                fontSize: '0.72rem',
                cursor: 'pointer',
                fontWeight: 500,
                fontFamily: 'var(--font-body)',
              }}
            >
              +${amount}
            </button>
          ))}
          <span style={{ fontSize: '0.72rem', color: 'var(--sage)', fontStyle: 'italic', marginLeft: 4 }}>
            Even $50 makes a difference
          </span>
        </div>
      </div>
    </div>
  );
}
