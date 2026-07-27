export interface SpeedInput {
  baseSpeed: number;
  percentSpeedBonus: number;
  flatSpeedBonus: number;
}

export function calculateTotalSpeed(input: SpeedInput): number {
  return input.baseSpeed * (1 + input.percentSpeedBonus) + input.flatSpeedBonus;
}

export function calculateActionValue(speed: number): number {
  if (speed <= 0) return 0;
  return 10000 / speed;
}

export function calculateActionAdvance(
  currentAV: number,
  speed: number,
  advancePercent: number
): number {
  if (speed <= 0) return 0;
  const baseAV = 10000 / speed;
  return Math.max(0, currentAV - baseAV * advancePercent);
}

export function getCyclesTurnCount(speed: number, totalCycles: number = 5): number {
  if (speed <= 0) return 0;
  const actionValue = 10000 / speed;
  if (totalCycles <= 0) {
    return Math.floor(150 / actionValue);
  }
  const totalAV = 150 + (totalCycles - 1) * 100;
  return Math.floor(totalAV / actionValue);
}
