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

export function calculateBreakDamage(input: BreakDamageInput): number {
  return calculateBreakDamageDetailed(input).totalDamage;
}

export function calculateBreakDamageDetailed(input: BreakDamageInput): BreakDamageBreakdown {
  const levelMult = getLevelMultiplier(input.attackerLevel);
  const elementMult = ELEMENT_BREAK_MULT[input.element] ?? 1.0;
  const breakMult = 1 + input.breakEffect;
  const toughnessMaxMult = 0.5 + input.toughnessMax / 120;
  const defMult = calculateDefMultiplier(
    input.targetBaseDef, input.attackerLevel, input.defShred, input.defIgnore
  );
  const resMult = calculateResMultiplier(input.targetRes, input.resPen);
  const vulnMult = 1 + input.vulnerabilityPercent;

  const totalDamage = levelMult * elementMult * breakMult * toughnessMaxMult * defMult * resMult * vulnMult;

  return { levelMult, elementMult, breakMult, toughnessMaxMult, defMult, resMult, vulnMult, totalDamage };
}

export function calculateSuperBreakDamage(input: SuperBreakDamageInput): number {
  return calculateSuperBreakDamageDetailed(input).totalDamage;
}

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
