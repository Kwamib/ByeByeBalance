'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Chevron } from './Icons';
import { BrandLink } from './Logo';
import { GUIDES } from '../../lib/guides';

const CALCULATORS = [
  { label: 'Debt payoff', items: [
    ['/calculators/extra-payment', 'What if I pay extra?'],
    ['/calculators/credit-card-payoff', 'Credit card payoff'],
    ['/calculators/snowball-vs-avalanche', 'Snowball or avalanche?'],
    ['/calculators/debt-free-date', 'When will I be debt-free?'],
  ] },
  { label: 'Home buying', items: [
    ['/mortgage', 'Mortgage payment'],
    ['/affordability', 'Can I afford this home?'],
  ] },
];

function Menu({ id, label, active, open, setOpen, children }) {
  return (
    <div className="nav-item">
      <button
        type="button"
        className={`nav-trigger${active ? ' active' : ''}`}
        aria-expanded={open === id}
        aria-controls={`menu-${id}`}
        onClick={() => setOpen(o => (o === id ? null : id))}
      >
        {label}<Chevron />
      </button>
      {open === id && <div className="nav-menu" id={`menu-${id}`}>{children}</div>}
    </div>
  );
}

export default function SiteHeader() {
  const path = usePathname() || '/';
  const [open, setOpen] = useState(null);
  const ref = useRef(null);

  useEffect(() => { setOpen(null); }, [path]);
  useEffect(() => {
    const onDoc = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(null); };
    const onKey = e => { if (e.key === 'Escape') setOpen(null); };
    document.addEventListener('pointerdown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDoc); document.removeEventListener('keydown', onKey); };
  }, []);

  const inCalcs = path.startsWith('/calculators') || ['/mortgage', '/affordability', '/home-buying'].includes(path);
  const inGuides = path.startsWith('/guides');
  const inPlan = path.startsWith('/planner') || path.startsWith('/progress');

  return (
    <header ref={ref}>
      <a className="skip" href="#main">Skip to content</a>
      <BrandLink />
      <nav aria-label="Main navigation">
        <Menu id="calcs" label="Calculators" active={inCalcs} open={open} setOpen={setOpen}>
          {CALCULATORS.map(group => (
            <div key={group.label} style={{ display: 'grid' }}>
              <span className="menu-label">{group.label}</span>
              {group.items.map(([href, text]) => <Link key={href} href={href}>{text}</Link>)}
            </div>
          ))}
          <Link href="/calculators" style={{ fontWeight: 600 }}>All calculators</Link>
        </Menu>
        <Menu id="guides" label="Guides" active={inGuides} open={open} setOpen={setOpen}>
          {GUIDES.map(g => <Link key={g.slug} href={`/guides/${g.slug}`}>{g.title}</Link>)}
          <Link href="/guides" style={{ fontWeight: 600 }}>All guides</Link>
        </Menu>
        <Link href="/planner" className={inPlan ? 'active' : undefined} aria-current={inPlan ? 'page' : undefined}>My plan</Link>
        <Link href="/budget" className={path.startsWith('/budget') ? 'active' : undefined} aria-current={path.startsWith('/budget') ? 'page' : undefined}>Budget</Link>
      </nav>
      <span className="pill">Free. No sign-up.</span>
    </header>
  );
}
