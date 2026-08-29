import { describe, it, expect } from 'vitest';
import { resolveCharacter, resolveLightCone, resolveRelic } from '../src/resolvers/character.js';
import { HSRDataNotFoundError } from '../src/types/errors.js';
import type { PlayerCharacter, PlayerEquipment, PlayerRelic } from '../src/types/player.js';
import type { ResolverGameData } from '../src/resolvers/character.js';

const gameData: ResolverGameData = {
  characters: {
    '1001': { id: '1001', name: 'March 7th', rarity: 4, path: 'Knight', element: 'Ice', max_sp: 120, icon: '' },
    '1005': { id: '1005', name: 'Kafka', rarity: 5, path: 'Warlock', element: 'Thunder', max_sp: 120, icon: '' }
  },
  lightCones: {
    '20000': { id: '20000', name: 'Arrows', rarity: 3, path: 'Rogue', icon: '' }
  },
  relics: {
    '31011': { id: '31011', name: "Passerby's Rejuvenated Wooden Hairstick", set_id: '101', rarity: 2, type: 'HEAD', icon: '' },
    '33015': { id: '33015', name: "Herta's Space Station", set_id: '301', rarity: 2, type: 'NECK', icon: '' },
    '33016': { id: '33016', name: "Herta's Wandering Trek", set_id: '301', rarity: 2, type: 'OBJECT', icon: '' }
  },
  relicSets: {
    '101': { id: '101', name: 'Passerby of Wandering Cloud', desc: ['2pc', '4pc'], properties: [[{ type: 'HealRatioBase', value: 0.1 }], []], icon: '' },
    '301': { id: '301', name: 'Space Sealing Station', desc: ['2pc', '4pc'], properties: [[{ type: 'AttackAddedRatio', value: 0.12 }], []], icon: '' }
  }
};

const baseStats = {} as PlayerCharacter['stats'];

describe('resolveCharacter', () => {
  it('March 7th: Ice/Knight -> Ice/Preservation', () => {
    const player: PlayerCharacter = {
      id: 1001, level: 80, promotion: 6, eidolon: 0, stats: baseStats, relics: []
    };
    const result = resolveCharacter(player, gameData);
    expect(result.id).toBe('1001');
    expect(result.name).toBe('March 7th');
    expect(result.element).toBe('Ice');
    expect(result.path).toBe('Preservation');
    expect(result.level).toBe(80);
    expect(result.lightCone).toBeUndefined();
    expect(result.relics).toEqual([]);
  });

  it('Kafka: Thunder -> Lightning, Warlock -> Nihility', () => {
    const player: PlayerCharacter = {
      id: 1005, level: 70, promotion: 5, eidolon: 6, stats: baseStats, relics: []
    };
    const result = resolveCharacter(player, gameData);
    expect(result.name).toBe('Kafka');
    expect(result.element).toBe('Lightning');
    expect(result.path).toBe('Nihility');
  });

  it('equipped light cone resolves', () => {
    const equipment: PlayerEquipment = { id: 20000, level: 80, promotion: 6, rank: 1 };
    const player: PlayerCharacter = {
      id: 1001, level: 80, promotion: 6, eidolon: 0, stats: baseStats, equipment, relics: []
    };
    const result = resolveCharacter(player, gameData);
    expect(result.lightCone).toEqual({
      id: '20000', name: 'Arrows', level: 80, promotion: 6, rank: 1
    });
  });

  it('NECK -> Sphere, OBJECT -> Rope', () => {
    const relics: PlayerRelic[] = [
      { id: 31011, type: 1, level: 15, mainAffixId: 1 },
      { id: 33015, type: 5, level: 15, mainAffixId: 1 },
      { id: 33016, type: 6, level: 15, mainAffixId: 1 }
    ];
    const player: PlayerCharacter = {
      id: 1001, level: 80, promotion: 6, eidolon: 0, stats: baseStats, relics
    };
    const result = resolveCharacter(player, gameData);
    expect(result.relics).toEqual([
      { id: '31011', setId: '101', setName: 'Passerby of Wandering Cloud', slot: 'Head', rarity: 2, level: 15 },
      { id: '33015', setId: '301', setName: 'Space Sealing Station', slot: 'Sphere', rarity: 2, level: 15 },
      { id: '33016', setId: '301', setName: 'Space Sealing Station', slot: 'Rope', rarity: 2, level: 15 }
    ]);
  });

  it('mainStat/subStats undefined (not decoded)', () => {
    const relics: PlayerRelic[] = [{ id: 31011, type: 1, level: 15, mainAffixId: 1 }];
    const player: PlayerCharacter = { id: 1001, level: 80, promotion: 6, eidolon: 0, stats: baseStats, relics };
    const result = resolveCharacter(player, gameData);
    expect(result.relics[0].mainStat).toBeUndefined();
    expect(result.relics[0].subStats).toBeUndefined();
  });

  it('throws on unknown character id', () => {
    const player: PlayerCharacter = { id: 999999, level: 1, promotion: 0, eidolon: 0, stats: baseStats, relics: [] };
    expect(() => resolveCharacter(player, gameData)).toThrow(HSRDataNotFoundError);
  });
});

describe('resolveLightCone', () => {
  it('throws on unknown light cone id', () => {
    const equipment: PlayerEquipment = { id: 999999, level: 1, promotion: 0, rank: 1 };
    expect(() => resolveLightCone(equipment, gameData.lightCones)).toThrow(HSRDataNotFoundError);
  });
});

describe('resolveRelic', () => {
  it('throws on unknown relic id', () => {
    const relic: PlayerRelic = { id: 999999, type: 1, level: 1, mainAffixId: 1 };
    expect(() => resolveRelic(relic, gameData.relics, gameData.relicSets)).toThrow(HSRDataNotFoundError);
  });

  it('falls back to raw set_id if set missing', () => {
    const relic: PlayerRelic = { id: 31011, type: 1, level: 15, mainAffixId: 1 };
    const result = resolveRelic(relic, gameData.relics, {});
    expect(result.setName).toBe('101');
  });
});
