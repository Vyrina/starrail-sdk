import { describe, it, expect } from 'vitest';
import {
  calculateDamage,
  calculateDamageDetailed,
  calculateBaseDamage,
  calculateDefMultiplier,
  calculateResMultiplier,
  calculateCritMultiplier,
} from '../src/calculators/damage.js';
import type { DamageInput } from '../src/calculators/damage.js';

function createBaseInput(overrides: Partial<DamageInput> = {}): DamageInput {
  return {
    scalingStat: 3000,
    skillMultiplier: 1.1,
    dmgBoostPercent: 0.388,
    targetBaseDef: 1000,
    attackerLevel: 80,
    defShred: 0,
    defIgnore: 0,
    targetRes: 0.20,
    resPen: 0,
    vulnerabilityPercent: 0,
    isBroken: true,
    critRate: 0.50,
    critDmg: 1.00,
    ...overrides
  };
}

describe('Damage Calculator Engine', () => {
  describe('calculateBaseDamage', () => {
    it('scales stat by multiplier', () => {
      expect(calculateBaseDamage(3000, 1.1)).toBeCloseTo(3300, 5);
    });

    it('handles zero multiplier', () => {
      expect(calculateBaseDamage(3000, 0)).toBe(0);
    });
  });

  describe('calculateDefMultiplier', () => {
    it('standard DEF mult at Lv80 vs 1000 DEF', () => {
      expect(calculateDefMultiplier(1000, 80)).toBeCloseTo(0.5, 5);
    });

    it('100% DEF shred makes DEF_Mult = 1.0', () => {
      expect(calculateDefMultiplier(1000, 80, 1.0, 0)).toBeCloseTo(1.0, 5);
    });

    it('50% DEF shred', () => {
      expect(calculateDefMultiplier(1000, 80, 0.5, 0)).toBeCloseTo(2 / 3, 4);
    });

    it('combined DEF shred and ignore', () => {
      expect(calculateDefMultiplier(1000, 80, 0.3, 0.2)).toBeCloseTo(2 / 3, 4);
    });

    it('caps DEF shred + ignore at 100% (mult max = 1.0)', () => {
      expect(calculateDefMultiplier(1000, 80, 0.8, 0.5)).toBe(1.0);
    });
  });

  describe('calculateResMultiplier', () => {
    it('standard 20% RES with no PEN', () => {
      expect(calculateResMultiplier(0.20)).toBeCloseTo(0.80, 5);
    });

    it('weakness element (0% RES)', () => {
      expect(calculateResMultiplier(0)).toBeCloseTo(1.0, 5);
    });

    it('RES PEN drops target below zero', () => {
      expect(calculateResMultiplier(0.20, 0.40)).toBeCloseTo(1.20, 5);
    });
  });

  describe('calculateCritMultiplier', () => {
    it('non-crit returns 1.0', () => {
      expect(calculateCritMultiplier(0.5, 1.0, 'none')).toBe(1.0);
    });

    it('crit hit returns 1 + CritDmg', () => {
      expect(calculateCritMultiplier(0.5, 1.0, 'crit')).toBe(2.0);
    });

    it('average crit with 50% rate and 100% CD', () => {
      expect(calculateCritMultiplier(0.5, 1.0, 'average')).toBe(1.5);
    });

    it('average crit caps rate at 100%', () => {
      expect(calculateCritMultiplier(1.5, 1.2, 'average')).toBeCloseTo(2.2, 5);
    });
  });

  describe('calculateDamage', () => {
    it('produces correct total with standard input', () => {
      const input = createBaseInput();
      const detail = calculateDamageDetailed(input, 'average');

      expect(detail.baseDamage).toBeCloseTo(3300, 2);
      expect(detail.dmgBoostMult).toBeCloseTo(1.388, 5);
      expect(detail.defMult).toBeCloseTo(0.5, 5);
      expect(detail.resMult).toBeCloseTo(0.8, 5);
      expect(detail.vulnerabilityMult).toBeCloseTo(1.0, 5);
      expect(detail.toughnessMult).toBe(1.0);
      expect(detail.critMult).toBeCloseTo(1.5, 5);
      expect(detail.totalDamage).toBeCloseTo(2748.24, 1);
    });

    it('unbroken target applies 0.9 toughness mult', () => {
      const input = createBaseInput({ isBroken: false });
      const detail = calculateDamageDetailed(input, 'none');
      expect(detail.toughnessMult).toBe(0.9);
    });

    it('shorthand calculateDamage matches detailed total', () => {
      const input = createBaseInput();
      const shorthand = calculateDamage(input, 'crit');
      const detailed = calculateDamageDetailed(input, 'crit');
      expect(shorthand).toBe(detailed.totalDamage);
    });
  });
});
