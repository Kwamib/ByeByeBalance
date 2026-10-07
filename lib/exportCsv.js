import { roundCents, displayBalance } from './finance/money';

const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const cell = v => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const c = x => roundCents(x).toFixed(2);
const bal = x => displayBalance(x).toFixed(2);

/**
 * Monthly schedule CSV. Amounts are rounded to cents per cell (round half
 * away from zero); totals are computed from unrounded values, so a column
 * sum can differ from the total by a few cents.
 */
export function scheduleCsv(result, debts) {
  const header = ['Month', 'Payment date', 'Total payment', 'Interest', 'Principal', 'Remaining balance',
    ...debts.flatMap(d => [`${d.name} payment`, `${d.name} balance`])];
  const lines = [header.map(cell).join(',')];
  for (const r of result.schedule) {
    lines.push([
      r.month, r.date ? iso(r.date) : '', c(r.payment), c(r.interest), (roundCents(r.payment) - roundCents(r.interest)).toFixed(2), bal(r.balance),
      ...debts.flatMap(d => [c(r.payments[d.id] || 0), bal(r.balances[d.id] ?? 0)]),
    ].map(cell).join(','));
  }
  lines.push('');
  lines.push(['Total interest', c(result.totalInterest)].map(cell).join(','));
  lines.push(['Total paid', c(result.totalPaid)].map(cell).join(','));
  lines.push(cell('Estimates assume fixed APR, monthly interest (APR/12), monthly payments, no fees and no new charges.'));
  return lines.join('\n');
}

export function downloadText(filename, text, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
