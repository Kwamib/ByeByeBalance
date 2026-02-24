export default function JsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ByeByeBalance',
    url: 'https://www.byebyebalance.com',
    description:
      'Free debt payoff calculator. Compare Snowball vs Avalanche strategies, see your debt-free date, and create a personalized payoff plan.',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Debt Snowball Calculator',
      'Debt Avalanche Calculator',
      'Strategy Comparison',
      'Debt-Free Date Projection',
      'Interest Savings Calculator',
      'Export to CSV',
      'Print Payoff Plan',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
