<img src="https://datafundamentals.com/static/datafundamentals.gif" alt="datafundamentals" />

# df

datafundamentals monorepo for:
- playing
- learning
- teaching
- building apps in a day without using whacko vibe coding with dead-end non-standard libraries

Read [Why?](./WHY.md) for insights on what motivates the maintenance of this repository, and why you might even be interested.

_**Extra Bonus:**_ This monorepo is so full of markdown docs for coding agents, any time you get lost you can probably just ask your favorite coding agent what to do next, and it will know, just from reading all the docs.

## Workspaces
- `apps/` – runnable front ends and local tooling (e.g., `df-lit-starter`, `df-storybook`)
- `packages/` – shareable libraries consumed across apps (e.g., `ui-lit`)
- `services/` – backend-oriented projects and API facades

Turbo and pnpm see every workspace via `pnpm-workspace.yaml`, so all standard commands (`pnpm install`, `pnpm dev`, `pnpm build`, etc.) can be run from the repo root.

## Getting Started
1. Install dependencies once after cloning: `pnpm install`
2. Launch all dev servers: `pnpm dev` [Is this true? Port conflicts???]
3. Scope commands to a workspace when you only need one package: `pnpm --filter <workspace> <command>`
4. Before copying a command into documentation, confirm it exists in the target `package.json`.

### Shared UI Components (`packages/ui-lit`)
- Houses reusable Lit elements consumed by multiple apps.
- Key components include:
- `df-auth-wrapper` – Google Sign-In authentication wrapper for protecting content (enable the developer-only Auth Emulator panel with the `emailPw` attribute)
  - Firebase auth components (`df-sign-in`, `df-sign-out`, `df-user-profile`)
  - Firestore components (`df-firestore-list`, `df-firestore-form`)
  - File storage components (`df-file-list`, `df-file-delete`)
  - Utility components (`df-segmented-button`, `df-upload-link`, `df-practice-widget`)
- Build output lives in `packages/ui-lit/dist`; regenerate it with `pnpm --filter @df/ui-lit run build`.
- Lint before publishing changes: `pnpm --filter @df/ui-lit run lint`.
- There is no standalone test script today; component behavior is covered through the consuming app harnesses.
- TypeScript consumers import via `@df/ui-lit/...` (for example `import '@df/ui-lit/my-element'`); apps consume the built output from `dist` while local harnesses point at source.
- When iterating on components, run `pnpm --filter @df/ui-lit run build --watch` in a second terminal so dependent apps pick up the latest `dist` output.
- **All components have Storybook stories** in `apps/df-storybook/stories/` for visual documentation and testing.

### Storybook (`apps/df-storybook`)
- Runs `@storybook/web-components-vite` against the shared components in `packages/ui-lit`.
- Dev server: `pnpm --filter @df/df-storybook run dev`
- Static build: `pnpm --filter @df/df-storybook run build` (outputs to `apps/df-storybook/storybook-static`)
- Lint stories: `pnpm --filter @df/df-storybook run lint`
- Use `pnpm test` from the root to execute Storybook interaction tests once they are added (they live alongside stories)
- Stories import components through the same `@df/ui-lit/...` aliases used by the apps.

### Lit Starter App (`apps/df-lit-starter`)
- Demonstrates integration of shared components into an application shell.
- The local `MyElement` re-exports the implementation from `@df/ui-lit/my-element`, so any changes flow through the teaching harnesses simultaneously.
- Analyzer scripts reference the shared source: `pnpm --filter @df/df-lit-starter run analyze`.
- `pnpm --filter @df/df-lit-starter test` runs Web Test Runner suites followed by Playwright flows.

### Deployment Model
- 11ty is the default hosting mechanism for deployed apps; each workspace ships Rollup bundles that can be consumed by external 11ty instances.
- Vite remains the local development server used by both developers and Playwright.
- Most production 11ty sites live outside this repo; the lit-starter app preserves its upstream 11ty demo purely for teaching purposes.

## Helpful Commands
- `pnpm lint` – run linting across every workspace
- `pnpm test` – run the configured test suites (add `--filter` for a single package)
- `pnpm build` – build all workspaces; each runs after its dependencies thanks to Turbo’s graph
- `pnpm clean` – clear workspaces’ `dist` folders and `.turbo` cache

When adding new packages or apps, register them under the appropriate directory (`apps/`, `packages/`, or `services/`) so pnpm/turbo automatically picks them up.
