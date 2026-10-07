import SingleDebtCalc from '../SingleDebtCalc';

export const metadata = {
  title: 'Credit Card Payoff Calculator',
  description: 'How long will it take to pay off your credit card? See your payoff month and total interest, and what an extra payment changes.',
  alternates: { canonical: '/calculators/credit-card-payoff' },
};

export default function Page() {
  return <SingleDebtCalc kind="credit" />;
}
