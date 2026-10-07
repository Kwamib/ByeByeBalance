import HomeCalc from '../_components/HomeCalc';

export const metadata = {
  title: 'Home Affordability Calculator: Can This Home Fit Your Budget?',
  description: 'Explore housing and debt-to-income ratios and the cash left each month. A budget check, not a lender approval.',
  alternates: { canonical: '/affordability' },
};

export default function Page() {
  return <HomeCalc afford />;
}
