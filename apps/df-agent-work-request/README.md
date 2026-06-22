# @df/df-agent-work-request

Agentic work-request app shell for local development of the shared `df-agent-work-request-widget`.

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
- Title, Intent, Summary, and Metrics are reviewed by the OpenClaw main agent (John) before initial creation and before later edits are saved. John applies the latest installed `work-request-key-fields` skill; rejected fields remain editable with his feedback.
