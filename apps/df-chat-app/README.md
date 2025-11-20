# DF Chat App

This workspace hosts the production-ready `<df-chat-widget>` so it can run against the primary Firebase project without emulator dependencies. The Activity Log shell was cloned to bootstrap the tooling in Step 1; Step 2 swaps in the chat widget while keeping the same deployment model.

## Stack
- Lit 3 + `@lit-labs/signals`
- Shared Firebase helpers/state from `@df/state`
- Material Design 3 components provided via `@df/ui-lit`
- Firebase Emulator Suite only (no production writes)

## Quick Start
1. Install repo dependencies if needed: `pnpm install`
2. Start the Firebase Emulator Suite (this app ships its own launcher so you don't have to remember the other teaching apps):
   ```sh
   pnpm --filter @df/df-chat-app emulators:start
   ```
   > This wraps `firebase emulators:start` with the same port map (+ disk-backed imports/exports) used elsewhere in the repo, but because the script lives inside this workspace it won’t break when other emulator workflows are refactored.
   > Ports are defined centrally in `packages/firebase/firebase.json`; keep this app’s `firebase.json` in sync with that file to avoid drift.
3. In another terminal, run the chat app dev server:
   ```sh
   pnpm --filter @df/df-chat-app dev
   ```
4. Open `http://127.0.0.1:4181`, sign in, and start sending messages. Chat transcripts persist to the `chatMessage` collection in the configured Firebase project.

> Emulator data is shared at `packages/firebase-emulator/emulator-data/` (same as other apps). Run `pnpm --filter @df/firebase-emulator seed` to refresh it.

## Environment Files
- `.env.emulator` (committed) targets the `demo-firebase-teaching-app` placeholder project and sets `VITE_USE_EMULATOR=true`
- `.env.development` symlinks to `.env.emulator` for Vite
- `.env.production.example` documents the vars required for a real Firebase project (future work)

## Firestore Layout
```
chatMessage
  └── {messageId} (text, userId, userDisplayName, userPhotoURL, createdAt)
```
Security rules (`firestore.rules`) only allow authenticated users to access their own branch.

## Scripts
| Command | Description |
| --- | --- |
| `pnpm --filter @df/df-chat-app dev` | Run Vite on `http://127.0.0.1:4181` |
| `pnpm --filter @df/df-chat-app build` | Type-check & emit `dist/` |
| `pnpm --filter @df/df-chat-app preview` | Preview the production bundle |
| `pnpm --filter @df/df-chat-app build:rollup` | Emit the Rollup bundle for 11ty deployment |
| `pnpm --filter @df/df-chat-app test` | Runs Playwright (tests TBD) |

## Testing
Integration specs live under `tests/integration/` (placeholder for now). When authored, they will:
- Stub auth to sign in
- Post chat messages and assert Firestore writes
- Exercise realtime update behaviour and transcript pagination (when implemented)

## File Map
```
src/
  config/firebase.config.ts   # Emulator-only config consumed by main.ts
  df-chat-app.ts              # Minimal host that renders <df-chat-widget>
  main.ts                     # Imports Material + initializes Firebase
firestore.rules               # Per-user access control
firebase.json                 # Emulator configuration
README.md                     # This file
```

## Future Enhancements
- Storybook harness updates as chat UI evolves
- Playwright automation once the chat flow stabilises
- Optional layout shell for embedding the widget in multi-column pages
