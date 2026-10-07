import Planner from '../_components/Planner';

export const metadata = {
  title: 'Debt Payoff Planner: Snowball or Avalanche',
  description: 'A free plan for all your debts. Compare snowball and avalanche, see your payoff month and export a monthly schedule. No sign-up; data stays in your browser.',
  alternates: { canonical: '/planner' },
};

export default function Page() {
  return <Planner />;
}
