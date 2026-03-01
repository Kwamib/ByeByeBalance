/**
 * ByeByeBalance — Print & Global Styles
 * 
 * Injected via <style> tag in the main App component.
 * Includes print report styles, hover effects, and input normalization.
 */

export const globalStyles = `
  .print-report { display: none; }
  button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
  a:hover { text-decoration: underline; }
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  input[type="number"] { -moz-appearance: textfield; }

  @media print {
    .no-print { display: none !important; }
    .print-report { display: block !important; }
    body, html { background: white !important; margin: 0 !important; padding: 0 !important; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .print-page { padding: 0.35in 0.5in; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: white !important; }
    .print-page-break { page-break-before: always; }
    @page { margin: 0.3in; }
    #app-root { background: white !important; background-image: none !important; }
    .pr-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 12px; border-bottom: 3px solid #1a1a2e; margin-bottom: 16px; }
    .pr-logo { display: flex; align-items: center; gap: 8px; }
    .pr-logo-icon { width: 32px; height: 32px; background: #667eea !important; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 11px; }
    .pr-logo-text { font-weight: 900; font-size: 16px; color: #1a1a2e; }
    .pr-meta { text-align: right; font-size: 10px; color: #888; line-height: 1.6; }
    .pr-title { font-weight: 800; font-size: 20px; color: #1a1a2e; margin-bottom: 2px; }
    .pr-strategy { font-size: 11px; color: #667eea; font-weight: 600; margin-bottom: 16px; }
    .pr-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
    .pr-metric { padding: 10px; border-radius: 8px; text-align: center; background: white !important; border: 2px solid #e9ecef; }
    .pr-metric-primary { border-color: #059669 !important; border-width: 2px !important; }
    .pr-metric-blue { border-color: #2563eb !important; border-width: 2px !important; }
    .pr-metric-gold { border-color: #d97706 !important; border-width: 2px !important; }
    .pr-metric-label { font-size: 8px; letter-spacing: 0.1em; text-transform: uppercase; color: #888; margin-bottom: 4px; font-weight: 600; }
    .pr-metric-value { font-weight: 800; font-size: 18px; color: #1a1a2e; }
    .pr-green { color: #059669 !important; }
    .pr-blue { color: #2563eb !important; }
    .pr-amber { color: #d97706 !important; }
    .pr-metric-sub { font-size: 9px; color: #aaa; margin-top: 2px; }
    .pr-savings { background: white !important; border: 2px solid #059669; border-radius: 8px; padding: 12px; margin-bottom: 16px; display: flex; align-items: center; gap: 12px; }
    .pr-savings-number { font-weight: 900; font-size: 20px; color: #059669; white-space: nowrap; }
    .pr-savings-text { font-size: 11px; color: #713f12; line-height: 1.5; }
    .pr-section-title { font-weight: 700; font-size: 13px; color: #1a1a2e; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #e9ecef; }
    .pr-comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
    .pr-comp-box { padding: 10px; border-radius: 8px; border: 2px solid #e9ecef; background: white !important; }
    .pr-comp-active { border-color: #667eea !important; }
    .pr-comp-header { font-size: 11px; color: #555; margin-bottom: 4px; font-weight: 600; }
    .pr-badge { font-size: 8px; background: #667eea !important; color: white; padding: 1px 5px; border-radius: 3px; font-weight: 700; margin-left: 4px; }
    .pr-comp-interest { font-weight: 800; font-size: 15px; color: #1a1a2e; }
    .pr-comp-months { font-size: 10px; color: #888; margin-top: 2px; }
    .pr-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 16px; }
    .pr-table thead th { text-align: left; font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase; color: #888; padding: 6px 8px; border-bottom: 2px solid #e9ecef; font-weight: 600; }
    .pr-table tbody td { padding: 7px 8px; border-bottom: 1px solid #f3f4f6; color: #333; }
    .pr-first-row { background: white !important; border-left: 3px solid #059669; }
    .pr-order { width: 20px; height: 20px; border-radius: 50%; background: #667eea !important; color: white; display: inline-flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; }
    .pr-order-first { background: #059669 !important; }
    .pr-rate { color: #d97706; font-weight: 600; }
    .pr-interest-high { color: #dc2626; font-weight: 600; }
    .pr-interest-low { color: #059669; font-weight: 600; }
    .pr-month { color: #2563eb; font-weight: 600; }
    .pr-before-after { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
    .pr-ba-box { padding: 10px; border-radius: 8px; text-align: center; }
    .pr-ba-before { background: white !important; border: 2px solid #dc2626; }
    .pr-ba-after { background: white !important; border: 2px solid #059669; }
    .pr-ba-title { font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700; margin-bottom: 10px; }
    .pr-ba-before .pr-ba-title { color: #dc2626; }
    .pr-ba-after .pr-ba-title { color: #059669; }
    .pr-ba-stat { margin-bottom: 6px; }
    .pr-ba-value { font-weight: 800; font-size: 16px; }
    .pr-ba-before .pr-ba-value { color: #991b1b; }
    .pr-ba-after .pr-ba-value { color: #047857; }
    .pr-ba-label { font-size: 9px; color: #999; }
    .pr-bars { margin-bottom: 8px; }
    .pr-bar-item { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .pr-bar-name { font-size: 10px; color: #555; width: 100px; flex-shrink: 0; }
    .pr-bar-track { flex: 1; height: 16px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
    .pr-bar-fill { height: 100%; border-radius: 4px; display: flex; align-items: center; justify-content: flex-end; padding-right: 5px; font-size: 8px; color: white; font-weight: 700; }
    .pr-bar-rate { font-size: 10px; color: #999; width: 50px; text-align: right; flex-shrink: 0; }
    .pr-footer { padding-top: 10px; border-top: 1px solid #e9ecef; display: flex; justify-content: space-between; font-size: 9px; color: #bbb; }
    .pr-disclaimer { font-size: 8px; color: #ccc; font-style: italic; margin-top: 8px; line-height: 1.5; }
  }
`;
