'use client';

import Link from 'next/link';
import React from 'react';
import { Share2, Download, FileText, RefreshCw } from 'lucide-react';

const CARD = {
  background: 'var(--bg-card)',
  borderRadius: 6,
  border: '1px solid var(--border)',
  padding: '1.25rem 1.5rem',
  marginBottom: '1rem',
};

export default function SidePanel({ isMobile, onShare, onExportPDF, onDownloadCSV, onClear }) {
  if (isMobile) return null;

  const btnStyle = {
    padding: '0.6rem',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    cursor: 'pointer',
    fontSize: '0.78rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-body)',
    transition: 'border-color 0.15s',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Quick Actions */}
      <div style={CARD}>
        <h3 style={{ margin: '0 0 0.75rem', fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.2px' }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <button onClick={onShare} style={btnStyle}><Share2 size={14} /> Share</button>
          <button onClick={onExportPDF} style={btnStyle}><Download size={14} /> Print</button>
          <button onClick={onDownloadCSV} style={btnStyle}><FileText size={14} /> Export</button>
          <button onClick={onClear} style={btnStyle}><RefreshCw size={14} /> Reset</button>
        </div>
      </div>

      {/* Why Trust This */}
      <div style={{ ...CARD, background: 'var(--success-light)' }}>
        <h3 style={{ margin: '0 0 0.75rem', fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 600, color: 'var(--sage-dark)', letterSpacing: '-0.2px' }}>
          Why Trust This?
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {[
            { title: 'Math You Can Verify', desc: 'Check against any financial calculator' },
            { title: 'Your Data Stays Private', desc: 'Everything stays in your browser' },
            { title: 'Completely Free', desc: 'No hidden fees or premium versions' },
          ].map(item => (
            <div key={item.title} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <span style={{ color: 'var(--sage)', fontSize: '0.85rem', marginTop: '0.1rem', flexShrink: 0 }}>✓</span>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--sage-dark)' }}>{item.title}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy */}
      <div style={{ ...CARD, background: 'var(--bg-card-alt)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: 'var(--bg)', fontSize: '0.7rem' }}>🔒</span>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>Your Privacy Matters</div>
            <p style={{ fontSize: '0.72rem', lineHeight: 1.5, color: 'var(--text-secondary)', margin: 0 }}>
              All calculations happen in your browser. We don{"'"}t store or see your financial data. Questions?{' '}
              <Link href="/contact" style={{ color: 'var(--slate)', marginLeft: '0.15rem' }}>Contact support</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
