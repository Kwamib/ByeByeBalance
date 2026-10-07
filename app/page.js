import Link from 'next/link';
import JsonLd from './JsonLd';
import HeroCard from './HeroCard';
import { ToolCards, GuideCards, HomeCards, PageTitle, SectionIntro } from './_components/Cards';
import { Arrow } from './_components/Icons';
import { CalendarArt } from './_components/Illustrations';

export const metadata = { alternates: { canonical: '/' } };

export default function Home() {
  return (
    <>
      <JsonLd />
      <PageTitle title="A clearer path to debt-free." sub="Compare payoff strategies, see what extra payments change, and build a plan that works for you.">
        <div className="row">
          <Link className="button" href="/planner">Build my payoff plan <Arrow /></Link>
          <Link className="button secondary" href="/calculators">Explore calculators</Link>
        </div>
        <div className="trust-row">
          <span>Free to use</span><span>No bank connection required</span><span>Saved only on your device</span>
        </div>
      </PageTitle>

      <HeroCard />

      <section>
        <SectionIntro title="Start with the question on your mind">
          <p>Small questions, clearer next steps. Each calculator takes a minute and shows its assumptions.</p>
        </SectionIntro>
        <div style={{ marginTop: 24 }}><ToolCards /></div>
      </section>

      <div className="band">
        <div className="band-inner">
          <div>
            <h2>Your plan. Your pace.</h2>
            <p style={{ fontSize: 17 }}>Add your debts, compare strategies, and record your balances each month to see how far you&rsquo;ve come.</p>
            <Link className="button" href="/progress">Explore my progress <Arrow /></Link>
          </div>
          <div className="card" style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 150 }}><CalendarArt /></div>
            <div>
              <h3 style={{ fontSize: 21, margin: '0 0 6px' }}>A monthly check-in</h3>
              <p style={{ margin: 0 }}>Keep your latest balances and a history of your progress in one place.</p>
              <div className="progress-bar"><i style={{ width: '48%' }} /></div>
              <span className="note">Illustrative progress preview</span>
            </div>
          </div>
        </div>
      </div>

      <section>
        <SectionIntro title="Make room for your next move">
          <p>See what a home could cost each month, and how your existing debt affects your budget.</p>
        </SectionIntro>
        <div style={{ marginTop: 24 }}><HomeCards /></div>
      </section>

      <section>
        <SectionIntro title="Practical guides for your next step" />
        <div style={{ marginTop: 20 }}><GuideCards /></div>
      </section>

      <section>
        <div className="card mint cta-card">
          <h2>You don&rsquo;t need a perfect plan to start.</h2>
          <p>A few details can give you a direction forward.</p>
          <Link className="button" href="/planner">Create my payoff plan <Arrow /></Link>
        </div>
      </section>
    </>
  );
}
