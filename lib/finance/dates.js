/**
 * Month-safe date arithmetic.
 *
 * Adding months clamps to the last day of the target month, so Jan 31 + 1
 * month is Feb 28/29 (never Mar 2/3), and a schedule never skips a month.
 */

export function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function addMonths(date, months) {
  const base = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(base.getTime())) throw new Error('addMonths: invalid date');
  if (!Number.isInteger(months)) throw new Error('addMonths: months must be an integer');
  const totalMonth = base.getMonth() + months;
  const year = base.getFullYear() + Math.floor(totalMonth / 12);
  const month = ((totalMonth % 12) + 12) % 12;
  const day = Math.min(base.getDate(), daysInMonth(year, month));
  return new Date(year, month, day);
}

/** Calendar date of the Nth monthly payment, counting from a start date (payment 1 = start + 1 month). */
export function paymentDate(startDate, paymentNumber) {
  return addMonths(startDate, paymentNumber);
}
