import React from "react";

export function Sparkline({ values, label = "趋势图" }) {
  const highest = Math.max(...values, 1);
  const width = 240;
  const height = 72;
  const points = values.map((value, index) => {
    const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
    const y = height - (value / highest) * (height - 12) - 6;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      <defs>
        <linearGradient id="sparkline-fill" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ff4b1b" />
          <stop offset="1" stopColor="#f8b84d" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke="url(#sparkline-fill)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BarChart({ values, label = "柱状图" }) {
  const highest = Math.max(...values, 1);
  return (
    <div className="bar-chart" role="img" aria-label={label}>
      {values.map((value, index) => (
        <span key={`${index}-${value}`} style={{ height: `${Math.max((value / highest) * 100, 8)}%` }} />
      ))}
    </div>
  );
}
