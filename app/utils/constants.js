/**
 * ByeByeBalance — Constants
 * 
 * Default values, configuration, and static data.
 */

export const DEFAULT_DEBTS = [
  { id: 1, name: 'Credit Card', balance: 8000, rate: 22.99, minPayment: 240 },
  { id: 2, name: 'Car Loan', balance: 3000, rate: 4.5, minPayment: 300 },
  { id: 3, name: 'Personal Loan', balance: 5000, rate: 12.99, minPayment: 150 },
  { id: 4, name: 'Student Loan', balance: 15000, rate: 6.5, minPayment: 165 },
];

export const DEFAULT_EXTRA_PAYMENT = 200;
export const DEFAULT_STRATEGY = 'snowball';

export const STRATEGIES = [
  {
    id: 'snowball',
    label: 'Snowball',
    desc: 'Lowest balance first (psychological wins)',
    tip: '💡 Smallest balance first — quick wins keep you motivated.',
  },
  {
    id: 'avalanche',
    label: 'Avalanche',
    desc: 'Highest rate first (saves most money)',
    tip: '💡 Highest interest first — saves the most money.',
  },
];

export const EXTRA_PAYMENT_PRESETS = [50, 100, 200, 500];

export const STORAGE_KEY = 'byebyebalance-data';
