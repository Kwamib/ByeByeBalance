'use client';

import React from 'react';
import { Snowflake, Mountain, TrendingUp } from 'lucide-react';

export default function StrategyComparison({ comparison, strategy, isMobile }) {
  if (!comparison) return null;

  return (
    <div style={{ background: 'white', borderRadius: '20px', padding: isMobile ? '1rem' : '1.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
      <h3 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: isMobile ? '1.125rem' : '1.25rem' }}>
        <TrendingUp size={20} color="#10b981" />
        Strategy Comparison
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
        {/* Snowball */}
        <div
          style={{
            padding: '1rem',
            background: strategy === 'snowball' ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' : '#f8f9fa',
            borderRadius: '12px',
            border: strategy === 'snowball' ? '2px solid #3b82f6' : '1px solid #e9ecef',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Snowflake size={20} color="#3b82f6" />
            <span style={{ fontWeight: '600', color: '#1e40af' }}>Snowball Method</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af' }}>
            ${Math.round(comparison.snowball.interest).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#3b82f6' }}>
            Total interest • {comparison.snowball.months} months
          </div>
        </div>

        {/* Avalanche */}
        <div
          style={{
            padding: '1rem',
            background: strategy === 'avalanche' ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' : '#f8f9fa',
            borderRadius: '12px',
            border: strategy === 'avalanche' ? '2px solid #22c55e' : '1px solid #e9ecef',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Mountain size={20} color="#16a34a" />
            <span style={{ fontWeight: '600', color: '#14532d' }}>Avalanche Method</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#14532d' }}>
            ${Math.round(comparison.avalanche.interest).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a' }}>
            Total interest • {comparison.avalanche.months} months
          </div>
        </div>
      </div>

      {/* Savings callout */}
      {comparison.difference.interest > 0 && (
        <div style={{ padding: '1rem', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', borderRadius: '12px', border: '1px solid #fbbf24' }}>
          <div style={{ fontSize: '0.875rem', color: '#78350f' }}>
            <strong>💰 Avalanche saves you:</strong>{' '}
            <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#16a34a' }}>
              ${Math.round(comparison.difference.interest).toLocaleString()}
            </span>{' '}in interest
            {comparison.difference.months > 0 && (
              <span> and <strong>{comparison.difference.months} months</strong> of payments</span>
            )}!
          </div>
        </div>
      )}
    </div>
  );
}
