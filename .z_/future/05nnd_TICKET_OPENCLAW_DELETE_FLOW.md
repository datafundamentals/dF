# Ticket 05nnd: OpenClaw Work Request Delete Flow

## Why

Ticket `0504a` added the visual placement for delete controls and the confirmation affordance, but intentionally deferred the actual backend delete implementation so the UI work could proceed without dragging in destructive Firestore behavior.

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
