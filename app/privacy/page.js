import Link from 'next/link';
import ClearData from './ClearData';

export const metadata = {
  title: 'Privacy',
  description: 'ByeByeBalance has no accounts, does not connect to bank accounts, never sends the numbers you enter to a server, and loads no advertising or analytics trackers.',
  alternates: { canonical: '/privacy' },
};

export default function Page() {
  return (
    <section className="article">
      <h1>Your information stays with you.</h1>
      <p>ByeByeBalance has no accounts and does not connect to bank accounts. The numbers you enter are never sent to a server, and the site loads no advertising or analytics trackers. Every calculation runs in your browser.</p>

      <h2>What is saved, and where</h2>
      <p>Everything below is stored in this browser&rsquo;s local storage, on this device only. We never receive it.</p>
      <ul>
        <li><strong>My plan:</strong> your debts (names, balances, APRs, minimum payments), your extra payment and strategy, and monthly check-ins. Saved when you choose Save my plan or Save monthly check-in.</li>
        <li><strong>Budget:</strong> your take-home income, expenses, debt minimums and savings. Saved automatically as you type, so you don&rsquo;t lose your work.</li>
        <li><strong>Home buying:</strong> the home price, down payment, rate, term, taxes, insurance and HOA you last calculated, so the mortgage and affordability pages stay in sync. Income entered on the affordability page is not saved.</li>
      </ul>
      <p>Saved data is not synchronized across devices, and clearing your browser data removes it. Anyone who uses this browser on this device can see it, so clear it when you&rsquo;re done on a shared computer.</p>
      <ClearData />

      <h2>Files you download</h2>
      <p>CSV exports, budget backups and printed or saved PDFs are created in your browser and downloaded straight to your device. They are never uploaded. A backup file contains your plan and budget, so keep it somewhere private. When you restore a backup, the file is read in your browser and checked before anything changes.</p>

      <h2>Hosting</h2>
      <p>The site is hosted on Vercel, which, like any web host, receives standard request information such as IP address, browser type and the page requested when a page loads. That never includes the numbers you enter.</p>

      <h2>Feedback and links to other sites</h2>
      <p>The feedback form on the <Link href="/contact">Contact</Link> page is a Google Form, so anything you type there is collected by Google and shared with us. GitHub issues are public. Please don&rsquo;t include your balances or other personal details in either. Links to other sites, such as the CFPB, follow those sites&rsquo; own privacy policies.</p>

      <h2>Security</h2>
      <p>The site only runs its own code. Its security settings stop other sites&rsquo; scripts from loading and stop pages from sending data anywhere else. To report a security problem, see our <a href="https://github.com/Kwamib/ByeByeBalance/security/policy" rel="noopener noreferrer">security policy</a>.</p>

      <h2>Children</h2>
      <p>ByeByeBalance is meant for adults managing their own finances. It has no accounts and doesn&rsquo;t collect personal information from anyone, including children.</p>

      <h2>Changes</h2>
      <p>If we ever add analytics, advertising or anything else that changes what is collected, we&rsquo;ll update this page first and change the date below. See also our <Link href="/terms">Terms of use</Link>.</p>
      <p className="note">Last updated October 11, 2026.</p>
    </section>
  );
}
