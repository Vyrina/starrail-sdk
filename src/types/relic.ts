export type RelicSlot = 'Head' | 'Hands' | 'Body' | 'Feet' | 'Sphere' | 'Rope';

export interface SubStatData {
  key: string;
  value: number;
}

export interface RelicData {
  id: string;
  setId: string;
  setName: string;
  slot: RelicSlot;
  rarity: number;
  level: number;
  mainStat: SubStatData;
  subStats: SubStatData[];
}

export interface RollValueResult {
  key: string;
  value: number;
  maxRoll: number;
  rollValue: number;
}
