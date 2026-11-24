import Link from 'next/link';
import { Arrow, Shield } from './_components/Icons';

export const metadata = {
  title: 'Page not found', // the root layout's template adds " | ByeByeBalance"
  robots: { index: false, follow: true },
};

const NOT_FOUND_LINKS = [
  { href: '/planner', title: 'Debt payoff planner', text: 'Compare payoff strategies and find your debt-free date.' },
  { href: '/calculators', title: 'All calculators', text: 'Mortgage, affordability and more.' },
  { href: '/guides', title: 'Guides', text: 'Plain answers to common debt questions.' },
  { href: '/budget', title: 'Budget', text: 'See where your money goes each month.' },
];

export default function NotFound() {
  return (
    <>
      <div className="page-title">
        <div className="eyebrow">Error 404</div>
        <h1>This page doesn&rsquo;t exist</h1>
        <p>The link may be old or mistyped. Here are a few places to pick up where you left off.</p>
      </div>

      <section className="not-found-top" style={{ paddingTop: 24, paddingBottom: 8 }}>
        <div className="notice">
          <Shield />
          <p>Your saved plan is safe. It lives in this browser, and visiting a missing page doesn&rsquo;t change it.</p>
        </div>
        <div className="row">
          <Link className="button" href="/planner">Go to my plan <Arrow /></Link>
          <Link className="button secondary" href="/">Back to home</Link>
        </div>
      </section>

      <section style={{ paddingTop: 32 }}>
        <h2 style={{ fontSize: 28, marginBottom: 20 }}>Or try one of these</h2>
        <div className="tool-cards">
          {NOT_FOUND_LINKS.map(({ href, title, text }) => (
            <Link key={href} className="card tool-card" href={href}>
              <h3>{title}</h3>
              <p>{text}</p>
              <span className="more"><Arrow /></span>
            </Link>
          ))}
        </div>
        <p className="note" style={{ marginTop: 28, marginBottom: 0 }}>
          Followed a link from this site and ended up here? <Link href="/contact">Let us know</Link> so we can fix it.
        </p>
      </section>
    </>
  );
}
