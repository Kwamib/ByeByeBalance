'use client';

import React from 'react';
import { Target, Plus, RefreshCw, Shield } from 'lucide-react';
import DebtCard from './DebtCard';

export default function DebtOverview({ debts, totalDebt, avgRate, monthlyMin, warningMap, isMobile, onboardingMode, onUpdate, onRemove, onAdd, onClear, onStartExamples, onStartFresh }) {
  return (
    <div style={{ background: 'white', borderRadius: '20px', padding: isMobile ? '1rem' : '1.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: isMobile ? '1.25rem' : '1.5rem' }}>
        <Target size={24} color="#667eea" />
        Your Debt Overview
      </h2>

      {onboardingMode === null ? (
        /* ─── Onboarding Prompt ─── */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '2rem 0.5rem' : '2.5rem 1rem', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(102,126,234,0.08), rgba(118,75,162,0.08))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <Shield size={36} color="#667eea" strokeWidth={1.5} />
          </div>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', color: '#1e293b' }}>How would you like to start?</h3>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: 380, margin: '0 0 2rem' }}>
            Jump in with example debts to see how the calculator works, or start fresh with your own numbers.
          </p>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '1.25rem', width: '100%', maxWidth: 460 }}>
            <div
              onClick={onStartExamples}
              style={{ flex: 1, padding: '1.5rem 1rem', background: 'white', border: '2px solid #e2e8f0', borderRadius: 16, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = '#667eea'; e.currentTarget.style.background = 'rgba(102,126,234,0.03)'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'white'; }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📊</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.35rem' }}>Try with Examples</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5 }}>See how it works with{isMobile ? ' ' : <br/>}sample debts first</div>
            </div>
            <div
              onClick={onStartFresh}
              style={{ flex: 1, padding: '1.5rem 1rem', background: 'linear-gradient(135deg, rgba(102,126,234,0.04), rgba(118,75,162,0.04))', border: '2px solid #667eea', borderRadius: 16, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(102,126,234,0.08), rgba(118,75,162,0.08))'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(102,126,234,0.04), rgba(118,75,162,0.04))'; }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✏️</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.35rem' }}>Enter My Own</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5 }}>Start with your{isMobile ? ' ' : <br/>}real numbers</div>
            </div>
          </div>
        </div>
      ) : (
        /* ─── Active Debt View ─── */
        <div>
          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)', borderRadius: '12px', padding: '1rem', borderLeft: '3px solid #667eea' }}>
              <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem' }}>TOTAL DEBT</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#212529' }}>${totalDebt.toLocaleString()}</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)', borderRadius: '12px', padding: '1rem', borderLeft: '3px solid #667eea' }}>
              <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem' }}>AVG RATE</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#212529' }}>{avgRate.toFixed(1)}%</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)', borderRadius: '12px', padding: '1rem', borderLeft: '3px solid #667eea' }}>
              <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem' }}>MONTHLY MIN</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#212529' }}>${monthlyMin.toLocaleString()}</div>
            </div>
          </div>

          {/* Example mode banner */}
          {onboardingMode === 'example' && (
            <div style={{ padding: '0.7rem 1rem', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1px solid #93c5fd', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.85rem', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1rem' }}>💡</span>
                <span><strong>Example data loaded</strong> — edit these with your real numbers</span>
              </div>
              <button onClick={onStartFresh} style={{ background: 'white', border: '1px solid #93c5fd', borderRadius: '6px', padding: '0.3rem 0.75rem', color: '#667eea', fontWeight: 600, cursor: 'pointer', fontSize: '0.78rem' }}>Start Fresh</button>
            </div>
          )}

          {/* Fresh start hint */}
          {onboardingMode === 'fresh' && debts.length === 1 && !debts[0].name && (
            <div style={{ padding: '0.7rem 1rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.85rem', color: '#047857', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1rem' }}>👇</span>
              <span>Enter your first debt below. Add as many as you need.</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: isMobile ? '1.125rem' : '1.25rem' }}>Your Debts</h3>
            <button
              onClick={onClear}
              style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #dee2e6', borderRadius: '6px', color: '#6c757d', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCw size={14} />
              {!isMobile && 'Reset All'}
            </button>
          </div>

          {/* Debt Cards */}
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

          {/* Add Debt Button */}
          <button
            onClick={onAdd}
            style={{ width: '100%', padding: '0.75rem', background: 'white', border: '2px dashed #dee2e6', borderRadius: '10px', color: '#6c757d', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', transition: 'all 0.2s' }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#667eea'; e.currentTarget.style.color = '#667eea'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = '#dee2e6'; e.currentTarget.style.color = '#6c757d'; }}
          >
            <Plus size={18} />
            Add Another Debt
          </button>
        </div>
      )}
    </div>
  );
}
