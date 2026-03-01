'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Share2, FileText, AlertCircle } from 'lucide-react';

export default function Results({ results, extraPayment, isMobile, onShare, onExportPDF, onDownloadCSV }) {
  if (!results) return null;

  return (
    <div style={{ background: 'white', borderRadius: '20px', padding: isMobile ? '1rem' : '1.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
      {/* Header with actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: isMobile ? '1.125rem' : '1.25rem' }}>Your Debt Freedom Plan</h3>
        {!isMobile && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={onExportPDF} style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #dee2e6', borderRadius: '6px', color: '#495057', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={14} /> PDF
            </button>
            <button onClick={onShare} style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #dee2e6', borderRadius: '6px', color: '#495057', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Share2 size={14} /> Share
            </button>
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #10b98115 0%, #05966915 100%)', borderRadius: '12px', padding: '1rem', borderLeft: '3px solid #10b981' }}>
          <div style={{ fontSize: '0.75rem', color: '#047857', marginBottom: '0.25rem', fontWeight: '600' }}>DEBT-FREE DATE</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#047857' }}>
            {results.debtFreeDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981' }}>{results.totalMonths} months</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #f5990b15 0%, #d9770615 100%)', borderRadius: '12px', padding: '1rem', borderLeft: '3px solid #f59e0b' }}>
          <div style={{ fontSize: '0.75rem', color: '#92400e', marginBottom: '0.25rem', fontWeight: '600' }}>TOTAL INTEREST</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#92400e' }}>${Math.round(results.totalInterest).toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Total paid: ${Math.round(results.totalPaid).toLocaleString()}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)', borderRadius: '12px', padding: '1rem', borderLeft: '3px solid #667eea' }}>
          <div style={{ fontSize: '0.75rem', color: '#4c1d95', marginBottom: '0.25rem', fontWeight: '600' }}>MONTHLY PAYMENT</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#4c1d95' }}>${Math.round(results.monthlyPayment).toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: '#667eea' }}>Including ${extraPayment} extra</div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#495057' }}>Balance Over Time</h4>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={results.chartData}>
            <defs>
              {results.schedule.map((debt, index) => (
                <linearGradient key={`gradient-${index}`} id={`gradient${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={`hsl(${260 + index * 40}, 70%, 50%)`} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={`hsl(${260 + index * 40}, 70%, 50%)`} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#dee2e6" />
            <XAxis dataKey="month" stroke="#495057" fontSize={12} />
            <YAxis stroke="#495057" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #dee2e6', borderRadius: '8px', fontSize: '12px' }} />
            {results.schedule.map((debt, index) => (
              <Area key={debt.name} type="monotone" dataKey={debt.name} stroke={`hsl(${260 + index * 40}, 70%, 50%)`} fillOpacity={1} fill={`url(#gradient${index})`} strokeWidth={2} stackId="1" />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Payoff Order */}
      <div>
        <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#495057' }}>Payoff Order</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {results.schedule.map((item, index) => (
            <div
              key={item.name}
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '30px 1fr' : '30px 2fr 1fr 1fr 1fr',
                gap: '0.75rem',
                padding: '0.75rem',
                background: index === 0 ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)' : '#f8f9fa',
                borderRadius: '8px',
                border: index === 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #e9ecef',
                alignItems: 'center',
                fontSize: '0.875rem',
              }}
            >
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: index === 0 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.75rem' }}>
                {item.order}
              </div>
              <div style={{ fontWeight: '600', color: '#212529' }}>
                {item.name}
                {isMobile && (
                  <div style={{ fontSize: '0.7rem', color: '#6c757d', marginTop: '0.25rem' }}>
                    ${Math.round(item.originalBalance).toLocaleString()} • {item.rate}% • ${Math.round(item.interestPaid).toLocaleString()} interest
                  </div>
                )}
              </div>
              {!isMobile && (
                <>
                  <div style={{ color: '#6c757d' }}>${Math.round(item.originalBalance).toLocaleString()}</div>
                  <div style={{ color: '#f59e0b', fontWeight: '600' }}>{item.rate}%</div>
                  <div style={{ color: item.interestPaid > 1000 ? '#dc2626' : '#16a34a', fontWeight: '600' }}>${Math.round(item.interestPaid).toLocaleString()}</div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Mobile share/export */}
        {isMobile && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginTop: '1rem' }}>
            <button onClick={onShare} style={{ padding: '0.75rem', background: 'white', border: '2px solid #e9ecef', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}><Share2 size={16} /> Share</button>
            <button onClick={onDownloadCSV} style={{ padding: '0.75rem', background: 'white', border: '2px solid #e9ecef', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}><FileText size={16} /> Export</button>
          </div>
        )}

        {/* Disclaimer */}
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(156, 163, 175, 0.1)', borderRadius: '8px', borderLeft: '3px solid #9ca3af' }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic' }}>
            <AlertCircle size={14} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'text-bottom' }} />
            * Calculations do not include late fees, annual fees, or variable rate changes. For educational purposes only.
          </div>
        </div>
      </div>
    </div>
  );
}
