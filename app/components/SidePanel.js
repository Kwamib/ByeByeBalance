'use client';

import Link from 'next/link';
import React from 'react';
import { Share2, Download, FileText, RefreshCw, Shield, DollarSign, Calculator } from 'lucide-react';

export default function SidePanel({ isMobile, onShare, onExportPDF, onDownloadCSV, onClear }) {
  if (isMobile) return null;

  const actionButtonStyle = {
    padding: '0.75rem',
    background: 'white',
    border: '2px solid #e9ecef',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '0.9rem',
    fontWeight: '500',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Quick Actions */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1rem' }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
          <button onClick={onShare} style={actionButtonStyle}><Share2 size={18} /><span>Share</span></button>
          <button onClick={onExportPDF} style={actionButtonStyle}><Download size={18} /><span>Print</span></button>
          <button onClick={onDownloadCSV} style={actionButtonStyle}><FileText size={18} /><span>Export</span></button>
          <button onClick={onClear} style={actionButtonStyle}><RefreshCw size={18} /><span>Reset</span></button>
        </div>
      </div>

      {/* Trust Badge */}
      <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '16px', padding: '1.5rem', border: '2px solid #86efac' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Shield size={20} color="#10b981" />
          <span style={{ fontWeight: '700', color: '#047857' }}>Why Trust This?</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <Calculator size={16} color="#10b981" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#047857' }}>Math You Can Verify</div>
              <div style={{ fontSize: '0.75rem', color: '#059669' }}>Check our calculations against any financial calculator</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <Shield size={16} color="#10b981" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#047857' }}>Your Data Stays Private</div>
              <div style={{ fontSize: '0.75rem', color: '#059669' }}>Everything stays in your browser</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <DollarSign size={16} color="#10b981" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#047857' }}>Completely Free</div>
              <div style={{ fontSize: '0.75rem', color: '#059669' }}>No hidden fees or premium versions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)', border: '2px solid #d1d5db' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Shield size={18} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Your Privacy Matters</div>
            <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: '#4b5563', margin: 0 }}>
              All calculations happen in your browser. We don{"'"}t store or see your financial data. Questions?{' '}
              <Link href="/contact" style={{ color: '#667eea', marginLeft: '0.25rem' }}>Contact support</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
