# Firebase Emulator Workflow

Canonical instructions for running the Firebase Emulator Suite across DF teaching apps.

## Prerequisites

- Install workspace dependencies: `pnpm install`
- Ensure the Firebase CLI is available (`pnpm dlx firebase-tools --version`)
- Use Node 20 (matches the repo/tooling requirements)

## Start the Emulator Suite

From the repo root run the app-specific emulator command, for example:

```sh
pnpm --filter @df/df-firebase-teaching-app emulators:start
```

Each teaching app ships with its own `firebase.json`. The command above will:

1. Free the common emulator ports (`pnpm --filter @df/firebase-emulator ensure-ports`)
2. Start Firebase emulators using the shared snapshot at `packages/firebase-emulator/emulator-data`
3. Export emulator state back to the same directory on exit

## Seed Canonical Data

Populate the shared emulator snapshot with the default classroom dataset:

```sh
pnpm --filter @df/firebase-emulator seed
```

This script provisions:

- 10 Auth users (verified/unverified variants)
- 5 Firestore collections with demo content (`flowers`, `continents`, `chemicalElements`, `musicalInstruments`, `todos`)
- Sample Storage assets (avatars, documents, images)

The seed script is idempotent—you can run it repeatedly without duplicating records.

### Reset and Reseed

To clear the snapshot and restore the canonical data from scratch:

```sh
pnpm --filter @df/firebase-emulator seed:reset
```

This performs:

1. `pnpm --filter @df/firebase-emulator emulators:clear`
2. `pnpm --filter @df/firebase-emulator seed`

## Test Auth Credentials

Run a smoke test against the Auth emulator to validate seeded logins:

```sh
pnpm --filter @df/firebase-emulator test:auth
```

## Emulator Snapshot Location

All shared emulator state lives under `packages/firebase-emulator/emulator-data/`. When you run an app’s `emulators:start`, Firebase reads from and writes to this directory so every workspace reuses the same dataset.

## Troubleshooting

| Issue | Fix |
| ----- | ---- |
| Ports already in use | `pnpm --filter @df/firebase-emulator ensure-ports` |
| Missing data after restart | Rerun `pnpm --filter @df/firebase-emulator seed` |
| Authentication login failures | Make sure emulators are running, then run `pnpm --filter @df/firebase-emulator test:auth` |
| Emulator snapshot corrupted | `pnpm --filter @df/firebase-emulator seed:reset` |

## Related Resources

- `packages/firebase-emulator/README.md`
- `guides/FIREBASE_PATTERNS.md`
