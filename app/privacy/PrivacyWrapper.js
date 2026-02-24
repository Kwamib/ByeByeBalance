'use client';

import dynamic from 'next/dynamic';

const PrivacyContent = dynamic(() => import('./PrivacyContent'), {
  ssr: false,
  loading: () => (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <p>Loading...</p>
    </div>
  ),
});

export default function PrivacyWrapper() {
  return <PrivacyContent />;
}
