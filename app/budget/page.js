import BudgetApp from './BudgetApp';

export const metadata = {
  title: 'Monthly Budget: See What’s Left for Paying Down Debt',
  description: 'A free monthly budget that pulls in your debt minimums and shows what you can put toward debt. No sign-up; your numbers stay in your browser.',
  alternates: { canonical: '/budget' },
};

export default function Page() {
  return <BudgetApp />;
}
