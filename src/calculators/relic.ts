import { MAX_SUBSTAT_ROLLS } from '../constants/relic_constants.js';
import { HSRSDKError } from '../types/errors.js';

export function calculateRollValue(substatType: string, value: number): number {
  const maxRoll = MAX_SUBSTAT_ROLLS[substatType];
  if (maxRoll === undefined) {
    throw new HSRSDKError(`Unknown substat type: "${substatType}". Valid types: ${Object.keys(MAX_SUBSTAT_ROLLS).join(', ')}`);
  }
  return value / maxRoll;
}

export function calculateTotalRollValue(substats: Array<{ key: string; value: number }>): number {
  return substats.reduce((total, sub) => total + calculateRollValue(sub.key, sub.value), 0);
}
