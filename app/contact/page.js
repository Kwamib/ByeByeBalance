export const metadata = {
  title: 'Contact',
  description: 'Suggest a feature, report a bug or follow ByeByeBalance on GitHub.',
  alternates: { canonical: '/contact' },
};

export default function Page() {
  return (
    <section className="article">
      <h1>Get in touch.</h1>
      <p>ByeByeBalance is built by one person, and feedback shapes what comes next.</p>
      <h2>Suggest a feature</h2>
      <p>Have an idea? <a href="https://forms.gle/3q4UdFGtA8zi5JdY9" rel="noopener noreferrer">Share it in the feedback form</a>.</p>
      <h2>Report a bug</h2>
      <p>If a number looks wrong or something breaks, <a href="https://github.com/Kwamib/ByeByeBalance/issues" rel="noopener noreferrer">open an issue on GitHub</a>. Leave out anything you&rsquo;d rather keep private.</p>
      <h2>Follow along</h2>
      <p><a href="https://github.com/Kwamib/ByeByeBalance" rel="noopener noreferrer">Watch the repository on GitHub</a> for updates.</p>
    </section>
  );
}
