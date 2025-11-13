# Firebase Environment Build Guards

## Problem
With the new `VITE_FIREBASE_ENV` helper, developers can toggle between `fb-emulator` and `fb-cloud`, but nothing enforces the correct mode during non-dev workflows. It’s easy to accidentally run `pnpm build` or `firebase deploy` while the variable (or default) still points at `fb-emulator`, producing bundles wired to localhost emulators. Those deployments technically succeed but fail for end users.

## Goals
1. Ensure `pnpm dev` (or equivalent dev scripts) always run with `VITE_FIREBASE_ENV=fb-emulator` without manual .env edits.
2. Ensure `pnpm build`, `pnpm build:rollup`, and `firebase deploy` always run with `VITE_FIREBASE_ENV=fb-cloud`.
3. Fail fast if a production build detects `fb-emulator` so misconfigured deploys can’t happen.
4. Keep the `.env.local` toggle for advanced workflows, but make it optional.

## Proposed Approach
- **Script wrappers:**
  - Update app-level `package.json` scripts so `dev`/`start:test` prefix `VITE_FIREBASE_ENV=fb-emulator` (or use cross-env) and build/deploy scripts prefix `VITE_FIREBASE_ENV=fb-cloud`.
  - Document that `.env.local` overrides win, but scripts supply safe defaults.
- **Build-time check:** Add a tiny script (or Vite plugin) that throws if `import.meta.env.VITE_FIREBASE_ENV !== 'fb-cloud'` during production builds (`MODE=production`). Hook it into Rollup/Vite build steps and `firebase deploy` (via `predeploy`).
- **CI enforcement:** For GitHub Actions or other CI pipelines, export `VITE_FIREBASE_ENV=fb-cloud` so remote builds follow the same rule.
- **Docs:** Update `guides/FIREBASE_ENVIRONMENT_SWITCHING.md` and affected app READMEs with the new workflow so devs know the scripts set defaults.

## Acceptance Criteria
- Running `pnpm --filter <app> dev` always logs the banner in emulator mode without needing `.env.local`.
- Running `pnpm --filter <app> build` or `firebase deploy` fails fast if the env var isn’t `fb-cloud`.
- Deploying after the change produces bundles that point at the live Firebase project even if `.env.local` is missing.
- Documentation highlights the automatic dev/prod split and how to override when necessary.
