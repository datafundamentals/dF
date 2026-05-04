# Ticket 05nnd: OpenClaw Acceptance Lifecycle Hardening

## Why

Ticket `0504a` kept the current acceptance visuals but did not resolve lifecycle questions around accepted requests, follow-up conversation creation, and future destructive actions such as delete.

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
