'use client';

import Link from 'next/link';
import React from 'react';
import { Shield, DollarSign, Calculator } from 'lucide-react';

export default function Footer({ isMobile }) {
  return (
    <footer
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        padding: isMobile ? '1.5rem 1rem' : '2rem',
        marginTop: '4rem',
      }}
      className="no-print"
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr 1fr',
          gap: '2rem',
          alignItems: 'center',
          textAlign: isMobile ? 'center' : 'left',
        }}
      >
        <div>
          <div style={{ fontWeight: '600', color: '#212529', marginBottom: '0.5rem' }}>ByeByeBalance</div>
          <p style={{ fontSize: '0.875rem', color: '#6c757d', margin: 0 }}>
            A free tool to visualize your<br />journey to debt freedom
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '0.5rem' : '2rem',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#495057' }}>
            <Shield size={16} color="#10b981" /><span>100% Private</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#495057' }}>
            <DollarSign size={16} color="#10b981" /><span>Forever Free</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#495057' }}>
            <Calculator size={16} color="#10b981" /><span>No Ads or Spam</span>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            gap: '1.5rem',
            justifyContent: isMobile ? 'center' : 'flex-end',
            fontSize: '0.875rem',
          }}
        >
          <Link href="/privacy" style={{ color: '#6c757d', textDecoration: 'none' }}>Privacy</Link>
          <Link href="/contact" style={{ color: '#6c757d', textDecoration: 'none' }}>Contact</Link>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e9ecef', fontSize: '0.8rem', color: '#6c757d' }}>
        © 2025 ByeByeBalance | Empowering debt-free futures
      </div>
    </footer>
  );
}
