/**
 * "Can I afford this home?" ratios.
 *
 * These are planning estimates, not an approval decision. Lenders also look at
 * credit, verified income, assets and the rules of the specific loan program.
 * The DTI target is editable and illustrative, not a universal cutoff.
 */
import { isFiniteNumber } from './money';

export const DEFAULT_DTI_TARGET = 0.36; // illustrative planning target, user-editable

export function affordability({
  grossMonthlyIncome,
  takeHomeMonthlyIncome,
  monthlyHousingCost,
  otherMonthlyDebtPayments = 0,
  otherMonthlyLivingExpenses = 0,
  dtiTarget = DEFAULT_DTI_TARGET,
}) {
  const errors = [];
  const add = (field, message) => errors.push({ field, message });
  if (!isFiniteNumber(grossMonthlyIncome) || grossMonthlyIncome <= 0) add('grossMonthlyIncome', 'Gross monthly income must be more than $0.');
  if (!isFiniteNumber(takeHomeMonthlyIncome) || takeHomeMonthlyIncome < 0) add('takeHomeMonthlyIncome', 'Take-home income must be $0 or more.');
  for (const [field, v] of Object.entries({ monthlyHousingCost, otherMonthlyDebtPayments, otherMonthlyLivingExpenses })) {
    if (!isFiniteNumber(v) || v < 0) add(field, 'Amounts must be $0 or more.');
  }
  if (!isFiniteNumber(dtiTarget) || dtiTarget <= 0 || dtiTarget >= 1) add('dtiTarget', 'Planning target must be between 0% and 100%.');
  if (errors.length) return { ok: false, errors };

  const housingRatio = monthlyHousingCost / grossMonthlyIncome;
  const totalDebtToIncome = (monthlyHousingCost + otherMonthlyDebtPayments) / grossMonthlyIncome;
  const remainingMonthlyCash = takeHomeMonthlyIncome - monthlyHousingCost - otherMonthlyDebtPayments - otherMonthlyLivingExpenses;

  return {
    ok: true,
    errors: [],
    housingRatio,
    totalDebtToIncome,
    remainingMonthlyCash,
    dtiTarget,
    withinPlanningTarget: totalDebtToIncome <= dtiTarget,
  };
}
