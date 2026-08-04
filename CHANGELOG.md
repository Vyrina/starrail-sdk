# Changelog

All notable changes to `starrail-sdk` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
