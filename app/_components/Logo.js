'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

const HAND = 'M11 29.5C8.6 27.6 7.3 25.2 6.4 22.6L4.7 17.6C4.3 16.4 4.9 15.2 6 14.9C7 14.6 8 15.2 8.4 16.2L9.6 19V8.2C9.6 7.2 10.3 6.5 11.1 6.5S12.6 7.2 12.6 8.2V15.2V5.2C12.6 4.2 13.3 3.5 14.1 3.5S15.6 4.2 15.6 5.2V15.2V6.2C15.6 5.2 16.3 4.5 17.1 4.5S18.6 5.2 18.6 6.2V15.6V9.2C18.6 8.4 19.2 7.8 19.9 7.8S21.2 8.4 21.2 9.2V20.2C21.2 24.4 20.4 27.4 19 29.5Z';

/**
 * Waving-hand mark. The hand and the motion lines are two stacked SVG
 * elements, so the hand can be rotated as a whole element (reliable in
 * Safari, Chrome and Firefox) while the motion lines stay still.
 * Decorative: the surrounding link carries the accessible name.
 */
export function HandMark({ waving = false, onWaveEnd }) {
  return (
    <span className="logo-hand" aria-hidden="true">
      <svg className={waving ? 'hand wave' : 'hand'} viewBox="0 0 32 32" focusable="false" onAnimationEnd={onWaveEnd}>
        <path d={HAND} fill="#e5f4e9" stroke="#137b57" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <svg className="lines" viewBox="0 0 32 32" focusable="false">
        <path d="M23.6 4.6C25.3 5.6 26.3 7.3 26.4 9.3M26 2.6C28.4 4 29.8 6.5 29.9 9.3" fill="none" stroke="#137b57" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function reducedMotion() {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return true; }
}

/**
 * Header logo link. The hand waves once when the page loads (the header
 * stays mounted during in-site navigation, so it never replays then), and
 * again on hover or tap. A wave in progress is never restarted. Nothing
 * moves when the person has asked for reduced motion.
 */
export function BrandLink() {
  const [waving, setWaving] = useState(false);
  const busy = useRef(false);

  const wave = useCallback(() => {
    if (busy.current || reducedMotion()) return;
    busy.current = true;
    setWaving(true);
  }, []);
  const done = useCallback(() => { busy.current = false; setWaving(false); }, []);

  useEffect(() => {
    const t = setTimeout(wave, 450); // after first paint so it's actually seen
    return () => clearTimeout(t);
  }, [wave]);

  return (
    <Link className="brand" href="/" onMouseEnter={wave} onClick={wave}>
      <HandMark waving={waving} onWaveEnd={done} />
      ByeByeBalance
    </Link>
  );
}
