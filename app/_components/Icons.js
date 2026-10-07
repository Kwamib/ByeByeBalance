export function Leaf(props) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false" {...props}>
      <defs>
        <linearGradient id="leafg" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#0c6b46" />
          <stop offset="1" stopColor="#2f9a63" />
        </linearGradient>
      </defs>
      <path d="M4 28C4 14 12 5 29 3c-1 17-9 26-23 26-.8 0-1.4-.4-2-1Z" fill="url(#leafg)" />
      <path d="M5.5 27.5C10 20 16 13 24 8" fill="none" stroke="#fdfcfb" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

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
