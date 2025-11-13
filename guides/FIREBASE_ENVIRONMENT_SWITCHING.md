# Firebase Environment Switching

Use this guide to toggle an app between the local Firebase Emulator Suite and live cloud services. The updated v4 workflow uses a single boolean flag (`VITE_USE_EMULATOR`) instead of named environment switching, with a persistent UI banner showing the active state.

## Supported Modes

| Configuration | VITE_USE_EMULATOR | Auth | Firestore | Storage | Functions | Banner Color |
|---------------|-------------------|------|-----------|---------|-----------|--------------|
| Emulator Mode | `true` | Production | Emulator | Emulator | Emulator | Yellow |
| Cloud Mode | `false` (or omitted) | Production | Production | Production | Production | Red |

- Auth never uses an emulator in this monorepo; Google Sign-In always points at production.
- **Runtime defaults to cloud.** Only when `VITE_USE_EMULATOR=true` are emulators used.
- **Production bundles are safe.** The flag is omitted during `firebase deploy`, so there is zero risk of shipping emulator connections.

## Quick Start

### Development (with emulators)

```bash
# Copy the emulator template (if not already done)
cp .env.emulator .env.local  # Not necessary—Vite loads .env.emulator by default

# Run dev server
pnpm dev
```

By default, Vite loads `.env.emulator` which includes `VITE_USE_EMULATOR=true`. Apps connect to emulators and the yellow banner appears.

### Testing Cloud Firebase While Running Dev Server

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

## Troubleshooting

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
