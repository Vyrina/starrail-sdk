export function calculateEnergyGain(baseEnergy: number, errPercent: number): number {
  return baseEnergy * (1 + errPercent);
}

export function canReachUltimate(
  actions: Array<{ baseEnergy: number }>,
  maxEnergy: number,
  errPercent: number,
  flatEnergyBonus: number = 0
): boolean {
  let totalEnergy = flatEnergyBonus;
  for (const action of actions) {
    totalEnergy += calculateEnergyGain(action.baseEnergy, errPercent);
  }
  return totalEnergy >= maxEnergy;
}
