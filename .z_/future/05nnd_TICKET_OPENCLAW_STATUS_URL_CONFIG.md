# Ticket 05nnd: OpenClaw Status URL Configuration

## Why

Ticket `0504a` added a status link in the UI using the current production-style URL pattern. That is enough for visual placement, but the base URL should be configurable rather than hardcoded.

## Scope

- Move the status-link base URL into configuration
- Decide whether configuration belongs in the app shell, widget properties, or environment variables
- Preserve the current request-id path structure
- Verify dev, preview, and production behavior

## Likely Touch Points

- `apps/df-openclaw-chat/src/df-openclaw-chat-app.ts`
- `packages/ui-lit/src/df-openclaw-chat-widget.ts`
- App docs and environment configuration references
