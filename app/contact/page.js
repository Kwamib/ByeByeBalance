import ContactWrapper from './ContactWrapper';

export const metadata = {
  title: 'Contact',
  description:
    'Get in touch with ByeByeBalance. Submit feature requests, report bugs, or reach out with questions.',
  alternates: {
    canonical: 'https://www.byebyebalance.com/contact',
  },
};

export default function ContactPage() {
  return <ContactWrapper />;
}
