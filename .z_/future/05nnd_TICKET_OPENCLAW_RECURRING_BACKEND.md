# Ticket 05nnd: OpenClaw Recurring Work Request Backend

## Why

Ticket `z_/0504b_TICKET_11ty_FROM_VM.md` added the recurring toggle and summary as a visual-only placement exercise. The data model and agent/backend behavior remain undefined.

---

## Pre and Post Requirements

1. Before loading the following ticket description into your context, read and follow `guides/1_TICKET_BEFORE_LOADING.md`
2. Then read the contents of this file into your context.
3. After loading the contents of this ticket into your context, read and follow `guides/2_TICKET_AFTER_LOADING.md`
4. Please understand that you are always required to follow the contents of relevant guides/ documents, even if they are not enumerated as a part of this ticket.
5. Always bring up and resolve with Pete(user) any ambiguities, wrong directions, or other difficulties with this ticket before beginning the coding work. This includes a confirmation from both coding agent and Pete that everything is resolved, and we are ready to code.

---

## Scope

- UI only toggles between `ONE TIME` and `AWAITING PERIOD FROM AGENT`
- The `AWAITING PERIOD FROM AGENT` is replaced later by the agent
- Once the agent has set a recurring string, toggle switch is disabled
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
