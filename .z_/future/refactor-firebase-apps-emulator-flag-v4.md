# Refactor Firebase Apps to Use Emulator Flag v4

## Status
⏳ **PENDING** - Depends on Firebase Emulator Flag Refactor v4 (completed in main ticket)

## Scope
Apply the new v4 emulator flag refactor to three Firebase-enabled apps:
- `apps/df-firebase-teaching-app2`
- `apps/df-chat-app`
- `apps/df-activity-log`

## Current State (All Three Apps)

### Shared Issues
1. **Package.json**: All have `"dev": "vite --mode production"` (loads `.env.production` instead of `.env.development`)
2. **Vite config**: None have `envDir: '.'` configuration to load `.env.development`
3. **Env files**: All have 5 junk files (`.env.emulator`, `.env.example`, `.env.production.example`)
4. **No banner**: Missing `index.html` conditional rendering for environment banner
5. **Main.ts**: Still passing explicit `EMULATOR_CONFIG` to `initializeFirebaseForApp()`

### App-Specific Details

#### df-firebase-teaching-app2
- **Type**: Standard app (not a library)
- **Firebase init**: `initializeFirebaseForApp(EMULATOR_CONFIG)` with single config
- **Port**: 4182
- **Status**: Has `.env.development` with demo credentials (needs REAL creds)

#### df-chat-app
- **Type**: Library build (`lib: { entry: ... formats: ['es'] }`)
- **Firebase init**: `initializeFirebaseForApp(EMULATOR_CONFIG, FIREBASE_CONFIG)` with dual config
- **Imports**: Uses `shouldUseEmulatorForService('firestore')` function
- **Status**: Has `.env.development` with demo credentials (needs REAL creds)

#### df-activity-log
- **Type**: Library build (`lib: { entry: ... formats: ['es'] }`)
- **Firebase init**: `initializeFirebaseForApp(EMULATOR_CONFIG, FIREBASE_CONFIG)` with dual config
- **Status**: Has `.env.development` with demo credentials (needs REAL creds)

## Refactoring Tasks

### For All Three Apps:

1. **Update package.json**
   - Change `"dev": "vite --mode production"` → `"dev": "vite"`
   - Ensures `.env.development` is loaded instead of `.env.production`

2. **Update vite.config.ts**
   - Add explicit `envDir: '.'` configuration
   - Add comment explaining environment file loading order
   - Match structure from `df-app-starter-template/vite.config.ts`

3. **Clean up .env files**
   - Delete: `.env.emulator`, `.env.example`, `.env.production.example`
   - Delete: `.env.local` (if present, gitignored anyway)
   - Keep: `.env.development`, `.env.production`
   - Add: `.env.development.example` template file

4. **Update .env files**
   - **`.env.development`**:
     - Add header comments explaining purpose
     - Change credentials to REAL Firebase credentials (same as `.env.production`)
     - Keep `VITE_USE_EMULATOR=true`
   - **`.env.production`**:
     - Add header comments
     - Keep `VITE_USE_EMULATOR=false`
   - **`.env.development.example`**:
     - Create new template with placeholder values
     - Clear instructions for developers

5. **Update src/main.ts**
   - Change `initializeFirebaseForApp(EMULATOR_CONFIG)` → `initializeFirebaseForApp()`
   - Or keep explicit config if needed for app-specific logic (check df-chat-app)
   - Update comments to explain auto-detection behavior

6. **Update index.html** (if present)
   - Add conditional banner rendering (like `df-app-starter-template`)
   - Only show `<df-environment-banner>` when `VITE_USE_EMULATOR=true`

7. **Update src/config/firebase.config.ts** (if needed)
   - If using old `getFirebaseEnvironmentConfig()`, switch to `getEmulatorConfigForRuntime()`
   - Update comments

### Special Handling:

#### df-chat-app Only
- Check if `shouldUseEmulatorForService('firestore')` can be removed
- Or update to use new approach if still needed
- Verify `initializeChatStore()` works with auto-detected config

## Acceptance Criteria

- [ ] All three apps: `pnpm dev` loads `.env.development` (no `--mode production`)
- [ ] All three apps: Vite config has `envDir: '.'` for proper env loading
- [ ] All three apps: Only 3 .env files remain (`.env.development`, `.env.development.example`, `.env.production`)
- [ ] All three apps: `.env.development` has REAL Firebase credentials
- [ ] All three apps: Build passes with no TypeScript errors
- [ ] All three apps: Can sign in (Auth works with real credentials)
- [ ] All three apps: Firebase emulator detection works (`VITE_USE_EMULATOR` affects behavior)
- [ ] df-app-starter-template remains consistent (no regressions)

## Implementation Order

1. **Start with df-firebase-teaching-app2** (simplest - single EMULATOR_CONFIG)
2. **Then df-activity-log** (same structure)
3. **Finally df-chat-app** (most complex - dual config + shouldUseEmulatorForService)

## Related
- Firebase Emulator Flag Refactor v4 (completed)
- guides/FIREBASE_ENVIRONMENT_SWITCHING.md (updated)
- apps/df-app-starter-template (reference implementation)

## Notes for Implementation

- These changes are **backward compatible**: Apps still work with explicit config passed to `initializeFirebaseForApp()`
- However, **auto-detection is preferred** for cleaner code (omit EMULATOR_CONFIG argument)
- Be careful with df-chat-app: It reads `shouldUseEmulatorForService()` - verify this function still works with v4
- All three apps currently pass demo credentials in `.env.development` - this breaks Auth signin. Must use real credentials.

## Test Plan

For each app:
1. `pnpm dev` → Should load `.env.development` (check banner color = yellow)
2. Try to sign in → Should work (Auth has real credentials)
3. `VITE_USE_EMULATOR=false pnpm dev` → Banner should be red (cloud mode)
4. `pnpm build:prod` → Should succeed with no errors
5. Check emulator state → Verify Firestore/Storage/Functions use emulators when flag is true
