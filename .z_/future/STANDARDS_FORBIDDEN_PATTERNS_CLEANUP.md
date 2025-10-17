# Standards Forbidden Patterns Cleanup

`pnpm standards:dashboard` currently fails the forbidden pattern check due to pre-existing console logs and commented code outside of Ticket 14 scope. Key areas flagged:

- `apps/df-firebase-teaching-app/scripts/seed-data/seed.ts` – numerous `console.log` diagnostics and legacy commented blocks
- `apps/df-firebase-teaching-app/functions/src/**` – commented code in callable/trigger examples
- `packages/state/src/**` – console logging in auth/storage stores and utility helpers
- `packages/ui-lit/src/**` – stray console logging (e.g., Google sign-in) and commented snippets
- `packages/ui-lit/src/file-processing.ts` – TODO without linked ticket

Follow-up work: replace debug logging with structured logger (or remove), convert commented code to documentation, and log/link any TODO items. Running `./scripts/check-forbidden-patterns.sh` after remediation should pass cleanly.
