export function Arrow({ className = 'btn-arrow' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M2.5 8h10M8.5 3.5 13 8l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Chevron() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const iconProps = { viewBox: '0 0 16 16', 'aria-hidden': 'true', focusable: 'false' };
const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };

export function Download({ size = 18 }) {
  return (
    <svg {...iconProps} width={size} height={size}>
      <path d="M8 2.5v7.5M4.8 7 8 10.2 11.2 7M3 13.5h10" {...stroke} />
    </svg>
  );
}

export function Upload({ size = 18 }) {
  return (
    <svg {...iconProps} width={size} height={size}>
      <path d="M8 10.5V3M4.8 6.2 8 3l3.2 3.2M3 13.5h10" {...stroke} />
    </svg>
  );
}

export function Lock({ size = 14 }) {
  return (
    <svg {...iconProps} width={size} height={size}>
      <rect x="3.5" y="7" width="9" height="6.5" rx="1.2" {...stroke} />
      <path d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7" {...stroke} />
    </svg>
  );
}
