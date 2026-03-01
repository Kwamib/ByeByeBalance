'use client';

import React from 'react';

export default function PrintReport({ results, comparisonResults, debts, strategy, extraPayment }) {
  if (!results) return null;

  const totalDebtAmount = debts.reduce((sum, d) => sum + (d.balance || 0), 0);
  const minPaymentTotal = debts.reduce((sum, d) => sum + (d.minPayment || 0), 0);
  const maxInterest = Math.max(...results.schedule.map(d => d.interestPaid));

  return (
    <div className="print-report">
      {/* PAGE 1: Your Debt Freedom Plan */}
      <div className="print-page">
        <div className="pr-header">
          <div className="pr-logo">
            <div className="pr-logo-icon">BB</div>
            <span className="pr-logo-text">ByeByeBalance</span>
          </div>
          <div className="pr-meta">
            Generated {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}<br/>
            byebyebalance.com
          </div>
        </div>

        <div className="pr-title">Your Debt Freedom Plan</div>
        <div className="pr-strategy">
          Strategy: {strategy === 'snowball' ? 'Snowball (Lowest balance first)' : 'Avalanche (Highest rate first)'} · ${extraPayment}/mo extra payment
        </div>

        <div className="pr-metrics">
          <div className="pr-metric pr-metric-primary">
            <div className="pr-metric-label">DEBT-FREE DATE</div>
            <div className="pr-metric-value pr-green">{results.debtFreeDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
            <div className="pr-metric-sub">{results.totalMonths} months</div>
          </div>
          <div className="pr-metric">
            <div className="pr-metric-label">TOTAL INTEREST</div>
            <div className="pr-metric-value pr-amber">${Math.round(results.totalInterest).toLocaleString()}</div>
            <div className="pr-metric-sub">on ${totalDebtAmount.toLocaleString()} debt</div>
          </div>
          <div className="pr-metric pr-metric-blue">
            <div className="pr-metric-label">MONTHLY PAYMENT</div>
            <div className="pr-metric-value pr-blue">${Math.round(results.monthlyPayment).toLocaleString()}</div>
            <div className="pr-metric-sub">${minPaymentTotal.toLocaleString()} min + ${extraPayment} extra</div>
          </div>
          <div className="pr-metric pr-metric-gold">
            <div className="pr-metric-label">INTEREST SAVED</div>
            <div className="pr-metric-value pr-green">${Math.round(results.interestSaved).toLocaleString()}</div>
            <div className="pr-metric-sub">vs minimum payments</div>
          </div>
        </div>

        {results.interestSaved > 0 && (
          <div className="pr-savings">
            <div className="pr-savings-number">${Math.round(results.interestSaved).toLocaleString()}</div>
            <div className="pr-savings-text">
              By paying ${extraPayment} extra per month, you will save <strong>${Math.round(results.interestSaved).toLocaleString()} in interest</strong> and be debt-free <strong>{results.monthsSaved} months sooner</strong> than paying minimums only.
            </div>
          </div>
        )}

        {comparisonResults && (
          <>
            <div className="pr-section-title">Strategy Comparison</div>
            <div className="pr-comparison">
              <div className={`pr-comp-box ${strategy === 'snowball' ? 'pr-comp-active' : ''}`}>
                <div className="pr-comp-header">Snowball Method {strategy === 'snowball' && <span className="pr-badge">SELECTED</span>}</div>
                <div className="pr-comp-interest">${Math.round(comparisonResults.snowball.interest).toLocaleString()} interest</div>
                <div className="pr-comp-months">{comparisonResults.snowball.months} months to debt-free</div>
              </div>
              <div className={`pr-comp-box ${strategy === 'avalanche' ? 'pr-comp-active' : ''}`}>
                <div className="pr-comp-header">Avalanche Method {strategy === 'avalanche' && <span className="pr-badge">SELECTED</span>}</div>
                <div className="pr-comp-interest">${Math.round(comparisonResults.avalanche.interest).toLocaleString()} interest</div>
                <div className="pr-comp-months">{comparisonResults.avalanche.months} months to debt-free</div>
              </div>
            </div>
          </>
        )}

        <div className="pr-section-title">Payoff Order</div>
        <table className="pr-table">
          <thead><tr><th style={{width:'36px'}}>#</th><th>Debt Name</th><th>Balance</th><th>Rate</th><th>Interest Paid</th><th>Paid Off</th></tr></thead>
          <tbody>
            {results.schedule.map((item, index) => (
              <tr key={item.name} className={index === 0 ? 'pr-first-row' : ''}>
                <td><span className={`pr-order ${index === 0 ? 'pr-order-first' : ''}`}>{item.order}</span></td>
                <td><strong>{item.name || 'Unnamed Debt'}</strong></td>
                <td>${Math.round(item.originalBalance).toLocaleString()}</td>
                <td className="pr-rate">{item.rate}%</td>
                <td className={item.interestPaid > 1000 ? 'pr-interest-high' : 'pr-interest-low'}>${Math.round(item.interestPaid).toLocaleString()}</td>
                <td className="pr-month">Month {item.paidOffMonth}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pr-footer"><span>ByeByeBalance · byebyebalance.com</span><span>Page 1</span></div>
        <div className="pr-disclaimer">* Calculations are estimates for educational purposes only. They do not include late fees, annual fees, promotional rate expirations, or variable rate changes.</div>
      </div>

      {/* PAGE 2: The Power of Extra Payments */}
      <div className="print-page print-page-break">
        <div className="pr-header">
          <div className="pr-logo"><div className="pr-logo-icon">BB</div><span className="pr-logo-text">ByeByeBalance</span></div>
          <div className="pr-meta">Generated {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}<br/>byebyebalance.com</div>
        </div>

        <div className="pr-title">The Power of Extra Payments</div>
        <div className="pr-strategy">What ${extraPayment}/month extra does for you</div>

        <div className="pr-before-after">
          <div className="pr-ba-box pr-ba-before">
            <div className="pr-ba-title">Minimum Payments Only</div>
            <div className="pr-ba-stat"><div className="pr-ba-value">{results.minimumOnlyMonths} months</div><div className="pr-ba-label">Time to debt-free</div></div>
            <div className="pr-ba-stat"><div className="pr-ba-value">${Math.round(results.minimumOnlyInterest).toLocaleString()}</div><div className="pr-ba-label">Total interest paid</div></div>
            <div className="pr-ba-stat"><div className="pr-ba-value">${Math.round(totalDebtAmount + results.minimumOnlyInterest).toLocaleString()}</div><div className="pr-ba-label">Total amount paid</div></div>
          </div>
          <div className="pr-ba-box pr-ba-after">
            <div className="pr-ba-title">With ${extraPayment} Extra ({strategy === 'snowball' ? 'Snowball' : 'Avalanche'})</div>
            <div className="pr-ba-stat"><div className="pr-ba-value">{results.totalMonths} months</div><div className="pr-ba-label">Time to debt-free</div></div>
            <div className="pr-ba-stat"><div className="pr-ba-value">${Math.round(results.totalInterest).toLocaleString()}</div><div className="pr-ba-label">Total interest paid</div></div>
            <div className="pr-ba-stat"><div className="pr-ba-value">${Math.round(results.totalPaid).toLocaleString()}</div><div className="pr-ba-label">Total amount paid</div></div>
          </div>
        </div>

        <div className="pr-savings">
          <div className="pr-savings-number">{results.monthsSaved} months</div>
          <div className="pr-savings-text">You will be debt-free <strong>{results.monthsSaved} months sooner</strong> and keep <strong>${Math.round(results.interestSaved).toLocaleString()}</strong> in your pocket.</div>
        </div>

        <div className="pr-section-title">Interest Breakdown by Debt</div>
        <div className="pr-bars">
          {results.schedule.map((item, index) => {
            const barWidth = maxInterest > 0 ? Math.max(8, (item.interestPaid / maxInterest) * 100) : 0;
            const colors = ['#dc2626', '#f59e0b', '#2563eb', '#059669', '#8b5cf6', '#ec4899'];
            return (
              <div key={item.name} className="pr-bar-item">
                <div className="pr-bar-name">{item.name}</div>
                <div className="pr-bar-track"><div className="pr-bar-fill" style={{ width: `${barWidth}%`, background: colors[index % colors.length] }}>${Math.round(item.interestPaid).toLocaleString()}</div></div>
                <div className="pr-bar-rate">{item.rate}%</div>
              </div>
            );
          })}
        </div>

        <div className="pr-section-title" style={{marginTop: '1.5rem'}}>Your Debts</div>
        <table className="pr-table">
          <thead><tr><th>Debt Name</th><th>Balance</th><th>Interest Rate</th><th>Min Payment</th></tr></thead>
          <tbody>
            {debts.filter(d => d.balance > 0).map(debt => (
              <tr key={debt.id}>
                <td><strong>{debt.name || 'Unnamed Debt'}</strong></td>
                <td>${debt.balance.toLocaleString()}</td>
                <td>{debt.rate}%</td>
                <td>${debt.minPayment.toLocaleString()}/mo</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pr-footer" style={{marginTop: '1.5rem'}}><span>ByeByeBalance · byebyebalance.com</span><span>Page 2</span></div>
        <div className="pr-disclaimer">* Calculations are estimates for educational purposes only.</div>
      </div>
    </div>
  );
}
