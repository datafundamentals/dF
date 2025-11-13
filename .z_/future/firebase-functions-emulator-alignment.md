# Firebase Functions Emulator Alignment

## Context
Recent work on the Firebase environment toggle surfaced that `apps/df-app-starter-template` currently starts the emulator suite with Auth + Firestore + Hosting + Storage, while the intended teaching pattern for this app is Firestore + Storage + Functions only (Auth stays production). The current mismatch causes confusion every time developers switch between apps or launch the emulators.

## Proposed Scope
1. Audit the template’s emulator scripts and `firebase.json` to ensure only Firestore, Storage, and Functions are configured for this app. Remove Auth/Hosting ports so the CLI can’t auto-start them.
2. Confirm the shared `@df/state` initialization still keeps `auth=false` while enabling Functions.
3. Update docs (README + the new `guides/FIREBASE_ENVIRONMENT_SWITCHING.md`) with the canonical emulator mix for the template.
4. Re-run `pnpm --filter @df/df-app-starter-template emulators:start` and document the expected log snippet showing only the desired services.

## Optional Stretch (Future Ticket)
- Evaluate moving duplicated Cloud Functions (e.g., `apps/df-firebase-teaching-app2/functions/src/scheduled/cleanupExpiredTodos.ts`) into the `services/fb-functions` workspace so all apps share the same deployment + emulator wiring.

## Acceptance Criteria
- Emulator start command spins up only Firestore, Storage, Functions for the template.
- Auth emulator remains off; Auth connections always target production.
- Docs clearly describe which services run in emulator mode vs. cloud mode for this app.
