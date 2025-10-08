# Integration Testing in the DF monorepo

This guide explains how browser-level tests are organised today, how to run them, and what to do when adding coverage for a new app or package.

## Tooling Overview

- **Playwright** drives user-flow validation. Each app stores specs in `tests/integration/` and runs them through the shared `playwright.config.ts`.
- **Web Test Runner (WTR)** still powers the lit-starter component suite (`apps/df-lit-starter/tests`). Other apps rely solely on Playwright.
- **Turbo graph** ensures `pnpm test` runs workspace builds before executing tests. Every workspace must expose a `build` script that emits the assets consumed by tests.

## Command Matrix

Always verify commands in documentation against the relevant `package.json` before relying on them; incorrect instructions must be fixed immediately.

| Workspace | Local dev server | Integration tests | Notes |
| --- | --- | --- | --- |
| `@df/df-npm-info-app` | `pnpm --filter @df/df-npm-info-app dev` (Vite) | `pnpm --filter @df/df-npm-info-app test` | `start:test` serves on port 4173 for Playwright |
| `@df/df-teaching-app` | `pnpm --filter @df/df-teaching-app dev` | `pnpm --filter @df/df-teaching-app test` | Supports forced-error toggles for negative paths |
| `@df/df-lit-starter` | `pnpm --filter @df/df-lit-starter dev` | `pnpm --filter @df/df-lit-starter test` | Runs WTR (dev + prod) then Playwright |

Repo-level helpers:

```bash
# Install Playwright browsers once per machine
pnpm exec playwright install --with-deps

# Run every workspace test target
pnpm test

# Run only the Playwright layer across projects
pnpm test:integration
```

> **Local port usage:** Playwright spins up Vite dev servers on `127.0.0.1:4173-4175`. Ensure those ports are free before running the suites.

## Current Coverage Snapshot

- `@df/df-npm-info-app` exercises happy/error registry flows and store snapshots.
- `@df/df-teaching-app` verifies task hydration, host-driven reload/reset, and forced failure recovery.
- `@df/df-lit-starter` runs the WTR component harness plus Playwright coverage for the host shell.

## Adding Integration Coverage to a New Workspace

1. **Build script** – Provide a `build` script that compiles the TypeScript entrypoints.
2. **Deterministic server** – Add a `start:test` script that runs `pnpm build` and launches a Vite dev server with `--strictPort` and a unique port.
3. **Playwright specs** – Create `tests/integration/*.spec.ts` using `playwright/test`. Mock external traffic via `page.route` where needed.
4. **Config registration** – Add a project entry to `playwright.config.ts` with the workspace test directory and base URL.
5. **Package test script** – Call Playwright with the shared config: `playwright test --config ../../playwright.config.ts --project=<name>`.
6. **Documentation** – Update this file and the workspace README with accurate commands immediately after wiring the suite.

## Integration Test Definition

- The app renders from its real entry point (the same HTML or route exposed to users).
- Component events are wired into the shared state stores without manual stubbing.
- External calls are mocked at the network layer to keep tests deterministic while still exercising state transitions.
- Critical workflows cover both success and failure states.

## Test-only Controls

- `apps/df-teaching-app` exposes `window.__dfPracticeForcePracticeErrorSetter(flag)` for forcing error paths during tests. Always reset the flag to `false` when cleaning up.
