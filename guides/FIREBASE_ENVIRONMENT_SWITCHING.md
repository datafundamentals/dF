# Firebase Environment Switching

Use this guide whenever you need to toggle an app between the local Firebase Emulator Suite and the live cloud services. The workflow is intentionally simple: one environment variable selects the backend and a persistent UI banner makes the active state obvious.

## Supported Modes

| Environment | Identifier | Auth | Firestore | Storage | Functions | Banner Color |
|-------------|------------|------|-----------|---------|-----------|--------------|
| Emulator Mode | `fb-emulator` | Production | Emulator | Emulator | Emulator | Yellow |
| Cloud Mode | `fb-cloud` | Production | Production | Production | Production | Red |

- Auth never uses an emulator in this monorepo; Google Sign-In always points at production.
- When the `VITE_FIREBASE_ENV` variable is missing or invalid the system defaults to `fb-emulator` to keep development safe.

## Shared Configuration Helper

`packages/firebase/src/environment-config.ts` centralizes the configuration for each environment.

```ts
import {getFirebaseEnvironmentConfig} from '@df/firebase';

const ENVIRONMENT_CONFIG = getFirebaseEnvironmentConfig();
initializeFirebaseForApp(ENVIRONMENT_CONFIG);
```

- The helper reads `import.meta.env.VITE_FIREBASE_ENV` at runtime.
- Returned objects extend `EmulatorConfig`, so existing Firebase initialization logic keeps working.

## Visual Banner

`<df-environment-banner>` ships from `@df/ui-lit` to show the active environment at the top of every app shell.

```ts
import '@df/ui-lit/df-environment-banner';

render() {
  return html`
    <df-environment-banner></df-environment-banner>
    <main>...</main>
  `;
}
```

- Yellow banner = emulator (safe for iterative development).
- Red banner = cloud (use extra caution; you are touching live data).
- The component can be forced into either mode via an `environment="fb-cloud"` attribute for Storybook demos or tests.
- Mount the element in `index.html` (outside your Lit host component) so you can easily comment it out or delete it before bundling for production without touching app code.

## Switching Environments Per App

1. **Create a `.env.local` up front** – Even though the code defaults to `fb-emulator`, drop this file beside the app’s `package.json` so developers always see the available options:

   ```env
   VITE_FIREBASE_ENV=fb-cloud
   # VITE_FIREBASE_ENV=fb-emulator
   ```

   Leave the mode you are *not* using commented out so the toggle stays obvious.

2. **Default (no action required)** – If the file is missing, apps still fall back to emulator mode.
3. **Switch modes** – Uncomment the desired line (cloud vs. emulator), save the file, and restart Vite so it reads the new value.
4. **Cleanup** – Delete the `.env.local` file only if you no longer want overrides on that machine.

> `.env.local` stays gitignored so per-developer overrides never leak into commits.

## Verification Checklist

- Launch the app with `pnpm --filter <app> dev`. The banner should read “Emulator Mode (fb-emulator)” by default.
- Create `.env.local` with `VITE_FIREBASE_ENV=fb-cloud`, restart the dev server, and confirm the banner switches to “Cloud Mode (fb-cloud)”.
- Remove the override file and restart to ensure the app returns to emulator mode.

This tool is totally optional but it does allow you to maintain constant visibility of whether you are working against the emulator or production back ends.
