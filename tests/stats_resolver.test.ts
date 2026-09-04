import { describe, it, expect } from 'vitest';
import { resolveFullStats } from '../src/resolvers/stats.js';
import { createEmptyStats } from '../src/types/stats.js';
import type { PlayerCharacter } from '../src/types/player.js';
import type { StatsResolverData } from '../src/resolvers/stats.js';
import { ENKA_PROPERTY_MAP } from '../src/constants/enka_properties.js';

const data: StatsResolverData = {
  skillTrees: {
    '1001201': {
      id: '1001201', name: 'DMG Boost: Ice', max_level: 1, anchor: 'Point09',
      levels: [{ promotion: 0, level: 1, properties: [{ type: 'IceAddedRatio', value: 0.032 }] }], icon: ''
    },
    '1001202': {
      id: '1001202', name: 'DEF Boost', max_level: 1, anchor: 'Point10',
      levels: [{ promotion: 2, level: 0, properties: [{ type: 'DefenceAddedRatio', value: 0.05 }] }], icon: ''
    },
    '1001001': {
      id: '1001001', name: '', max_level: 6, anchor: 'Point01',
      levels: [{ promotion: 0, level: 0, properties: [] }], icon: ''
    }
  },
  lightConeRanks: {
    '20003': {
      id: '20003', skill: 'Stasis', desc: 'test', params: [[0.16, 0.5, 0.16]],
      properties: [
        [{ type: 'DefenceAddedRatio', value: 0.16 }],
        [{ type: 'DefenceAddedRatio', value: 0.20 }],
        [{ type: 'DefenceAddedRatio', value: 0.24 }],
        [{ type: 'DefenceAddedRatio', value: 0.28 }],
        [{ type: 'DefenceAddedRatio', value: 0.32 }]
      ]
    },
    '20000': {
      id: '20000', skill: 'Crisis', desc: 'test', params: [[0.12, 3]],
      properties: [[], [], [], [], []]
    }
  },
  relicSets: {
    '102': {
      id: '102', name: 'Musketeer of Wild Wheat', icon: '', desc: ['2pc', '4pc'],
      properties: [[{ type: 'AttackAddedRatio', value: 0.12 }], [{ type: 'SpeedAddedRatio', value: 0.06 }]]
    },
    '104': {
      id: '104', name: 'Hunter of Glacial Forest', icon: '', desc: ['2pc', '4pc'],
      properties: [[{ type: 'IceAddedRatio', value: 0.1 }], []]
    }
  },
  relics: {
    '61011': { id: '61011', name: 'Head', set_id: '102', rarity: 5, type: 'HEAD', icon: '' },
    '61012': { id: '61012', name: 'Hands', set_id: '102', rarity: 5, type: 'HAND', icon: '' },
    '61013': { id: '61013', name: 'Body', set_id: '102', rarity: 5, type: 'BODY', icon: '' },
    '61014': { id: '61014', name: 'Feet', set_id: '102', rarity: 5, type: 'FOOT', icon: '' },
    '63041': { id: '63041', name: 'Sphere', set_id: '104', rarity: 5, type: 'NECK', icon: '' },
    '63042': { id: '63042', name: 'Rope', set_id: '104', rarity: 5, type: 'OBJECT', icon: '' }
  },
  characterPromotions: {
    '1001': {
      id: '1001',
      values: [
        { hp: { base: 144, step: 7.2 }, atk: { base: 69.6, step: 3.48 }, def: { base: 78, step: 3.9 }, spd: { base: 101, step: 0 }, crit_rate: { base: 0.05, step: 0 }, crit_dmg: { base: 0.5, step: 0 }, taunt: { base: 150, step: 0 } },
        { hp: { base: 201.6, step: 7.2 }, atk: { base: 97.44, step: 3.48 }, def: { base: 109.2, step: 3.9 }, spd: { base: 101, step: 0 }, crit_rate: { base: 0.05, step: 0 }, crit_dmg: { base: 0.5, step: 0 }, taunt: { base: 150, step: 0 } },
        { hp: { base: 259.2, step: 7.2 }, atk: { base: 125.28, step: 3.48 }, def: { base: 140.4, step: 3.9 }, spd: { base: 101, step: 0 }, crit_rate: { base: 0.05, step: 0 }, crit_dmg: { base: 0.5, step: 0 }, taunt: { base: 150, step: 0 } },
        { hp: { base: 316.8, step: 7.2 }, atk: { base: 153.12, step: 3.48 }, def: { base: 171.6, step: 3.9 }, spd: { base: 101, step: 0 }, crit_rate: { base: 0.05, step: 0 }, crit_dmg: { base: 0.5, step: 0 }, taunt: { base: 150, step: 0 } },
        { hp: { base: 374.4, step: 7.2 }, atk: { base: 180.96, step: 3.48 }, def: { base: 202.8, step: 3.9 }, spd: { base: 101, step: 0 }, crit_rate: { base: 0.05, step: 0 }, crit_dmg: { base: 0.5, step: 0 }, taunt: { base: 150, step: 0 } },
        { hp: { base: 432, step: 7.2 }, atk: { base: 208.8, step: 3.48 }, def: { base: 234, step: 3.9 }, spd: { base: 101, step: 0 }, crit_rate: { base: 0.05, step: 0 }, crit_dmg: { base: 0.5, step: 0 }, taunt: { base: 150, step: 0 } },
        { hp: { base: 489.6, step: 7.2 }, atk: { base: 236.64, step: 3.48 }, def: { base: 265.2, step: 3.9 }, spd: { base: 101, step: 0 }, crit_rate: { base: 0.05, step: 0 }, crit_dmg: { base: 0.5, step: 0 }, taunt: { base: 150, step: 0 } }
      ]
    }
  }
};

function char(overrides: Partial<PlayerCharacter> = {}): PlayerCharacter {
  return { id: 1001, level: 80, promotion: 6, eidolon: 0, stats: createEmptyStats(), statsSource: 'flatProps', relics: [], ...overrides };
}

describe('resolveFullStats', () => {
  it('base HP/ATK/DEF/SPD from promotions', () => {
    const s = resolveFullStats(char(), data);
    // promotion 6, level 80: base + step * 79
    expect(s.baseHp).toBeCloseTo(489.6 + 7.2 * 79, 1);
    expect(s.baseAtk).toBeCloseTo(236.64 + 3.48 * 79, 1);
    expect(s.baseDef).toBeCloseTo(265.2 + 3.9 * 79, 1);
    expect(s.baseSpeed).toBe(101);
    expect(s.critRate).toBeCloseTo(0.05, 4);
    expect(s.critDmg).toBeCloseTo(0.50, 4);
  });

  it('promo 0 lvl 1 = raw base', () => {
    const s = resolveFullStats(char({ level: 1, promotion: 0 }), data);
    expect(s.baseHp).toBeCloseTo(144, 1);
    expect(s.baseAtk).toBeCloseTo(69.6, 1);
    expect(s.baseDef).toBeCloseTo(78, 1);
  });

  it('no promotions = zero base stats', () => {
    const { characterPromotions, ...noPromo } = data;
    const s = resolveFullStats(char(), noPromo);
    expect(s.baseHp).toBe(0);
    expect(s.critRate).toBe(0);
  });

  it('trace stat nodes sum correctly', () => {
    const c = char({
      skillTreePoints: [
        { pointId: 1001201, level: 1 },
        { pointId: 1001202, level: 1 },
        { pointId: 1001001, level: 6 } // skill node, skipped
      ]
    });
    const s = resolveFullStats(c, data);
    expect(s.iceDmgBoost).toBeCloseTo(0.032);
    expect(s.percentDef).toBeCloseTo(0.05);
  });

  it('level 0 traces ignored', () => {
    const s = resolveFullStats(char({ skillTreePoints: [{ pointId: 1001201, level: 0 }] }), data);
    expect(s.iceDmgBoost).toBe(0);
  });

  it('LC S3 = index 2 = 0.24 DEF', () => {
    const s = resolveFullStats(char({ equipment: { id: 20003, level: 80, promotion: 6, rank: 3 } }), data);
    expect(s.percentDef).toBeCloseTo(0.24);
  });

  it('LC with empty properties = base crit only', () => {
    const s = resolveFullStats(char({ equipment: { id: 20000, level: 80, promotion: 6, rank: 1 } }), data);
    expect(s.critRate).toBeCloseTo(0.05, 4);
  });

  it('2pc set bonus only', () => {
    const s = resolveFullStats(char({
      relics: [
        { id: 61011, type: 1, level: 15, mainAffixId: 1 },
        { id: 61012, type: 2, level: 15, mainAffixId: 1 }
      ]
    }), data);
    expect(s.percentAtk).toBeCloseTo(0.12);
    expect(s.percentSpeed).toBe(0);
  });

  it('4pc = 2pc + 4pc bonus', () => {
    const s = resolveFullStats(char({
      relics: [
        { id: 61011, type: 1, level: 15, mainAffixId: 1 },
        { id: 61012, type: 2, level: 15, mainAffixId: 1 },
        { id: 61013, type: 3, level: 15, mainAffixId: 1 },
        { id: 61014, type: 4, level: 15, mainAffixId: 1 }
      ]
    }), data);
    expect(s.percentAtk).toBeCloseTo(0.12);
    expect(s.percentSpeed).toBeCloseTo(0.06);
  });

  it('2+2 mixed sets', () => {
    const s = resolveFullStats(char({
      relics: [
        { id: 61011, type: 1, level: 15, mainAffixId: 1 },
        { id: 61012, type: 2, level: 15, mainAffixId: 1 },
        { id: 63041, type: 5, level: 15, mainAffixId: 1 },
        { id: 63042, type: 6, level: 15, mainAffixId: 1 }
      ]
    }), data);
    expect(s.percentAtk).toBeCloseTo(0.12);
    expect(s.iceDmgBoost).toBeCloseTo(0.1);
  });

  it('all sources combined', () => {
    const s = resolveFullStats(char({
      skillTreePoints: [{ pointId: 1001201, level: 1 }],
      equipment: { id: 20003, level: 80, promotion: 6, rank: 1 },
      relics: [
        { id: 63041, type: 5, level: 15, mainAffixId: 1 },
        { id: 63042, type: 6, level: 15, mainAffixId: 1 }
      ]
    }), data);
    expect(s.iceDmgBoost).toBeCloseTo(0.032 + 0.1);
    expect(s.percentDef).toBeCloseTo(0.16);
    expect(s.critRate).toBeCloseTo(0.05, 4);
    expect(s.baseSpeed).toBe(101);
  });

  it('does not mutate input', () => {
    const c = char({ skillTreePoints: [{ pointId: 1001201, level: 1 }] });
    const before = c.stats.iceDmgBoost;
    resolveFullStats(c, data);
    expect(c.stats.iceDmgBoost).toBe(before);
  });

  it('out of range promotion falls back to tier 0', () => {
    const s = resolveFullStats(char({ level: 1, promotion: 99 }), data);
    expect(s.baseHp).toBeCloseTo(144, 1);
  });

  it('statsMap path skips promotion base stats', () => {
    const prePopulated = createEmptyStats();
    prePopulated.baseHp = 1047.82;
    prePopulated.baseAtk = 582.12;
    prePopulated.baseDef = 485.64;
    prePopulated.baseSpeed = 96;
    prePopulated.critRate = 0.302;
    prePopulated.critDmg = 1.124;

    const c = char({ stats: prePopulated, statsSource: 'statsMap' });
    const s = resolveFullStats(c, data);

    expect(s.baseHp).toBe(1047.82);
    expect(s.baseAtk).toBe(582.12);
    expect(s.baseDef).toBe(485.64);
    expect(s.baseSpeed).toBe(96);
    expect(s.critRate).toBe(0.302);
    expect(s.critDmg).toBe(1.124);
  });

  it('flatProps path adds promotion base stats', () => {
    const c = char({ statsSource: 'flatProps' });
    const s = resolveFullStats(c, data);
    // promotion 6, level 80: base + step * 79
    expect(s.baseHp).toBeCloseTo(489.6 + 7.2 * 79, 1);
    expect(s.baseAtk).toBeCloseTo(236.64 + 3.48 * 79, 1);
    expect(s.baseDef).toBeCloseTo(265.2 + 3.9 * 79, 1);
    expect(s.baseSpeed).toBe(101);
    expect(s.critRate).toBeCloseTo(0.05, 4);
    expect(s.critDmg).toBeCloseTo(0.50, 4);
  });
});

describe('ENKA_PROPERTY_MAP coverage', () => {
  const allTypes = new Set<string>();

  for (const tree of Object.values(data.skillTrees)) {
    for (const lvl of tree.levels) {
      for (const p of lvl.properties) allTypes.add(p.type);
    }
  }
  for (const lc of Object.values(data.lightConeRanks)) {
    for (const rank of lc.properties) {
      for (const p of rank) allTypes.add(p.type);
    }
  }
  for (const set of Object.values(data.relicSets)) {
    for (const tier of set.properties) {
      for (const p of tier) allTypes.add(p.type);
    }
  }

  const emptyStats = createEmptyStats();

  it('every property type in fixture data maps to a valid ComputedStats key', () => {
    const unmapped: string[] = [];
    for (const type of allTypes) {
      const mapped = ENKA_PROPERTY_MAP[type];
      if (!mapped || !(mapped in emptyStats)) {
        unmapped.push(type);
      }
    }
    expect(unmapped).toEqual([]);
  });
});
