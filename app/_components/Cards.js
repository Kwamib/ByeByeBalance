import Link from 'next/link';
import { GUIDES } from '../../lib/guides';
import { GUIDE_ART, CalendarArt, CardArt, SplitArt, CoinsArt, HouseArt, GaugeArt } from './Illustrations';
import { Arrow } from './Icons';

export const TOOLS = [
  { href: '/calculators/extra-payment', title: 'What if I pay extra?', text: 'See how additional payments change your payoff date.', Art: CoinsArt },
  { href: '/calculators/credit-card-payoff', title: 'Credit card payoff', text: 'Estimate your timeline and total interest.', Art: CardArt },
  { href: '/calculators/snowball-vs-avalanche', title: 'Snowball or avalanche?', text: 'Compare strategies using your own debts.', Art: SplitArt },
  { href: '/calculators/debt-free-date', title: 'When will I be debt-free?', text: 'Find the payment needed for your target timeline.', Art: CalendarArt },
];

export function ToolCards() {
  return (
    <div className="tool-cards">
      {TOOLS.map(({ href, title, text, Art }) => (
        <Link key={href} className="card tool-card" href={href}>
          <div className="tool-art"><Art /></div>
          <h3>{title}</h3>
          <p>{text}</p>
          <span className="more">Open calculator <Arrow /></span>
        </Link>
      ))}
    </div>
  );
}

export function HomeCards() {
  return (
    <div className="home-cards">
      <Link className="card home-card" href="/mortgage">
        <div className="tool-art"><HouseArt /></div>
        <div>
          <h3>Mortgage payment</h3>
          <p>Principal, interest, taxes, insurance and HOA fees in one monthly number.</p>
          <span className="more">Estimate my payment <Arrow /></span>
        </div>
      </Link>
      <Link className="card home-card" href="/affordability">
        <div className="tool-art"><GaugeArt /></div>
        <div>
          <h3>Can I afford this home?</h3>
          <p>See the payment next to your income and existing debts. A budget check, not an approval.</p>
          <span className="more">Check my affordability <Arrow /></span>
        </div>
      </Link>
    </div>
  );
}

export function GuideCards({ exclude } = {}) {
  return (
    <div className="grid three">
      {GUIDES.filter(g => g.slug !== exclude).map(g => {
        const Art = GUIDE_ART[g.slug];
        return (
          <Link key={g.slug} className="card guide-card" href={`/guides/${g.slug}`}>
            <div className="guide-img">{Art && <Art />}</div>
            <h3>{g.title}</h3>
            <p>{g.intro}</p>
            <span className="more">Read the guide <Arrow /></span>
          </Link>
        );
      })}
    </div>
  );
}

export function PageTitle({ title, sub, back, children }) {
  return (
    <div className="page-title">
      {back && <Link className="back" href={back[0]}>{back[1]}</Link>}
      <h1>{title}</h1>
      {sub && <p>{sub}</p>}
      {children}
    </div>
  );
}

export function SectionIntro({ title, children }) {
  return (
    <div className="section-intro">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

export function Metric({ value, label }) {
  return <div className="metric"><strong>{value}</strong><span>{label}</span></div>;
}
