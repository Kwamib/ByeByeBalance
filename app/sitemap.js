import { GUIDES } from '../lib/guides';

const PATHS = [
  ['', 1], ['/planner', 0.9], ['/budget', 0.8], ['/calculators', 0.7],
  ['/calculators/credit-card-payoff', 0.8], ['/calculators/extra-payment', 0.8],
  ['/calculators/snowball-vs-avalanche', 0.8], ['/calculators/debt-free-date', 0.8],
  ['/home-buying', 0.6], ['/mortgage', 0.7], ['/affordability', 0.7],
  ['/guides', 0.6], ...GUIDES.map(g => [`/guides/${g.slug}`, 0.6]),
  ['/about', 0.4], ['/privacy', 0.3], ['/contact', 0.3],
];

export default function sitemap() {
  const base = 'https://www.byebyebalance.com';
  return PATHS.map(([path, priority]) => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: 'monthly', priority }));
}
