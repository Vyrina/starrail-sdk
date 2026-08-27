import { MAX_SUBSTAT_ROLLS } from '../constants/relic_constants.js';
import { HSRSDKError } from '../types/errors.js';
import type { SubStatData, RollValueResult } from '../types/relic.js';

/**
 * Calculates the roll value of a single relic substat (value / max roll).
 * @param substatType - Substat key (e.g. `'ATK%'`, `'CRIT Rate'`).
 * @param value - The substat's current value.
 * @throws {@link HSRSDKError} if substatType is unknown.
 */
export function calculateRollValue(substatType: string, value: number): number {
  const maxRoll = MAX_SUBSTAT_ROLLS[substatType];
  if (maxRoll === undefined) {
    throw new HSRSDKError(`Unknown substat type: "${substatType}". Valid types: ${Object.keys(MAX_SUBSTAT_ROLLS).join(', ')}`);
  }
  return value / maxRoll;
}

/**
 * Calculates the total roll value of all substats on a relic.
 * @param substats - Array of substat entries with `key` and `value`.
 * @returns Sum of individual roll values.
 */
export function calculateTotalRollValue(substats: SubStatData[]): number {
  return substats.reduce((total, sub) => total + calculateRollValue(sub.key, sub.value), 0);
}

/**
 * Calculates the total roll value of all substats on a relic, with a per-substat breakdown.
 * @param substats - Array of substat entries with `key` and `value`.
 * @returns One {@link RollValueResult} per substat, each with its own roll value.
 * @throws {@link HSRSDKError} if any substat's key is unknown.
 */
export function calculateTotalRollValueDetailed(substats: SubStatData[]): RollValueResult[] {
  return substats.map(sub => ({
    key: sub.key,
    value: sub.value,
    maxRoll: MAX_SUBSTAT_ROLLS[sub.key],
    rollValue: calculateRollValue(sub.key, sub.value)
  }));
}
