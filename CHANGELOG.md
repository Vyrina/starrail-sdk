# Changelog

All notable changes to `starrail-sdk` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
