/** Fictional example debts (from the approved concept), shown until a person saves their own plan. */
export const SAMPLE_DEBTS = [
  { id: 'sample-1', name: 'Credit card', balance: 10000, rate: 18, minPayment: 300 },
  { id: 'sample-2', name: 'Car loan', balance: 8500, rate: 6.5, minPayment: 260 },
  { id: 'sample-3', name: 'Personal loan', balance: 3200, rate: 11, minPayment: 150 },
];

export const SAMPLE_PLAN = {
  debts: SAMPLE_DEBTS,
  extraPayment: 100,
  strategy: 'avalanche',
  customOrder: SAMPLE_DEBTS.map(d => d.id),
};

export const SAMPLE_HOME = {
  homePrice: 400000,
  downPayment: 80000,
  ratePercent: 6.5, // editable example, not a live quote
  loanYears: 30,
  annualPropertyTax: 4800,
  annualInsurance: 1800,
  monthlyHoa: 75,
  monthlyMortgageInsurance: 0,
};

/** Debts the previous version of the site pre-filled (and auto-saved). */
export const LEGACY_DEFAULT_DEBTS = [
  { name: 'Credit Card', balance: 8000, rate: 22.99, minPayment: 240 },
  { name: 'Car Loan', balance: 3000, rate: 4.5, minPayment: 300 },
  { name: 'Personal Loan', balance: 5000, rate: 12.99, minPayment: 150 },
  { name: 'Student Loan', balance: 15000, rate: 6.5, minPayment: 165 },
];
