/**
 * Calculates the real hit rate of a debuff after EHR and effect RES.
 * @param baseProbability - Base probability of the debuff (e.g. 0.65 for 65%).
 * @param attackerEHR - Attacker's Effect Hit Rate as a decimal.
 * @param targetEffectRes - Target's Effect RES as a decimal.
 * @param targetDebuffRes - Target's specific debuff RES as a decimal. Defaults to 0.
 * @returns Real hit rate, clamped to a minimum of 0.
 */
export function calculateRealHitRate(
  baseProbability: number,
  attackerEHR: number,
  targetEffectRes: number,
  targetDebuffRes: number = 0
): number {
  return Math.max(0, baseProbability * (1 + attackerEHR) * (1 - targetEffectRes) * (1 - targetDebuffRes));
}
