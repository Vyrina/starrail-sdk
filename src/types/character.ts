import type { ComputedStats } from './stats.js';
import type { RelicData } from './relic.js';

export type Element = 'Physical' | 'Fire' | 'Ice' | 'Lightning' | 'Wind' | 'Quantum' | 'Imaginary';
export type Path = 'Destruction' | 'Hunt' | 'Erudition' | 'Harmony' | 'Nihility' | 'Preservation' | 'Abundance' | 'Remembrance' | 'Elation';

export interface LightConeData {
  id: string;
  name: string;
  level: number;
  promotion: number;
  rank: number;
}

export interface CharacterData {
  id: string;
  name: string;
  level: number;
  promotion: number;
  eidolon: number;
  element: Element;
  path: Path;
  stats: ComputedStats;
  lightCone?: LightConeData;
  relics: RelicData[];
}
