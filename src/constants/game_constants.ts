export const LEVEL_MULT: Record<number, number> = {
  1: 54.0,
  20: 126.3,
  50: 933.2,
  60: 1533.1,
  70: 2650.8,
  80: 3767.55
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
