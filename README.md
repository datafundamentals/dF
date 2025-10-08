# df

datafundamentals monorepo

## Workspaces
- `apps/` – runnable front ends and local tooling (e.g., `df-lit-starter`, `df-storybook`)
- `packages/` – shareable libraries consumed across apps (e.g., `ui-lit`)
- `services/` – backend-oriented projects and API facades

Turbo and pnpm see every workspace via `pnpm-workspace.yaml`, so all standard commands (`pnpm install`, `pnpm dev`, `pnpm build`, etc.) can be run from the repo root.

## Getting Started
1. Install dependencies once after cloning: `pnpm install`
2. Launch all dev servers: `pnpm dev`
3. Scope commands to a workspace when you only need one package: `pnpm --filter <workspace> <command>`

### Shared UI Components (`packages/ui-lit`)
- Houses reusable Lit elements consumed by multiple apps.
- Build output lives in `packages/ui-lit/dist`; regenerate it with `pnpm --filter @df/ui-lit run build`.
- Lint before publishing changes: `pnpm --filter @df/ui-lit run lint`
- Unit tests (if present) can be added under `packages/ui-lit/test` and run via `pnpm --filter @df/ui-lit test`
- TypeScript consumers import via `@df/ui-lit/...` (for example `import '@df/ui-lit/my-element'`); Storybook maps that alias to the source directory while apps consume the built output from `dist`.
- When iterating on components, run `pnpm --filter @df/ui-lit run build --watch` in a second terminal so dependent apps pick up the latest `dist` output.

### Storybook (`apps/df-storybook`)
- Runs `@storybook/web-components-vite` against the shared components in `packages/ui-lit`.
- Dev server: `pnpm --filter @df/df-storybook run dev`
- Static build: `pnpm --filter @df/df-storybook run build` (outputs to `apps/df-storybook/storybook-static`)
- Lint stories: `pnpm --filter @df/df-storybook run lint`
- Use `pnpm test` from the root to execute Storybook interaction tests once they are added (they live alongside stories)
- Stories import components through the same `@df/ui-lit/...` aliases used by the apps.

### Lit Starter App (`apps/df-lit-starter`)
- Demonstrates integration of shared components into an application shell.
- The local `MyElement` re-exports the implementation from `@df/ui-lit/my-element`, so any changes flow through Storybook and the starter simultaneously.
- Analyzer scripts reference the shared source: `pnpm --filter @df/df-lit-starter run analyze`

## Helpful Commands
- `pnpm lint` – run linting across every workspace
- `pnpm test` – run the configured test suites (add `--filter` for a single package)
- `pnpm build` – build all workspaces; each runs after its dependencies thanks to Turbo’s graph
- `pnpm clean` – clear workspaces’ `dist` folders and `.turbo` cache

When adding new packages or apps, register them under the appropriate directory (`apps/`, `packages/`, or `services/`) so pnpm/turbo automatically picks them up.
