'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Inline warning shown on individual debt cards
 */
export function InlineWarning({ warning }) {
  if (!warning) return null;
  return (
    <div
      style={{
        background: '#fef3c7',
        border: '1px solid #f59e0b',
        borderRadius: '8px',
        padding: '0.625rem 0.75rem',
        marginBottom: '0.75rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.5rem',
        fontSize: '0.8rem',
        color: '#92400e',
        lineHeight: 1.4,
      }}
    >
      <AlertCircle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
      <div>
        <strong>Warning:</strong> {warning.message}
        <div style={{ marginTop: '0.25rem', fontSize: '0.75rem' }}>
          Suggested minimum: <strong>${warning.requiredMin}/mo</strong>
        </div>
      </div>
    </div>
  );
}

/**
 * Global warning banner shown above the strategy section
 */
export function GlobalWarningBanner({ warnings }) {
  if (!warnings || warnings.length === 0) return null;
  return (
    <div
      style={{
        background: '#fef3c7',
        border: '2px solid #f59e0b',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '0',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
      }}
    >
      <AlertCircle size={22} color="#f59e0b" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
      <div>
        <div style={{ fontWeight: '700', color: '#92400e', marginBottom: '0.25rem' }}>
          ⚠️ {warnings.length} debt{warnings.length > 1 ? 's need' : ' needs'} attention
        </div>
        <div style={{ fontSize: '0.8rem', color: '#92400e', lineHeight: 1.5 }}>
          {warnings.length === 1
            ? `${warnings[0].debtName}'s minimum payment doesn't cover monthly interest. Increase it to at least $${warnings[0].requiredMin}/mo.`
            : "Some minimum payments don't cover monthly interest. These debts will grow instead of shrink. Check the warnings above."}
        </div>
      </div>
    </div>
  );
}
