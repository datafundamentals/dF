# Firebase Emulator Workflow

Canonical instructions for running the Firebase Emulator Suite across DF teaching apps.

> **Note:** This workflow applies to all apps **EXCEPT** `apps/df-auth-trigd-func-tool`, which maintains its own specialized emulator configuration for Auth testing.

## Prerequisites

- Install workspace dependencies: `pnpm install`
- Ensure the Firebase CLI is available (`pnpm dlx firebase-tools --version`)
- Use Node 20 (matches the repo/tooling requirements)

## Start the Emulator Suite

**Run this command from the repo root:**

```sh
pnpm emulators:start
```

This command will:

1. Free the common emulator ports (`pnpm --filter @df/firebase-emulator ensure-ports`)
2. Start Firebase emulators (Firestore, Storage, Functions) using the shared snapshot at `packages/firebase-emulator/emulator-data`
3. Export emulator state back to the same directory on exit

### Why run from root?

All teaching apps (except the auth tool) share the same Firebase project (`peg-2035`) and the same emulator configuration. Running a single instance from the root ensures:
- Consistent state across all apps
- No port conflicts
- Simplified maintenance

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

## Troubleshooting

If you see port conflicts:

```sh
pnpm emulators:clear
```

This will kill any lingering processes on the emulator ports.

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
