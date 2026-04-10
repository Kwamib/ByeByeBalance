/**
 * ByeByeBalance — Print & Global Styles
 * Restyled for warm sage/beige design system.
 */

export const globalStyles = `
  .print-report { display: none; }

  @media print {
    .no-print { display: none !important; }
    .print-report { display: block !important; }
    body, html { background: white !important; margin: 0 !important; padding: 0 !important; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .print-page { padding: 0.35in 0.5in; font-family: 'Outfit', -apple-system, sans-serif; background: white !important; }
    @page { margin: 0.3in; }
    #app-root { background: white !important; }
  }
`;
