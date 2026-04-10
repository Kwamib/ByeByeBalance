'use client';

import React from 'react';

export default function HeroSection({ isMobile }) {
  return (
    <div
      style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: isMobile ? '2rem 1rem 1.5rem' : '3rem 2rem 2rem',
      }}
      className="no-print"
    >
      <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--sage)', marginBottom: '0.75rem' }}>
        Debt Payoff Calculator
      </div>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: isMobile ? '2.75rem' : '3.75rem',
          fontWeight: 600,
          lineHeight: 1.0,
          letterSpacing: '-1.5px',
          color: 'var(--text-primary)',
          margin: 0,
        }}
      >
        Your clear path<br />
        to <em style={{ fontStyle: 'italic', color: 'var(--sage)' }}>financial</em><br />
        <em style={{ fontStyle: 'italic', color: 'var(--sage)' }}>freedom.</em>
      </h1>
      <p
        style={{
          fontSize: isMobile ? '0.9rem' : '1rem',
          fontWeight: 300,
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginTop: '1rem',
          marginBottom: 0,
          maxWidth: 420,
        }}
      >
        Compare proven strategies and see exactly when you&apos;ll be debt-free — down to the month.
      </p>

      {/* Trust badges */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          marginTop: '1.5rem',
          border: '1px solid var(--border)',
          borderRadius: 5,
          overflow: 'hidden',
          width: 'fit-content',
        }}
      >
        {['🔒 Private', '$ Free', '✓ No Login'].map((label, i) => (
          <div
            key={i}
            style={{
              padding: '8px 16px',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              background: 'var(--bg-card)',
              borderRight: i < 2 ? '1px solid var(--border)' : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
