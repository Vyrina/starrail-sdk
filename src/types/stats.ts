export interface BaseStats {
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  baseSpeed: number;
}

export interface ComputedStats extends BaseStats {
  flatHp: number;
  percentHp: number;
  flatAtk: number;
  percentAtk: number;
  flatDef: number;
  percentDef: number;
  flatSpeed: number;
  percentSpeed: number;
  critRate: number;
  critDmg: number;
  effectHit: number;
  effectRes: number;
  breakEffect: number;
  energyRecovery: number;
  healBoost: number;
  healTakenBoost: number;
  physicalDmgBoost: number;
  fireDmgBoost: number;
  iceDmgBoost: number;
  lightningDmgBoost: number;
  windDmgBoost: number;
  quantumDmgBoost: number;
  imaginaryDmgBoost: number;
  elationDmgBoost: number;
  allDmgBoost: number;
}

export type StatKey = keyof ComputedStats;

export function createEmptyStats(): ComputedStats {
  return {
    baseHp: 0,
    baseAtk: 0,
    baseDef: 0,
    baseSpeed: 0,
    flatHp: 0,
    percentHp: 0,
    flatAtk: 0,
    percentAtk: 0,
    flatDef: 0,
    percentDef: 0,
    flatSpeed: 0,
    percentSpeed: 0,
    critRate: 0,
    critDmg: 0,
    effectHit: 0,
    effectRes: 0,
    breakEffect: 0,
    energyRecovery: 0,
    healBoost: 0,
    healTakenBoost: 0,
    physicalDmgBoost: 0,
    fireDmgBoost: 0,
    iceDmgBoost: 0,
    lightningDmgBoost: 0,
    windDmgBoost: 0,
    quantumDmgBoost: 0,
    imaginaryDmgBoost: 0,
    elationDmgBoost: 0,
    allDmgBoost: 0
  };
}
