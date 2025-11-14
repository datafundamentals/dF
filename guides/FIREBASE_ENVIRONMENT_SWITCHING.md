# Firebase Environment Switching

Use this guide to toggle an app between the local Firebase Emulator Suite and live cloud services. The v4 workflow uses Vite's standard environment files (`.env.development` and `.env.production`) with a single boolean flag (`VITE_USE_EMULATOR`), with a persistent UI banner showing the active state.

## Quick Migration Checklist

Use this checklist when migrating an app to the v4 pattern:

- [ ] **firebase.json**: Remove `"auth"`, `"hosting"`, and `"extensions"` from `"emulators"` section
- [ ] **package.json**: Change `"dev": "vite --mode emulator"` to `"dev": "vite"`
- [ ] **src/config/firebase.config.ts**: Set `auth: false` in `EMULATOR_CONFIG`
- [ ] **src/main.ts**: Use `initializeFirebaseForApp()` without arguments
- [ ] **index.html**: Add `<df-environment-banner>` and `<df-auth-wrapper headless>`
- [ ] **.env files**: Create `.env.development` and `.env.production` with REAL credentials
- [ ] **Cleanup**: Delete `.env.emulator`, `.env.local`, and any `df-auth-demo.ts` files
- [ ] **Test**: Run `firebase emulators:start` - verify NO auth emulator starts
- [ ] **Test**: Run `pnpm dev` - yellow banner appears, Google Sign-In works

## ⚠️ CRITICAL: Auth Emulator is FORBIDDEN

**The Authentication Emulator must NEVER be configured or running in apps** (except `apps/df-auth-trigd-func-tool` which is intentionally designed for testing auth-triggered functions).

### Why No Auth Emulator?

- Auth emulator creates friction for developers (no real OAuth providers)
- Google Sign-In doesn't work with auth emulator
- Production auth is safe and works seamlessly in development
- See `guides/STANDARDS_STYLES.md` line 130 for policy details

### ⚠️ CRITICAL: Environment File Pattern

**DO NOT create `.env.local` or `.env.emulator` files!** This was the OLD pattern and clutters the workspace.

**CORRECT PATTERN**: Use Vite's standard environment files:
- **`.env.development`** - Loaded automatically by `pnpm dev` (Vite development mode)
- **`.env.production`** - Loaded automatically by `pnpm build` (Vite production mode)

**Key insight**: Both files contain **REAL Firebase credentials** (not demo values). The only difference is the `VITE_USE_EMULATOR` flag:
- `.env.development`: `VITE_USE_EMULATOR=true` (emulators for Firestore/Storage/Functions, real auth)
- `.env.production`: `VITE_USE_EMULATOR=false` (all services use production Firebase)

This avoids credential duplication and follows Vite conventions.

### Required Steps to Disable Auth Emulator

When migrating an app or ensuring compliance:

1. **Remove from `firebase.json`**: Delete the entire `"auth"` section from `"emulators"`
   ```json
   "emulators": {
     // ❌ DELETE THIS ENTIRE BLOCK:
     // "auth": {
     //   "host": "127.0.0.1",
     //   "port": 9155
     // },
     
     // ✅ Keep these for local development:
     "firestore": { ... },
     "storage": { ... },
     "functions": { ... },
     
     // ❌ REMOVE these (not needed with Vite dev server):
     // "hosting": { ... },  // Vite serves the app in dev mode
     // "extensions": { ... },  // Rarely needed for development
     
     "ui": { ... }  // ✅ Keep the emulator UI
   }
   ```
   
   **Why remove hosting emulator**: Vite's dev server (`pnpm dev`) already serves the app with hot reload. The hosting emulator is only needed for production-like testing with `vite preview`.
   
   **Why remove extensions emulator**: Extensions are rarely used during development and add startup overhead.

2. **Update `src/config/firebase.config.ts`**: Set `auth: false`
   ```ts
   export const EMULATOR_CONFIG: EmulatorConfig = {
     auth: false,  // ✅ REQUIRED
     firestore: true,
     storage: true,
     functions: true,
   };
   ```

3. **Use Auto-Detection in `main.ts`**: Remove explicit EMULATOR_CONFIG passing
   ```ts
   // ✅ CORRECT: Auto-detects from VITE_USE_EMULATOR
   import {initializeFirebaseForApp} from '@df/state';
   initializeFirebaseForApp();
   
   // ❌ OLD PATTERN (still works but deprecated):
   import {EMULATOR_CONFIG} from './config/firebase.config.js';
   initializeFirebaseForApp(EMULATOR_CONFIG);
   ```

4. **Wrap app in `<df-auth-wrapper>`**: Use in `index.html` for authentication guard
   ```html
   <df-auth-wrapper headless>
     <your-app-components></your-app-components>
   </df-auth-wrapper>
   ```

5. **Verify emulator command**: Run `firebase emulators:start` and confirm auth emulator does NOT start

6. **Use `.env.development` and `.env.production` (NOT `.env.local` or `.env.emulator`)**:
   
   Create/update `.env.development`:
   ```bash
   # .env.development - Used by `pnpm dev`
   # MUST contain REAL Firebase credentials (auth never uses emulators)
   
   VITE_USE_EMULATOR=true  # Emulators for Firestore/Storage/Functions only
   
   # Get these from Firebase Console > Project Settings > Your apps
   VITE_FIREBASE_API_KEY=AIzaSy...  # REAL API key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```
   
   Create/update `.env.production`:
   ```bash
   # .env.production - Used by `pnpm build`
   # Same credentials, but VITE_USE_EMULATOR=false
   
   VITE_USE_EMULATOR=false  # All services use production
   
   # Same real credentials as .env.development
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   # ... etc
   ```

7. **⚠️ CRITICAL: Update `package.json` dev script**: Remove any `--mode` flag
   ```json
   {
     "scripts": {
       "dev": "vite",  // ✅ CORRECT - loads .env.development automatically
       // ❌ WRONG:
       // "dev": "vite --mode emulator",  // Tries to load .env.emulator!
       // "dev": "vite --mode development",  // Redundant, this is default
     }
   }
   ```
   
   **Why**: Vite automatically uses `development` mode for `vite` (dev server) and `production` mode for `vite build`. Adding `--mode emulator` breaks this by trying to load `.env.emulator` which doesn't exist in the new pattern.

## Supported Modes

| Configuration | VITE_USE_EMULATOR | Auth | Firestore | Storage | Functions | Banner Color |
|---------------|-------------------|------|-----------|---------|-----------|--------------|
| Emulator Mode | `true` | Production | Emulator | Emulator | Emulator | Yellow |
| Cloud Mode | `false` (or omitted) | Production | Production | Production | Production | Red |

- Auth never uses an emulator in this monorepo; Google Sign-In always points at production.
- **Runtime defaults to cloud.** Only when `VITE_USE_EMULATOR=true` are emulators used.
- **Production bundles are safe.** The flag is omitted during `firebase deploy`, so there is zero risk of shipping emulator connections.

## Quick Start

### Development (with emulators + production auth)

```bash
# 1. Ensure .env.development exists with REAL Firebase credentials
#    (See .env.development.example in app directory)
#    VITE_USE_EMULATOR=true + real credentials

# 2. Start emulators (auth emulator should NOT start)
pnpm --filter @df/your-app emulators:start

# 3. Run dev server (in another terminal)
pnpm --filter @df/your-app dev
```

**What happens**:
- Vite automatically loads `.env.development`
- Yellow banner appears (emulator mode)
- Google Sign-In works with real accounts (uses real credentials)
- Firestore, Storage, Functions use local emulators (because `VITE_USE_EMULATOR=true`)

### Testing with Cloud Services (No Emulators)

```bash
# Temporarily override the emulator flag
VITE_USE_EMULATOR=false pnpm dev
```

Or edit `.env.local`:
```env
VITE_USE_EMULATOR=false
```

Then restart the dev server. The red banner will appear, and the app uses live Firebase services.

### Production Deployment

```bash
# Build and deploy
pnpm build
firebase deploy
```

The production build **omits** `VITE_USE_EMULATOR`, so the app defaults to cloud mode. This is safe because:
1. The flag is not present in `.env.production` (which contains live credentials).
2. Rollup removes the variable during bundling.
3. No emulator configuration is baked into the bundle.

## How It Works

### Environment Files

- **`.env.emulator`** (loaded by Vite dev server by default)
  ```env
  VITE_USE_EMULATOR=true
  VITE_FIREBASE_API_KEY=demo-api-key-for-emulator-development
  # ... other placeholder credentials
  ```

- **`.env.production`** (used for `pnpm build`)
  ```env
  VITE_USE_EMULATOR=false
  VITE_FIREBASE_API_KEY=AIzaSy...  # Real Firebase credentials
  # ... other production credentials
  ```

### Configuration Helper

`packages/firebase/src/environment-config.ts` provides runtime detection:

```ts
import { getEmulatorConfigForRuntime } from '@df/firebase';

// Returns EmulatorConfig with services enabled/disabled based on VITE_USE_EMULATOR
const config = getEmulatorConfigForRuntime();
initializeFirebaseForApp(config);  // Now optional—auto-detects from env
```

Or use the new simplified initialization (auto-detects from environment):

```ts
import { initializeFirebaseForApp } from '@df/state';

// Automatically detects VITE_USE_EMULATOR and configures emulators
initializeFirebaseForApp();
```

### Visual Banner

The `<df-environment-banner>` component displays the active mode:

```html
<!-- In index.html -->
<df-environment-banner id="env-banner"></df-environment-banner>

<script>
  // Hide banner in production (when VITE_USE_EMULATOR !== 'true')
  if (import.meta.env.VITE_USE_EMULATOR !== 'true') {
    document.getElementById('env-banner').style.display = 'none';
  }
</script>
```

- **Yellow banner** = Emulator Mode (safe for iterative development)
- **Red banner** = Cloud Mode (live data—use caution)
- The component reads `VITE_USE_EMULATOR` at runtime, so no rebuild needed when toggling.

## Migration from Legacy Approach (VITE_FIREBASE_ENV)

The old system used `VITE_FIREBASE_ENV` with named environments (`fb-emulator` vs `fb-cloud`). This has been replaced with the simpler boolean flag.

### If You're on the Old System

1. **Update `.env.emulator`**: Ensure it includes `VITE_USE_EMULATOR=true`
2. **Update `.env.production`**: Ensure it includes `VITE_USE_EMULATOR=false`
3. **Remove `.env.local` overrides**: Delete any `VITE_FIREBASE_ENV=...` lines
4. **Update `main.ts`**: Change from explicit config passing to auto-detection:
   ```ts
   // Old
   import { EMULATOR_CONFIG, FIREBASE_CONFIG } from './config/firebase.config';
   initializeFirebaseForApp(EMULATOR_CONFIG, FIREBASE_CONFIG);

   // New
   initializeFirebaseForApp();  // Auto-detects VITE_USE_EMULATOR
   ```
5. **Update `index.html`**: Add the conditional banner script shown above

### Backward Compatibility

The legacy `getFirebaseEnvironmentConfig()` function still works but is deprecated. Use `getEmulatorConfigForRuntime()` for new code.

## Verification Checklist

- [ ] Run `pnpm dev` (with default `.env.emulator`): Yellow banner appears, emulators work
- [ ] Run `VITE_USE_EMULATOR=false pnpm dev`: Red banner appears, uses live Firebase
- [ ] Run `pnpm build`: Build succeeds, banner is hidden in production bundle
- [ ] After `firebase deploy`: Banner does not appear on deployed app, uses cloud Firebase

## Common Pitfalls for Coding Agents

**🤖 ATTENTION CODING AGENTS**: These are the most common mistakes when migrating apps:

1. **❌ Creating `.env.local` or `.env.emulator` files**
   - **Correct**: Use `.env.development` and `.env.production` only
   - **Why**: Avoids file proliferation, follows Vite conventions

2. **❌ Using `"dev": "vite --mode emulator"` in package.json**
   - **Correct**: `"dev": "vite"` (loads `.env.development` automatically)
   - **Why**: Custom modes break Vite's automatic file loading

3. **❌ Putting placeholder/demo credentials in `.env.development`**
   - **Correct**: Use REAL Firebase credentials in both `.env.development` and `.env.production`
   - **Why**: Auth never uses emulator, so demo credentials fail with `auth/api-key-not-valid`

4. **❌ Leaving `"auth"` in `firebase.json` emulators section**
   - **Correct**: Remove entire `"auth"` block (also remove `"hosting"` and `"extensions"`)
   - **Why**: Auth emulator must never start, hosting/extensions not needed in dev

5. **❌ Passing explicit `EMULATOR_CONFIG` to `initializeFirebaseForApp()`**
   - **Correct**: Call `initializeFirebaseForApp()` with no arguments
   - **Why**: Auto-detection reads `VITE_USE_EMULATOR` at runtime

6. **❌ Forgetting to add `<df-auth-wrapper>` and `<df-environment-banner>`**
   - **Correct**: Wrap app components and add banner with conditional display script
   - **Why**: Auth guard and visual environment indicator required

7. **❌ Deleting `df-auth-demo.ts` but leaving imports in `main.ts`**
   - **Correct**: Remove both the file and its import statement
   - **Why**: Build errors from missing imports

## Troubleshooting

**Q: I see a RED banner (cloud mode) instead of YELLOW (emulator mode)**
- **Cause 1**: `.env.development` doesn't exist or has wrong `VITE_USE_EMULATOR` value
- **Cause 2**: `package.json` dev script has `--mode` flag (e.g., `vite --mode emulator`)
- **Solution**: Ensure `.env.development` exists with `VITE_USE_EMULATOR=true` and `"dev": "vite"` in package.json
- **Verify**: Check browser console for `import.meta.env.VITE_USE_EMULATOR` value

**Q: I get `auth/api-key-not-valid` error when trying to sign in**
- **Root cause**: `.env.development` doesn't exist or has demo/placeholder credentials
- **Solution**: Ensure `.env.development` exists with REAL Firebase credentials (not "demo-api-key...")
- **Common mistake**: Using `.env.emulator` or `.env.local` instead of `.env.development`
- **Correct pattern**: `.env.development` (for dev) and `.env.production` (for prod) - both with real credentials

**Q: The auth emulator is starting when I run `firebase emulators:start`**
- **Critical**: Remove the `"auth"` block from `firebase.json` emulators section
- Auth emulator should NEVER run (except in `apps/df-auth-trigd-func-tool`)
- This is a common mistake that coding agents make—always verify `firebase.json`

**Q: The banner doesn't appear or shows wrong environment**
- Restart the dev server: `pnpm dev`
- Check that `.env.emulator` has `VITE_USE_EMULATOR=true`
- Verify that `.env.production` has `VITE_USE_EMULATOR=false`

**Q: I want to test cloud Firebase locally**
- Run: `VITE_USE_EMULATOR=false pnpm dev`
- Or temporarily edit `.env.local` and restart the server

**Q: The banner appears in production**
- This should not happen. Verify that:
  1. You ran `pnpm build` (not `pnpm dev`)
  2. The `index.html` script correctly hides the banner when `VITE_USE_EMULATOR !== 'true'`
  3. The bundled code does not contain the `VITE_USE_EMULATOR` variable

**Q: Google Sign-In doesn't work**
- Verify auth emulator is NOT running (check `firebase.json`)
- Ensure `EMULATOR_CONFIG.auth` is set to `false`
- Production auth should work seamlessly in development
