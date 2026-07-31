export interface SpeedInput {
  baseSpeed: number;
  percentSpeedBonus: number;
  flatSpeedBonus: number;
}

/**
 * Calculates total speed from base speed, percent bonus, and flat bonus.
 * @param input - Speed stat components.
 */
export function calculateTotalSpeed(input: SpeedInput): number {
  return input.baseSpeed * (1 + input.percentSpeedBonus) + input.flatSpeedBonus;
}

/**
 * Calculates the action value (AV) for a given speed. AV = 10000 / speed.
 * @param speed - Total speed. Returns 0 if speed ≤ 0.
 */
export function calculateActionValue(speed: number): number {
  if (speed <= 0) return 0;
  return 10000 / speed;
}

/**
 * Calculates remaining AV after an action advance (forward).
 * @param currentAV - Current action value before advance.
 * @param speed - Total speed of the character.
 * @param advancePercent - Advance percentage as a decimal (e.g. 0.5 for 50%).
 * @returns Remaining AV, clamped to a minimum of 0.
 */
export function calculateActionAdvance(
  currentAV: number,
  speed: number,
  advancePercent: number
): number {
  if (speed <= 0) return 0;
  const baseAV = 10000 / speed;
  return Math.max(0, currentAV - baseAV * advancePercent);
}

/**
 * Calculates the number of turns a character gets within a given number of cycles.
 * @param speed - Total speed of the character.
 * @param totalCycles - Number of cycles to simulate. Defaults to 5.
 * @returns Number of turns (floored).
 */
export function getCyclesTurnCount(speed: number, totalCycles: number = 5): number {
  if (speed <= 0) return 0;
  const actionValue = 10000 / speed;
  if (totalCycles <= 0) {
    return Math.floor(150 / actionValue);
  }
  const totalAV = 150 + (totalCycles - 1) * 100;
  return Math.floor(totalAV / actionValue);
}
