# starrail-sdk

[![npm version](https://img.shields.io/npm/v/starrail-sdk.svg)](https://www.npmjs.com/package/starrail-sdk)
[![CI](https://github.com/Vyrina/starrail-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/Vyrina/starrail-sdk/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/Vyrina/starrail-sdk/branch/main/graph/badge.svg)](https://codecov.io/gh/Vyrina/starrail-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

TypeScript SDK for **Honkai: Star Rail** theorycrafting, stat calculations, and API integration ([Enka.Network](https://enka.network) & [StarRailRes](https://github.com/Mar-7th/StarRailRes)).

Features zero-dependency math functions for damage, break/super break, turn order/AV, status EHR, energy requirements, and relic roll values.

## Installation

```bash
npm install starrail-sdk
```

> Requires Node.js ≥ 18 (uses native `fetch`).

## Quick Start

```typescript
import {
  StarRailSDK,
  calculateDamage,
  calculateActionValue,
  calculateRealHitRate,
  getCyclesTurnCount,
} from 'starrail-sdk';

// Calculate AV & turn count
const av = calculateActionValue(134); // ~74.63
const turns = getCyclesTurnCount(134, 5); // 7 turns in 5 cycles

// Calculate damage
const dmg = calculateDamage({
  scalingStat: 3000,
  skillMultiplier: 1.1,
  dmgBoostPercent: 0.388,
  targetBaseDef: 1000,
  attackerLevel: 80,
  defShred: 0,
  defIgnore: 0,
  targetRes: 0.20,
  resPen: 0,
  vulnerabilityPercent: 0,
  isBroken: true,
  critRate: 0.50,
  critDmg: 1.00,
}, 'average');

// Debuff real hit chance
const hitRate = calculateRealHitRate(1.0, 0.40, 0.30); // 0.98

// API client
const sdk = new StarRailSDK({
  lang: 'en',
  timeoutMs: 10_000,
  maxRetries: 3,
});

const profile = await sdk.enka.getProfile('800123456');
const characters = await sdk.res.getCharacters();
```

## API Reference

### Calculators

#### Speed & Turn Order

```typescript
import {
  calculateTotalSpeed,
  calculateActionValue,
  calculateActionAdvance,
  getCyclesTurnCount,
} from 'starrail-sdk';

calculateTotalSpeed({ baseSpeed: 96, percentSpeedBonus: 0.25, flatSpeedBonus: 0 }); // 120
calculateActionValue(100); // 100.00
calculateActionAdvance(100, 100, 0.25); // 75
getCyclesTurnCount(134, 5); // 7
```

#### Damage

```typescript
import {
  calculateDamage,
  calculateDamageDetailed,
  calculateDefMultiplier,
  calculateResMultiplier,
} from 'starrail-sdk';

const detail = calculateDamageDetailed(input, 'crit');
console.log(detail.baseDamage, detail.defMult, detail.totalDamage);

calculateDefMultiplier(1000, 80, 0.5); // ~0.667
calculateResMultiplier(0.20, 0.40); // 1.20 (with RES PEN)
```

#### Break & Super Break

```typescript
import {
  calculateBreakDamage,
  calculateSuperBreakDamage,
} from 'starrail-sdk';

calculateBreakDamage({
  attackerLevel: 80,
  element: 'Fire',
  breakEffect: 2.5,
  toughnessMax: 360,
  targetBaseDef: 1000,
  defShred: 0, defIgnore: 0,
  targetRes: 0, resPen: 0,
  vulnerabilityPercent: 0,
});

calculateSuperBreakDamage({
  attackerLevel: 80,
  toughnessReduce: 30,
  breakEffect: 2.5,
  superBreakBuff: 0.60,
  targetBaseDef: 1000,
  defShred: 0, defIgnore: 0,
  targetRes: 0, resPen: 0,
  vulnerabilityPercent: 0,
});
```

#### Status & EHR

```typescript
import { calculateRealHitRate } from 'starrail-sdk';

calculateRealHitRate(1.0, 0.40, 0.30); // 0.98
```

#### Energy & Rotation

```typescript
import { calculateEnergyGain, canReachUltimate } from 'starrail-sdk';

calculateEnergyGain(30, 0.194); // 35.82

canReachUltimate(
  [{ baseEnergy: 30 }, { baseEnergy: 30 }, { baseEnergy: 30 }, { baseEnergy: 20 }],
  120,       // ultimate cost
  0.194,     // ERR%
  5          // flat energy bonus (e.g. from energy rope)
); // true
```

#### Relic Roll Values

```typescript
import { calculateRollValue, calculateTotalRollValue } from 'starrail-sdk';

calculateRollValue('CRIT DMG', 0.0648); // 1.0

calculateTotalRollValue([
  { key: 'CRIT DMG', value: 0.1296 },
  { key: 'CRIT Rate', value: 0.0324 },
  { key: 'SPD', value: 2.6 },
]); // 4.0
```

### API Clients

#### EnkaClient

```typescript
import { EnkaClient } from 'starrail-sdk';

const enka = new EnkaClient({
  timeoutMs: 10_000,
  maxRetries: 3,
  cacheMaxSize: 200,
  cacheTtlMs: 600_000,
  providers: [
    'https://enka.network/api/hsr/uid',
    'https://mirror.example.com/api/hsr/uid',
  ],
});

EnkaClient.isValidUID('800123456'); // true

const profile = await enka.getProfile('800123456');
console.log(profile.nickname, profile.characters);
```

#### StarRailResClient

```typescript
import { StarRailResClient } from 'starrail-sdk';

const res = new StarRailResClient({
  lang: 'en', // 'en' | 'cn' | 'jp' | 'kr'
  timeoutMs: 10_000,
  maxRetries: 3,
  providers: [
    'https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/index_min',
    'https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/index_min',
  ],
});

const characters = await res.getCharacters();
const lightCones = await res.getLightCones();
const relics = await res.getRelics();
const relicSets = await res.getRelicSets();
const skillTrees = await res.getSkillTrees();
const lightConeRanks = await res.getLightConeRanks();
```

### Resolvers

Map raw Enka player data to named game objects using StarRailRes metadata.

#### Character & Equipment

```typescript
import { resolveCharacter } from 'starrail-sdk';

const profile = await enka.getProfile('800123456');
const gameData = {
  characters: await res.getCharacters(),
  lightCones: await res.getLightCones(),
  relics: await res.getRelics(),
  relicSets: await res.getRelicSets(),
};

const char = resolveCharacter(profile.characters[0], gameData);
console.log(char.name, char.element, char.path); // "March 7th" "Ice" "Preservation"
console.log(char.lightCone?.name);                // "Moment of Victory"
console.log(char.relics[0].setName);              // "Knight of Purity Palace"
```

#### Full Stats (Traces + LC Passive + Set Bonus)

```typescript
import { resolveFullStats } from 'starrail-sdk';

const statsData = {
  skillTrees: await res.getSkillTrees(),
  lightConeRanks: await res.getLightConeRanks(),
  relicSets: await res.getRelicSets(),
  relics: await res.getRelics(),
};

const fullStats = resolveFullStats(profile.characters[0], statsData);
console.log(fullStats.critRate, fullStats.critDmg); // includes trace + LC + set bonuses
```

### Errors

```typescript
import {
  HSRSDKError,
  HSRInvalidUIDError,
  HSRRateLimitError,
  HSRDataNotFoundError,
  HSRTimeoutError,
} from 'starrail-sdk';

// EnkaClient errors
try {
  await enka.getProfile('invalid');
} catch (err) {
  if (err instanceof HSRInvalidUIDError) {
    // Handle invalid UID format
  } else if (err instanceof HSRRateLimitError) {
    // Rate limited
  } else if (err instanceof HSRTimeoutError) {
    // Request timed out
  }
}

// StarRailResClient errors
try {
  await res.getCharacters();
} catch (err) {
  if (err instanceof HSRDataNotFoundError) {
    // Resource not found (404)
  } else if (err instanceof HSRTimeoutError) {
    // CDN request timed out after all retries
  } else if (err instanceof HSRSDKError) {
    // Other SDK errors (unsupported lang, server errors, etc.)
  }
}
```

## Development

```bash
# Build ESM, CJS, and TypeScript declaration files
npm run build

# Run TypeScript type check
npm run typecheck

# Run ESLint
npm run lint

# Run Vitest test suite
npm run test

# Run tests with coverage report
npm run test:coverage
```

## License

MIT

## Disclaimer

This project is an independent open-source tool and is not affiliated with or endorsed by miHoYo or HoYoverse. Honkai: Star Rail assets and game data belong to their respective owners.
