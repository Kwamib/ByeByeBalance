'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CHART_COLORS = ['#7A9E87', '#4A6FA5', '#C0714A', '#4A5A5A', '#5A7A66', '#8A9A9A'];

function StatCell({ label, value, sub, color }) {
  return (
    <div style={{ padding: '1rem 1.25rem' }}>
      <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: '1.35rem', fontWeight: 600, color: color || 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.3px', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function fmtMo(m) {
  if (!isFinite(m) || m >= 600) return '50+ years';
  if (m < 12) return `${m} mo`;
  const y = Math.floor(m / 12), r = m % 12;
  return r > 0 ? `${y}y ${r}m` : `${y}y`;
}

export default function Results({ results, extraPayment, isMobile, onShare, onExportPDF, onDownloadCSV }) {
  if (!results) return null;

  const fmt = (v) => '$' + Math.round(v).toLocaleString();
  const fmtK = (v) => v >= 1000 ? '$' + Math.round(v / 1000) + 'K' : fmt(v);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Freedom Plan */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 6, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 1.5rem', background: 'var(--success-light)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 600, color: 'var(--sage-dark)', letterSpacing: '-0.2px' }}>
            Your Debt Freedom Plan
          </h3>
          {!isMobile && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={onExportPDF} style={{ padding: '4px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, fontSize: '0.7rem', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 500, fontFamily: 'var(--font-body)' }}>PDF</button>
              <button onClick={onShare} style={{ padding: '4px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, fontSize: '0.7rem', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 500, fontFamily: 'var(--font-body)' }}>Share</button>
            </div>
          )}
        </div>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', borderBottom: '1px solid var(--border)' }}>
          <StatCell
            label="Debt-Free Date"
            value={results.debtFreeDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            sub={`${results.totalMonths} months`}
            color="var(--sage-dark)"
          />
          <div style={{ borderLeft: isMobile ? 'none' : '1px solid var(--border)', borderRight: isMobile ? 'none' : '1px solid var(--border)', borderTop: isMobile ? '1px solid var(--border)' : 'none' }}>
            <StatCell label="Total Interest" value={fmt(results.totalInterest)} color="var(--warn)" />
          </div>
          <div style={{ borderTop: isMobile ? '1px solid var(--border)' : 'none' }}>
            <StatCell label="Monthly Payment" value={fmt(results.monthlyPayment)} sub={`incl. ${fmt(extraPayment)} extra`} />
          </div>
        </div>

        {/* Savings callout */}
        {results.interestSaved > 0 && (
          <div style={{ padding: '14px 1.5rem', fontSize: '0.82rem', color: 'var(--sage-dark)', lineHeight: 1.7, background: 'var(--bg)' }}>
            Paying ${extraPayment} extra saves <strong>{fmt(results.interestSaved)}</strong> in interest — debt-free <strong>{results.monthsSaved} months sooner</strong>.
          </div>
        )}
      </div>

      {/* Chart */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 6, border: '1px solid var(--border)', padding: '1.25rem 1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem', fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600, letterSpacing: '-0.2px' }}>Balance Over Time</h3>
        <ResponsiveContainer width="100%" height={isMobile ? 200 : 220}>
          <AreaChart data={results.chartData}>
            <defs>
              {results.schedule.map((debt, index) => (
                <linearGradient key={`gradient-${index}`} id={`cg${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS[index % CHART_COLORS.length]} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={CHART_COLORS[index % CHART_COLORS.length]} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" stroke="#8A9A9A" fontSize={10} />
            <YAxis stroke="#8A9A9A" fontSize={10} tickFormatter={v => fmtK(v)} />
            <Tooltip
              formatter={v => fmt(v)}
              contentStyle={{ borderRadius: 4, border: '1px solid #D8D3C8', fontSize: 11, fontFamily: 'Outfit', background: '#EFECE4' }}
            />
            {results.schedule.map((debt, index) => (
              <Area
                key={debt.name}
                type="monotone"
                dataKey={debt.name}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                fillOpacity={1}
                fill={`url(#cg${index})`}
                strokeWidth={2}
                stackId="1"
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Payoff Order */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 6, border: '1px solid var(--border)', padding: '1.25rem 1.5rem' }}>
        <h3 style={{ margin: '0 0 0.75rem', fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600, letterSpacing: '-0.2px' }}>Payoff Order</h3>

        {!isMobile && (
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto auto', padding: '0 10px 8px', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', gap: '1rem' }}>
            <span /><span>Debt</span><span style={{ textAlign: 'right' }}>Balance</span><span style={{ textAlign: 'right' }}>Rate</span><span style={{ textAlign: 'right' }}>Paid Off</span>
          </div>
        )}

        {results.schedule.map((item, index) => {
          const paidDate = new Date(Date.now() + (item.paidOffMonth || results.totalMonths) * 30 * 86400000);
          return (
            <div
              key={item.name}
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '30px 1fr' : 'auto 1fr auto auto auto',
                gap: isMobile ? '0.5rem' : '1rem',
                padding: '10px',
                background: index === 0 ? 'var(--success-light)' : 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                marginTop: 4,
                alignItems: 'center',
                fontSize: '0.82rem',
              }}
            >
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: index === 0 ? 'var(--sage-dark)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg)', fontWeight: 700, fontSize: '0.65rem' }}>
                {item.order}
              </div>
              <div>
                <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{item.name}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Interest: ${item.interestPaid.toLocaleString()}</div>
                {isMobile && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    ${Math.round(item.originalBalance).toLocaleString()} • {item.rate}% • {fmtMo(item.paidOffMonth)}
                  </div>
                )}
              </div>
              {!isMobile && (
                <>
                  <div style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>${Math.round(item.originalBalance).toLocaleString()}</div>
                  <div style={{ color: 'var(--warn)', fontWeight: 600, fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>{item.rate}%</div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, color: 'var(--sage-dark)', fontSize: '0.78rem' }}>{fmtMo(item.paidOffMonth)}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{paidDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
                  </div>
                </>
              )}
            </div>
          );
        })}

        {/* Mobile export buttons */}
        {isMobile && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button onClick={onShare} style={{ padding: '0.6rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>Share</button>
            <button onClick={onDownloadCSV} style={{ padding: '0.6rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>Export CSV</button>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div style={{ padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.5 }}>
        * Calculations do not include late fees, annual fees, or variable rate changes. For educational purposes only.
      </div>
    </div>
  );
}
