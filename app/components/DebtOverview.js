'use client';

import React from 'react';
import { Target, Plus, RefreshCw } from 'lucide-react';
import DebtCard from './DebtCard';

export default function DebtOverview({ debts, totalDebt, avgRate, monthlyMin, warningMap, isMobile, onUpdate, onRemove, onAdd, onClear }) {
  return (
    <div style={{ background: 'white', borderRadius: '20px', padding: isMobile ? '1rem' : '1.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: isMobile ? '1.25rem' : '1.5rem' }}>
        <Target size={24} color="#667eea" />
        Your Debt Overview
      </h2>

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

      {/* Debt Cards Header */}
      <div style={{ marginTop: '1.5rem' }}>
        {debts.some(d => d.balance > 0) && (
          <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid #93c5fd', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#1e40af' }}>
            <span style={{ fontSize: '1rem' }}>💡</span>
            <span><strong>Example debts shown</strong> - Edit these directly or click {"'"}Reset All{"'"} to start fresh with your own debts</span>
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
    </div>
  );
}
