# DF Activity Log

Single-page Lit app that demonstrates Firebase Authentication with Firestore writes that can target either the local emulator suite or live cloud services. Users record pushup counts, which are stored in a nested collection under `activity/{uid}/pushups`.

## Stack
- Lit 3 + `@lit-labs/signals`
- Shared Firebase helpers/state from `@df/state`
- Material Design 3 components provided via `@df/ui-lit`
- Firebase Emulator Suite for Firestore/Storage/Functions + production Auth

## Quick Start
0. Copy `.env.development.example` to `.env.development`, fill in your real Firebase credentials, and keep `VITE_USE_EMULATOR=true` (this is what turns on the yellow banner).
   ```sh
   cp .env.development.example .env.development
   # then edit .env.development with real project values
   ```
   > If this file is missing, Vite boots in cloud mode, the banner turns red, and Google Sign-In fails with `VITE_FIREBASE_API_KEY` errors.
1. Install repo dependencies if needed: `pnpm install`
2. Start the Firebase Emulator Suite (this app ships its own launcher so you don't have to remember the other teaching apps):
   ```sh
   pnpm --filter @df/df-activity-log emulators:start
   ```
   > This wraps `firebase emulators:start` with the same port map (+ disk-backed imports/exports) used elsewhere in the repo, but because the script lives inside this workspace it won’t break when other emulator workflows are refactored.
   > Ports are defined centrally in `packages/firebase/firebase.json`; keep this app’s `firebase.json` in sync with that file to avoid drift.
3. In another terminal, run the activity log dev server:
   ```sh
   pnpm --filter @df/df-activity-log dev
   ```
4. Open `http://127.0.0.1:4180` and authenticate with the built-in widgets. A yellow banner confirms emulator mode. Entries appear in `activity/<uid>/pushups` inside the Emulator UI (`http://127.0.0.1:5400`).

> Emulator data is now shared at `packages/firebase-emulator/emulator-data/` (same as other apps) so seeds and writes persist across workspaces. Run `pnpm --filter @df/firebase-emulator seed` to refresh it.

## Environment Files
- `.env.development` (ignored) contains real Firebase credentials **with** `VITE_USE_EMULATOR=true`
- `.env.production` (ignored) contains the same credentials **with** `VITE_USE_EMULATOR=false`
- `.env.development.example` / `.env.production.example` document the required variables

Both `.env` files must reference the real Firebase project that owns authentication. The emulator toggle only affects Firestore/Storage/Functions. Run `pnpm dev` for emulator-backed development (yellow banner) or temporarily override the flag for cloud testing:

```sh
VITE_USE_EMULATOR=false pnpm --filter @df/df-activity-log dev
```

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
  config/firebase.config.ts   # Runtime env detector shared by Firebase helpers
  df-activity-log-app.ts      # Lit component w/ auth, form, and history UI
  main.ts                     # Imports Material + initializes Firebase
firestore.rules               # Per-user access control
firebase.json                 # Emulator configuration
README.md                     # This file
```

## Future Enhancements
- Storybook harness for the pushup widgets (once extracted into `@df/ui-lit`)
- Playwright automation that seeds/deletes activity entries
- Expanded activity types beyond pushups
