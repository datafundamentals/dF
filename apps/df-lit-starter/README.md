# LitElement TypeScript starter

This workspace continues to use the upstream `lit-starter-ts` app as a teaching tool. It wires the shared `<my-element>` widget from `@df/ui-lit` into a signals-first store from `@df/state`, mirroring the patterns used across Data Fundamentals apps. Where the upstream template references `npm`, the commands below translate those steps into pnpm workspace scripts.

## Monorepo usage

Run all commands from the repository root and scope them with `pnpm --filter @df/df-lit-starter`:

```bash
# Build once (TypeScript only)
pnpm --filter @df/df-lit-starter run build

# Watch TypeScript rebuilds
pnpm --filter @df/df-lit-starter run build:watch

# Launch the Vite dev server
pnpm --filter @df/df-lit-starter run dev

# Execute the full test suite (Web Test Runner + Playwright)
pnpm --filter @df/df-lit-starter run test

# Playwright-only integration flows
pnpm --filter @df/df-lit-starter run test:e2e

# Start the deterministic server used by Playwright (`start:test`)
pnpm --filter @df/df-lit-starter run start:test
```

The command set mirrors the original template while fitting into pnpm’s workspace model. Always confirm commands in `apps/df-lit-starter/package.json` before updating documentation.

## About this release

This project tracks Lit 3.x just like the upstream starter:

- Drops support for IE11
- Ships modern (ES2021) output
- Removes deprecated Lit 1.x APIs

Lit 2.x and 3.x remain interoperable. For upstream release notes and additional guidance, see the [lit-starter-ts README](https://github.com/lit/lit/tree/main/packages/lit-starter-ts).

## Setup

Install dependencies from the monorepo root:

```bash
pnpm install
```

## Build

Use the TypeScript compiler to produce JavaScript for modern browsers:

```bash
pnpm --filter @df/df-lit-starter run build
```

Watch for incremental builds during development:

```bash
pnpm --filter @df/df-lit-starter run build:watch
```

## Testing

This workspace runs Web Test Runner for component coverage (dev + prod) and Playwright for browser flows:

```bash
# Full suite
pnpm --filter @df/df-lit-starter run test

# Web Test Runner (dev mode)
pnpm --filter @df/df-lit-starter run test:dev

# Web Test Runner (watch)
pnpm --filter @df/df-lit-starter run test:watch

# Web Test Runner (prod mode)
pnpm --filter @df/df-lit-starter run test:prod

# Playwright integration flows
pnpm --filter @df/df-lit-starter run test:e2e
```

## Dev Server

Start the Vite dev server to preview the project without additional build steps:

```bash
pnpm --filter @df/df-lit-starter run serve
```

- Visit `/dev/index.html` while the server is running to load the teaching harness.
- Use `pnpm --filter @df/df-lit-starter run serve:prod` to emulate production mode.

> **11ty note:** The upstream template bundles an Eleventy documentation site. We keep that structure for teaching purposes, but other apps in this monorepo ship Rollup bundles for consumption by external 11ty deployments instead of hosting 11ty inside the repo.

## Editing support

- Install the [lit-plugin extension](https://marketplace.visualstudio.com/items?itemName=runem.lit-plugin) for Lit-specific editor features.
- Run `pnpm --filter @df/df-lit-starter run analyze` to regenerate `custom-elements.json` and docs metadata.

## Linting & Formatting

```bash
pnpm --filter @df/df-lit-starter run lint
pnpm exec prettier "apps/df-lit-starter/**/*.{cjs,html,js,json,md,ts}" --write
```

## Static Site (Eleventy)

The upstream documentation site remains available for reference:

```bash
# Generate docs
pnpm --filter @df/df-lit-starter run docs

# Serve the generated docs locally
pnpm --filter @df/df-lit-starter run docs:serve

# Regenerate docs on change
pnpm --filter @df/df-lit-starter run docs:gen:watch
```

GitHub Pages configuration mirrors the upstream instructions (serve from `/docs` on the default branch) should you choose to publish the demo.

## Staying Aligned with Upstream

Whenever the Lit team updates `lit-starter-ts`, review the diff and reconcile:

1. Re-run `pnpm --filter @df/df-lit-starter run analyze` to capture manifest changes.
2. Update dependency ranges to match upstream.
3. Re-test using the commands above to ensure the pnpm workflow still functions.
