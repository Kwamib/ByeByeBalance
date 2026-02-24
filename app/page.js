import CalculatorWrapper from './CalculatorWrapper';
import JsonLd from './JsonLd';

export default function Home() {
  return (
    <>
      <JsonLd />
      {/* SEO-friendly static content that Google can always read */}
      <noscript>
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
          <h1>ByeByeBalance – Free Debt Payoff Calculator</h1>
          <p>
            ByeByeBalance is a free debt payoff calculator that helps you compare
            the Snowball and Avalanche debt repayment strategies. See your
            debt-free date, calculate total interest paid, and create a
            personalized payoff plan.
          </p>
          <h2>Features</h2>
          <ul>
            <li>Compare Debt Snowball vs Debt Avalanche strategies</li>
            <li>Calculate your exact debt-free date</li>
            <li>See how extra payments accelerate your payoff</li>
            <li>Export your plan as CSV or print it</li>
            <li>100% private – all data stays in your browser</li>
            <li>Completely free – no sign-up required</li>
          </ul>
          <p>Please enable JavaScript to use the interactive calculator.</p>
        </div>
      </noscript>
      <CalculatorWrapper />
    </>
  );
}
