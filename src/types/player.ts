import type { ComputedStats } from './stats.js';

export interface PlayerProfile {
  uid: string;
  nickname: string;
  level: number;
  worldLevel: number;
  signature: string;
  characters: PlayerCharacter[];
}

export interface PlayerCharacter {
  id: number;
  level: number;
  promotion: number;
  eidolon: number;
  stats: ComputedStats;
  equipment?: PlayerEquipment;
  relics: PlayerRelic[];
}

export interface PlayerEquipment {
  id: number;
  level: number;
  promotion: number;
  rank: number;
}

export interface PlayerRelic {
  id: number;
  type: number;
  level: number;
  mainAffixId: number;
}
