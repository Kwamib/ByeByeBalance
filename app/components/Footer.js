'use client';

import Link from 'next/link';
import React from 'react';

export default function Footer({ isMobile }) {
  return (
    <footer
      style={{
        background: 'var(--bg)',
        borderTop: '1px solid var(--border)',
        padding: isMobile ? '1.5rem 1rem' : '2rem',
        marginTop: '4rem',
      }}
      className="no-print"
    >
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr 1fr',
          gap: '1.5rem',
          alignItems: 'center',
          textAlign: isMobile ? 'center' : 'left',
        }}
      >
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.4rem', letterSpacing: '-0.2px' }}>
            Bye<span style={{ color: 'var(--sage)' }}>Bye</span>Balance
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            A free tool to visualize your<br />journey to debt freedom
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '0.5rem' : '0',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {['🔒 Private', '$ Free', '✓ No Ads'].map((item, i) => (
            <div
              key={i}
              style={{
                padding: isMobile ? '6px 0' : '0 1.5rem',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                borderRight: !isMobile && i < 2 ? '1px solid var(--border)' : 'none',
              }}
            >
              {item}
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            gap: '1.5rem',
            justifyContent: isMobile ? 'center' : 'flex-end',
            fontSize: '0.8rem',
          }}
        >
          <Link href="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy</Link>
          <Link href="/contact" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Contact</Link>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.6 }}>© 2025 ByeByeBalance</div>
      </div>
    </footer>
  );
}
