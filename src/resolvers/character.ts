import type { PlayerCharacter, PlayerEquipment, PlayerRelic } from '../types/player.js';
import type { CharacterData, LightConeData, Element, Path } from '../types/character.js';
import type { RelicData, RelicSlot } from '../types/relic.js';
import type {
  StarRailResCharacter,
  StarRailResLightCone,
  StarRailResRelic,
  StarRailResRelicSet
} from '../types/api.js';
import {
  ELEMENT_CODE_NAME_MAP,
  PATH_CODE_NAME_MAP,
  RELIC_SLOT_CODE_NAME_MAP
} from '../constants/hsr_code_names.js';
import { HSRDataNotFoundError } from '../types/errors.js';

/** Game data needed to resolve player data into named objects. */
export interface ResolverGameData {
  characters: Record<string, StarRailResCharacter>;
  lightCones: Record<string, StarRailResLightCone>;
  relics: Record<string, StarRailResRelic>;
  relicSets: Record<string, StarRailResRelicSet>;
}

/**
 * Merges raw player character IDs with StarRailRes game data into a named CharacterData.
 * @throws {@link HSRDataNotFoundError} if the character id is missing from game data.
 */
export function resolveCharacter(character: PlayerCharacter, gameData: ResolverGameData): CharacterData {
  const charInfo = gameData.characters[String(character.id)];
  if (!charInfo) {
    throw new HSRDataNotFoundError(`character id ${character.id} not in characters.json`);
  }

  return {
    id: charInfo.id,
    name: charInfo.name,
    level: character.level,
    promotion: character.promotion,
    eidolon: character.eidolon,
    element: (ELEMENT_CODE_NAME_MAP[charInfo.element] ?? charInfo.element) as Element,
    path: (PATH_CODE_NAME_MAP[charInfo.path] ?? charInfo.path) as Path,
    stats: character.stats,
    lightCone: character.equipment ? resolveLightCone(character.equipment, gameData.lightCones) : undefined,
    relics: character.relics.map(r => resolveRelic(r, gameData.relics, gameData.relicSets))
  };
}

/**
 * @throws {@link HSRDataNotFoundError} if the light cone id is missing.
 */
export function resolveLightCone(
  equipment: PlayerEquipment,
  lightCones: Record<string, StarRailResLightCone>
): LightConeData {
  const info = lightCones[String(equipment.id)];
  if (!info) {
    throw new HSRDataNotFoundError(`light cone id ${equipment.id} not in light_cones.json`);
  }
  return {
    id: info.id,
    name: info.name,
    level: equipment.level,
    promotion: equipment.promotion,
    rank: equipment.rank
  };
}

/**
 * Falls back to raw set_id as setName if the set isn't in relicSets.
 * @throws {@link HSRDataNotFoundError} if the relic piece id is missing.
 */
export function resolveRelic(
  relic: PlayerRelic,
  relics: Record<string, StarRailResRelic>,
  relicSets: Record<string, StarRailResRelicSet>
): RelicData {
  const info = relics[String(relic.id)];
  if (!info) {
    throw new HSRDataNotFoundError(`relic id ${relic.id} not in relics.json`);
  }
  const setInfo = relicSets[info.set_id];

  return {
    id: info.id,
    setId: info.set_id,
    setName: setInfo?.name ?? info.set_id,
    slot: (RELIC_SLOT_CODE_NAME_MAP[info.type] ?? info.type) as RelicSlot,
    rarity: info.rarity,
    level: relic.level
  };
}
