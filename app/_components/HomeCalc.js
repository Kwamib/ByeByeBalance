'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Field from './Field';
import { Metric, PageTitle, SectionIntro } from './Cards';
import { Arrow } from './Icons';
import { housingCost } from '../../lib/finance/mortgage';
import { affordability } from '../../lib/finance/affordability';
import { SAMPLE_HOME } from '../../lib/sampleData';
import { loadHome, saveHome } from '../../lib/storage';
import { money, toNumber } from '../../lib/format';

const HOME_FIELDS = [
  ['homePrice', 'Home price ($)', { min: 1 }],
  ['downPayment', 'Down payment ($)', {}],
  ['ratePercent', 'Interest rate (%)', { max: 30, step: '0.01' }],
  ['loanYears', 'Loan term (years)', { min: 1, max: 50, step: 1 }],
  ['annualPropertyTax', 'Annual property taxes ($)', {}],
  ['annualInsurance', 'Annual home insurance ($)', {}],
  ['monthlyHoa', 'Monthly HOA fees ($)', {}],
  ['monthlyMortgageInsurance', 'Monthly mortgage insurance ($)', {}],
];
const COLORS = ['#007d62', '#538cba', '#8cc5ad', '#c6a258', '#9cabc0'];
const toStrings = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, String(v)]));

const DEFAULTS = { ...toStrings(SAMPLE_HOME), income: '120000', debts: '700', takehome: '7500', living: '2500', target: '36' };

function compute(afford, f) {
  const n = Object.fromEntries(HOME_FIELDS.map(([k]) => [k, toNumber(f[k])]));
  const cost = housingCost(n);
  const errors = Object.fromEntries((cost.errors || []).map(e => [e.field, e.message]));
  let budget = null;
  if (afford) {
    const income = toNumber(f.income);
    const a = cost.ok ? affordability({
      grossMonthlyIncome: income / 12,
      takeHomeMonthlyIncome: toNumber(f.takehome),
      monthlyHousingCost: cost.totalMonthly,
      otherMonthlyDebtPayments: toNumber(f.debts),
      otherMonthlyLivingExpenses: toNumber(f.living),
      dtiTarget: toNumber(f.target) / 100,
    }) : null;
    if (!Number.isFinite(income) || income <= 0) errors.income = 'Enter an income above $0.';
    if (a && !a.ok) {
      const map = { grossMonthlyIncome: 'income', takeHomeMonthlyIncome: 'takehome', otherMonthlyDebtPayments: 'debts', otherMonthlyLivingExpenses: 'living', dtiTarget: 'target' };
      a.errors.forEach(e => { errors[map[e.field] || e.field] = e.message; });
    }
    if (a?.ok) budget = { ...a, allowance: Math.max(0, (income / 12) * a.dtiTarget - toNumber(f.debts)) };
  }
  return { n, cost, errors, budget };
}

export default function HomeCalc({ afford = false }) {
  const [f, setF] = useState(DEFAULTS);
  const [out, setOut] = useState(() => compute(afford, DEFAULTS));
  const set = k => v => setF(s => ({ ...s, [k]: v }));

  useEffect(() => {
    const saved = loadHome();
    if (saved) {
      const next = { ...DEFAULTS, ...toStrings(saved) };
      setF(next);
      setOut(compute(afford, next));
    }
  }, [afford]);

  const onSubmit = e => {
    e.preventDefault();
    const res = compute(afford, f);
    setOut(res);
    if (res.cost.ok) saveHome(res.n);
  };

  const { cost, errors, budget, n } = out;
  const rows = cost.ok ? [
    ['Principal & interest', cost.principalAndInterest],
    ['Property taxes', cost.monthlyPropertyTax],
    ['Home insurance', cost.monthlyInsurance],
    ['Mortgage insurance', cost.monthlyMortgageInsurance],
    ['HOA fees', cost.monthlyHoa],
  ] : [];

  return (
    <>
      <PageTitle
        title={afford ? 'Can this home fit your budget?' : 'See the full monthly picture.'}
        sub={afford ? 'Explore housing and debt-to-income ratios. This tool does not determine mortgage eligibility.' : 'The mortgage is one part of the cost. Include taxes, insurance and fees for a clearer estimate.'}
      />
        <div className="calc-grid wide">
          <form className="card calc-form" onSubmit={onSubmit} noValidate>
            <h2>Your home scenario</h2>
            <p>Enter the home you&rsquo;re considering and the costs that come with it.</p>
            <div className="fields">
              {HOME_FIELDS.map(([k, label, attrs]) => (
                <Field key={k} id={`m-${k}`} label={label} min={attrs.min ?? 0} max={attrs.max} step={attrs.step ?? '0.01'} value={f[k]} onChange={set(k)} error={errors[k]} />
              ))}
            </div>
            <p className="note">6.5% is an editable example, not a current rate quote. Enter a lender estimate for mortgage insurance, if applicable.</p>
            {afford && (
              <>
                <h2 style={{ marginTop: 28 }}>Your monthly budget</h2>
                <Field id="m-income" label="Gross annual household income ($)" min="1" step="0.01" value={f.income} onChange={set('income')} error={errors.income} />
                <Field id="m-debts" label="Other monthly debt payments ($)" min="0" step="0.01" value={f.debts} onChange={set('debts')} error={errors.debts} />
                <Field id="m-takehome" label="Monthly take-home income ($)" min="0" step="0.01" value={f.takehome} onChange={set('takehome')} error={errors.takehome} />
                <Field id="m-living" label="Other monthly living expenses ($)" min="0" step="0.01" value={f.living} onChange={set('living')} error={errors.living} />
                <p className="note">Other debts exclude the proposed mortgage. Living expenses exclude housing and debt payments.</p>
                <Field id="m-target" label="Your planning target for total DTI (%)" min="1" max="100" step="1" value={f.target} onChange={set('target')} error={errors.target} />
                <p className="note">36% is an adjustable planning example, not a universal lender requirement.</p>
              </>
            )}
            <button type="submit" className="block">{afford ? 'Explore my affordability' : 'Calculate monthly payment'} <Arrow /></button>
          </form>

            <div className="card mint" aria-live="polite">
              <div className="panel-title">
                <h2>{afford ? 'Your affordability snapshot' : 'Your monthly cost'}</h2>
                <span className="badge-outline">Estimate</span>
              </div>
              {cost.ok ? (
                <>
                  <p className="panel-sub" style={{ margin: '4px 0 0' }}>Estimated monthly housing cost</p>
                  <div className="mortgage-total">{money(cost.totalMonthly)}<span>/ month</span></div>
                  <p>{cost.principal === 0 ? 'Cash purchase · no loan' : `${money(cost.principal)} loan · ${n.loanYears} years · ${n.ratePercent}% interest`}</p>
                  <div className="costbar" role="img" aria-label="Monthly housing cost breakdown">
                    {rows.map(([label, v], i) => <i key={label} style={{ width: `${cost.totalMonthly ? (v / cost.totalMonthly) * 100 : 0}%`, background: COLORS[i] }} title={`${label}: ${money(v)}`} />)}
                  </div>
                  {rows.map(([label, v], i) => (
                    <div className="debtline" key={label}><span><i className="costdot" style={{ background: COLORS[i] }} />{label}</span><strong>{money(v)}</strong></div>
                  ))}
                  <div className="metrics" style={{ marginTop: 20 }}>
                    <Metric value={money(cost.principal)} label="Loan amount" />
                    <Metric value={money(cost.totalLoanInterest)} label="Lifetime loan interest" />
                  </div>
                  {afford && budget && (
                    <div className="budget-result">
                      <h3>Your budget</h3>
                      <div className="metrics">
                        <Metric value={`${(budget.housingRatio * 100).toFixed(1)}%`} label="Housing ÷ gross income" />
                        <Metric value={`${(budget.totalDebtToIncome * 100).toFixed(1)}%`} label="Total debt-to-income ratio" />
                        <Metric value={money(budget.remainingMonthlyCash)} label="Monthly cash left after entered costs" />
                        <Metric value={money(budget.allowance)} label="Housing allowance at your DTI target" />
                      </div>
                      <p>
                        <strong>{budget.withinPlanningTarget ? 'Within' : 'Above'} your {Math.round(budget.dtiTarget * 100)}% DTI planning target.</strong>{' '}
                        {budget.remainingMonthlyCash < 0 ? 'Entered monthly costs exceed your take-home income.' : 'Cash remaining must also cover any expenses, savings and reserves you have not entered.'}
                      </p>
                      <p className="note">This is not a qualification decision or preapproval. Different loan programs and lenders apply different criteria.</p>
                      <Link className="button block" href="/planner">Explore reducing my debt payments <Arrow /></Link>
                    </div>
                  )}
                  {afford && !budget && <div className="budget-result"><p className="error">Check the budget fields to see your affordability snapshot.</p></div>}
                </>
              ) : (
                <><h3>Check your home scenario</h3><p className="error">{Object.values(errors)[0]}</p></>
              )}
            </div>
        </div>
      <section style={{ paddingTop: 8 }}>
        <SectionIntro title={afford ? 'A budget check, not an approval' : 'What this estimate includes'}>
          <p>{afford ? 'Lenders also review credit history, verified income, assets, loan type and other factors. A debt-to-income comparison alone cannot tell you whether you qualify.' : 'A fixed-rate, fully amortizing loan with monthly payments. Taxes, insurance and fees use the amounts you enter.'} Closing costs, maintenance, repairs, utilities, rate changes and future tax or insurance increases are not part of this estimate. <a href="https://www.consumerfinance.gov/owning-a-home/" target="_blank" rel="noopener noreferrer">CFPB home-buying resources</a></p>
        </SectionIntro>
        <div className="row" style={{ marginTop: 18 }}>
          <Link className="button secondary" href={afford ? '/mortgage' : '/affordability'}>{afford ? 'Explore mortgage payments' : 'Check affordability with this home'}</Link>
          <Link href="/planner">Review my debt plan</Link>
        </div>
      </section>
    </>
  );
}
