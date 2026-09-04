import type { ComputedStats } from './stats.js';
import type { EnkaSubAffix, EnkaSkillTreePoint } from './api.js';

export interface PlayerProfile {
  uid: string;
  nickname: string;
  level: number;
  worldLevel: number;
  headIcon: number;
  signature: string;
  characters: PlayerCharacter[];
}

export interface PlayerCharacter {
  id: number;
  level: number;
  promotion: number;
  eidolon: number;
  stats: ComputedStats;
  // Which Enka path produced stats: _statsMap has base stats baked in, _flat.props does not
  statsSource: 'statsMap' | 'flatProps';
  equipment?: PlayerEquipment;
  relics: PlayerRelic[];
  skillTreePoints?: EnkaSkillTreePoint[];
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
  // Raw rolls from Enka, not decoded to {key,value} (needs relic_sub_affixes.json formula)
  subAffixes?: EnkaSubAffix[];
}
