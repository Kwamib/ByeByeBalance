import { ToolCards, HomeCards, GuideCards, PageTitle, SectionIntro } from '../_components/Cards';

export const metadata = {
  title: 'Free Debt Calculators',
  description: 'Free calculators for extra payments, credit card payoff, snowball vs. avalanche, your debt-free date, mortgage payments and home affordability.',
  alternates: { canonical: '/calculators' },
};

export default function Page() {
  return (
    <>
      <PageTitle title="Make the numbers clearer." sub="Explore a specific question, then bring your debts together in the full planner." />
      <section style={{ paddingTop: 24 }}>
        <SectionIntro title="Debt payoff" />
        <div style={{ marginTop: 16 }}><ToolCards /></div>
      </section>
      <section style={{ paddingTop: 0 }}>
        <SectionIntro title="Home buying" />
        <div style={{ marginTop: 16 }}><HomeCards /></div>
      </section>
      <section style={{ paddingTop: 0 }}>
        <SectionIntro title="Understand your results">
          <p>Every calculator uses a simplified fixed-rate, fixed-payment model to show illustrative results. Actual results may vary based on your lender&rsquo;s terms, payment allocation, and other factors.</p>
        </SectionIntro>
        <div style={{ marginTop: 24 }}><GuideCards /></div>
      </section>
    </>
  );
}
