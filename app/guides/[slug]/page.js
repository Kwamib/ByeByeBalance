import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GuideCards, SectionIntro } from '../../_components/Cards';
import { Arrow } from '../../_components/Icons';
import { GUIDE_ART } from '../../_components/Illustrations';
import { GUIDES, getGuide } from '../../../lib/guides';

export function generateStaticParams() {
  return GUIDES.map(g => ({ slug: g.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const g = getGuide(slug);
  return g ? { title: g.title, description: g.intro, alternates: { canonical: `/guides/${g.slug}` } } : {};
}

export default async function Page({ params }) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) notFound();
  const Art = GUIDE_ART[g.slug];
  return (
    <>
      <article className="article" style={{ padding: '44px 32px 0' }}>
        <Link href="/guides">All guides</Link>
        <h1 style={{ marginTop: 14 }}>{g.title}</h1>
        <p style={{ fontSize: 20 }}>{g.intro}</p>
        {Art && <div className="guide-hero"><Art animate /></div>}
        {g.parts.map(([h, p]) => (
          <div key={h}><h2>{h}</h2><p>{p}</p></div>
        ))}
        <div className="card mint cta-card" style={{ marginTop: 32 }}>
          <h2>Put it into practice</h2>
          <p>Compare scenarios with your own numbers.</p>
          <Link className="button" href={g.practice}>Try the calculator <Arrow /></Link>
        </div>
      </article>
      <section>
        <SectionIntro title="Keep exploring" />
        <div style={{ marginTop: 20 }}><GuideCards /></div>
      </section>
    </>
  );
}
