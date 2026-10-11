import Link from 'next/link';

export const metadata = {
  title: 'Terms of use',
  description: 'The plain-language terms for using ByeByeBalance: free educational estimates, not financial advice, provided as is.',
  alternates: { canonical: '/terms' },
};

export default function Page() {
  return (
    <section className="article">
      <h1>Terms of use</h1>
      <p>These terms cover your use of ByeByeBalance at byebyebalance.com. By using the site, you agree to them. They&rsquo;re written to be read, so please do.</p>

      <h2>Estimates, not advice</h2>
      <p>ByeByeBalance is an educational tool. Its results are estimates based on the numbers you enter and on simplifying assumptions: fixed APRs, monthly interest (APR ÷ 12), no fees, no new charges and payments made on time. Your lenders calculate interest their own way, so your statements will differ.</p>
      <p>Nothing on the site is financial, tax, credit or legal advice, and it is not an offer or approval of credit. Before you make a big decision, check the numbers with your lender or a qualified professional.</p>

      <h2>Your data and your responsibilities</h2>
      <ul>
        <li>The numbers you enter stay in your browser. How that works is explained in our <Link href="/privacy">Privacy</Link> page.</li>
        <li>Saved data lives only on your device. Clearing browser data, switching devices or a browser problem can erase it. Export a backup if it matters to you.</li>
        <li>You&rsquo;re responsible for the accuracy of what you enter and for how you use the results.</li>
      </ul>

      <h2>Acceptable use</h2>
      <p>Please don&rsquo;t attack, overload or try to break the site, try to get around its security, or present it, or a copy of it, as your own service in a way that misleads people. If you find a security problem, report it privately through our <a href="https://github.com/Kwamib/ByeByeBalance/security/policy" rel="noopener noreferrer">security policy</a>.</p>

      <h2>The code and the name</h2>
      <p>The source code is public on <a href="https://github.com/Kwamib/ByeByeBalance" rel="noopener noreferrer">GitHub</a> under the GNU Affero General Public License v3.0 (AGPL). You may use, change and share it under that license, which requires that anyone who runs a modified version for others also shares their source code. The ByeByeBalance name, logo and guide articles are not covered by that license, so please don&rsquo;t use them for your own version.</p>

      <h2>Provided as is</h2>
      <p>The site is free and provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without warranties of any kind, including accuracy, availability or fitness for a particular purpose. To the fullest extent the law allows, ByeByeBalance and its maintainer are not liable for any loss or damage arising from your use of the site or its results, including financial decisions made with them or lost saved data.</p>

      <h2>Other sites</h2>
      <p>Links to other sites are for convenience. We don&rsquo;t control them and aren&rsquo;t responsible for their content.</p>

      <h2>Changes</h2>
      <p>We may update the site and these terms. When the terms change, we&rsquo;ll update the date below. Using the site after a change means you accept the updated terms.</p>

      <h2>Governing law and contact</h2>
      <p>These terms are governed by the laws of the State of Maryland, United States. Questions? <Link href="/contact">Get in touch</Link>.</p>
      <p className="note">Last updated October 11, 2026.</p>
    </section>
  );
}
