export type CritMode = 'none' | 'crit' | 'average';

export interface DamageInput {
  scalingStat: number;
  skillMultiplier: number;
  dmgBoostPercent: number;
  targetBaseDef: number;
  attackerLevel: number;
  defShred: number;
  defIgnore: number;
  targetRes: number;
  resPen: number;
  vulnerabilityPercent: number;
  isBroken: boolean;
  critRate: number;
  critDmg: number;
}

export interface DamageBreakdown {
  baseDamage: number;
  dmgBoostMult: number;
  defMult: number;
  resMult: number;
  vulnerabilityMult: number;
  toughnessMult: number;
  critMult: number;
  totalDamage: number;
}

export function calculateBaseDamage(scalingStat: number, skillMultiplier: number): number {
  return scalingStat * skillMultiplier;
}

export function calculateDefMultiplier(
  targetBaseDef: number,
  attackerLevel: number,
  defShred: number = 0,
  defIgnore: number = 0
): number {
  const effectiveDef = Math.max(0, targetBaseDef * (1 - defShred - defIgnore));
  return 1 - effectiveDef / (effectiveDef + 200 + 10 * attackerLevel);
}

export function calculateResMultiplier(targetRes: number, resPen: number = 0): number {
  return 1 - (targetRes - resPen);
}

export function calculateCritMultiplier(
  critRate: number,
  critDmg: number,
  mode: CritMode
): number {
  switch (mode) {
    case 'none':
      return 1.0;
    case 'crit':
      return 1 + critDmg;
    case 'average':
      return 1 + Math.min(1.0, critRate) * critDmg;
  }
}

export function calculateDamage(input: DamageInput, critMode: CritMode = 'average'): number {
  return calculateDamageDetailed(input, critMode).totalDamage;
}

export function calculateDamageDetailed(
  input: DamageInput,
  critMode: CritMode = 'average'
): DamageBreakdown {
  const baseDamage = calculateBaseDamage(input.scalingStat, input.skillMultiplier);
  const dmgBoostMult = 1 + input.dmgBoostPercent;
  const defMult = calculateDefMultiplier(
    input.targetBaseDef,
    input.attackerLevel,
    input.defShred,
    input.defIgnore
  );
  const resMult = calculateResMultiplier(input.targetRes, input.resPen);
  const vulnerabilityMult = 1 + input.vulnerabilityPercent;
  const toughnessMult = input.isBroken ? 1.0 : 0.9;
  const critMult = calculateCritMultiplier(input.critRate, input.critDmg, critMode);

  const totalDamage = baseDamage * dmgBoostMult * defMult * resMult
    * vulnerabilityMult * toughnessMult * critMult;

  return {
    baseDamage,
    dmgBoostMult,
    defMult,
    resMult,
    vulnerabilityMult,
    toughnessMult,
    critMult,
    totalDamage
  };
}
