# Ticket 05nnd: OpenClaw Recurring Work Request Backend

## Why

Ticket `0504a` added the recurring toggle and summary as a visual-only placement exercise. The data model and agent/backend behavior remain undefined.

## Scope

- Define the recurring data model for OpenClaw work requests
- Decide where recurrence is stored and how it is represented
- Wire the UI toggle to persisted state
- Define how the agent or conversation flow controls recurrence
- Replace the temporary visual summary with real recurrence text

## Likely Questions

- Is recurrence stored on the work request document itself?
- Is the agent authoritative for recurrence, or can the user control it directly?
- What summaries are valid beyond `ONE TIME` and `DAILY`?

## Likely Touch Points

- `packages/types/src/openclaw-chat.types.ts`
- `packages/state/src/stores/openclaw-chat.store.ts`
- `packages/ui-lit/src/df-openclaw-chat-widget.ts`
- OpenClaw backend/function integration if recurrence is agent-driven
