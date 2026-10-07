import '@fontsource-variable/source-serif-4';
import '@fontsource-variable/inter';
import './globals.css';
import SiteHeader from './_components/SiteHeader';
import SiteFooter from './_components/SiteFooter';

export const metadata = {
  metadataBase: new URL('https://www.byebyebalance.com'),
  title: {
    default: 'ByeByeBalance: A Clearer Path to Debt-Free | Free Debt Payoff Planner',
    template: '%s | ByeByeBalance',
  },
  description: 'Compare debt payoff strategies, see what extra payments change, and build a plan that works for you. Free, no sign-up; your data stays in your browser.',
  applicationName: 'ByeByeBalance',
  manifest: '/manifest.json',
  openGraph: {
    title: 'ByeByeBalance: A clearer path to debt-free',
    description: 'Compare payoff strategies, see what extra payments change, and build a plan that works for you. Free, no sign-up.',
    url: 'https://www.byebyebalance.com',
    siteName: 'ByeByeBalance',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ByeByeBalance: A clearer path to debt-free',
    description: 'Compare payoff strategies and see what extra payments change. Free, no sign-up.',
  },
  robots: { index: true, follow: true },
};

export const viewport = { themeColor: '#ffffff' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
