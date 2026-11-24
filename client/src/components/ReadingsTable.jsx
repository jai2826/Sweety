import { formatDate } from '../lib/format.js';
import { Button } from './ui.jsx';

export default function ReadingsTable({ readings, onEdit, onDelete }) {
  if (!readings.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        No readings yet. Add your first one above.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="py-2 pr-4 font-medium">Date</th>
            <th className="py-2 pr-4 font-medium">Slot</th>
            <th className="py-2 pr-4 font-medium">Value (mg/dl)</th>
            <th className="py-2 pr-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {readings.map((r) => (
            <tr key={r.id} className="border-b border-slate-100 last:border-0">
              <td className="py-2 pr-4 whitespace-nowrap">{formatDate(r.date)}</td>
              <td className="py-2 pr-4">{r.slotLabel}</td>
              <td className="py-2 pr-4 font-medium">{r.value}</td>
              <td className="py-2 pr-4">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" onClick={() => onEdit(r)} aria-label={`Edit ${r.slotLabel} on ${formatDate(r.date)}`}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => onDelete(r)}
                    aria-label={`Delete ${r.slotLabel} on ${formatDate(r.date)}`}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
