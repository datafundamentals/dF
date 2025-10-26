# Firebase New App Notes

- **Emulator sharing:** Teaching apps own the canonical `firebase.json`, port map, and security rules the entire repo uses. Either add collection-specific rules there (with tests) or build a new shared ruleset before wiring a new app. Without the rule changes, writes silently hit `PERMISSION_DENIED`.
- **App-local scripts, shared config:** Give each new Firebase app its own `emulators:start` wrapper so devs don’t have to remember another workspace, but have that script shell out to the same ports/config so seed data stays consistent. Scope the services (`--only auth,firestore,storage,hosting`) if the app doesn’t ship Functions; otherwise Firebase fails with the Extensions dependency error.
- **Persisted emulator data:** We’re persisting to `apps/<app>/emulator-data`. If we want the teaching app’s seed data, copy its folder in once—Firebase will keep it around afterward. Document this in the new app’s README so resets don’t assume they must re-seed everything.
- **Shared store vs app code:** Push shared Firestore logic (`activity-log.store.ts`) + types into packages before touching app code. Otherwise you’ll end up duplicating stores when the next activity-based app lands.
- **Testing:** Any tweak to `apps/df-firebase-teaching-app0/firestore.rules` must run `pnpm --filter @df/df-firebase-teaching-app0 test:rules` to keep the 64-rule tests green. Mention this in future PRs so reviewers know the change was validated.

Future idea: factor the emulator tooling (port guard + firebase start command) into a root-level script/package so apps only declare their dependencies, not the full command string.
