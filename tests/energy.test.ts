import { describe, it, expect } from 'vitest';
import { calculateEnergyGain, canReachUltimate } from '../src/calculators/energy.js';

describe('Energy & Ultimate Engine', () => {
  describe('calculateEnergyGain', () => {
    it('base energy with 19.4% ERR rope', () => {
      expect(calculateEnergyGain(30, 0.194)).toBeCloseTo(35.82, 2);
    });

    it('no ERR returns base energy', () => {
      expect(calculateEnergyGain(30, 0)).toBe(30);
    });

    it('high ERR scales multiplicatively', () => {
      expect(calculateEnergyGain(20, 0.50)).toBeCloseTo(30, 5);
    });
  });

  describe('canReachUltimate', () => {
    it('reaches 120 ult with standard rotation and 19.4% ERR', () => {
      const actions = [
        { baseEnergy: 30 },
        { baseEnergy: 30 },
        { baseEnergy: 30 },
        { baseEnergy: 20 }
      ];
      expect(canReachUltimate(actions, 120, 0.194)).toBe(true);
    });

    it('falls short without ERR', () => {
      const actions = [
        { baseEnergy: 30 },
        { baseEnergy: 30 },
        { baseEnergy: 20 }
      ];
      expect(canReachUltimate(actions, 120, 0)).toBe(false);
    });

    it('flat energy bonus can push over threshold', () => {
      const actions = [
        { baseEnergy: 30 },
        { baseEnergy: 30 },
        { baseEnergy: 20 }
      ];
      expect(canReachUltimate(actions, 120, 0, 45)).toBe(true);
    });

    it('exact threshold returns true', () => {
      const actions = [{ baseEnergy: 120 }];
      expect(canReachUltimate(actions, 120, 0)).toBe(true);
    });

    it('empty rotation with flat bonus', () => {
      expect(canReachUltimate([], 100, 0, 100)).toBe(true);
      expect(canReachUltimate([], 100, 0, 99)).toBe(false);
    });

    it('140 cost ult with Penacony-like flat bonus', () => {
      const actions = Array.from({ length: 4 }, () => ({ baseEnergy: 30 }));
      expect(canReachUltimate(actions, 140, 0.194, 5)).toBe(true);
    });
  });
});
