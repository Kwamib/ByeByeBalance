import SingleDebtCalc from '../SingleDebtCalc';

export const metadata = {
  title: 'Debt-Free Date Calculator',
  description: 'Choose your debt-free timeline and see the monthly payment it takes.',
  alternates: { canonical: '/calculators/debt-free-date' },
};

export default function Page() {
  return <SingleDebtCalc kind="date" />;
}
