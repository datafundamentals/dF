# DF Activity Log

Single-page Lit app that demonstrates Firebase Authentication + Firestore writes against the local emulator suite. Users record pushup counts, which are stored in a nested collection under `activity/{uid}/pushups`.

## Stack
- Lit 3 + `@lit-labs/signals`
- Shared Firebase helpers/state from `@df/state`
- Material Design 3 components provided via `@df/ui-lit`
- Firebase Emulator Suite only (no production writes)

## Quick Start
1. Install repo dependencies if needed: `pnpm install`
2. Start the Firebase Emulator Suite (this app ships its own launcher so you don't have to remember the other teaching apps):
   ```sh
   pnpm --filter @df/df-activity-log emulators:start
   ```
   > This wraps `firebase emulators:start` with the same port map (+ disk-backed imports/exports) used elsewhere in the repo, but because the script lives inside this workspace it won’t break when other emulator workflows are refactored.
3. In another terminal, run the activity log dev server:
   ```sh
   pnpm --filter @df/df-activity-log dev
   ```
4. Open `http://127.0.0.1:4180` and authenticate with the built-in widgets. Entries appear in `activity/<uid>/pushups` inside the Emulator UI (`http://127.0.0.1:5400`).

> **Need the original teaching app seed data?** The emulator persists writes to `apps/df-activity-log/emulator-data/`, so once you create accounts/entries they stick around. If you prefer the pre-seeded data from `df-firebase-teaching-app0`, just copy that workspace’s `emulator-data/` directory into this app’s folder before starting the suite.

## Environment Files
- `.env.emulator` (committed) targets the `demo-firebase-teaching-app` placeholder project and sets `VITE_USE_EMULATOR=true`
- `.env.development` symlinks to `.env.emulator` for Vite
- `.env.production.example` documents the vars required for a real Firebase project (future work)

## Firestore Layout
```
activity
  └── {uid}
      └── pushups
          └── {entryId} (count, note, recordedAt, createdAt, updatedAt, ownerId)
```
Security rules (`firestore.rules`) only allow authenticated users to access their own branch.

## Scripts
| Command | Description |
| --- | --- |
| `pnpm --filter @df/df-activity-log dev` | Run Vite on `http://127.0.0.1:4180` |
| `pnpm --filter @df/df-activity-log build` | Type-check & emit `dist/` |
| `pnpm --filter @df/df-activity-log preview` | Preview the production bundle |
| `pnpm --filter @df/df-activity-log test` | Runs Playwright (tests TBD) |

## Testing
Integration specs live under `tests/integration/` (placeholder for now). When authored, they will:
- Stub emulator auth to sign in
- Submit pushup entries and assert Firestore writes
- Exercise delete/refresh behaviours

## File Map
```
src/
  config/firebase.config.ts   # Emulator-only config consumed by main.ts
  df-activity-log-app.ts      # Lit component w/ auth, form, and history UI
  main.ts                     # Imports Material + initializes Firebase
firestore.rules               # Per-user access control
firebase.json                 # Emulator + hosting configuration
README.md                     # This file
```

## Future Enhancements
- Storybook harness for the pushup widgets (once extracted into `@df/ui-lit`)
- Playwright automation that seeds/deletes activity entries
- Expanded activity types beyond pushups
