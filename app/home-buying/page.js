import Link from 'next/link';
import { HomeCards, PageTitle, SectionIntro } from '../_components/Cards';
import { Arrow } from '../_components/Icons';

export const metadata = {
  title: 'Home Buying Calculators',
  description: 'Estimate a full monthly mortgage payment and explore how a home fits your budget alongside your debt payoff goals.',
  alternates: { canonical: '/home-buying' },
};

export default function Page() {
  return (
    <>
      <PageTitle title="A home payment that fits your life." sub="Explore a potential home purchase alongside your debt payoff goals." />
      <section style={{ paddingTop: 24 }}>
        <HomeCards />
        <div className="card mint cta-card" style={{ marginTop: 24 }}>
          <h2>Debt payoff and home buying belong together.</h2>
          <p>Lower monthly debt payments change how much of your income can go toward a home.</p>
          <Link className="button" href="/planner">Review my debt payoff plan <Arrow /></Link>
        </div>
      </section>
      <section style={{ paddingTop: 0 }}>
        <SectionIntro title="A budget check, not an approval">
          <p>These tools estimate costs and ratios from the numbers you enter. Lenders also review credit history, verified income, assets and the rules of each loan program, so only a lender can tell you what you qualify for.</p>
        </SectionIntro>
      </section>
    </>
  );
}
