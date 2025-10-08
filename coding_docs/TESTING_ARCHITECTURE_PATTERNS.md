# Testing Architecture Patterns

This file highlights the high-level approaches currently in use. For day-to-day commands, required scripts, and per-workspace details, rely on `coding_docs/TESTING_INTEGRATION.md`.

## Patterns in Use

- **Hybrid (WTR + Playwright)** – `apps/df-lit-starter` keeps the upstream Web Test Runner suite for component-level checks and then runs Playwright for host flows. Use this pattern when a workspace ships both reusable components and an integration harness.
- **Playwright-only** – `apps/df-teaching-app` and `apps/df-npm-info-app` rely solely on Playwright because their value lies in end-to-end workflows rather than isolated component tests.

## Shared Expectations

- Every workspace exposes `build`, `start:test`, and `test` scripts that align with the root Turbo graph.
- Vite is the deterministic dev server for Playwright runs (`127.0.0.1` with `--strictPort`); select a unique port per project.
- All Playwright projects are registered in `playwright.config.ts`; update that file whenever onboarding a new workspace.
- Update documentation immediately after creating or changing scripts so instructions stay accurate.

## Planning Checklist for New Workspaces

1. Decide whether you need a component-level harness (WTR) or if Playwright coverage is sufficient.
2. Implement the script trio (`build`, `start:test`, `test`) before writing docs.
3. Register the project in `playwright.config.ts` with the unique port and test directory.
4. Capture critical workflows (success and failure) in Playwright specs.
5. Update `coding_docs/TESTING_INTEGRATION.md` and the workspace README once the suite is runnable.
