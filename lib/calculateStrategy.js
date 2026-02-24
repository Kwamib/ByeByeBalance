/**
 * Core debt payoff calculation engine.
 * Extracted from Calculator.js for testability.
 */

export function calculateStrategy(validDebts, strategyType, extraPmt) {
  // Validate and ensure minimum payments cover interest
  const validatedDebts = validDebts.map(d => {
    const monthlyInterestRate = d.rate / 100 / 12;
    const minInterestPayment = d.balance * monthlyInterestRate;
    return {
      ...d,
      minPayment: Math.max(d.minPayment, minInterestPayment * 1.1)
    };
  });

  let workingDebts = validatedDebts.map(d => ({
    ...d,
    originalBalance: d.balance,
    currentBalance: d.balance,
    individualInterest: 0,
    monthPaidOff: null
  }));

  const chartData = [];
  let month = 0;
  let totalInterestPaid = 0;
  const MAX_MONTHS = 360;

  while (workingDebts.some(d => d.currentBalance > 0) && month < MAX_MONTHS) {
    month++;

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

    if (extraPmt > 0) {
      let targetDebt = null;
      const activeDebts = workingDebts.filter(d => d.currentBalance > 0);

      if (activeDebts.length > 0) {
        if (strategyType === 'snowball') {
          targetDebt = activeDebts.reduce((min, d) =>
            d.currentBalance < min.currentBalance ? d : min
          );
        } else if (strategyType === 'avalanche') {
          targetDebt = activeDebts.reduce((max, d) =>
            d.rate > max.rate ? d : max
          );
        }

        if (targetDebt) {
          const extraApplied = Math.min(extraPmt, targetDebt.currentBalance);
          targetDebt.currentBalance -= extraApplied;
        }
      }
    }

    workingDebts.forEach(debt => {
      if (debt.currentBalance === 0 && !debt.monthPaidOff) {
        debt.monthPaidOff = month;
      }
    });

    const monthData = { month: `M${month}` };
    workingDebts.forEach(debt => {
      monthData[debt.name] = Math.round(debt.currentBalance);
    });

    if (month === 1 || month % Math.ceil(month / 20) === 0 || workingDebts.every(d => d.currentBalance === 0)) {
      chartData.push(monthData);
    }
  }

  return {
    totalMonths: month,
    totalInterest: totalInterestPaid,
    workingDebts: workingDebts,
    chartData: chartData
  };
}
