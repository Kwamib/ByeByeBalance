'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calculator } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: '💰 Debt Payoff' },
  { href: '/mortgage', label: '🏠 Mortgage' },
  { href: '/qualify', label: '📋 Qualify' },
];

export default function Header({ onCalculate, isMobile }) {
  const pathname = usePathname();

  return (
    <header
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: isMobile ? '0.75rem 1rem' : '0.75rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 20px rgba(0, 0, 0, 0.1)',
      }}
      className="no-print"
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          gap: isMobile ? '0.75rem' : '0',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: 'white', fontWeight: 900, fontSize: 14, fontFamily: "Georgia, 'Times New Roman', serif", letterSpacing: -1 }}>BB</span>
          </div>
          <span
            style={{
              fontSize: isMobile ? '1.15rem' : '1.35rem',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ByeByeBalance
          </span>
        </Link>

        {/* Navigation */}
        <nav style={{
          display: 'flex',
          background: '#f1f5f9',
          borderRadius: '12px',
          padding: '3px',
          order: isMobile ? 3 : 0,
          width: isMobile ? '100%' : 'auto',
        }}>
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  flex: isMobile ? 1 : 'none',
                  padding: isMobile ? '0.5rem 0.5rem' : '0.5rem 1.25rem',
                  borderRadius: '10px',
                  background: isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                  color: isActive ? 'white' : '#64748b',
                  fontWeight: 600,
                  fontSize: isMobile ? '0.75rem' : '0.85rem',
                  textDecoration: 'none',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA Button */}
        {onCalculate && (
          <button
            onClick={onCalculate}
            style={{
              padding: '0.6rem 1.25rem',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              display: isMobile ? 'none' : 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
            }}
          >
            <Calculator size={16} />
            Calculate
          </button>
        )}
      </div>
    </header>
  );
}
