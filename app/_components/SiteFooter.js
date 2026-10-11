import Link from 'next/link';
import { HandMark } from './Logo';

export default function SiteFooter() {
  return (
    <footer>
      <Link className="brand" href="/"><HandMark />ByeByeBalance</Link>
      <div className="footer-links">
        <Link href="/calculators">Calculators</Link>
        <Link href="/guides">Guides</Link>
        <Link href="/planner">My plan</Link>
        <Link href="/budget">Budget</Link>
        <Link href="/about">About</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <a href="https://github.com/Kwamib/ByeByeBalance" rel="noopener noreferrer">Source code</a>
      </div>
      <p>Educational estimates, not financial advice. Actual lender calculations may differ.</p>
    </footer>
  );
}
