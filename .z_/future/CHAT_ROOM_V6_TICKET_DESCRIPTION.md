# df-chat-app

This is my sixth attempt at a simple chat room app. The last one is working, but only with an emulator. I attempted to shift it to production firebase configuration but failed to figure out how to solve this problem easily.

This ticket will attempt to solve that problem by simply cloning another very simple project which is configured exactly as I wish the chat project to be configured, and then simply drop the chat widget into this clone, replacing it's primary component.
  
## Step 1 - Clone df-activity-log app

apps/df-activity-log is cloned to apps/df-chat-app

All relevant pnpm, turbo, and package.json adjustments must be made, to assure that the new clone is usable and worthy of being worked within. At this point it will still have the same functionality as df-activity-log, but the app just renamed.

As a part of this step, the coding agent is expected to examine apps/df-chat-app thoroughly to make sure that no inappropriate legacy code remains from the the apps/df-activity-log codebase that this app was cloned from.

At this point, apps/df-chat-app/src/df-activity-log-app.ts should be refactored entirely, including to rename it as apps/df-activity-log/src/df-chat-app.ts and have @customElement('df-activity-log-app') changed to @customElement('df-chat-app')

Coding Agent stops all work here and allows User to validate work so far for:
  - code and design compliance
  - broken builds etc
  - does it work, so far?

## Step 2 - Swap Web Components

If further information is required for successful hosting of <df-chat-widget>, the coding agent is pointed towards apps/df-chat-tmp-test-app where is currently deployed within an emulator environment.

This apps/df-activity-log/src/df-chat-app.ts file should have one purpose only, which is to import and host the rendering <df-chat-widget> as coded by packages/ui-lit/src/df-chat-widget.ts.

When this step is complete, apps/df-chat-app should be runnable without an emulator just as apps/df-activity-log is currently runnable without an emulator using `pnpm --filter @df/df-activity-log run dev`, only instead, using `pnpm --filter @df/df-chat-app run dev`

Coding Agent stops all work here and allows User to validate work so far for:
  - code and design compliance
  - broken builds etc
  
## Step 3 - Rollup Configuration Confirmed

<df-chat-app> will be deployable by a bundle using rollup, in the same manner that <df-activity-log> is currently deployable using rollup

Coding Agent stops all work here and allows User to validate work so far for:
  - code and design compliance
  - broken builds etc
  - does it work, so far?

## Step 4 - Cleanup

Coding agent takes specific directions of the User to clean up this implementation, as required




---
## Pattern Breadcrumbs for Future Clones
1. **Clone + Renaming Checklist**
   - `rsync` or copy the source app but immediately remove `node_modules`, `dist`, and `tsconfig.tsbuildinfo` to avoid stale artifacts.
   - Search/replace the original app name in `package.json`, `vite.config.ts`, `rollup.config.js`, HTML entry points, scripts, and README/test docs before touching code.
   - Register the new workspace in shared tooling (Playwright `PROJECT_WEB_SERVERS`, README commands, etc.). Diffing the source/target trees side-by-side helps catch missed strings.

2. **Widget Swap Playbook**
   - Strip the cloned host component down to a thin wrapper; import only the shared widget (`@df/ui-lit/<widget>`) and leave business logic in `@df/state` stores.
   - In `src/main.ts`, call `initializeFirebaseForApp` first, then resolve `getInitializedFirebaseApp()` and wire any widget-specific store initializers (e.g., `initializeChatStore`, `initializePushupStore`). Always guard emulator toggles via `shouldUseEmulatorForService()` so production + emulator stay aligned.
   - Keep the auth wrapper (`<df-auth-wrapper headless>`) if the widget assumes signed-in users; otherwise document auth expectations in README.

3. **Security + Firestore Rules**
   - Replace cloned rules with collection-specific validation for the new widget (`chatMessage`, etc.). Include helper functions for required fields/types so future diffs stay manageable.
   - After deploying to production (`pnpm --filter <app> exec firebase deploy --only firestore:rules`), note the exact command in session notes so the next run reuses it.

4. **Rollup Verification**
   - Always run `pnpm --filter <workspace> build:rollup` once cloning + widget wiring are done; this exercises the TS build plus the bundle step and surfaces “this is undefined” warnings early.
   - In README “Scripts”, list the rollup command explicitly so deploy-oriented tickets know which script to invoke.

5. **Docs & Tests Hygiene**
   - Update README/test instructions immediately after the swap so future agents don’t inherit stale references (pushups vs chat, etc.). A quick `rg 'activity' apps/<new-app>` helps confirm nothing old lingers.
 - Leave a short blurb in `tests/README.md` describing the intended integration coverage even if Playwright specs are deferred; it reminds the next ticket what remains.

6. **Optimization & Verification Follow-ups**
  - The Rollup output is currently ~1.7 MB. If you plan to embed the bundle across multiple sites, evaluate tree-shaking opportunities (e.g., ensure only necessary `@df/ui-lit` modules are imported) or lazy-load any heavy wrappers such as `df-auth-wrapper` to keep the payload lean.
  - Schedule a Playwright scenario (sign in → send message → verify transcript) once the chat UX stabilizes so widget regressions and rule changes are caught automatically.
  - Capture the exact rules-deploy command you used (e.g., `pnpm --filter @df/df-chat-app exec firebase deploy --only firestore:rules`) inside workspace docs or session notes to speed up future production pushes.
