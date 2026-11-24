import { describe, it, expect } from 'vitest';
import { validateReadingInput, MESSAGES } from '../src/domain/validation.js';

const NOW = new Date('2026-10-15T12:00:00Z');
const valid = { date: '2026-10-15', slot: 'AFTER_LUNCH', value: 120 };

describe('validateReadingInput', () => {
  it('accepts a valid reading', () => {
    const result = validateReadingInput(valid, NOW);
    expect(result.ok).toBe(true);
    expect(result.data.value).toBe(120);
    expect(result.data.slot).toBe('AFTER_LUNCH');
  });

  it('requires a value', () => {
    for (const value of [undefined, null, '']) {
      const result = validateReadingInput({ ...valid, value }, NOW);
      expect(result).toEqual({ ok: false, message: MESSAGES.VALUE_REQUIRED });
    }
  });

  it('rejects values outside 40-600', () => {
    for (const value of [39, 601, 0, -5, 1000]) {
      const result = validateReadingInput({ ...valid, value }, NOW);
      expect(result).toEqual({ ok: false, message: MESSAGES.VALUE_RANGE });
    }
  });

  it('rejects non-integer values', () => {
    const result = validateReadingInput({ ...valid, value: 120.5 }, NOW);
    expect(result).toEqual({ ok: false, message: MESSAGES.VALUE_RANGE });
  });

  it('accepts the boundary values 40 and 600', () => {
    expect(validateReadingInput({ ...valid, value: 40 }, NOW).ok).toBe(true);
    expect(validateReadingInput({ ...valid, value: 600 }, NOW).ok).toBe(true);
  });

  it('rejects an invalid slot', () => {
    const result = validateReadingInput({ ...valid, slot: 'MIDNIGHT' }, NOW);
    expect(result).toEqual({ ok: false, message: MESSAGES.SLOT_INVALID });
  });

  it('rejects a future date', () => {
    const result = validateReadingInput({ ...valid, date: '2026-10-16' }, NOW);
    expect(result).toEqual({ ok: false, message: MESSAGES.DATE_FUTURE });
  });

  it('allows today', () => {
    const result = validateReadingInput({ ...valid, date: '2026-10-15' }, NOW);
    expect(result.ok).toBe(true);
  });

  it('rejects a malformed date', () => {
    const result = validateReadingInput({ ...valid, date: '15-10-2026' }, NOW);
    expect(result).toEqual({ ok: false, message: MESSAGES.DATE_INVALID });
  });
});
