'use client';

import React from 'react';
import { Shield, DollarSign, Calculator } from 'lucide-react';

export default function HeroSection({ isMobile }) {
  return (
    <div
      style={{
        maxWidth: '1400px',
        margin: isMobile ? '1rem auto' : '2rem auto',
        padding: isMobile ? '0 1rem' : '0 2rem',
        textAlign: 'center',
        color: 'white',
      }}
      className="no-print"
    >
      <h2 style={{ fontSize: isMobile ? '1.75rem' : '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>
        Calculate Your Path to Financial Freedom
      </h2>
      <p style={{ fontSize: isMobile ? '1rem' : '1.2rem', opacity: 0.95, marginBottom: '1.5rem' }}>
        Compare proven strategies and see exactly when you{"'"}ll be debt-free
      </p>
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '0.5rem' : '2rem',
          justifyContent: 'center',
          fontSize: '0.9rem',
          opacity: 0.9,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', gap: '0.5rem' }}>
          <Shield size={16} />100% Private
        </span>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', gap: '0.5rem' }}>
          <DollarSign size={16} />Forever Free
        </span>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', gap: '0.5rem' }}>
          <Calculator size={16} />No Account Required
        </span>
      </div>
    </div>
  );
}
