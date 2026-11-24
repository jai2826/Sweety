import { describe, it, expect } from 'vitest';
import { summarize, round1 } from '../src/domain/reports.js';

describe('round1', () => {
  it('rounds to one decimal place', () => {
    expect(round1(123.44)).toBe(123.4);
    expect(round1(123.45)).toBe(123.5);
    expect(round1(100)).toBe(100);
  });
});

describe('summarize', () => {
  it('returns an empty summary for no readings', () => {
    expect(summarize([])).toEqual({
      count: 0,
      highest: null,
      lowest: null,
      average: null,
    });
  });

  it('computes highest, lowest, average and count', () => {
    const readings = [{ value: 100 }, { value: 120 }, { value: 140 }];
    expect(summarize(readings)).toEqual({
      count: 3,
      highest: 140,
      lowest: 100,
      average: 120,
    });
  });

  it('rounds the average to one decimal place', () => {
    const readings = [{ value: 100 }, { value: 101 }, { value: 101 }];
    // (100 + 101 + 101) / 3 = 100.666... -> 100.7
    expect(summarize(readings).average).toBe(100.7);
  });

  it('handles a single reading', () => {
    expect(summarize([{ value: 95 }])).toEqual({
      count: 1,
      highest: 95,
      lowest: 95,
      average: 95,
    });
  });
});
