# Session Notes – Oct 1, 2025

## Completed
- Added Playwright integration for `@df/df-lit-starter` (scripts, shared config, `start:test`).
- Authored `apps/df-lit-starter/tests/integration/main-flow.spec.ts` to cover name edit, counter increment (host + shared component), and reset.
- Updated documentation (`coding_docs/INTEGRATION_TESTING.md`, `apps/df-lit-starter/README.md`) to reflect browser coverage for all three apps.
- Practice and npm-info Playwright suites already green locally earlier in this session.

## Pending Verification
- Need to run the new Lit starter Playwright suite locally: `pnpm --filter @df/df-lit-starter test:e2e` (or `pnpm --filter @df/df-lit-starter test`).
- Re-run the full matrix once more after verifying: `pnpm test`.

## Follow-ups / Ideas
- Consider extracting common Playwright helpers if more apps join (currently duplicated flag toggles and selectors).
- Evaluate Vite's Playwright starter only if we hit limitations; current setup aligns the three apps already.

## Quick Start Next Session
```bash
pnpm --filter @df/df-lit-starter test:e2e
pnpm test
```

If Playwright reports issues, inspect the trace via `pnpm exec playwright show-trace <trace.zip>`.
