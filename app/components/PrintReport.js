'use client';

import React from 'react';

export default function PrintReport({ results, comparisonResults, debts, strategy, extraPayment }) {
  if (!results) return null;

  const totalDebtAmount = debts.reduce((sum, d) => sum + (d.balance || 0), 0);
  const minPaymentTotal = debts.reduce((sum, d) => sum + (d.minPayment || 0), 0);

  return (
    <div className="print-report">
      <div className="print-page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 12, borderBottom: '2px solid #1A2626', marginBottom: 16 }}>
          <div style={{ fontFamily: 'Georgia, serif', fontWeight: 600, fontSize: 18, color: '#1A2626' }}>
            Bye<span style={{ color: '#7A9E87' }}>Bye</span>Balance
          </div>
          <div style={{ textAlign: 'right', fontSize: 10, color: '#8A9A9A', lineHeight: 1.6 }}>
            Generated {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}<br />
            byebyebalance.com
          </div>
        </div>

        <div style={{ fontFamily: 'Georgia, serif', fontWeight: 600, fontSize: 20, color: '#1A2626', marginBottom: 2 }}>Your Debt Freedom Plan</div>
        <div style={{ fontSize: 11, color: '#7A9E87', fontWeight: 600, marginBottom: 16 }}>
          Strategy: {strategy === 'snowball' ? 'Snowball' : 'Avalanche'} · ${extraPayment}/mo extra
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
          <div style={{ padding: 10, borderRadius: 4, border: '2px solid #5A7A66', textAlign: 'center' }}>
            <div style={{ fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A9A9A', marginBottom: 4, fontWeight: 600 }}>DEBT-FREE DATE</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#5A7A66' }}>{results.debtFreeDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
            <div style={{ fontSize: 9, color: '#8A9A9A', marginTop: 2 }}>{results.totalMonths} months</div>
          </div>
          <div style={{ padding: 10, borderRadius: 4, border: '1px solid #D8D3C8', textAlign: 'center' }}>
            <div style={{ fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A9A9A', marginBottom: 4, fontWeight: 600 }}>TOTAL INTEREST</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#C0714A' }}>${Math.round(results.totalInterest).toLocaleString()}</div>
            <div style={{ fontSize: 9, color: '#8A9A9A', marginTop: 2 }}>on ${totalDebtAmount.toLocaleString()} debt</div>
          </div>
          <div style={{ padding: 10, borderRadius: 4, border: '1px solid #D8D3C8', textAlign: 'center' }}>
            <div style={{ fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A9A9A', marginBottom: 4, fontWeight: 600 }}>MONTHLY PAYMENT</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#1A2626' }}>${Math.round(results.monthlyPayment).toLocaleString()}</div>
            <div style={{ fontSize: 9, color: '#8A9A9A', marginTop: 2 }}>${minPaymentTotal.toLocaleString()} min + ${extraPayment} extra</div>
          </div>
          <div style={{ padding: 10, borderRadius: 4, border: '2px solid #C0714A', textAlign: 'center' }}>
            <div style={{ fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A9A9A', marginBottom: 4, fontWeight: 600 }}>INTEREST SAVED</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#5A7A66' }}>${Math.round(results.interestSaved).toLocaleString()}</div>
            <div style={{ fontSize: 9, color: '#8A9A9A', marginTop: 2 }}>vs minimum payments</div>
          </div>
        </div>

        <div style={{ fontWeight: 600, fontSize: 13, color: '#1A2626', marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid #D8D3C8' }}>Payoff Order</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, marginBottom: 16 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A9A9A', padding: '6px 8px', borderBottom: '2px solid #D8D3C8', fontWeight: 600, width: 36 }}>#</th>
              <th style={{ textAlign: 'left', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A9A9A', padding: '6px 8px', borderBottom: '2px solid #D8D3C8', fontWeight: 600 }}>Debt Name</th>
              <th style={{ textAlign: 'left', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A9A9A', padding: '6px 8px', borderBottom: '2px solid #D8D3C8', fontWeight: 600 }}>Balance</th>
              <th style={{ textAlign: 'left', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A9A9A', padding: '6px 8px', borderBottom: '2px solid #D8D3C8', fontWeight: 600 }}>Rate</th>
              <th style={{ textAlign: 'left', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A9A9A', padding: '6px 8px', borderBottom: '2px solid #D8D3C8', fontWeight: 600 }}>Interest Paid</th>
              <th style={{ textAlign: 'left', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A9A9A', padding: '6px 8px', borderBottom: '2px solid #D8D3C8', fontWeight: 600 }}>Paid Off</th>
            </tr>
          </thead>
          <tbody>
            {results.schedule.map((item, index) => (
              <tr key={item.name} style={{ background: index === 0 ? 'rgba(90,122,102,0.08)' : 'transparent' }}>
                <td style={{ padding: '7px 8px', borderBottom: '1px solid #EAE6DC' }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: index === 0 ? '#5A7A66' : '#1A2626', color: '#F5F2EC', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700 }}>{item.order}</span>
                </td>
                <td style={{ padding: '7px 8px', borderBottom: '1px solid #EAE6DC', fontWeight: 500 }}>{item.name || 'Unnamed Debt'}</td>
                <td style={{ padding: '7px 8px', borderBottom: '1px solid #EAE6DC' }}>${Math.round(item.originalBalance).toLocaleString()}</td>
                <td style={{ padding: '7px 8px', borderBottom: '1px solid #EAE6DC', color: '#C0714A', fontWeight: 600 }}>{item.rate}%</td>
                <td style={{ padding: '7px 8px', borderBottom: '1px solid #EAE6DC', color: item.interestPaid > 1000 ? '#C0714A' : '#5A7A66', fontWeight: 600 }}>${Math.round(item.interestPaid).toLocaleString()}</td>
                <td style={{ padding: '7px 8px', borderBottom: '1px solid #EAE6DC', color: '#4A6FA5', fontWeight: 600 }}>Month {item.paidOffMonth}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #D8D3C8', fontSize: 9, color: '#C0BAB0' }}>
          <span>ByeByeBalance · byebyebalance.com</span>
          <span>Page 1</span>
        </div>
        <div style={{ fontSize: 8, color: '#C0BAB0', fontStyle: 'italic', marginTop: 8, lineHeight: 1.5 }}>
          * Calculations are estimates for educational purposes only. They do not include late fees, annual fees, promotional rate expirations, or variable rate changes.
        </div>
      </div>
    </div>
  );
}
