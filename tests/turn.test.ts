import { describe, it, expect } from 'vitest';
import {
  calculateTotalSpeed,
  calculateActionValue,
  calculateActionAdvance,
  getCyclesTurnCount
} from '../src/calculators/turn.js';

describe('Turn & Action Value Engine', () => {
  describe('calculateTotalSpeed', () => {
    it('returns base speed with no bonuses', () => {
      expect(calculateTotalSpeed({ baseSpeed: 100, percentSpeedBonus: 0, flatSpeedBonus: 0 }))
        .toBe(100);
    });

    it('applies percent and flat bonuses correctly', () => {
      expect(calculateTotalSpeed({ baseSpeed: 100, percentSpeedBonus: 0.10, flatSpeedBonus: 5 }))
        .toBeCloseTo(115, 5);
    });

    it('handles only percent bonus', () => {
      expect(calculateTotalSpeed({ baseSpeed: 96, percentSpeedBonus: 0.25, flatSpeedBonus: 0 }))
        .toBeCloseTo(120, 5);
    });
  });

  describe('calculateActionValue', () => {
    it('SPD = 100 -> AV = 100.00', () => {
      expect(calculateActionValue(100)).toBe(100.00);
    });

    it('SPD = 133.4 -> AV ~ 74.96', () => {
      expect(calculateActionValue(133.4)).toBeCloseTo(74.96, 2);
    });

    it('SPD = 200 -> AV = 50.00', () => {
      expect(calculateActionValue(200)).toBe(50.00);
    });

    it('SPD = 80 -> AV = 125.00', () => {
      expect(calculateActionValue(80)).toBe(125.00);
    });
  });

  describe('calculateActionAdvance', () => {
    it('100% advance reduces AV to 0', () => {
      const av = calculateActionValue(100);
      expect(calculateActionAdvance(av, 100, 1.0)).toBe(0);
    });

    it('25% advance reduces AV by 25% of base', () => {
      const av = calculateActionValue(100);
      expect(calculateActionAdvance(av, 100, 0.25)).toBeCloseTo(75, 5);
    });

    it('50% advance on SPD 134', () => {
      expect(calculateActionAdvance(calculateActionValue(134), 134, 0.50)).toBeCloseTo(37.3134, 2);
    });

    it('AV cannot go below 0', () => {
      expect(calculateActionAdvance(10, 100, 1.0)).toBe(0);
    });
  });

  describe('getCyclesTurnCount', () => {
    it('134 SPD gives 2 turns in Cycle 0', () => {
      expect(getCyclesTurnCount(134, 0)).toBe(2);
    });

    it('134 SPD gives 7 turns in 5 cycles', () => {
      expect(getCyclesTurnCount(134, 5)).toBe(7);
    });

    it('100 SPD gives 5 turns in 5 cycles', () => {
      expect(getCyclesTurnCount(100, 5)).toBe(5);
    });

    it('200 SPD gives 11 turns in 5 cycles', () => {
      expect(getCyclesTurnCount(200, 5)).toBe(11);
    });

    it('default totalCycles is 5', () => {
      expect(getCyclesTurnCount(134)).toBe(getCyclesTurnCount(134, 5));
    });
  });
});
