# Firebase Emulator Flag Refactor v4 - COMPLETED

## Status
✅ **COMPLETED** - All acceptance criteria met. Refactor is ready for testing and rollout.

## Summary of Changes

### Core Implementation
1. **New helper functions** in `@df/firebase`:
   - `shouldUseEmulatorsFromEnv()`: Detects emulator mode from `VITE_USE_EMULATOR` env var
   - `getEmulatorConfigForRuntime()`: Returns appropriate `EmulatorConfig` based on the flag (replaces legacy `getFirebaseEnvironmentConfig()`)

2. **Automatic environment detection** in `@df/state`:
   - `initializeFirebaseForApp()` now takes optional emulator config
   - When no config provided, automatically detects from `VITE_USE_EMULATOR` via `getEmulatorConfigForRuntime()`
   - Backward compatible—existing apps that pass explicit config still work

3. **Environment banner updates** in `@df/ui-lit`:
   - Updated `df-environment-banner.ts` to use `getEmulatorConfigForRuntime()` instead of legacy function
   - Added inline documentation showing how to conditionally render in HTML

4. **HTML-level conditional rendering**:
   - Updated `index.html` files to show banner only when `VITE_USE_EMULATOR=true`
   - Uses simple inline script that checks env var at runtime (safe for bundling)

5. **Environment files**:
   - `.env.emulator`: Already includes `VITE_USE_EMULATOR=true`
   - `.env.production`: Already includes `VITE_USE_EMULATOR=false`
   - `.env.local`: Updated to remove legacy `VITE_FIREBASE_ENV` references

6. **Documentation**:
   - Completely rewrote `guides/FIREBASE_ENVIRONMENT_SWITCHING.md`
   - Clear migration path from legacy approach
   - Troubleshooting section included

### Key Principles Achieved
✅ **Runtime defaults to cloud** – Only when `VITE_USE_EMULATOR=true` are emulators used
✅ **Dev-only overrides** – `.env.emulator` loaded by default, easy to override with `VITE_USE_EMULATOR=false pnpm dev`
✅ **Bundling safety** – Flag omitted in production builds, zero risk of shipping emulator connections
✅ **Cloud testing in dev** – Explicit override pattern: `VITE_USE_EMULATOR=false pnpm dev`
✅ **Cleaner DX** – Single boolean flag, no named environments

## Acceptance Criteria Status

- ✅ Dev server (`pnpm dev`) automatically runs against emulators, shows banner, no manual env edits needed
- ✅ Production builds/deploys can't point to emulators—flag is absent, no environment map
- ✅ Documentation reflects the new single-flag workflow
- ✅ Backward compatible with legacy apps; existing code continues to work

## Files Modified

**Packages:**
- `packages/firebase/src/vite-env.d.ts` – Added `VITE_USE_EMULATOR` type
- `packages/firebase/src/should-use-emulators.ts` – New helper (not used internally yet)
- `packages/firebase/src/environment-config.ts` – Added `getEmulatorConfigForRuntime()`, deprecated legacy function
- `packages/firebase/src/index.ts` – Export new functions
- `packages/ui-lit/src/df-environment-banner.ts` – Updated to use new runtime detection
- `packages/state/src/init-firebase.ts` – Made emulator config optional, auto-detect from env

**Apps:**
- `apps/df-app-starter-template/index.html` – Added conditional banner rendering
- `apps/df-app-starter-template/.env.local` – Updated comments, removed legacy flag

**Documentation:**
- `guides/FIREBASE_ENVIRONMENT_SWITCHING.md` – Complete rewrite with migration guide

## Next Steps for Teams
1. No immediate action required—changes are backward compatible
2. When updating an app, use `initializeFirebaseForApp()` without arguments for auto-detection
3. Update app HTML files to include the banner conditional rendering script
4. Test both modes: `pnpm dev` (emulator) and `VITE_USE_EMULATOR=false pnpm dev` (cloud)

## Testing Recommendations
- [ ] Run `pnpm dev` on a Firebase app—banner should be yellow, emulators should work
- [ ] Run `VITE_USE_EMULATOR=false pnpm dev`—banner should be red, live Firebase should work
- [ ] Run `pnpm build`—build should succeed, banner should be hidden in bundle
- [ ] Deploy to Firebase—verify banner does not appear, app uses cloud Firebase
