'use client';

import React from 'react';
import { Zap, Snowflake, Mountain, TrendingDown } from 'lucide-react';
import { STRATEGIES, EXTRA_PAYMENT_PRESETS } from '../utils/constants';

export default function StrategySelector({ strategy, extraPayment, isMobile, onStrategyChange, onExtraChange, onCalculate }) {
  const currentStrategy = STRATEGIES.find(s => s.id === strategy);

  return (
    <div style={{ background: 'white', borderRadius: '20px', padding: isMobile ? '1rem' : '1.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
      <h3 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: isMobile ? '1.125rem' : '1.25rem' }}>
        <Zap size={20} color="#facc15" />
        Payoff Strategy
      </h3>

      {/* Strategy Toggle */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '0.75rem' }}>
        {STRATEGIES.map(strat => {
          const Icon = strat.id === 'snowball' ? Snowflake : Mountain;
          return (
            <div
              key={strat.id}
              onClick={() => onStrategyChange(strat.id)}
              style={{
                padding: '1rem',
                border: '2px solid',
                borderColor: strategy === strat.id ? '#667eea' : '#e9ecef',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'center',
                background: strategy === strat.id
                  ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
                  : 'white',
                transition: 'all 0.2s',
              }}
            >
              <Icon size={28} color="#667eea" style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{strat.label}</div>
              <div style={{ fontSize: '0.7rem', color: '#6c757d', lineHeight: 1.3 }}>{strat.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Strategy Description */}
      <p style={{ fontSize: '0.8rem', color: '#6c757d', textAlign: 'center', marginTop: '0.75rem', lineHeight: 1.5 }}>
        {currentStrategy?.tip}
      </p>

      {/* Extra Payment */}
      <div style={{ marginTop: '1.5rem' }}>
        <label style={{ fontSize: '0.875rem', color: '#495057', fontWeight: '600' }}>
          Extra Monthly Payment (This is where the magic happens!)
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <input
            type="number"
            value={extraPayment || ''}
            onChange={(e) => onExtraChange(e.target.value === '' ? 0 : parseFloat(e.target.value))}
            placeholder="0"
            style={{ flex: 1, padding: '0.75rem', border: '2px solid #dee2e6', borderRadius: '8px', fontSize: '1rem' }}
          />
          <button
            onClick={onCalculate}
            style={{
              padding: '0.75rem 2rem',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <TrendingDown size={18} />
            {isMobile ? 'Go' : 'Calculate'}
          </button>
        </div>

        {/* Presets */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>Try:</span>
          {EXTRA_PAYMENT_PRESETS.map(amount => (
            <button
              key={amount}
              onClick={() => onExtraChange(amount)}
              style={{
                padding: '0.25rem 0.5rem',
                background: extraPayment === amount ? '#667eea' : '#f8f9fa',
                color: extraPayment === amount ? 'white' : '#495057',
                border: '1px solid',
                borderColor: extraPayment === amount ? '#667eea' : '#dee2e6',
                borderRadius: '6px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              +${amount}
            </button>
          ))}
          <span style={{ fontSize: '0.75rem', color: '#10b981', fontStyle: 'italic' }}>
            Even $50 extra makes a huge difference!
          </span>
        </div>
      </div>
    </div>
  );
}
