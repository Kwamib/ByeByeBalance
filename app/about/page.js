import Link from 'next/link';

export const metadata = {
  title: 'About',
  description: 'ByeByeBalance helps you explore payment strategies and build a plan with your own numbers. Free, open source, no sign-up.',
  alternates: { canonical: '/about' },
};

export default function Page() {
  return (
    <section className="article">
      <h1>Debt payoff, made clearer.</h1>
      <p>ByeByeBalance helps you explore payment strategies and build a plan with your own numbers.</p>
      <h2>A free, practical starting point</h2>
      <p>Calculators, a multi-debt planner and device-local progress tracking, with no sign-up and nothing to pay. People getting out of debt deserve a tool that doesn&rsquo;t cost them anything.</p>
      <h2>How the estimates work</h2>
      <p>Each month every debt gets its minimum payment, and the rest of your budget goes to the debt your strategy puts first. When a debt is paid off, its payment moves to the next one. Estimates assume fixed APRs, monthly interest (APR ÷ 12), no fees and no new charges, so lender statements will differ slightly.</p>
      <h2>Open source</h2>
      <p>The code, including the calculations and their tests, is public on <a href="https://github.com/Kwamib/ByeByeBalance" rel="noopener noreferrer">GitHub</a>. Spot something wrong? <Link href="/contact">Let us know</Link>.</p>
      <Link className="button" href="/planner">Explore the planner</Link>
    </section>
  );
}
