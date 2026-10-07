/**
 * Editable plan state keeps what people type (strings); this turns it into
 * numbers for the engine and collects field errors.
 */
import { toNumber } from './format';

export function toDraft(plan) {
  return {
    debts: plan.debts.map(d => ({ id: String(d.id), name: d.name, balance: String(d.balance), rate: String(d.rate), minPayment: String(d.minPayment) })),
    extraPayment: String(plan.extraPayment ?? 0),
    strategy: plan.strategy || 'avalanche',
    customOrder: (plan.customOrder && plan.customOrder.length ? plan.customOrder : plan.debts.map(d => d.id)).map(String),
  };
}

export function parseDraft(draft) {
  const errors = {};
  const debts = draft.debts.map((d, i) => {
    const balance = toNumber(d.balance);
    const rate = toNumber(d.rate);
    const minPayment = toNumber(d.minPayment);
    const e = {};
    if (!Number.isFinite(balance) || balance < 0) e.balance = 'Enter a balance of $0 or more.';
    if (!Number.isFinite(rate) || rate < 0 || rate > 100) e.rate = 'Enter an APR from 0 to 100.';
    if (!Number.isFinite(minPayment) || minPayment < 0) e.minPayment = 'Enter a payment of $0 or more.';
    if (Object.keys(e).length) errors[d.id] = e;
    return { id: d.id, name: d.name.trim() || `Debt ${i + 1}`, balance, rate, minPayment };
  });
  const extraPayment = draft.extraPayment.trim() === '' ? 0 : toNumber(draft.extraPayment);
  if (!Number.isFinite(extraPayment) || extraPayment < 0) errors.extraPayment = 'Enter an amount of $0 or more.';
  return {
    ok: Object.keys(errors).length === 0,
    errors,
    plan: { debts, extraPayment, strategy: draft.strategy, customOrder: draft.customOrder },
  };
}

let counter = 0;
export function newDebtId() {
  counter += 1;
  return `debt-${Date.now().toString(36)}-${counter}`;
}
