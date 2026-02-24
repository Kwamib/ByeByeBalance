'use client';

import dynamic from 'next/dynamic';

const Calculator = dynamic(() => import('./Calculator'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>
        ByeByeBalance
      </h1>
      <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
        Free Debt Payoff Calculator
      </p>
      <p style={{ fontSize: '1rem', opacity: 0.7, marginTop: '2rem' }}>
        Loading calculator...
      </p>
    </div>
  ),
});

export default function CalculatorWrapper() {
  return <Calculator />;
}
