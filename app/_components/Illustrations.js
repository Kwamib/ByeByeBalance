/* Decorative illustrations (aria-hidden). Drawn to match the approved mockup. */

export function CalendarArt() {
  const dots = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) dots.push([c, r]);
  return (
    <svg viewBox="0 0 170 120" aria-hidden="true" focusable="false">
      <circle cx="78" cy="62" r="56" fill="#e2f1e7" />
      <rect x="30" y="24" width="92" height="82" rx="8" fill="#fff" stroke="#cfe0d6" />
      <path d="M30 32a8 8 0 0 1 8-8h76a8 8 0 0 1 8 8v12H30Z" fill="#1b7f58" />
      <rect x="48" y="14" width="5" height="18" rx="2.5" fill="#0f5e40" />
      <rect x="98" y="14" width="5" height="18" rx="2.5" fill="#0f5e40" />
      {dots.map(([c, r]) => {
        const cx = 46 + c * 17, cy = 58 + r * 16;
        const special = c === 3 && r === 1;
        const green = (c + r) % 3 === 1;
        return special
          ? <circle key={`${c}${r}`} cx={cx} cy={cy} r="7" fill="#fff" stroke="#1b7f58" strokeWidth="2.4" />
          : <circle key={`${c}${r}`} cx={cx} cy={cy} r="4.2" fill={green ? '#8fcaa8' : '#dfe5e2'} />;
      })}
      <path d="M104 74h28" stroke="#1b7f58" strokeWidth="2.4" />
      <circle cx="140" cy="74" r="20" fill="#137b57" />
      <path d="M131 74h16M141 67l7 7-7 7" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CoinStack({ x, base, n }) {
  const coins = [];
  for (let i = 0; i < n; i++) {
    const y = base - i * 11;
    coins.push(
      <g key={i}>
        <path d={`M${x - 20} ${y}v6c0 4 9 7 20 7s20-3 20-7v-6`} fill="#137b57" />
        <ellipse cx={x} cy={y} rx="20" ry="7" fill={i === n - 1 ? '#3aa274' : '#1f8a60'} />
        <path d={`M${x - 20} ${y + 6}c0 4 9 7 20 7s20-3 20-7`} fill="none" stroke="#0c5c3e" strokeOpacity=".5" />
      </g>,
    );
  }
  return <g>{coins}</g>;
}

export function CoinsArt() {
  return (
    <svg viewBox="0 0 170 120" aria-hidden="true" focusable="false">
      <circle cx="78" cy="62" r="56" fill="#e2f1e7" />
      <CoinStack x={58} base={92} n={4} />
      <CoinStack x={98} base={96} n={7} />
      <circle cx="122" cy="88" r="20" fill="#137b57" stroke="#fff" strokeWidth="3" />
      <text x="122" y="96" textAnchor="middle" fontSize="23" fontWeight="600" fill="#fff" fontFamily="Inter Variable, system-ui, sans-serif">$</text>
      <path d="M128 14l-3 9M140 20l-7 7M146 33l-9 2" stroke="#137b57" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function ScaleArt() {
  return (
    <svg viewBox="0 0 280 130" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="scbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e9f3ec" /><stop offset="1" stopColor="#dcebe1" /></linearGradient>
      </defs>
      <rect width="280" height="130" fill="url(#scbg)" />
      <ellipse cx="140" cy="113" rx="70" ry="6" fill="#c8dccf" />
      <rect x="137" y="22" width="6" height="86" fill="#2b3a4a" />
      <path d="M118 110h44l-6-8h-32Z" fill="#2b3a4a" />
      <circle cx="140" cy="20" r="5" fill="#2b3a4a" />
      <path d="M78 30 202 24" stroke="#2b3a4a" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M84 30l-10 30M84 30l10 30M196 24l-10 30M196 24l10 30" stroke="#2b3a4a" strokeWidth="1.4" />
      <rect x="68" y="58" width="32" height="7" rx="2" fill="#5b6876" />
      <rect x="71" y="51" width="26" height="8" rx="2" fill="#6f7c8a" />
      <rect x="180" y="52" width="32" height="7" rx="2" fill="#3c9a6c" />
      <rect x="183" y="45" width="26" height="8" rx="2" fill="#56b082" />
      <rect x="20" y="70" width="88" height="24" rx="3" fill="#fff" />
      <text x="64" y="86" textAnchor="middle" fontSize="11" fontWeight="600" fill="#1d2735" fontFamily="Inter Variable, system-ui, sans-serif">SNOWBALL</text>
      <rect x="166" y="70" width="94" height="24" rx="3" fill="#7cc097" />
      <text x="213" y="86" textAnchor="middle" fontSize="11" fontWeight="600" fill="#0f3d27" fontFamily="Inter Variable, system-ui, sans-serif">AVALANCHE</text>
    </svg>
  );
}

function LeafShape({ x, y, r, s = 1, fill }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M0 0C10-18 30-24 46-20 40-4 22 8 0 0Z" fill={fill} />
      <path d="M2-1C16-10 30-15 44-19" stroke="#ffffff55" strokeWidth="1.2" fill="none" />
    </g>
  );
}

export function ChecklistArt() {
  const items = ['Extra payment', 'Lower balance', 'Less interest'];
  return (
    <svg viewBox="0 0 280 130" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <rect width="280" height="130" fill="#eceee9" />
      <LeafShape x={-6} y={120} r={-58} s={1.5} fill="#4f8a3c" />
      <LeafShape x={14} y={132} r={-80} s={1.2} fill="#3f7a31" />
      <LeafShape x={286} y={60} r={150} s={1.6} fill="#46833a" />
      <LeafShape x={292} y={110} r={175} s={1.4} fill="#3b742f" />
      <g transform="rotate(-6 140 70)">
        <rect x="66" y="16" width="150" height="128" rx="4" fill="#fbfbf8" stroke="#dcdcd4" />
        {Array.from({ length: 11 }).map((_, i) => (
          <g key={i}><rect x={78 + i * 12.5} y="10" width="2.4" height="12" rx="1.2" fill="#6b6f74" /></g>
        ))}
        {items.map((t, i) => (
          <g key={t} transform={`translate(86 ${48 + i * 24})`}>
            <rect width="14" height="14" rx="2.5" fill="#1b7f58" />
            <path d="M3.5 7.5l2.6 2.6 4.6-5.2" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <text x="22" y="11.5" fontSize="12.5" fill="#1d2735" fontFamily="Source Serif 4 Variable, Georgia, serif">{t}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

export function PathArt() {
  return (
    <svg viewBox="0 0 280 130" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e8f0ef" /><stop offset="1" stopColor="#f6f3e9" /></linearGradient>
        <linearGradient id="hill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7fb15a" /><stop offset="1" stopColor="#4d8a3a" /></linearGradient>
      </defs>
      <rect width="280" height="130" fill="url(#sky)" />
      <circle cx="216" cy="24" r="12" fill="#f2c96b" />
      <path d="M0 70 40 50 80 66 120 48 150 60 190 44 240 62 280 52V130H0Z" fill="#9dbfa8" />
      <path d="M0 86 50 66 92 80 140 22 196 78 240 70 280 82V130H0Z" fill="url(#hill)" />
      <path d="M0 104 60 90 120 104 180 92 280 108V130H0Z" fill="#3f7b33" />
      <path d="M140 24c-6 14 8 20 -2 32s-22 16-10 30-26 20-20 44h22c-8-20 22-24 14-42s10-18 2-34 4-18-6-30Z" fill="#efe6cc" />
      <path d="M140 22V8" stroke="#2b3a2a" strokeWidth="1.5" />
      <path d="M140 8h11l-3 4 3 4h-11Z" fill="#1b7f58" />
      {[[22, 92], [34, 96], [52, 88], [222, 92], [238, 98], [256, 90], [96, 82], [196, 80]].map(([x, y]) => (
        <path key={`${x}-${y}`} d={`M${x} ${y - 16}l7 16h-14Z`} fill="#2f6a2b" />
      ))}
    </svg>
  );
}

export const GUIDE_ART = { 'snowball-vs-avalanche': ScaleArt, 'extra-payments': ChecklistArt, 'debt-free-date': PathArt };

export function HouseArt() {
  return (
    <svg viewBox="0 0 140 104" aria-hidden="true" focusable="false">
      <circle cx="66" cy="54" r="44" fill="#d6ecdd" />
      <path d="M28 56 66 24l38 32" fill="none" stroke="#0f6847" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M36 52v34h60V52L66 28Z" fill="#fff" />
      <rect x="58" y="62" width="16" height="24" rx="2" fill="#137b57" />
      <rect x="42" y="60" width="11" height="11" rx="1.5" fill="#8fcaa8" />
      <rect x="80" y="60" width="11" height="11" rx="1.5" fill="#8fcaa8" />
      <circle cx="112" cy="74" r="16" fill="#137b57" stroke="#fff" strokeWidth="3" />
      <text x="112" y="81" textAnchor="middle" fontSize="18" fontWeight="600" fill="#fff" fontFamily="Inter Variable, system-ui, sans-serif">$</text>
    </svg>
  );
}

export function GaugeArt() {
  return (
    <svg viewBox="0 0 140 104" aria-hidden="true" focusable="false">
      <circle cx="70" cy="54" r="44" fill="#d6ecdd" />
      <path d="M30 74a40 40 0 0 1 80 0" fill="none" stroke="#fff" strokeWidth="12" strokeLinecap="round" />
      <path d="M30 74a40 40 0 0 1 52-38" fill="none" stroke="#137b57" strokeWidth="12" strokeLinecap="round" />
      <path d="M70 74 90 46" stroke="#0e1a2b" strokeWidth="4" strokeLinecap="round" />
      <circle cx="70" cy="74" r="6" fill="#0e1a2b" />
      <text x="70" y="98" textAnchor="middle" fontSize="13" fontWeight="600" fill="#0f6847" fontFamily="Inter Variable, system-ui, sans-serif">DTI</text>
    </svg>
  );
}

export function CardArt() {
  return (
    <svg viewBox="0 0 140 104" aria-hidden="true" focusable="false">
      <circle cx="66" cy="52" r="44" fill="#d6ecdd" />
      <rect x="22" y="30" width="80" height="50" rx="7" fill="#137b57" />
      <rect x="22" y="40" width="80" height="9" fill="#0c5c3e" />
      <rect x="30" y="58" width="22" height="6" rx="3" fill="#8fcaa8" />
      <rect x="30" y="68" width="40" height="4" rx="2" fill="#5fae86" />
      <circle cx="108" cy="72" r="16" fill="#fff" stroke="#137b57" strokeWidth="3" />
      <text x="108" y="78" textAnchor="middle" fontSize="16" fontWeight="700" fill="#137b57" fontFamily="Inter Variable, system-ui, sans-serif">%</text>
    </svg>
  );
}

export function SplitArt() {
  return (
    <svg viewBox="0 0 140 104" aria-hidden="true" focusable="false">
      <circle cx="70" cy="52" r="44" fill="#d6ecdd" />
      <rect x="28" y="62" width="14" height="22" rx="2" fill="#98a9b7" />
      <rect x="46" y="48" width="14" height="36" rx="2" fill="#98a9b7" />
      <rect x="80" y="40" width="14" height="44" rx="2" fill="#137b57" />
      <rect x="98" y="24" width="14" height="60" rx="2" fill="#137b57" />
      <path d="M64 30h12M72 25l5 5-5 5M76 42H64M68 37l-5 5 5 5" fill="none" stroke="#0e1a2b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
