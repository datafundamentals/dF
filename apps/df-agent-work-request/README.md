# @df/df-agent-work-request

OpenClaw work-request app shell for local development of the shared `df-agent-work-request-widget`.

## Scripts

- `pnpm --filter @df/df-agent-work-request dev`
- `pnpm --filter @df/df-agent-work-request build`
- `pnpm --filter @df/df-agent-work-request preview`
- `pnpm --filter @df/df-agent-work-request start:test`
- `pnpm --filter @df/df-agent-work-request build:rollup`

## Notes

- The main UI implementation lives in [packages/ui-lit/src/df-agent-work-request-widget.ts](/Users/petecarapetyan/work/primary/dF/packages/ui-lit/src/df-agent-work-request-widget.ts).
- The app shell lives in [src/df-agent-work-request-app.ts](/Users/petecarapetyan/work/primary/dF/apps/df-agent-work-request/src/df-agent-work-request-app.ts).
- Firebase initialization is handled through `@df/state`.
