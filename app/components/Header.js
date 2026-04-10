'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Debt Payoff' },
  { href: '/mortgage', label: 'Mortgage' },
  { href: '/qualify', label: 'Qualify' },
];

export default function Header({ onCalculate, isMobile }) {
  const pathname = usePathname();

  return (
    <header
      style={{
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        padding: isMobile ? '0 1rem' : '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
      className="no-print"
    >
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            padding: isMobile ? '14px 0' : '16px 0',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: isMobile ? '1.2rem' : '1.4rem',
              letterSpacing: '-0.3px',
              color: 'var(--text-primary)',
            }}
          >
            Bye<span style={{ color: 'var(--sage)' }}>Bye</span>Balance
          </span>
        </Link>

        <nav
          style={{
            display: 'flex',
            alignItems: 'stretch',
            order: isMobile ? 3 : 0,
            width: isMobile ? '100%' : 'auto',
            borderLeft: isMobile ? 'none' : '1px solid var(--border)',
            borderTop: isMobile ? '1px solid var(--border)' : 'none',
          }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  flex: isMobile ? 1 : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: isMobile ? '12px 8px' : '0 1.5rem',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  letterSpacing: '0.2px',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  borderBottom: isActive ? '2px solid var(--text-primary)' : '2px solid transparent',
                  borderRight: isMobile ? 'none' : '1px solid var(--border)',
                  transition: 'color 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {onCalculate && (
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <button
              onClick={onCalculate}
              style={{
                padding: '8px 18px',
                background: 'var(--text-primary)',
                color: 'var(--bg)',
                border: 'none',
                borderRadius: 4,
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: isMobile ? 'none' : 'block',
              }}
            >
              Calculate
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
