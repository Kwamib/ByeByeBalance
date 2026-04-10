'use client';

import dynamic from 'next/dynamic';

const PrivacyContent = dynamic(() => import('./PrivacyContent'), {
  ssr: false,
  loading: () => (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg, #F5F2EC)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text-primary, #1A2626)',
      fontFamily: "'Outfit', -apple-system, sans-serif",
    }}>
      <p>Loading...</p>
    </div>
  ),
});

export default function PrivacyWrapper() {
  return <PrivacyContent />;
}
