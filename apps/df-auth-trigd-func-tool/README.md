# Auth-Triggered Function Tool

Minimal Firebase emulator harness focused on auth-triggered Cloud Functions. Provides a single UI surface (`df-auth-wrapper` with the developer email/password panel) plus emulator wiring so you can create/delete users and watch your auth triggers fire. The demo Cloud Functions live in `services/auth-functions/` and export simple `onCreate` / `onDelete` handlers.

## What This Tool Provides
- Firebase Emulator Suite scoped to **Auth**, **Firestore** (for future use), and **Functions**
- `df-auth-wrapper emailPw` mounted on an otherwise empty page
- Ports isolated from the other teaching apps (Auth 9156, Functions 5001, Emulator UI 5410)
- Playwright entry on port 4186 for smoke tests

## Quick Start
```bash
pnpm install
pnpm --filter @df/df-auth-trigd-func-tool emulators:start
pnpm --filter @df/df-auth-trigd-func-tool dev
```
- UI: run `pnpm dev` (Vite serves the harness locally)
- Emulator UI: http://127.0.0.1:5410

## Scripts
| Command | Description |
| --- | --- |
| `pnpm --filter @df/df-auth-trigd-func-tool dev` | Run the Vite server (emulator mode) |
| `pnpm --filter @df/df-auth-trigd-func-tool build` | Type-check the harness |
| `pnpm --filter @df/df-auth-trigd-func-tool start:test` | Launch the Playwright server on port 4186 |
| `pnpm --filter @df/df-auth-trigd-func-tool test` | Run the Playwright smoke test |
| `pnpm --filter @df/df-auth-trigd-func-tool emulators:start` | Start Auth + Firestore + Functions emulators |
| `pnpm --filter @df/auth-functions build` | Compile the Cloud Functions |

## Firebase Emulator Environment
- Uses the fake firebase emulator demo project ID `demo-auth-function-tool`
- `.env.emulator` and `.env.development` are identical (Auth emulator port 9156, Emulator UI 5410)
- No production mode; this tool exists purely for emulator workflow testing

## Developing Auth Triggers
1. Open a terminal for emulators (`pnpm --filter @df/df-auth-trigd-func-tool emulators:start`)
2. Open another for the UI (`pnpm --filter @df/df-auth-trigd-func-tool dev`)
3. Edit functions in `services/auth-functions/src/index.ts`, then rebuild with `pnpm --filter @df/auth-functions build`
4. Create/delete users in the email/password panel to trigger your auth functions and observe logs in the emulator terminal or UI
