import Link from 'next/link';
import { Leaf } from './Icons';

export default function SiteFooter() {
  return (
    <footer>
      <Link className="brand" href="/"><Leaf />ByeByeBalance</Link>
      <div className="footer-links">
        <Link href="/calculators">Calculators</Link>
        <Link href="/guides">Guides</Link>
        <Link href="/planner">My plan</Link>
        <Link href="/about">About</Link>
        <Link href="/privacy">Privacy</Link>
      </div>
      <p>Educational estimates. Actual lender calculations may differ.</p>
    </footer>
  );
}
