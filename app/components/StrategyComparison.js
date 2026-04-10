'use client';

import React from 'react';

export default function StrategyComparison({ comparison, strategy, isMobile }) {
  if (!comparison) return null;

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: 6, border: '1px solid var(--border)', overflow: 'hidden' }}>
      <div style={{ padding: '14px 1.5rem', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600, letterSpacing: '-0.2px', color: 'var(--text-primary)' }}>
          Strategy Comparison
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
        {/* Snowball */}
        <div style={{
          padding: '1rem 1.25rem',
          background: strategy === 'snowball' ? 'var(--sage-light)' : 'var(--bg)',
          borderRight: isMobile ? 'none' : '1px solid var(--border)',
          borderBottom: isMobile ? '1px solid var(--border)' : 'none',
        }}>
          <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: strategy === 'snowball' ? 'var(--sage-dark)' : 'var(--text-muted)', marginBottom: 6 }}>
            Snowball
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 600, color: strategy === 'snowball' ? 'var(--sage-dark)' : 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            ${Math.round(comparison.snowball.interest).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 3 }}>
            {comparison.snowball.months} months • Total interest
          </div>
        </div>

        {/* Avalanche */}
        <div style={{
          padding: '1rem 1.25rem',
          background: strategy === 'avalanche' ? 'var(--sage-light)' : 'var(--bg)',
        }}>
          <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: strategy === 'avalanche' ? 'var(--sage-dark)' : 'var(--text-muted)', marginBottom: 6 }}>
            Avalanche
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 600, color: strategy === 'avalanche' ? 'var(--sage-dark)' : 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            ${Math.round(comparison.avalanche.interest).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 3 }}>
            {comparison.avalanche.months} months • Total interest
          </div>
        </div>
      </div>

      {/* Savings callout */}
      {comparison.difference.interest > 0 && (
        <div style={{ padding: '10px 1.5rem', background: 'var(--bg)', borderTop: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Avalanche saves <strong style={{ color: 'var(--sage-dark)' }}>${Math.round(comparison.difference.interest).toLocaleString()}</strong> more in interest
          {comparison.difference.months > 0 && (<span> and <strong>{comparison.difference.months} months</strong></span>)}.
        </div>
      )}
    </div>
  );
}
