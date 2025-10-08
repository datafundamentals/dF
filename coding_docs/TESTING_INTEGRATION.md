# Integration Testing in the DF monorepo

This guide explains how browser-level tests are organised and how to add coverage for new surfaces.

## Tooling overview

- **Web Test Runner** remains the harness for component-level checks that render Lit elements against compiled bundles (currently used by `apps/df-lit-starter`).
- **Playwright** now drives user-flow validation. Tests live alongside each app under `tests/integration` and run via the shared `playwright.config.ts` at the repo root.
- Turbo already wires `test` -> `^build`, so every package must export a `build` script that produces the assets loaded by the tests.

## Running the suites

```bash
# Install the Playwright browsers once per machine
pnpm exec playwright install --with-deps

# Run integration tests for a single app
pnpm --filter @df/df-npm-info-app test

# Execute all test tasks across the workspace
pnpm test

# Run only the Playwright layer from the repo root
pnpm test:integration -- --project=df-npm-info-app
```

> **Note:** The local sandbox used for automated checks in this repository cannot bind to TCP ports, so Playwright runs may fail in CI unless they execute on a host without that restriction. When running locally, ensure nothing is already bound to the configured port (`4173`).

## Current coverage

- `@df/df-npm-info-app`: browser smoke for happy/error handlers on the npm widget (Playwright).
- `@df/df-teaching-app`: verifies initial task hydration, host reset actions, and forced error recovery (Playwright).
- `@df/df-lit-starter`: Web Test Runner dev/prod suites plus Playwright coverage for the host shell's name + counter flows.

## Adding integration coverage to a new package

1. Implement or reuse a `start:test` script that builds the package (for type safety) and launches a deterministic dev/preview server (see `apps/df-npm-info-app/package.json`).
2. Create `tests/integration/*.spec.ts` files that rely on `playwright/test` and mock external traffic via `page.route`.
3. Register a new project in `playwright.config.ts` with a unique `baseURL` and port so tests can run in parallel.
4. Update the package’s `test` script to call `playwright test --config ../../playwright.config.ts --project=<package-name>`.
5. Extend documentation with the critical workflows each integration suite covers so contributors know when to add or update scenarios.

## What counts as “integration tested”

- The app renders from its real entry point (the same HTML or route exposed to users).
- Component events are wired into the shared state stores without manual stubbing.
- External calls (REST, GraphQL, etc.) are mocked at the network layer to keep tests deterministic, but state transitions are exercised end-to-end.
- Happy path *and* at least one failure path per critical workflow are asserted (for instance, ready and error states while fetching npm metadata).

Following these conventions keeps browser automation consistent while the repo grows additional apps or shared widgets.

## Test-only controls

- Set `window.__dfPracticeForcePracticeError = true` (and back to `false`) to force the practice widget store into its error branch. A dedicated setter helper is also exposed as `window.__dfPracticeForcePracticeErrorSetter` for convenience. Leave the flag `false` outside of tests.
