import Link from 'next/link';

export default function NotFound() {
  return (
    <section>
      <h1>Page not found</h1>
      <Link className="button" href="/">Back to home</Link>
    </section>
  );
}
