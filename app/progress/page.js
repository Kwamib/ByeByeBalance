import ProgressApp from './ProgressApp';

export const metadata = {
  title: 'My Progress',
  description: 'Record your debt balances each month and see your progress.',
  alternates: { canonical: '/progress' },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <ProgressApp />;
}
