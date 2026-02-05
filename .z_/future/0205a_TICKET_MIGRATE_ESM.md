# Migrate @df/node-utils to ESM

  ## Objective

  Migrate `packages/node-utils` from CommonJS to ESM while preserving current behavior and keeping
  extension consumers (especially `extensions/df-dashboard`) fully functional.

  ## Why

  `@df/node-utils` is currently CommonJS while most workspaces are ESM-oriented. This creates
  inconsistency in import style and test/runtime expectations. This ticket aligns the package with the
  monorepo’s preferred module direction.

  ## In Scope

  - Convert `packages/node-utils` build/runtime metadata to ESM:
    - `tsconfig.json` module settings
    - `package.json` module/type/exports alignment
  - Keep the existing public API surface stable (no functional API changes).
  - Update consumers that import `@df/node-utils` as needed (at minimum `extensions/df-dashboard`).
  - Migrate node-utils tests from CJS (`.cjs`/`require`) to ESM-compatible format.
  - Validate extension compile + runtime behavior after migration.

  ## Out of Scope

  - Monorepo-wide module migration outside direct consumers.
  - Feature work unrelated to module format.
  - Refactoring dashboard/site logic beyond compatibility fixes.

  ## Files Likely Touched

  - `packages/node-utils/package.json`
  - `packages/node-utils/tsconfig.json`
  - `packages/node-utils/src/index.ts` (if export paths need normalization)
  - `packages/node-utils/tests/*`
  - `extensions/df-dashboard/src/extension.ts` (only if import interop requires it)
  - Any additional direct consumers discovered via search

  ## Implementation Notes

  - Preserve current named exports and signatures.
  - Prefer explicit ESM-compatible import/export patterns.
  - Keep changes minimal and focused on module-system compatibility.
  - Do not alter dashboard behavior or SITES.yaml mutation logic.

  ## Validation Commands

  - `pnpm --filter @df/node-utils run build`
  - `pnpm --filter @df/node-utils run test`
  - `pnpm --filter df-dashboard run compile`

  ## Manual QA

  - Launch `df-dashboard` extension host.
  - Run `DF: Open Dashboard`.
  - Verify refresh works.
  - Verify app card site add/remove still updates `SITES.yaml` correctly.

  ## Risks

  - CJS/ESM interop issues in VS Code extension bundling/runtime.
  - Import resolution edge cases (`.js` specifiers, moduleResolution mode).
  - Node test runner behavior differences between CJS and ESM.

  ## Acceptance Criteria

  - `@df/node-utils` is ESM-native.
  - Build/tests pass for node-utils.
  - `df-dashboard` compiles and functions at runtime.
  - No regressions in dashboard app-site target management.

