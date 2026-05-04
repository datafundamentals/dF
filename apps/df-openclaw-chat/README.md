# @df/df-openclaw-chat

OpenClaw work-request app shell for local development of the shared `df-openclaw-chat-widget`.

## Scripts

- `pnpm --filter @df/df-openclaw-chat dev`
- `pnpm --filter @df/df-openclaw-chat build`
- `pnpm --filter @df/df-openclaw-chat preview`
- `pnpm --filter @df/df-openclaw-chat start:test`
- `pnpm --filter @df/df-openclaw-chat build:rollup`

## Notes

- The main UI implementation lives in [packages/ui-lit/src/df-openclaw-chat-widget.ts](/Users/petecarapetyan/work/primary/dF/packages/ui-lit/src/df-openclaw-chat-widget.ts).
- The app shell lives in [src/df-openclaw-chat-app.ts](/Users/petecarapetyan/work/primary/dF/apps/df-openclaw-chat/src/df-openclaw-chat-app.ts).
- Firebase initialization is handled through `@df/state`.
