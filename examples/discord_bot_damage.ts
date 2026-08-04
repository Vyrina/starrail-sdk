/**
 * Discord bot /damage command example.
 * Fetches a player's Enka profile, runs damage calc, prints breakdown.
 *
 * Usage:
 *   /damage uid:800123456 character:0 skill_mult:1.5
 */

import {
  EnkaClient,
  calculateDamageDetailed,
  HSRInvalidUIDError,
  HSRDataNotFoundError,
  HSRTimeoutError,
} from '../src/index.js';
import type { DamageInput } from '../src/calculators/damage.js';

const enka = new EnkaClient({ timeoutMs: 10_000, maxRetries: 2 });

/** Handle /damage slash command. */
async function handleDamageCommand(uid: string, characterIndex: number, skillMultiplier: number) {
  // 1. Fetch live profile from Enka
  const profile = await enka.getProfile(uid);
  const char = profile.characters[characterIndex];

  if (!char) {
    console.log(`Character at index ${characterIndex} not found. ${profile.nickname} has ${profile.characters.length} character(s) on display.`);
    return;
  }

  // 2. Build damage input from live stats
  const input: DamageInput = {
    scalingStat: char.stats.baseAtk + char.stats.flatAtk + char.stats.baseAtk * char.stats.percentAtk,
    skillMultiplier,
    dmgBoostPercent: char.stats.fireDmgBoost, // adjust element per character
    targetBaseDef: 1000,     // MoC-level enemy
    attackerLevel: char.level,
    defShred: 0,
    defIgnore: 0,
    targetRes: 0.20,
    resPen: 0,
    vulnerabilityPercent: 0,
    isBroken: false,
    critRate: char.stats.critRate,
    critDmg: char.stats.critDmg,
  };

  // 3. Calculate with full breakdown
  const detail = calculateDamageDetailed(input, 'average');

  // 4. Format output (would be an embed in a real bot)
  console.log(`Damage Calc for ${profile.nickname}'s Character #${characterIndex + 1}`);
  console.log(`   Level: ${char.level} | Eidolon: ${char.eidolon}`);
  console.log(`   Effective ATK: ${input.scalingStat.toFixed(0)}`);
  console.log(`   Crit Rate: ${(char.stats.critRate * 100).toFixed(1)}%`);
  console.log(`   Crit DMG: ${(char.stats.critDmg * 100).toFixed(1)}%`);
  console.log('   ---');
  console.log(`   Base DMG:    ${detail.baseDamage.toFixed(0)}`);
  console.log(`   DMG Boost:   ×${detail.dmgBoostMult.toFixed(3)}`);
  console.log(`   DEF Mult:    ×${detail.defMult.toFixed(3)}`);
  console.log(`   RES Mult:    ×${detail.resMult.toFixed(3)}`);
  console.log(`   Crit Mult:   ×${detail.critMult.toFixed(3)}`);
  console.log(`   Toughness:   ×${detail.toughnessMult.toFixed(1)}`);
  console.log(`   Total:       ${detail.totalDamage.toFixed(0)}`);
}

// --- Entry point ---
async function main() {
  const uid = process.argv[2] ?? '800123456';
  const charIdx = Number(process.argv[3] ?? '0');
  const skillMult = Number(process.argv[4] ?? '1.5');

  try {
    await handleDamageCommand(uid, charIdx, skillMult);
  } catch (err) {
    if (err instanceof HSRInvalidUIDError) {
      console.log(`Invalid UID: "${uid}". Must be 9 digits.`);
    } else if (err instanceof HSRDataNotFoundError) {
      console.log(`Profile not found for UID ${uid}.`);
    } else if (err instanceof HSRTimeoutError) {
      console.log(`Request timed out. Enka might be down.`);
    } else {
      console.log(`Unexpected error:`, (err as Error).message);
    }
  }
}

main();
