import { useState } from 'react';
import { SLOT_OPTIONS, VALUE_MIN, VALUE_MAX } from '../lib/slots.js';
import { todayString } from '../lib/format.js';
import { Button, Field, Input, Select, Alert } from './ui.jsx';

// Client-side messages mirror the server's exact wording.
const MSG = {
  VALUE_REQUIRED: 'Please enter a glucose value.',
  VALUE_RANGE: `Value must be between ${VALUE_MIN} and ${VALUE_MAX} mg/dl.`,
  DATE_FUTURE: 'Date cannot be in the future.',
};

// Validate the raw form fields. Returns an error string or null.
export function validateForm({ value, date }) {
  if (value === '' || value === null || value === undefined) {
    return MSG.VALUE_REQUIRED;
  }
  const n = Number(value);
  if (!Number.isInteger(n) || n < VALUE_MIN || n > VALUE_MAX) {
    return MSG.VALUE_RANGE;
  }
  if (date && date > todayString()) {
    return MSG.DATE_FUTURE;
  }
  return null;
}

// A reusable add/edit form. `onSubmit(payload)` should return a promise that
// rejects with an Error whose message is shown to the user.
export default function ReadingForm({ initial, onSubmit, onCancel }) {
  const isEdit = Boolean(initial);
  const [date, setDate] = useState(initial?.date ?? todayString());
  const [slot, setSlot] = useState(initial?.slot ?? SLOT_OPTIONS[0].value);
  const [value, setValue] = useState(initial?.value?.toString() ?? '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const clientError = validateForm({ value, date });
    if (clientError) {
      setError(clientError);
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({ date, slot, value: Number(value) });
      if (!isEdit) setValue(''); // clear for the next entry
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Reading form">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Date" htmlFor="date">
          <Input
            id="date"
            type="date"
            max={todayString()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </Field>
        <Field label="Time slot" htmlFor="slot">
          <Select id="slot" value={slot} onChange={(e) => setSlot(e.target.value)}>
            {SLOT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Value (mg/dl)" htmlFor="value">
          <Input
            id="value"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="e.g. 120"
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/[^\d]/g, ''))}
          />
        </Field>
      </div>

      <Alert>{error}</Alert>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add reading'}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
