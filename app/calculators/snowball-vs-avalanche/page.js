import Planner from '../../_components/Planner';

export const metadata = {
  title: 'Snowball vs. Avalanche Calculator',
  description: 'Compare the debt snowball and debt avalanche methods with your own debts: timeline, interest and a monthly schedule.',
  alternates: { canonical: '/calculators/snowball-vs-avalanche' },
};

export default function Page() {
  return <Planner compare />;
}
