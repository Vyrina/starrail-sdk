# Changelog

All notable changes to `starrail-sdk` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.3.0] - 2026-08-31

### Added
- `resolveFullStats` now computes character base HP/ATK/DEF/SPD from `character_promotions.json`.
- `StarRailResClient.getCharacterPromotions()`.
- `headIcon` on `PlayerProfile`.
- `characterPromotions` on `StatsResolverData` and `StarRailResCharacterPromotion` types.

### Changed
- Base CRIT (5% CR / 50% CD) moved from `EnkaClient` to `resolveFullStats` via promotion data.

## [2.2.0] - 2026-08-30

### Added
- `resolveCharacter`, `resolveLightCone`, `resolveRelic` for mapping Enka IDs to StarRailRes game data.
- `resolveFullStats` for aggregating trace, LC rank, and relic set stat bonuses.
- `StarRailResClient.getSkillTrees()` and `StarRailResClient.getLightConeRanks()`.
- `skillTreePoints` on `PlayerCharacter`, `subAffixes` on `PlayerRelic`.
- Codename maps for element, path, and relic slot (`hsr_code_names.ts`).

### Fixed
- `EnkaClient` now computes character stats from equipment and relic `_flat.props` when `_statsMap` is omitted by Enka.

## [2.1.0] - 2026-08-28

### Added
- `calculateTotalRollValueDetailed` for a per-substat roll value breakdown.

### Fixed
- `calculateRealHitRate` is now clamped to a maximum of 100%.
- `StarRailResClient` now throws `HSRRateLimitError` on 429, consistent with `EnkaClient`.
- `EnkaClient` now throws a clear error when a profile has no detail data (private/uncached).
- Wrong JSDoc substat key example in `relic.ts`.

### Changed
- `calculateResMultiplier`/`calculateCritMultiplier` now use internal `clamp()` utility (no output change).

## [2.0.3] - 2026-08-24

### Fixed
- Break Damage toughness multiplier was using the wrong divisor (120 instead of 40).
- Level Multiplier table had incorrect values at levels 20/50/60.
- Relic DEF% max roll was wrong (0.0432 instead of 0.054).

## [2.0.2] - 2026-08-17

### Fixed
- Fixed CommonJS bundle emitting `.js` instead of `.cjs`, which caused `MODULE_NOT_FOUND` when using `require()`.
- Fixed `canReachUltimate` parameter documentation in README (4th arg represents flat energy bonus).
- Aligned CONTRIBUTING coverage target with Vitest config thresholds.

## [2.0.1] - 2026-08-04

### Fixed
- `calculateResMultiplier` now clamps result to a minimum of 0, consistent with `calculateDefMultiplier`.

### Added
- JSDoc comments for all calculator functions and API client classes.
- Request deduplication tests for `EnkaClient` and `StarRailResClient`.
- `StarRailResClient` error handling example in README.
- New example: `examples/discord_bot_damage.ts`.

## [2.0.0] - 2026-07-27

### Added
- Initial release of `starrail-sdk`.
- Calculations for Damage, Break/Super Break, Turn Timeline, Status EHR, Energy, and Relic Roll Values.
- API integration for Enka.Network and StarRailRes.
- Multi-provider fallback support for `StarRailResClient` with default CDN mirrors (`raw.githubusercontent.com` and `cdn.jsdelivr.net`).
- Custom `resProviders` and `enkaProviders` option fields in `StarRailSDKOptions`.
- Runnable `examples/` directory and full TypeScript definitions.

### Fixed
- Cache key scoping for `StarRailResClient` when multiple language instances are used.
