/**
 * ByeByeBalance — Payoff Calculation Engine
 * 
 * Pure functions for debt payoff calculations.
 * No React dependencies — can be used anywhere.
 */

const MAX_MONTHS = 360;

/**
 * Validate debts for underwater conditions (min payment < monthly interest)
 */
export function validateDebts(debtList) {
  const warnings = [];
  for (const d of debtList) {
    if (d.balance <= 0 || d.rate <= 0 || d.minPayment <= 0) continue;
    const monthlyRate = d.rate / 100 / 12;
    const monthlyInterest = d.balance * monthlyRate;
    if (d.minPayment <= monthlyInterest) {
      warnings.push({
        debtId: d.id,
        debtName: d.name || 'Unnamed Debt',
        message: `Minimum payment ($${d.minPayment}) doesn't cover monthly interest ($${Math.round(monthlyInterest)}). This debt will grow forever.`,
        monthlyInterest: Math.round(monthlyInterest),
        requiredMin: Math.ceil(monthlyInterest * 1.01),
      });
    }
  }
  return warnings;
}

/**
 * Build a warning lookup map keyed by debt ID
 */
export function buildWarningMap(warnings) {
  const map = {};
  for (const w of warnings) map[w.debtId] = w;
  return map;
}

/**
 * Run a payoff simulation for a given strategy and extra payment amount.
 * Returns totalMonths, totalInterest, workingDebts (with payoff details), and chartData.
 */
export function calculateStrategy(validDebts, strategyType, extraPmt) {
  // Ensure min payments cover at least interest * 1.1
  const validatedDebts = validDebts.map(d => {
    const monthlyInterestRate = d.rate / 100 / 12;
    const minInterestPayment = d.balance * monthlyInterestRate;
    return { ...d, minPayment: Math.max(d.minPayment, minInterestPayment * 1.1) };
  });

  let workingDebts = validatedDebts.map(d => ({
    ...d,
    originalBalance: d.balance,
    currentBalance: d.balance,
    individualInterest: 0,
    monthPaidOff: null,
  }));

  const chartData = [];
  let month = 0;
  let totalInterestPaid = 0;
  const totalOriginal = workingDebts.reduce((s, d) => s + d.originalBalance, 0);
  const balanceCap = totalOriginal * 10;

  while (workingDebts.some(d => d.currentBalance > 0) && month < MAX_MONTHS) {
    month++;

    // Safety: stop if balance has grown to 10x original (underwater)
    const currentTotal = workingDebts.reduce((s, d) => s + d.currentBalance, 0);
    if (currentTotal > balanceCap) break;

    // Apply minimum payments
    workingDebts.forEach(debt => {
      if (debt.currentBalance > 0) {
        const monthlyInterest = debt.currentBalance * (debt.rate / 100 / 12);
        const minPayment = Math.min(debt.minPayment, debt.currentBalance + monthlyInterest);
        const principalFromMin = Math.max(0, minPayment - monthlyInterest);
        debt.currentBalance = Math.max(0, debt.currentBalance - principalFromMin);
        debt.individualInterest += monthlyInterest;
        totalInterestPaid += monthlyInterest;
      }
    });

    // Apply extra payment to target debt
    if (extraPmt > 0) {
      let targetDebt = null;
      const activeDebts = workingDebts.filter(d => d.currentBalance > 0);
      if (activeDebts.length > 0) {
        if (strategyType === 'snowball') {
          targetDebt = activeDebts.reduce((min, d) => d.currentBalance < min.currentBalance ? d : min);
        } else if (strategyType === 'avalanche') {
          targetDebt = activeDebts.reduce((max, d) => d.rate > max.rate ? d : max);
        }
        if (targetDebt) {
          const extraApplied = Math.min(extraPmt, targetDebt.currentBalance);
          targetDebt.currentBalance -= extraApplied;
        }
      }
    }

    // Mark debts as paid off
    workingDebts.forEach(debt => {
      if (debt.currentBalance === 0 && !debt.monthPaidOff) debt.monthPaidOff = month;
    });

    // Sample chart data
    const monthData = { month: `M${month}` };
    workingDebts.forEach(debt => { monthData[debt.name] = Math.round(debt.currentBalance); });
    if (month === 1 || month % Math.ceil(month / 20) === 0 || workingDebts.every(d => d.currentBalance === 0)) {
      chartData.push(monthData);
    }
  }

  return { totalMonths: month, totalInterest: totalInterestPaid, workingDebts, chartData };
}

/**
 * Run full calculation: current strategy, both comparisons, and minimum-only baseline.
 * Returns { results, comparison } ready for UI consumption.
 */
export function runFullCalculation(debts, strategy, extraPayment) {
  const validDebts = debts.filter(d => d.balance > 0 && d.minPayment > 0);
  if (validDebts.length === 0) return null;

  const currentResults = calculateStrategy(validDebts, strategy, extraPayment);
  const snowballResults = calculateStrategy(validDebts, 'snowball', extraPayment);
  const avalancheResults = calculateStrategy(validDebts, 'avalanche', extraPayment);
  const minOnlyResults = calculateStrategy(validDebts, 'snowball', 0);

  let displayOrder = [...currentResults.workingDebts];
  if (strategy === 'snowball') displayOrder.sort((a, b) => (a.monthPaidOff || 999) - (b.monthPaidOff || 999));
  else if (strategy === 'avalanche') displayOrder.sort((a, b) => b.rate - a.rate);

  const results = {
    totalMonths: currentResults.totalMonths,
    totalInterest: currentResults.totalInterest,
    debtFreeDate: new Date(Date.now() + (currentResults.totalMonths * 30 * 24 * 60 * 60 * 1000)),
    chartData: currentResults.chartData,
    monthlyPayment: validDebts.reduce((sum, d) => sum + (d.minPayment || 0), 0) + (extraPayment || 0),
    totalPaid: validDebts.reduce((sum, d) => sum + d.balance, 0) + currentResults.totalInterest,
    schedule: displayOrder.map((debt, i) => ({
      order: i + 1,
      name: debt.name,
      originalBalance: debt.originalBalance,
      rate: debt.rate,
      paidOffMonth: debt.monthPaidOff || currentResults.totalMonths,
      interestPaid: Math.round(debt.individualInterest),
    })),
    minimumOnlyMonths: minOnlyResults.totalMonths,
    minimumOnlyInterest: minOnlyResults.totalInterest,
    interestSaved: minOnlyResults.totalInterest - currentResults.totalInterest,
    monthsSaved: minOnlyResults.totalMonths - currentResults.totalMonths,
    strategy,
  };

  const comparison = {
    snowball: { months: snowballResults.totalMonths, interest: snowballResults.totalInterest },
    avalanche: { months: avalancheResults.totalMonths, interest: avalancheResults.totalInterest },
    difference: {
      months: snowballResults.totalMonths - avalancheResults.totalMonths,
      interest: snowballResults.totalInterest - avalancheResults.totalInterest,
    },
  };

  return { results, comparison };
}
