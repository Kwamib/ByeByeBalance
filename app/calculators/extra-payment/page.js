import SingleDebtCalc from '../SingleDebtCalc';

export const metadata = {
  title: 'Extra Payment Calculator',
  description: 'See how much time and interest an extra monthly payment saves on a loan or credit card.',
  alternates: { canonical: '/calculators/extra-payment' },
};

export default function Page() {
  return <SingleDebtCalc kind="extra" />;
}
