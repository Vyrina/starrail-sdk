import { MAX_SUBSTAT_ROLLS } from '../constants/relic_constants.js';
import { HSRSDKError } from '../types/errors.js';

/**
 * Calculates the roll value of a single relic substat (value / max roll).
 * @param substatType - Substat key (e.g. `'ATK_'`, `'CRIT Rate_'`).
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
export function calculateTotalRollValue(substats: Array<{ key: string; value: number }>): number {
  return substats.reduce((total, sub) => total + calculateRollValue(sub.key, sub.value), 0);
}
