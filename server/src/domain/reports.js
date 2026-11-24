// Pure report math: given a list of readings, compute summary stats.
// A reading here is any object with a numeric `value`.

// Round to 1 decimal place, returning a Number (e.g. 123.45 -> 123.5).
export function round1(n) {
  return Math.round(n * 10) / 10;
}

// Build the summary used by every report.
// Returns { count, highest, lowest, average } with nulls when empty.
export function summarize(readings) {
  const count = readings.length;
  if (count === 0) {
    return { count: 0, highest: null, lowest: null, average: null };
  }
  const values = readings.map((r) => r.value);
  const highest = Math.max(...values);
  const lowest = Math.min(...values);
  const average = round1(values.reduce((sum, v) => sum + v, 0) / count);
  return { count, highest, lowest, average };
}
