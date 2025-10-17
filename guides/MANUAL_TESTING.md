# Manual Testing Guide

Run through this checklist after automated suites pass and before opening a PR. It mirrors the workflow I follow today.

## Fresh Workspace Setup
- `pnpm install` (run `rm -rf node_modules` first only if dependencies are behaving oddly)
- `pnpm build`
- `pnpm lint`
- `lsof -ti :4175 | xargs kill -9 && lsof -ti :4174 | xargs kill -9 && lsof -ti :4173 | xargs kill -9 && pnpm test`
- use above `lsof -ti :4174 | xargs kill -9` or 4173|4175 alt to refactoring the Playwright setup to pick ephemeral ports to get rid of: 
    @df/df-teaching-app:test: ERROR: command finished with error: command (/Users/petecarapetyan/work/primary/df/apps/df-teaching-app) /Users/petecarapetyan/Library/pnpm/.tools/@pnpm+macos-arm64/10.18.2/bin/pnpm run test exited (1)
    @df/df-teaching-app#test: command (/Users/petecarapetyan/work/primary/df/apps/df-teaching-app) /Users/petecarapetyan/Library/pnpm/.tools/@pnpm+macos-arm64/10.18.2/bin/pnpm run test exited (1)

    Tasks:    9 successful, 10 total
    Cached:    9 cached, 10 total
    Time:    11.057s 
    Failed:    @df/df-teaching-app#test

    ERROR  run failed: command  exited (1)
     ELIFECYCLE  Test failed. See above for more details.
- `pnpm test`

## Emulator & Seed Data
- `pnpm --filter @df/df-firebase-teaching-app emulators:start`
- `pnpm --filter @df/df-firebase-teaching-app seed`
- Restart the app: `pnpm --filter @df/df-firebase-teaching-app dev` or whatever relevant app that you are working on.
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
