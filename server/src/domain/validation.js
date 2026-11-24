import { isValidSlot, slotLabel, VALUE_MIN, VALUE_MAX } from './slots.js';
import { parseDateOnly, isFuture } from './dates.js';

// Exact, user-facing error messages required by the assignment.
export const MESSAGES = {
  VALUE_REQUIRED: 'Please enter a glucose value.',
  VALUE_RANGE: `Value must be between ${VALUE_MIN} and ${VALUE_MAX} mg/dl.`,
  DATE_FUTURE: 'Date cannot be in the future.',
  DATE_INVALID: 'Please provide a valid date (YYYY-MM-DD).',
  SLOT_INVALID: 'Please choose a valid time slot.',
  MAX_PER_DAY: 'You can add only 4 readings per day.',
  slotTaken: (slot) => `You already have a ${slotLabel(slot)} reading for this date.`,
};

// Validate the raw request body for creating/updating a reading.
// Returns { ok: true, data } or { ok: false, message }.
// `now` is injectable for deterministic tests.
export function validateReadingInput(body, now = new Date()) {
  const raw = body ?? {};

  // --- value ---
  // Required check first: missing, null, or empty string.
  if (raw.value === undefined || raw.value === null || raw.value === '') {
    return { ok: false, message: MESSAGES.VALUE_REQUIRED };
  }
  const value = Number(raw.value);
  if (!Number.isInteger(value) || value < VALUE_MIN || value > VALUE_MAX) {
    return { ok: false, message: MESSAGES.VALUE_RANGE };
  }

  // --- slot ---
  if (!isValidSlot(raw.slot)) {
    return { ok: false, message: MESSAGES.SLOT_INVALID };
  }

  // --- date ---
  const date = parseDateOnly(raw.date);
  if (!date) {
    return { ok: false, message: MESSAGES.DATE_INVALID };
  }
  if (isFuture(date, now)) {
    return { ok: false, message: MESSAGES.DATE_FUTURE };
  }

  return { ok: true, data: { value, slot: raw.slot, date } };
}
