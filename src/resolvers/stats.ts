import type { PlayerCharacter } from '../types/player.js';
import type { ComputedStats, StatKey } from '../types/stats.js';
import type {
  StarRailResSkillTree,
  StarRailResLightConeRank,
  StarRailResRelicSet,
  StarRailResRelic,
  StarRailResStatProperty,
  StarRailResCharacterPromotion
} from '../types/api.js';
import { ENKA_PROPERTY_MAP } from '../constants/enka_properties.js';

export interface StatsResolverData {
  skillTrees: Record<string, StarRailResSkillTree>;
  lightConeRanks: Record<string, StarRailResLightConeRank>;
  relicSets: Record<string, StarRailResRelicSet>;
  relics: Record<string, StarRailResRelic>;
  characterPromotions?: Record<string, StarRailResCharacterPromotion>;
}

/** Sums character base stats, trace, LC superimposition, and relic set bonuses into a copy of character.stats. */
export function resolveFullStats(character: PlayerCharacter, data: StatsResolverData): ComputedStats {
  const stats: ComputedStats = { ...character.stats };

  // Character base stats from promotion data
  const promo = data.characterPromotions?.[String(character.id)];
  if (promo) {
    const tier = promo.values[character.promotion] ?? promo.values[0];
    const lvl = character.level;
    stats.baseHp += tier.hp.base + tier.hp.step * (lvl - 1);
    stats.baseAtk += tier.atk.base + tier.atk.step * (lvl - 1);
    stats.baseDef += tier.def.base + tier.def.step * (lvl - 1);
    stats.baseSpeed += tier.spd.base + tier.spd.step * (lvl - 1);
    stats.critRate += tier.crit_rate.base;
    stats.critDmg += tier.crit_dmg.base;
  }

  // Trace stat nodes
  if (character.skillTreePoints) {
    for (const point of character.skillTreePoints) {
      if (point.level < 1) continue;
      const node = data.skillTrees[String(point.pointId)];
      // stat bonus nodes = max_level 1; multi-level nodes are skills, skip
      if (!node || node.max_level !== 1 || node.levels.length === 0) continue;
      applyProps(stats, node.levels[0].properties);
    }
  }

  // LC rank (superimposition) passive stats
  if (character.equipment) {
    const rankData = data.lightConeRanks[String(character.equipment.id)];
    if (rankData) {
      const idx = Math.max(0, character.equipment.rank - 1); // rank 1 = index 0
      if (idx < rankData.properties.length) {
        applyProps(stats, rankData.properties[idx]);
      }
    }
  }

  // Relic set bonuses (2pc / 4pc)
  const setCounts = new Map<string, number>();
  for (const relic of character.relics) {
    const info = data.relics[String(relic.id)];
    if (!info) continue;
    setCounts.set(info.set_id, (setCounts.get(info.set_id) ?? 0) + 1);
  }
  for (const [setId, count] of setCounts) {
    const set = data.relicSets[setId];
    if (!set?.properties) continue;
    if (count >= 2 && set.properties.length > 0) applyProps(stats, set.properties[0]);
    if (count >= 4 && set.properties.length > 1) applyProps(stats, set.properties[1]);
  }

  return stats;
}

function applyProps(stats: ComputedStats, props: StarRailResStatProperty[]): void {
  for (const p of props) {
    const k = ENKA_PROPERTY_MAP[p.type] as StatKey | undefined;
    if (k && k in stats) {
      (stats as unknown as Record<string, number>)[k] += p.value;
    }
  }
}
