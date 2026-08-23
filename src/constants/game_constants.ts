export const LEVEL_MULT: Record<number, number> = {
  1: 54.0,
  10: 85.8684,
  20: 139.7703,
  30: 231.1992,
  40: 363.6658,
  50: 774.9041,
  60: 1640.3068,
  70: 2659.6406,
  80: 3767.5533,
  90: 6020.8836,
  95: 7494.3713
};

export const ELEMENT_BREAK_MULT: Record<string, number> = {
  Physical: 2.0,
  Fire: 2.0,
  Wind: 1.5,
  Ice: 1.0,
  Lightning: 1.0,
  Quantum: 0.5,
  Imaginary: 0.5
};

export const LEVEL_MULT_KEYS: number[] = Object.keys(LEVEL_MULT)
  .map(Number)
  .sort((a, b) => a - b);
