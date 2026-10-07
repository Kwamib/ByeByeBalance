'use client';

import { useId, useMemo, useState } from 'react';
import { addMonths } from '../../lib/finance/dates';
import { padSeries } from '../../lib/chartSeries';
import { money, monthShort, tickLabel } from '../../lib/format';

const L = 76, R = 610, T = 34, B = 250, W = R - L, H = B - T;

function monthStart() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/**
 * Remaining-debt chart from the approved concept.
 * series: [{ label, color, dashed?, points: number[] }]  (points[0] = today)
 */
export default function BalanceChart({ series: raw, title = 'Remaining debt over time', subtitle = 'Estimated monthly balances', markerPrefix = 'Debt-free' }) {
  const id = useId();
  const series = useMemo(() => padSeries(raw.filter(s => s.points)), [raw]);
  const [m, setMonth] = useState(0);
  const [touched, setTouched] = useState(false);
  const setM = v => { setTouched(true); setMonth(v); };
  const start = useMemo(monthStart, []);
  if (!series.length) return null;

  const end = series[0].points.length - 1;
  const max = Math.max(1, ...series.flatMap(s => s.points));
  const x = i => L + (i / end) * W;
  const y = v => B - (v / max) * H;
  const line = p => p.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const month = Math.max(0, Math.min(end, m));
  const date = i => addMonths(start, i);

  const fromPointer = e => {
    const r = e.currentTarget.getBoundingClientRect();
    const i = Math.round(((((e.clientX - r.left) / r.width) * 640 - L) / W) * end);
    setM(Math.max(0, Math.min(end, i)));
  };

  // draw the main (first) series on top
  const drawOrder = [...series].reverse();

  return (
    <div className="balance-chart">
      <div className="chart-title"><strong>{title}</strong><span className="note">{subtitle}</span></div>
      <div className="chart-legend">
        {series.map(s => <span key={s.label}><i style={{ background: s.color }} />{s.label}</span>)}
      </div>
      <svg
        className="chart"
        viewBox="0 0 640 300"
        role="img"
        aria-label="Remaining debt in dollars over months. Use the slider below to inspect monthly balances."
        onPointerMove={fromPointer}
        onPointerDown={fromPointer}
      >
        {[0, 0.25, 0.5, 0.75, 1].map(f => (
          <g key={f}>
            <line x1={L} x2={R} y1={y(max * f)} y2={y(max * f)} stroke="#dce5e3" strokeDasharray="3 5" />
            <text x={L - 12} y={y(max * f) + 4} textAnchor="end" fill="#576577" fontSize="13">{money(max * f)}</text>
          </g>
        ))}
        {[0, 1, 2, 3, 4].map(k => {
          const i = Math.round((end * k) / 4);
          return <text key={k} x={x(i)} y="277" textAnchor="middle" fill="#576577" fontSize="13">{tickLabel(date(i))}</text>;
        })}
        <text x={L} y="18" fill="#576577" fontSize="12">Balance ($)</text>
        {drawOrder.map(s => (
          <polyline
            key={s.label}
            points={line(s.points)}
            fill="none"
            stroke={s.color}
            strokeWidth={s.dashed ? 3 : 4}
            strokeDasharray={s.dashed ? '7 5' : undefined}
            strokeLinejoin="round"
          />
        ))}
        {series.map(s => (
          <circle key={s.label} cx={x(s.payoffIndex)} cy={B} r="5" fill={s.color} stroke="white" strokeWidth="2" />
        ))}
        <line x1={x(month)} x2={x(month)} y1={T} y2={B} stroke="#10233d" strokeOpacity=".3" strokeDasharray="4 4" />
      </svg>
      <div className="chart-readout" aria-live="polite">
        <strong>{monthShort(date(month))}{touched ? ` · Month ${month}` : ''}</strong>
        {series.map(s => <span key={s.label}>{s.label}: <b>{money(s.points[month] ?? 0)}</b></span>)}
      </div>
      <label className="note" htmlFor={`${id}-month`}>Hover the graph, tap, or slide to explore a month</label>
      <input
        id={`${id}-month`}
        className="chart-slider"
        type="range"
        min="0"
        max={end}
        value={month}
        onChange={e => setM(Number(e.target.value))}
        aria-label="Explore monthly debt balances"
        aria-valuetext={`${monthShort(date(month))}: ${series.map(s => `${s.label} ${money(s.points[month] ?? 0)}`).join(', ')}`}
      />
      <div className="payoff-markers">
        {series.map(s => (
          <div key={s.label}><i style={{ background: s.color }} /><span>{s.label}<strong>{markerPrefix} {monthShort(date(s.payoffIndex))}</strong></span></div>
        ))}
      </div>
    </div>
  );
}
