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

/**
 * Calculates base damage before multipliers.
 * @param scalingStat - The character's scaling stat (ATK, DEF, or HP depending on skill).
 * @param skillMultiplier - Skill multiplier as a decimal (e.g. 1.2 for 120%).
 */
export function calculateBaseDamage(scalingStat: number, skillMultiplier: number): number {
  return scalingStat * skillMultiplier;
}

/**
 * Calculates the DEF multiplier. Result is clamped so effective DEF cannot go below 0.
 * @param targetBaseDef - Target's base DEF stat.
 * @param attackerLevel - Attacker's character level.
 * @param defShred - DEF shred as a decimal (e.g. 0.1 for 10%). Defaults to 0.
 * @param defIgnore - DEF ignore as a decimal. Defaults to 0.
 */
export function calculateDefMultiplier(
  targetBaseDef: number,
  attackerLevel: number,
  defShred: number = 0,
  defIgnore: number = 0
): number {
  const effectiveDef = Math.max(0, targetBaseDef * (1 - defShred - defIgnore));
  return 1 - effectiveDef / (effectiveDef + 200 + 10 * attackerLevel);
}

/**
 * Calculates the RES multiplier. Clamped to a minimum of 0.
 * @param targetRes - Target's elemental resistance as a decimal (e.g. 0.2 for 20%).
 * @param resPen - Resistance penetration as a decimal. Defaults to 0.
 */
export function calculateResMultiplier(targetRes: number, resPen: number = 0): number {
  return Math.max(0, 1 - (targetRes - resPen));
}

/**
 * Calculates the crit multiplier based on the selected mode.
 * @param critRate - Crit rate as a decimal (e.g. 0.5 for 50%). Capped at 1.0 in 'average' mode.
 * @param critDmg - Crit damage as a decimal (e.g. 1.0 for 100%).
 * @param mode - `'none'` = no crit, `'crit'` = guaranteed crit, `'average'` = expected value.
 */
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

/**
 * Calculates final damage as a single number.
 * @param input - All damage calculation parameters.
 * @param critMode - Crit handling mode. Defaults to `'average'`.
 * @returns The total damage value.
 */
export function calculateDamage(input: DamageInput, critMode: CritMode = 'average'): number {
  return calculateDamageDetailed(input, critMode).totalDamage;
}

/**
 * Calculates damage with a full breakdown of each multiplier.
 * @param input - All damage calculation parameters.
 * @param critMode - Crit handling mode. Defaults to `'average'`.
 * @returns A {@link DamageBreakdown} with each multiplier and the total.
 */
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
