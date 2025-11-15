# Firebase Emulator Toolkit

Shared Firebase emulator utilities and seed data used across DF teaching apps.

## Available Scripts

Run these commands from the repo root:

### Seed Commands

- `pnpm --filter @df/firebase-emulator seed` – populate the Firebase Emulator Suite with canonical auth, Firestore, and Storage data.
- `pnpm --filter @df/firebase-emulator seed:reset` – clear existing emulator data then reseed it with all data.
- `pnpm --filter @df/firebase-emulator seed:auth-only` – populate the Auth Emulator with seeded users only (no Firestore or Storage).
  - Supports custom auth port via `AUTH_EMULATOR_PORT` environment variable (defaults to 9155)
  - Used by `df-auth-trigd-func-tool` for auth-only development
- `pnpm --filter @df/firebase-emulator seed:auth-only:reset` – clear existing emulator data then reseed with auth users only.

**Note:** Firestore seed data is currently handled via authenticated operations within the app (via a web component in the teaching app).

### Utility Commands

- `pnpm --filter @df/firebase-emulator emulators:clear` – remove the generated `emulator-data/` snapshot (useful before running exports).
- `pnpm --filter @df/firebase-emulator ensure-ports` – free the standard emulator ports (9155, 8280, 9390, 5501, 5500, 5400, 4400, 4401, 4500).
- `pnpm --filter @df/firebase-emulator test:auth` – smoke-test seeded users against the Auth emulator.

See `guides/firebase-emulator-workflow.md` for full setup instructions and troubleshooting tips.
