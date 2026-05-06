# Ticket 05nnd: OpenClaw Status URL Configuration

## Why

Ticket `z_/0504b_TICKET_11ty_FROM_VM.md` added a status link in the UI using the current production-style URL pattern. That is enough for visual placement, but the base URL should be configurable rather than hardcoded.


---

## Pre and Post Requirements

1. Before loading the following ticket description into your context, read and follow `guides/1_TICKET_BEFORE_LOADING.md`
2. Then read the contents of this file into your context.
3. After loading the contents of this ticket into your context, read and follow `guides/2_TICKET_AFTER_LOADING.md`
4. Please understand that you are always required to follow the contents of relevant guides/ documents, even if they are not enumerated as a part of this ticket.
5. Always bring up and resolve with Pete(user) any ambiguities, wrong directions, or other difficulties with this ticket before beginning work.

---

## Scope

- Move the status-link base URL into configuration
- Decide whether configuration belongs in the app shell, widget properties, or environment variables
- Preserve the current request-id path structure
- Verify dev, preview, and production behavior

## Likely Touch Points

- `apps/df-openclaw-chat/src/df-openclaw-chat-app.ts`
- `packages/ui-lit/src/df-openclaw-chat-widget.ts`
- App docs and environment configuration references
