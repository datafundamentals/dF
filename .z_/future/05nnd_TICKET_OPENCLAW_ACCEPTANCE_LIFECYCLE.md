# Ticket 05nnd: OpenClaw Acceptance Lifecycle Hardening

## Why

Ticket `z_/0504b_TICKET_11ty_FROM_VM.md` kept the current acceptance visuals but did not resolve lifecycle questions around accepted requests, follow-up conversation creation, and future destructive actions such as delete.


---

## Pre and Post Requirements

1. Before loading the following ticket description into your context, read and follow `guides/1_TICKET_BEFORE_LOADING.md`
2. Then read the contents of this file into your context.
3. After loading the contents of this ticket into your context, read and follow `guides/2_TICKET_AFTER_LOADING.md`
4. Please understand that you are always required to follow the contents of relevant guides/ documents, even if they are not enumerated as a part of this ticket.

---

## Scope

- Review the transition from `active` to `accepted`
- Review the automatic follow-up conversation creation behavior
- Define how accepted requests interact with future delete/edit operations
- Confirm that message sending, status rendering, and follow-up creation stay coherent during acceptance transitions

## Likely Touch Points

- `packages/ui-lit/src/df-openclaw-chat-widget.ts`
- `packages/state/src/stores/openclaw-chat.store.ts`
- `services/functions/src/triggers/onOpenclawMessage.ts`

## Acceptance Notes

- Avoid racey UX when a request becomes accepted while the UI is open
- Define the intended behavior before attaching destructive operations to accepted requests
