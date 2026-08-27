import { describe, it, expect } from 'vitest';
import { calculateRollValue, calculateTotalRollValue, calculateTotalRollValueDetailed } from '../src/calculators/relic.js';

describe('Relic Substat & Score Engine', () => {
  describe('calculateRollValue', () => {
    it('CRIT DMG perfect single roll = 1.0 RV', () => {
      expect(calculateRollValue('CRIT DMG', 0.0648)).toBeCloseTo(1.0, 5);
    });

    it('CRIT DMG two perfect rolls = 2.0 RV', () => {
      expect(calculateRollValue('CRIT DMG', 0.1296)).toBeCloseTo(2.0, 5);
    });

    it('CRIT DMG 80% roll = 0.8 RV', () => {
      expect(calculateRollValue('CRIT DMG', 0.0648 * 0.8)).toBeCloseTo(0.8, 5);
    });

    it('CRIT Rate perfect roll = 1.0 RV', () => {
      expect(calculateRollValue('CRIT Rate', 0.0324)).toBeCloseTo(1.0, 5);
    });

    it('SPD perfect roll = 1.0 RV', () => {
      expect(calculateRollValue('SPD', 2.6)).toBeCloseTo(1.0, 5);
    });

    it('ATK% perfect roll = 1.0 RV', () => {
      expect(calculateRollValue('ATK%', 0.0432)).toBeCloseTo(1.0, 5);
    });

    it('flat HP perfect roll = 1.0 RV', () => {
      expect(calculateRollValue('HP', 42.3375)).toBeCloseTo(1.0, 5);
    });

    it('throws on unknown substat type', () => {
      expect(() => calculateRollValue('InvalidStat', 10)).toThrow('Unknown substat type');
    });
  });

  describe('calculateTotalRollValue', () => {
    it('sums roll values across multiple substats', () => {
      const substats = [
        { key: 'CRIT DMG', value: 0.1296 },
        { key: 'CRIT Rate', value: 0.0324 },
        { key: 'ATK%', value: 0.0216 },
        { key: 'SPD', value: 2.6 }
      ];
      expect(calculateTotalRollValue(substats)).toBeCloseTo(4.5, 3);
    });

    it('empty substats returns 0', () => {
      expect(calculateTotalRollValue([])).toBe(0);
    });
  });

  describe('calculateTotalRollValueDetailed', () => {
    it('returns a per-substat breakdown matching calculateRollValue', () => {
      const substats = [
        { key: 'CRIT DMG', value: 0.0648 },
        { key: 'SPD', value: 1.3 }
      ];
      const result = calculateTotalRollValueDetailed(substats);
      expect(result).toEqual([
        { key: 'CRIT DMG', value: 0.0648, maxRoll: 0.0648, rollValue: 1.0 },
        { key: 'SPD', value: 1.3, maxRoll: 2.6, rollValue: 0.5 }
      ]);
    });

    it('empty substats returns empty array', () => {
      expect(calculateTotalRollValueDetailed([])).toEqual([]);
    });

    it('sum of individual rollValue entries matches calculateTotalRollValue', () => {
      const substats = [
        { key: 'CRIT DMG', value: 0.1296 },
        { key: 'CRIT Rate', value: 0.0324 },
        { key: 'ATK%', value: 0.0216 },
        { key: 'SPD', value: 2.6 }
      ];
      const detailed = calculateTotalRollValueDetailed(substats);
      const sum = detailed.reduce((total, r) => total + r.rollValue, 0);
      expect(sum).toBeCloseTo(calculateTotalRollValue(substats), 5);
    });

    it('throws on unknown substat type, same as calculateRollValue', () => {
      expect(() => calculateTotalRollValueDetailed([{ key: 'InvalidStat', value: 10 }]))
        .toThrow('Unknown substat type');
    });
  });
});

