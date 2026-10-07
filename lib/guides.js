/** Guide content from the approved concept, with wording updated for the live site. */
export const GUIDES = [
  {
    slug: 'snowball-vs-avalanche',
    title: 'Snowball vs. avalanche',
    intro: 'Compare two popular strategies for paying off debt and find out which might fit your situation best.',
    art: '⇄',
    practice: '/calculators/snowball-vs-avalanche',
    parts: [
      ['How each method works', 'The snowball method puts extra payments toward the smallest balance first. The avalanche method prioritizes the highest interest rate. Both keep minimum payments on your other debts.'],
      ['Compare the tradeoff', 'With the same fixed budget and assumptions, prioritizing higher rates generally reduces interest. Paying off a small debt sooner may make progress easier to notice. Your motivation matters alongside the numbers.'],
      ['Try both with your balances', 'Use the planner to compare estimated interest and payoff dates. It carries freed monthly payments forward to your remaining debts. The model assumes fixed rates and no new borrowing.'],
    ],
  },
  {
    slug: 'extra-payments',
    title: 'Making extra payments',
    intro: 'Learn how extra payments work, where they go, and simple ways to make them part of your plan.',
    art: '+',
    practice: '/calculators/extra-payment',
    parts: [
      ['Start with an amount you can sustain', 'Keep essential expenses and required minimum payments in your budget. Enter an extra amount into the calculator to compare scenarios before making a commitment.'],
      ['Check how your lender applies payments', 'Payment allocation, accrued interest, fees and prepayment terms can affect the outcome. Ask your lender how an additional payment is applied and whether you need to provide instructions.'],
      ['Compare a few scenarios', 'Try an extra $25, $50 or $100. The calculator assumes a consistent monthly payment, fixed APR and no fees or new charges; it does not reproduce every lender’s daily-interest calculation.'],
    ],
  },
  {
    slug: 'debt-free-date',
    title: 'Planning your debt-free date',
    intro: 'Get practical tips to set a realistic timeline, stay motivated, and adjust your plan as life changes.',
    art: '◷',
    practice: '/calculators/debt-free-date',
    parts: [
      ['Pick a date you can actually reach', 'Start from what you can pay every month after essentials, not from the date you wish for. The debt-free date calculator shows the payment a target needs; if it is more than your budget allows, move the date out rather than stretching yourself thin.'],
      ['Stay motivated along the way', 'Check in once a month with your latest statements. Watching the total come down, or paying off a small debt first, can make a long plan feel shorter.'],
      ['Adjust as life changes', 'A raise, a new expense or a rate change will move your date. Update your balances and payment, and treat the new date as your plan rather than a failure. Estimates assume fixed rates, monthly interest and no new charges.'],
    ],
  },
];

export const getGuide = slug => GUIDES.find(g => g.slug === slug);
