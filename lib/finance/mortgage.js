/**
 * Mortgage payment and monthly housing cost.
 * Fixed-rate loan; mortgage insurance is whatever the user enters (no hidden PMI).
 * The interest rate is a user-editable example, not a live market quote.
 */
import { isFiniteNumber } from './money';
import { requiredPayment } from './amortization';

export const EXCLUDED_HOUSING_COSTS = [
  'Closing costs',
  'Maintenance and repairs',
  'Utilities',
  'Future changes to taxes, insurance or HOA dues',
];

export function validateHomeScenario(s) {
  const errors = [];
  const add = (field, message) => errors.push({ field, message });
  if (!isFiniteNumber(s.homePrice) || s.homePrice <= 0) add('homePrice', 'Home price must be more than $0.');
  if (!isFiniteNumber(s.downPayment) || s.downPayment < 0) add('downPayment', 'Down payment must be $0 or more.');
  else if (isFiniteNumber(s.homePrice) && s.downPayment > s.homePrice) add('downPayment', "Down payment can't be more than the home price.");
  if (!isFiniteNumber(s.ratePercent) || s.ratePercent < 0 || s.ratePercent > 30) add('ratePercent', 'Interest rate must be between 0% and 30%.');
  if (!Number.isInteger(s.loanYears) || s.loanYears < 1 || s.loanYears > 50) add('loanYears', 'Loan term must be a whole number of years (1–50).');
  for (const field of ['annualPropertyTax', 'annualInsurance', 'monthlyMortgageInsurance', 'monthlyHoa']) {
    const v = s[field] ?? 0;
    if (!isFiniteNumber(v) || v < 0) add(field, 'Costs must be $0 or more.');
  }
  return errors;
}

/** Principal-and-interest payment for a fixed-rate loan (0% supported). */
export function mortgagePayment(principal, ratePercent, loanYears) {
  return requiredPayment(principal, ratePercent, loanYears * 12);
}

/**
 * @returns {{ok, errors, principal, principalAndInterest, monthlyPropertyTax, monthlyInsurance,
 *            monthlyMortgageInsurance, monthlyHoa, totalMonthly, totalLoanInterest, excluded}}
 */
export function housingCost(scenario) {
  const s = {
    annualPropertyTax: 0, annualInsurance: 0, monthlyMortgageInsurance: 0, monthlyHoa: 0,
    ...scenario,
  };
  const errors = validateHomeScenario(s);
  if (errors.length) return { ok: false, errors };

  const principal = s.homePrice - s.downPayment;
  const n = s.loanYears * 12;
  const principalAndInterest = principal > 0 ? mortgagePayment(principal, s.ratePercent, s.loanYears) : 0;
  const monthlyPropertyTax = s.annualPropertyTax / 12;
  const monthlyInsurance = s.annualInsurance / 12;
  const totalMonthly = principalAndInterest + monthlyPropertyTax + monthlyInsurance + s.monthlyMortgageInsurance + s.monthlyHoa;

  return {
    ok: true,
    errors: [],
    principal,
    principalAndInterest,
    monthlyPropertyTax,
    monthlyInsurance,
    monthlyMortgageInsurance: s.monthlyMortgageInsurance,
    monthlyHoa: s.monthlyHoa,
    totalMonthly,
    totalLoanInterest: principal > 0 ? principalAndInterest * n - principal : 0,
    excluded: EXCLUDED_HOUSING_COSTS,
  };
}
