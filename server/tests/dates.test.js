import { describe, it, expect } from 'vitest';
import {
  parseDateOnly,
  toDateOnlyString,
  startOfMonth,
  endOfMonth,
  startOfPreviousMonth,
  endOfPreviousMonth,
  isFuture,
} from '../src/domain/dates.js';

describe('parseDateOnly', () => {
  it('parses a valid YYYY-MM-DD string', () => {
    const d = parseDateOnly('2026-10-15');
    expect(toDateOnlyString(d)).toBe('2026-10-15');
  });

  it('rejects malformed or impossible dates', () => {
    expect(parseDateOnly('2026-13-01')).toBeNull();
    expect(parseDateOnly('2026-02-31')).toBeNull();
    expect(parseDateOnly('15/10/2026')).toBeNull();
    expect(parseDateOnly('')).toBeNull();
  });
});

describe('month boundaries (selected 2026-10-15)', () => {
  const d = parseDateOnly('2026-10-15');

  it('month-to-date starts on the 1st', () => {
    expect(toDateOnlyString(startOfMonth(d))).toBe('2026-10-01');
    expect(toDateOnlyString(endOfMonth(d))).toBe('2026-10-31');
  });

  it('previous month is all of September', () => {
    expect(toDateOnlyString(startOfPreviousMonth(d))).toBe('2026-09-01');
    expect(toDateOnlyString(endOfPreviousMonth(d))).toBe('2026-09-30');
  });
});

describe('previous month across a year boundary (selected 2026-01-10)', () => {
  const d = parseDateOnly('2026-01-10');
  it('rolls back to December of the prior year', () => {
    expect(toDateOnlyString(startOfPreviousMonth(d))).toBe('2025-12-01');
    expect(toDateOnlyString(endOfPreviousMonth(d))).toBe('2025-12-31');
  });
});

describe('isFuture', () => {
  const now = new Date('2026-10-15T08:00:00Z');
  it('is false for today and past, true for tomorrow', () => {
    expect(isFuture(parseDateOnly('2026-10-15'), now)).toBe(false);
    expect(isFuture(parseDateOnly('2026-10-14'), now)).toBe(false);
    expect(isFuture(parseDateOnly('2026-10-16'), now)).toBe(true);
  });
});
