import { formatRange } from '../lib/format.js';
import MonthChart from './MonthChart.jsx';

function Stat({ label, value, unit }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2 text-center">
      <div className="text-lg font-semibold text-slate-800">
        {value ?? '—'}
        {value != null && unit ? <span className="ml-0.5 text-xs font-normal text-slate-400">{unit}</span> : null}
      </div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

// One report block: title, date range, and the four stats (or an empty state).
function ReportBlock({ title, report }) {
  const { summary, range } = report;
  const empty = summary.count === 0;

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-semibold text-slate-800">{title}</h3>
        <span className="text-xs text-slate-400">{formatRange(range)}</span>
      </div>
      {empty ? (
        <p className="py-4 text-center text-sm text-slate-400">No readings in this period.</p>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          <Stat label="Highest" value={summary.highest} unit="mg/dl" />
          <Stat label="Lowest" value={summary.lowest} unit="mg/dl" />
          <Stat label="Average" value={summary.average} unit="mg/dl" />
          <Stat label="Readings" value={summary.count} />
        </div>
      )}
    </div>
  );
}

export default function ReportsPanel({ report }) {
  if (!report) return null;

  const { daily, monthToDate, monthly } = report;

  return (
    <div className="space-y-4">
      <ReportBlock title="Daily" report={daily} />

      {/* The daily report also lists each reading with its slot. */}
      {daily.readings.length > 0 && (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 text-sm">
          {daily.readings.map((r) => (
            <li key={r.id} className="flex items-center justify-between px-4 py-2">
              <span className="text-slate-600">{r.slotLabel}</span>
              <span className="font-medium text-slate-800">{r.value} mg/dl</span>
            </li>
          ))}
        </ul>
      )}

      <ReportBlock title="Month-to-date" report={monthToDate} />

      <div className="rounded-xl border border-slate-200 p-4">
        <h3 className="mb-3 font-semibold text-slate-800">Month-to-date trend</h3>
        <MonthChart readings={monthToDate.readings} />
      </div>

      <ReportBlock title="Monthly (previous month)" report={monthly} />
    </div>
  );
}
