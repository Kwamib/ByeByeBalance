import Link from 'next/link';
import { GuideCards, PageTitle } from '../_components/Cards';
import { Arrow } from '../_components/Icons';

export const metadata = {
  title: 'Debt Payoff Guides',
  description: 'Practical guides to the snowball and avalanche methods, extra payments and planning your debt-free date.',
  alternates: { canonical: '/guides' },
};

export default function Page() {
  return (
    <>
      <PageTitle title="A little clarity goes a long way." sub="Short, practical guides to help you understand your options and keep your plan moving." />
      <section style={{ paddingTop: 24 }}>
        <GuideCards />
        <div className="card mint cta-card" style={{ marginTop: 24 }}>
          <h2>Ready to try it with your numbers?</h2>
          <p>Add your debts and see your payoff month in a couple of minutes.</p>
          <Link className="button" href="/planner">Build my payoff plan <Arrow /></Link>
        </div>
      </section>
    </>
  );
}
