import { LEVEL_MULT, LEVEL_MULT_KEYS } from '../constants/game_constants.js';

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function getLevelMultiplier(level: number): number {
  const exact = LEVEL_MULT[level];
  if (exact !== undefined) return exact;

  const keys = LEVEL_MULT_KEYS;
  if (level <= keys[0]) return LEVEL_MULT[keys[0]];
  if (level >= keys[keys.length - 1]) return LEVEL_MULT[keys[keys.length - 1]];

  let lower = keys[0];
  let upper = keys[keys.length - 1];
  for (const k of keys) {
    if (k <= level) lower = k;
    if (k >= level && k <= upper) upper = k;
  }

  const t = (level - lower) / (upper - lower);
  return LEVEL_MULT[lower] + t * (LEVEL_MULT[upper] - LEVEL_MULT[lower]);
}
