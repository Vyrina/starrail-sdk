export function calculateRealHitRate(
  baseProbability: number,
  attackerEHR: number,
  targetEffectRes: number,
  targetDebuffRes: number = 0
): number {
  return Math.max(0, baseProbability * (1 + attackerEHR) * (1 - targetEffectRes) * (1 - targetDebuffRes));
}
