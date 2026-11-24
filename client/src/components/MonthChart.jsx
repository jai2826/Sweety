import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
} from 'recharts';
import { formatDate } from '../lib/format.js';

// Collapse the month-to-date readings into one point per day (the day's average),
// so the line reads as a clean trend over time.
function toDailySeries(readings) {
  const byDay = new Map();
  for (const r of readings) {
    const bucket = byDay.get(r.date) ?? { sum: 0, count: 0 };
    bucket.sum += r.value;
    bucket.count += 1;
    byDay.set(r.date, bucket);
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { sum, count }]) => ({
      date,
      label: formatDate(date).replace(/ \d{4}$/, ''), // "15 Oct"
      average: Math.round((sum / count) * 10) / 10,
    }));
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow">
      <div className="font-medium text-slate-700">{formatDate(point.date)}</div>
      <div className="text-slate-500">Avg {point.average} mg/dl</div>
    </div>
  );
}

export default function MonthChart({ readings }) {
  const series = toDailySeries(readings);

  if (series.length < 2) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        Add readings on at least two days this month to see a trend.
      </p>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
          {/* Typical in-range band (70–180 mg/dl) for context. */}
          <ReferenceArea y1={70} y2={180} fill="#16a34a" fillOpacity={0.06} />
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickLine={false}
            axisLine={{ stroke: '#cbd5e1' }}
            minTickGap={16}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickLine={false}
            axisLine={false}
            width={44}
            domain={['dataMin - 20', 'dataMax + 20']}
          />
          <Tooltip content={<ChartTooltip />} />
          <Line
            type="monotone"
            dataKey="average"
            stroke="#2f66b5"
            strokeWidth={2}
            dot={{ r: 3, fill: '#2f66b5' }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
