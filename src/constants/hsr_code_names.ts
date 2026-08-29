// StarRailRes internal codename -> SDK display name
// Verified against Mar-7th/StarRailRes elements.json, paths.json, relics.json

export const ELEMENT_CODE_NAME_MAP: Record<string, string> = {
  Physical: 'Physical',
  Fire: 'Fire',
  Ice: 'Ice',
  Thunder: 'Lightning',
  Wind: 'Wind',
  Quantum: 'Quantum',
  Imaginary: 'Imaginary'
};

export const PATH_CODE_NAME_MAP: Record<string, string> = {
  Warrior: 'Destruction',
  Rogue: 'Hunt',
  Mage: 'Erudition',
  Shaman: 'Harmony',
  Warlock: 'Nihility',
  Knight: 'Preservation',
  Priest: 'Abundance',
  Memory: 'Remembrance',
  Elation: 'Elation'
};

export const RELIC_SLOT_CODE_NAME_MAP: Record<string, string> = {
  HEAD: 'Head',
  HAND: 'Hands',
  BODY: 'Body',
  FOOT: 'Feet',
  NECK: 'Sphere',
  OBJECT: 'Rope'
};
