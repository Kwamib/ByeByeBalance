'use client';

import React from 'react';

/**
 * Inline warning shown on individual debt cards
 */
export function InlineWarning({ warning }) {
  if (!warning) return null;
  return (
    <div
      style={{
        background: 'var(--warn-light)',
        border: '1px solid var(--border)',
        borderLeft: '3px solid var(--warn)',
        borderRadius: 4,
        padding: '0.55rem 0.75rem',
        marginBottom: '0.65rem',
        fontSize: '0.75rem',
        color: 'var(--warn)',
        lineHeight: 1.5,
      }}
    >
      <strong>Warning:</strong> {warning.message}
      <div style={{ marginTop: '0.2rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
        Suggested minimum: <strong>${warning.requiredMin}/mo</strong>
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
        background: 'var(--warn-light)',
        border: '1px solid var(--border)',
        borderLeft: '3px solid var(--warn)',
        borderRadius: 4,
        padding: '0.85rem 1rem',
      }}
    >
      <div style={{ fontWeight: 600, color: 'var(--warn)', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
        ⚠ {warnings.length} debt{warnings.length > 1 ? 's need' : ' needs'} attention
      </div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        {warnings.length === 1
          ? `${warnings[0].debtName}'s minimum payment doesn't cover monthly interest. Increase it to at least $${warnings[0].requiredMin}/mo.`
          : "Some minimum payments don't cover monthly interest. These debts will grow instead of shrink. Check the warnings above."}
      </div>
    </div>
  );
}
