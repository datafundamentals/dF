# Harden df-dashboard Node Utils Dynamic Import

## Objective

Add resilient error handling around `@df/node-utils` dynamic import in `extensions/df-dashboard` so import failures produce clear user-visible feedback and safe command behavior.

## Why

`df-dashboard` now loads `@df/node-utils` at runtime via dynamic import for ESM/CJS interop. If module resolution or runtime loading fails, current behavior can throw without a clear path for users. This ticket makes failure mode explicit and recoverable.

## In Scope

- Wrap dynamic import bootstrap in `try/catch`.
- Surface a clear `vscode.window.showErrorMessage(...)` when load fails.
- Write error details to `DF Dashboard` output channel.
- Ensure dashboard message handlers fail gracefully when node-utils is unavailable.
- Keep existing happy-path behavior unchanged.

## Out of Scope

- Changing `@df/node-utils` APIs or packaging.
- Refactoring dashboard feature logic beyond import-failure handling.
- Adding telemetry/back-end reporting.

## Files Likely Touched

- `extensions/df-dashboard/src/extension.ts`

## Implementation Notes

- Keep module-load caching pattern (`nodeUtilsPromise`) but make rejected state explicit.
- Prefer a small helper that returns `NodeUtilsModule | undefined` (or throws typed error) and centralizes UX messaging.
- Avoid duplicate popup spam on repeated command invocations (log every time; gate UI message if needed).

## Validation Commands

- `pnpm --filter df-dashboard run compile`
- `pnpm --filter df-dashboard run build`

## Manual QA

- Launch extension host.
- Run `DF: Open Dashboard` in normal conditions (no behavior changes expected).
- Simulate import failure (temporary wrong package name or mocked throw), then verify:
  - User sees actionable error message.
  - Output channel includes stack/error context.
  - Extension does not crash and command exits safely.

## Risks

- Over-catching could hide non-import runtime errors if boundaries are too broad.
- Repeated error prompts could degrade UX if not deduplicated.

## Acceptance Criteria

- Import failures are caught and handled without crashing the extension host flow.
- User receives clear in-product feedback.
- Output channel logs root-cause details for debugging.
- Existing dashboard behavior remains unchanged when import succeeds.
