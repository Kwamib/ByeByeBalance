/**
 * Monthly balance points for the chart: index 0 = today (starting balance),
 * index n = balance after payment n. Series are padded with zeros so every
 * series shares one timeline (a paid-off series stays at $0).
 */
export function pointsFrom(result, startBalance) {
  if (!result || !result.ok) return null;
  return [startBalance, ...result.schedule.map(r => r.balance)];
}

export function padSeries(series) {
  const len = Math.max(2, ...series.map(s => s.points.length));
  return series.map(s => ({
    ...s,
    payoffIndex: s.points.length - 1,
    points: [...s.points, ...Array(len - s.points.length).fill(0)],
  }));
}
