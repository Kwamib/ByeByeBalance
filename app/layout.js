import './globals.css';

export const metadata = {
  title: {
    default: 'ByeByeBalance – Free Debt Payoff Calculator | Snowball & Avalanche',
    template: '%s | ByeByeBalance',
  },
  description:
    'Free debt payoff calculator. Compare Snowball vs Avalanche strategies, see your debt-free date, and create a personalized payoff plan. No sign-up required. 100% private.',
  keywords: [
    'debt payoff calculator',
    'debt snowball calculator',
    'debt avalanche calculator',
    'pay off debt fast',
    'debt free calculator',
    'debt elimination',
    'debt repayment plan',
    'credit card payoff calculator',
    'student loan payoff calculator',
    'free debt calculator',
  ],
  authors: [{ name: 'ByeByeBalance' }],
  creator: 'ByeByeBalance',
  openGraph: {
    title: 'ByeByeBalance – Free Debt Payoff Calculator',
    description:
      'Compare Snowball vs Avalanche strategies and see exactly when you\'ll be debt-free. Free, private, no sign-up.',
    url: 'https://www.byebyebalance.com',
    siteName: 'ByeByeBalance',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ByeByeBalance – Free Debt Payoff Calculator',
    description:
      'Compare Snowball vs Avalanche strategies and see exactly when you\'ll be debt-free.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://www.byebyebalance.com',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#667eea" />
        <link rel="apple-touch-icon" href="/logo192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
