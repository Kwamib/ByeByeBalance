import HomeCalc from '../_components/HomeCalc';

export const metadata = {
  title: 'Mortgage Payment Calculator with Taxes, Insurance and HOA',
  description: 'See the full monthly picture: principal and interest, property taxes, home insurance, mortgage insurance and HOA fees.',
  alternates: { canonical: '/mortgage' },
};

export default function Page() {
  return <HomeCalc />;
}
