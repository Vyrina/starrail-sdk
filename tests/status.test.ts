import { describe, it, expect } from 'vitest';
import { calculateRealHitRate } from '../src/calculators/status.js';

describe('Status & Effect Hit Rate Engine', () => {
  it('100% base + 40% EHR vs 30% Effect RES = 98%', () => {
    const result = calculateRealHitRate(1.0, 0.40, 0.30, 0);
    expect(result).toBeCloseTo(0.98, 5);
  });

  it('100% base + 0% EHR vs 0% Effect RES = 100%', () => {
    expect(calculateRealHitRate(1.0, 0, 0)).toBeCloseTo(1.0, 5);
  });

  it('75% base + 43.2% EHR vs 30% RES = 75.18%', () => {
    const result = calculateRealHitRate(0.75, 0.432, 0.30);
    expect(result).toBeCloseTo(0.7518, 3);
  });

  it('accounts for specific debuff resistance', () => {
    const result = calculateRealHitRate(1.0, 0.40, 0.30, 0.20);
    expect(result).toBeCloseTo(0.784, 5);
  });

  it('zero base probability returns zero', () => {
    expect(calculateRealHitRate(0, 1.0, 0)).toBe(0);
  });

  it('real hit rate is clamped at 100% even with excess EHR', () => {
    const result = calculateRealHitRate(1.0, 1.0, 0);
    expect(result).toBeCloseTo(1.0, 5);
  });

  it('default targetDebuffRes is 0', () => {
    const withDefault = calculateRealHitRate(1.0, 0.40, 0.30);
    const withExplicit = calculateRealHitRate(1.0, 0.40, 0.30, 0);
    expect(withDefault).toBe(withExplicit);
  });
});
