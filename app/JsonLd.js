export default function JsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ByeByeBalance',
    url: 'https://www.byebyebalance.com',
    description:
      'Free debt payoff planner. Compare snowball and avalanche, see your debt-free date and build a month-by-month plan.',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Debt snowball and avalanche planner',
      'Custom payoff order',
      'Debt-free date projection',
      'Extra payment calculator',
      'Month-by-month schedule with CSV export',
      'Mortgage payment and affordability calculators',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
