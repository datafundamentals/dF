# Manual Testing Guide

Run through this checklist after automated suites pass and before opening a PR. It mirrors the workflow I follow today.

## Fresh Workspace Setup
- `pnpm install` (run `rm -rf node_modules` first only if dependencies are behaving oddly)
- `pnpm build`
- `pnpm lint`
- `pnpm test`

## Emulator & Seed Data
- `pnpm --filter @df/df-firebase-teaching-app emulators:start`
- `pnpm --filter @df/df-firebase-teaching-app seed`
- Restart the app: `pnpm --filter @df/df-firebase-teaching-app dev`
- Hard refresh the browser, open DevTools console, and watch for unexpected logs
- Manually exercise every relevant page/state (auth flows, data mutations, error handling, etc.)

## Production Smoke (when applicable)
- `pnpm --filter @df/df-firebase-teaching-app deploy:prod`
- Hard refresh production, check DevTools console, spot-check key user flows

## Standards & Reporting
- `pnpm scan:compliance`
- `pnpm lint`
- `pnpm --filter @df/df-firebase-teaching-app test`
- `pnpm generate:compliance-report` (expect 100% clean)
- `pnpm standards:dashboard` → currently fails because of legacy console/comment debt; capture the output and ensure failures match `.z_/future/STANDARDS_FORBIDDEN_PATTERNS_CLEANUP.md`

## Notes
- Capture anything odd in the ticket/PR (console warnings, emulator quirks, manual cases verified)
- If you touch additional apps/services, rerun their targeted scripts similarly
