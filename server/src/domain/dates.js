// Date helpers. We treat a reading's `date` as a calendar day in UTC so that
// the same day is stored and compared consistently regardless of server TZ.

// Parse a "YYYY-MM-DD" string into a UTC Date at midnight. Returns null if invalid.
export function parseDateOnly(input) {
  if (typeof input !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.trim());
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  // Guard against overflow like 2026-02-31 rolling into March.
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return null;
  }
  return date;
}

// Format a Date as "YYYY-MM-DD" using its UTC components.
export function toDateOnlyString(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Today's calendar day in UTC, at midnight.
export function todayUTC(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function isFuture(date, now = new Date()) {
  return date.getTime() > todayUTC(now).getTime();
}

// First day of the month containing `date`.
export function startOfMonth(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

// Last day of the month containing `date`.
export function endOfMonth(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
}

// First day of the month before the one containing `date`.
export function startOfPreviousMonth(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1));
}

// Last day of the month before the one containing `date`.
export function endOfPreviousMonth(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 0));
}
