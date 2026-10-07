# ByeByeBalance

Free, open-source debt payoff planner: [byebyebalance.com](https://www.byebyebalance.com). No sign-up; every calculation runs in the browser and saved plans stay in local storage.

## Features
- **Debt planner** (`/planner`): avalanche or snowball, freed payments roll to the next debt, payoff month, strategy comparison, monthly schedule, CSV export and print.
- **Calculators**: extra payment, credit card payoff, snowball vs. avalanche, debt-free date.
- **Home buying**: mortgage payment with taxes, insurance, mortgage insurance and HOA (`/mortgage`); affordability ratios with no approval claims (`/affordability`; `/qualify` redirects here).
- **My progress**: monthly balance check-ins and history, stored on the device.
- **Guides**: snowball vs. avalanche, extra payments, a monthly payoff habit.

## Calculations
All finance logic lives in `lib/finance/` (pure functions, no React):
- `debtPlan.js`: fixed monthly budget (minimums + extra). Each month interest accrues (APR/12), minimums are paid (capped at what's owed), and the rest goes to debts in strategy order, cascading when a debt is cleared. No payment is ever raised or invented; impossible plans return an error.
- `amortization.js`, `mortgage.js`, `affordability.js`, `dates.js` (month-safe), `money.js` (rounding model).

Tests in `__tests__/` use independently computed reference values.

## Develop
```bash
npm install
npm run dev     # http://localhost:3000
npm test
npm run build
```

Next.js App Router, deployed on Vercel.
