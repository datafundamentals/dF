# Ticket 0505aq: OpenClaw Work Request Delete Flow

## Why

Ticket `z_/0504b_TICKET_11ty_FROM_VM.md` added the visual placement for delete controls and the confirmation affordance, but intentionally deferred the actual backend delete implementation so the UI work could proceed without dragging in destructive Firestore behavior.

---

## Pre and Post Requirements

1. Before loading the following ticket description into your context, read and follow `guides/1_TICKET_BEFORE_LOADING.md`
2. Then read the contents of this file into your context.
3. After loading the contents of this ticket into your context, read and follow `guides/2_TICKET_AFTER_LOADING.md`
4. Please understand that you are always required to follow the contents of relevant guides/ documents, even if they are not enumerated as a part of this ticket.

---

## Scope

- Implement actual delete behavior for OpenClaw work requests
- Delete downstream `messages` subcollection documents as a part of the flow
- Define the safest client/store entry point in `@df/state`
- Confirm behavior for deleting the active conversation
- Confirm behavior when the last remaining conversation is deleted
- Verify accepted conversation edge cases

## Likely Touch Points

- `packages/state/src/stores/openclaw-chat.store.ts`
- `packages/types/src/openclaw-chat.types.ts` if extra state is needed
- `packages/ui-lit/src/df-openclaw-chat-widget.ts`
- Firestore rules and/or functions if a server-side delete path is required

## Acceptance Notes

- Keep the strong confirmation process already placed in the UI
- Do not leave orphaned message documents behind
- Define whether delete is purely client-driven or must be mediated by backend code
