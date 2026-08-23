import { ELEMENT_BREAK_MULT } from '../constants/game_constants.js';
import { getLevelMultiplier } from '../utils/math.js';
import { calculateDefMultiplier, calculateResMultiplier } from './damage.js';

export interface BreakDamageInput {
  attackerLevel: number;
  element: string;
  breakEffect: number;
  toughnessMax: number;
  targetBaseDef: number;
  defShred: number;
  defIgnore: number;
  targetRes: number;
  resPen: number;
  vulnerabilityPercent: number;
}

export interface SuperBreakDamageInput {
  attackerLevel: number;
  toughnessReduce: number;
  breakEffect: number;
  superBreakBuff: number;
  targetBaseDef: number;
  defShred: number;
  defIgnore: number;
  targetRes: number;
  resPen: number;
  vulnerabilityPercent: number;
}

export interface BreakDamageBreakdown {
  levelMult: number;
  elementMult: number;
  breakMult: number;
  toughnessMaxMult: number;
  defMult: number;
  resMult: number;
  vulnMult: number;
  totalDamage: number;
}

export interface SuperBreakDamageBreakdown {
  levelMult: number;
  toughnessFactor: number;
  breakMult: number;
  superBreakMult: number;
  defMult: number;
  resMult: number;
  vulnMult: number;
  totalDamage: number;
}

/**
 * Calculates break damage as a single number.
 * @param input - Break damage parameters including element, break effect, and target stats.
 * @returns The total break damage value.
 */
export function calculateBreakDamage(input: BreakDamageInput): number {
  return calculateBreakDamageDetailed(input).totalDamage;
}

/**
 * Calculates break damage with a full breakdown of each multiplier.
 * @param input - Break damage parameters including element, break effect, and target stats.
 * @returns A {@link BreakDamageBreakdown} with each multiplier and the total.
 */
export function calculateBreakDamageDetailed(input: BreakDamageInput): BreakDamageBreakdown {
  const levelMult = getLevelMultiplier(input.attackerLevel);
  const elementMult = ELEMENT_BREAK_MULT[input.element] ?? 1.0;
  const breakMult = 1 + input.breakEffect;
  const toughnessMaxMult = 0.5 + input.toughnessMax / 40;
  const defMult = calculateDefMultiplier(
    input.targetBaseDef, input.attackerLevel, input.defShred, input.defIgnore
  );
  const resMult = calculateResMultiplier(input.targetRes, input.resPen);
  const vulnMult = 1 + input.vulnerabilityPercent;

  const totalDamage = levelMult * elementMult * breakMult * toughnessMaxMult * defMult * resMult * vulnMult;

  return { levelMult, elementMult, breakMult, toughnessMaxMult, defMult, resMult, vulnMult, totalDamage };
}

/**
 * Calculates super break damage as a single number.
 * @param input - Super break parameters including toughness reduction and super break buff.
 * @returns The total super break damage value.
 */
export function calculateSuperBreakDamage(input: SuperBreakDamageInput): number {
  return calculateSuperBreakDamageDetailed(input).totalDamage;
}

/**
 * Calculates super break damage with a full breakdown of each multiplier.
 * @param input - Super break parameters including toughness reduction and super break buff.
 * @returns A {@link SuperBreakDamageBreakdown} with each multiplier and the total.
 */
export function calculateSuperBreakDamageDetailed(input: SuperBreakDamageInput): SuperBreakDamageBreakdown {
  const levelMult = getLevelMultiplier(input.attackerLevel);
  const toughnessFactor = input.toughnessReduce / 30;
  const breakMult = 1 + input.breakEffect;
  const superBreakMult = 1 + input.superBreakBuff;
  const defMult = calculateDefMultiplier(
    input.targetBaseDef, input.attackerLevel, input.defShred, input.defIgnore
  );
  const resMult = calculateResMultiplier(input.targetRes, input.resPen);
  const vulnMult = 1 + input.vulnerabilityPercent;

  const totalDamage = levelMult * toughnessFactor * breakMult * superBreakMult * defMult * resMult * vulnMult;

  return { levelMult, toughnessFactor, breakMult, superBreakMult, defMult, resMult, vulnMult, totalDamage };
}
