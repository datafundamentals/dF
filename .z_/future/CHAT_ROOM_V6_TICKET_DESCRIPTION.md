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



