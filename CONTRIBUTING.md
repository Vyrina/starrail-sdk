# Contributing to starrail-sdk

## Setup

```bash
git clone https://github.com/Vyrina/starrail-sdk.git
cd starrail-sdk
npm install
```

## Development Workflow

```bash
npm run typecheck   # strict TypeScript checking
npm run lint        # ESLint
npm run test        # Vitest
npm run test:coverage  # coverage report + thresholds
npm run build       # tsup → ESM + CJS + .d.ts
```

## Pull Request Checklist

- [ ] All new public APIs have JSDoc (`/** */`) documentation
- [ ] New calculator functions include a `*Detailed` variant returning a breakdown object when applicable
- [ ] Tests cover new code (target ≥ 80% line coverage)
- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm run lint` passes with zero errors
- [ ] `npm run test` passes with zero failures
- [ ] No new runtime dependencies — keep the SDK zero-dependency

## Code Style

- TypeScript strict mode, all flags enabled
- Inline `//` comments for implementation notes, `/** */` JSDoc for public API
- Error hierarchy extends `HSRSDKError`
- Calculator pattern: `calculateX(input): number` + `calculateXDetailed(input): XBreakdown`

## Commit Messages

Use conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `chore:`.
