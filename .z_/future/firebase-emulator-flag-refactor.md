# Firebase Emulator Flag Refactor

## Motivation
The current `fb-emulator` / `fb-cloud` split leaks into build artifacts: whatever value `VITE_FIREBASE_ENV` has during `pnpm build` gets baked into the bundle, so it’s possible to accidentally deploy code wired to localhost. Developers also have to juggle `.env.local` edits when switching between dev and prod workflows.

## Proposed Direction
Adopt a single “cloud” configuration and use a dev-only flag (e.g., `VITE_USE_EMULATOR=true` from `.env.emulator`) to toggle emulator connections + the `<df-environment-banner>` when running Vite. Production builds never see the flag, so they always target live Firebase services.

### Key Principles
1. **Runtime defaults to cloud** – Shared helpers no longer export named environments; they assume production backends unless the runtime explicitly detects `VITE_USE_EMULATOR === 'true'`.
2. **Dev-only overrides** – Vite dev server loads `.env.emulator` by default; `pnpm dev` automatically runs with `VITE_USE_EMULATOR=true` and mounting the banner. No `.env.local` shuffle required.
3. **Bundling safety** – Rollup builds and `firebase deploy` simply omit the flag, so there is zero risk of shipping emulator hosts.
4. **Cloud testing in dev** – Developers can still run `pnpm dev` against live Firebase by temporarily unsetting/overriding `VITE_USE_EMULATOR` (e.g., `VITE_USE_EMULATOR=false pnpm dev`). This keeps the workflow explicit without extra environment names.
5. **Cleaner DX** – Docs collapse to “copy `.env.emulator` → run dev” with no mention of `fb-cloud/fb-emulator` toggles.

## Implementation Sketch
- Replace `getFirebaseEnvironmentConfig()` with something like `shouldUseEmulators()` that reads `import.meta.env.VITE_USE_EMULATOR === 'true'`.
- Update `@df/state`/`@df/firebase` to pass that boolean into `initializeFirebaseForApp` / `connectFirebaseEmulators`.
- Move `<df-environment-banner>` into `index.html` for each Firebase app and render it only when the flag is set (e.g., wrap in a small script that checks `import.meta.env.VITE_USE_EMULATOR`).
- Remove `VITE_FIREBASE_ENV` references from docs and code; update `.env.emulator` templates to include a single `VITE_USE_EMULATOR=true` entry and document how to override it (e.g., `VITE_USE_EMULATOR=false pnpm dev`) when testing against cloud while still using the local Vite server.
- Optional: add a warning banner in dev if the flag is missing so developers know why emulators aren’t connected.

## Acceptance Criteria
- Dev server (`pnpm dev`) automatically runs against emulators (Firestore/Storage/Functions per app config), shows the banner, and never requires manual VITE_FIREBASE_ENV edits.
- Production builds/deploys can’t accidentally point to emulators, because the flag is absent and there’s no alternate environment map.
- Documentation and templates reflect the new single-flag workflow.
- Legacy apps either adopt the new helper or continue to function unchanged until migrated.
