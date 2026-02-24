import dynamic from 'next/dynamic';

export const metadata = {
  title: 'Privacy Policy',
  description:
    "ByeByeBalance privacy policy. Your financial data stays in your browser. We don't collect, store, or see your information.",
  alternates: {
    canonical: 'https://www.byebyebalance.com/privacy',
  },
};

// Must use a client wrapper component for dynamic with ssr:false
import PrivacyWrapper from './PrivacyWrapper';

export default function PrivacyPage() {
  return <PrivacyWrapper />;
}
