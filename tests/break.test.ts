import { describe, it, expect } from 'vitest';
import { calculateBreakDamage, calculateSuperBreakDamage } from '../src/calculators/break.js';

describe('Break & Super Break Engine', () => {
  describe('calculateBreakDamage', () => {
    it('Fire break at Lv80 with 100% Break Effect', () => {
      const result = calculateBreakDamage({
        attackerLevel: 80,
        element: 'Fire',
        breakEffect: 1.0,
        toughnessMax: 360,
        targetBaseDef: 1000,
        defShred: 0,
        defIgnore: 0,
        targetRes: 0,
        resPen: 0,
        vulnerabilityPercent: 0
      });
      expect(result).toBeCloseTo(26372.85, 1);
    });

    it('Quantum break has 0.5 element multiplier', () => {
      const result = calculateBreakDamage({
        attackerLevel: 80,
        element: 'Quantum',
        breakEffect: 0,
        toughnessMax: 120,
        targetBaseDef: 1000,
        defShred: 0,
        defIgnore: 0,
        targetRes: 0,
        resPen: 0,
        vulnerabilityPercent: 0
      });
      expect(result).toBeCloseTo(1412.83, 0);
    });

    it('Wind break has 1.5 element multiplier', () => {
      const result = calculateBreakDamage({
        attackerLevel: 80,
        element: 'Wind',
        breakEffect: 0,
        toughnessMax: 120,
        targetBaseDef: 1000,
        defShred: 0,
        defIgnore: 0,
        targetRes: 0,
        resPen: 0,
        vulnerabilityPercent: 0
      });
      expect(result).toBeCloseTo(4238.49, 0);
    });
  });

  describe('calculateSuperBreakDamage', () => {
    it('Super Break with 250% Break Effect', () => {
      const result = calculateSuperBreakDamage({
        attackerLevel: 80,
        toughnessReduce: 30,
        breakEffect: 2.5,
        superBreakBuff: 0,
        targetBaseDef: 1000,
        defShred: 0,
        defIgnore: 0,
        targetRes: 0,
        resPen: 0,
        vulnerabilityPercent: 0
      });
      expect(result).toBeCloseTo(6593.2125, 1);
    });

    it('Super Break with buff multiplier', () => {
      const result = calculateSuperBreakDamage({
        attackerLevel: 80,
        toughnessReduce: 30,
        breakEffect: 2.5,
        superBreakBuff: 0.60,
        targetBaseDef: 1000,
        defShred: 0,
        defIgnore: 0,
        targetRes: 0,
        resPen: 0,
        vulnerabilityPercent: 0
      });
      expect(result).toBeCloseTo(10549.14, 1);
    });

    it('toughnessReduce scales linearly', () => {
      const base = calculateSuperBreakDamage({
        attackerLevel: 80,
        toughnessReduce: 30,
        breakEffect: 0,
        superBreakBuff: 0,
        targetBaseDef: 1000,
        defShred: 0,
        defIgnore: 0,
        targetRes: 0,
        resPen: 0,
        vulnerabilityPercent: 0
      });
      const double = calculateSuperBreakDamage({
        attackerLevel: 80,
        toughnessReduce: 60,
        breakEffect: 0,
        superBreakBuff: 0,
        targetBaseDef: 1000,
        defShred: 0,
        defIgnore: 0,
        targetRes: 0,
        resPen: 0,
        vulnerabilityPercent: 0
      });
      expect(double).toBeCloseTo(base * 2, 2);
    });
  });
});
