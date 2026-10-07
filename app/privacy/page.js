import ClearData from './ClearData';

export const metadata = {
  title: 'Privacy',
  description: 'ByeByeBalance does not connect to bank accounts, send your debt inputs to a server, or load advertising or analytics trackers.',
  alternates: { canonical: '/privacy' },
};

export default function Page() {
  return (
    <section className="article">
      <h1>Your information stays with you.</h1>
      <p>ByeByeBalance does not connect to bank accounts, send your debt inputs to a server, or load advertising or analytics trackers. Every calculation runs in your browser.</p>
      <h2>Device-local saving</h2>
      <p>Your plan and check-ins are saved only when you choose Save my plan or Save monthly check-in. Home scenarios are kept when you calculate them, so the mortgage and affordability pages stay in sync. Income is not saved.</p>
      <p>Everything is stored in this browser&rsquo;s local storage. It is not synchronized across devices, and clearing browser data can remove it.</p>
      <ClearData />
      <h2>Hosting</h2>
      <p>The site is hosted on Vercel, which, like any web host, receives standard request information such as IP address and browser type when a page loads. That never includes the numbers you enter.</p>
      <p className="note">Last updated October 2026. If this changes, we&rsquo;ll update this page.</p>
    </section>
  );
}
