# Ticket 0429b — Conversation Management for OpenClaw Chat

## Executive Summary

The OpenClaw chat UI currently supports only a single, unbounded conversation per user. This ticket introduces full conversation management: users can start new work-request conversations with Cathy, return to previous ones via a sidebar list, and receive an auto-generated title when Cathy accepts the work request. The underlying Firestore data model is migrated from the ambiguous `sessions/` collection to a named, purpose-built `openclawWorkRequests/` collection.

---

## Pre and Post Requirements

This ticket focuses on changes to `apps/df-openclaw-chat` or related code.

1. Before loading the following ticket description into your context, read and follow `guides/1_TICKET_BEFORE_LOADING.md`
2. Then read the contents of this file into your context.
3. After loading the contents of this ticket into your context, read and follow `guides/2_TICKET_AFTER_LOADING.md`
4. Please understand that you are always required to follow the contents of relevant guides/ documents, even if they are not enumerated as a part of this ticket.

---

## Abstraction Schema

```yaml
Objectives:
  Enable Cathy to guide users through composing complete work requests across
  multiple named, persistent, returnable sessions.

  Key Results:
    - Users can start a new work request conversation at any time
    - Users can return to any previous conversation from a sidebar list
    - Each accepted work request receives an auto-generated title derived from
      the work request content
    - No conversation context bleeds between separate work requests
    - The sidebar is the only navigation surface; no other agent-switching UI
      is exposed to regular users

  Intent:
    Replace the single-session-per-user model with a named, persistent
    conversation model that mirrors standard AI chat UI paradigms (Gemini,
    Claude, ChatGPT) — but scoped tightly to the Cathy work-request purpose.

  Context:
    - Currently one Firestore session per user grows without bound and cannot
      be terminated or restarted
    - The fix in ticket 0429a (conversation history passed to API) makes the
      unbounded growth problem urgent
    - The OpenClaw chat UI has exactly one purpose: helping users compose work
      requests by answering all of Cathy's questions until she decides the
      request is fully formed and accepts it
    - Cathy drives the conversation; acceptance is her decision, not the user's
    - Title generation happens at acceptance time, titled from the work request
      itself — latency at that moment is acceptable

  Strategy:
    Use a single self-contained Firestore collection: openclawWorkRequests/{requestId}
    as the root entity, with messages as a subcollection of that same document.
    Conversation metadata and messages are co-located — no split paths, no
    cross-collection joins. The requestId becomes the canonical Work Request ID
    referenced by all future artifacts (logs, reports, file attachments).
    See guides/firebase-teaching/FIRESTORE_COLLECTION_NAMING.md.

  Tactics:
    - New Firestore collection: openclawWorkRequests/ (replaces sessions/)
    - Update Cloud Function trigger path and title-generation logic
    - Update @df/state openclaw store (collection paths, new conversation
      list state, create/switch/rename conversation functions)
    - Update df-openclaw-chat-widget UI: sidebar, new conversation button,
      active title in header, inline rename
    - Update firestore.rules for new collection
    - Update FIRESTORE_COLLECTION_NAMING.md registry (move planned entry
      to active)
    - Leave old sessions/ collection in place; no data migration

  WCPGW:
    - If the sidebar loads message subcollections for all conversations,
      Firestore read costs explode. The list must load metadata docs only;
      messages are fetched only for the active conversation.
    - If the requestId is not stable from creation through acceptance,
      future artifacts (logs, reports) cannot reliably reference it.
      The requestId must be assigned at conversation creation and never change.
    - If acceptance detection is ambiguous or unreliable, conversations
      never get titled and the sidebar fills with untitled entries. The
      initial acceptance mechanism must be simple and deterministic.
    - If security rules are not scoped to userId on openclawWorkRequests/,
      users can read each other's work requests.
    - If the superuser agent-switching UI bleeds into this ticket, scope
      expands significantly. That feature is explicitly out of scope here.
```

---

## Data Model

### New collection: `openclawWorkRequests/`

**`openclawWorkRequests/{requestId}`** — work request metadata doc

| Field | Type | Notes |
|---|---|---|
| `userId` | string | Owner. Used to query "all conversations for this user." |
| `agentId` | string | Always `'cathy'` for now. Ensures no context pollution between agents. |
| `title` | string \| null | null until Cathy accepts. Generated from the work request content at acceptance. |
| `status` | `'active'` \| `'accepted'` | `active` while in progress; `accepted` when Cathy submits. |
| `createdAt` | Timestamp | Set at conversation creation. |
| `lastMessageAt` | Timestamp | Updated on each new message for sidebar sort order. |

**`openclawWorkRequests/{requestId}/messages/{messageId}`** — individual messages

Same shape as current `sessions/{id}/messages/{id}` docs. Fields unchanged.

### Abandoned collection: `sessions/`

The `sessions/` collection and its message subcollections are left in place but no longer written to. No data migration. Existing data has no value and will age out or can be manually deleted from the Firestore console.

---

## Conversation Lifecycle

```
User clicks "New conversation"
  → Client creates openclawWorkRequests/{newId} doc (status: active, title: null)
  → Widget navigates to new conversation, messages subcollection is empty

User sends messages ↔ Cathy responds
  → onOpenclawMessage trigger fires on messages/{msgId} under new path
  → Full conversation history passed to API (as per ticket 0429a fix)
  → lastMessageAt updated on parent doc after each exchange

Cathy decides the work request is fully formed and signals acceptance
  → Initial implementation: surrogate detection (see Acceptance Signal section)
  → Cloud Function writes title to parent doc, sets status: 'accepted'

User can rename any conversation title at any time via inline edit in sidebar
```

---

## Layout & Real Estate

This UI is **desktop-only** in its initial iteration. No mobile or narrow-viewport behavior is required or expected. Responsive handling can be added in a future ticket.

The widget must expand to a two-column layout:

```
┌─────────────────────────────────────────────────────────────┐
│  Sidebar (240–280px)  │  Chat panel (remaining width)        │
│  ─────────────────    │  ──────────────────────────────────  │
│  [+ New conversation] │  Header: active title                │
│  ─────────────────    │  ──────────────────────────────────  │
│  • Conv title 1  3:56 │  Messages                            │
│  • Conv title 2  2:10 │                                      │
│  • Conv title 3  1:44 │                                      │
│  ...                  │  Composer                            │
└─────────────────────────────────────────────────────────────┘
```

**`df-openclaw-chat-app`** (the shell in `apps/df-openclaw-chat`) should be updated to give the widget enough horizontal room — target `min-width: 900px` or equivalent, with the shell no longer constraining to `min(1100px, 100%)` in a way that squeezes the two-column layout.

**`df-openclaw-chat-widget`** switches from a single-column grid to a two-column layout:
- Left column: sidebar, fixed width (~260px), full height, scrollable conversation list
- Right column: existing header + messages + composer, takes remaining width

The sidebar is always visible on desktop (not a hamburger/overlay in this iteration). Collapsible behavior is a future enhancement.

---

## UI Changes: `df-openclaw-chat-widget`

### Sidebar (new)
- Lists all `openclawWorkRequests` docs for the current user, ordered by `lastMessageAt` desc
- Each entry shows: title (or "Untitled" if null) + relative timestamp
- Active conversation is highlighted
- Clicking an entry switches to that conversation
- Sidebar is collapsible

### New conversation button
- Appears at the top of the sidebar
- Creates a new `openclawWorkRequests` doc and activates it

### Header
- Active conversation title shown in header
- Inline rename: clicking the title opens an edit field; saving writes back to Firestore

### Out of scope for this ticket
- Superuser / agent switching UI
- File attachment UI
- Conversation deletion / archiving
- Search across conversations

---

## Acceptance Signal (Surrogate)

> ⚠️ **This is a surrogate implementation.** The real acceptance mechanism — how Cathy reliably and intentionally signals that a work request is complete — is a non-trivial problem that would make this ticket 10x larger. It requires its own ticket(s) immediately following this one.

For the purposes of making this ticket completable and testable, acceptance is detected by a simple string match against Cathy's response content:

```typescript
const ACCEPTANCE_SIGNAL = 'This all sounds good to me';
```

If the assistant reply contains this string (case-sensitive), the Cloud Function treats it as an acceptance event: it writes the title to the parent doc and sets `status: 'accepted'`.

**What this enables:**
- The full acceptance flow (title generation, status change, UI update) can be implemented, wired, and manually tested end-to-end
- Cathy's system prompt can be temporarily updated to include this phrase when she is ready to accept, making the surrogate usable in real conversations

**What must follow in subsequent tickets:**
- A proper acceptance protocol between the Cloud Function and the OpenClaw agent (structured response, a dedicated API field, a webhook, or a prompt-engineering approach)
- Removal or replacement of the `ACCEPTANCE_SIGNAL` constant once the real mechanism is in place

---

## Code Changes by Layer

### `services/functions/src/triggers/onOpenclawMessage.ts`
- Update trigger document path: `openclawWorkRequests/{requestId}/messages/{messageId}`
- After writing the assistant reply, update `lastMessageAt` on the parent `openclawWorkRequests/{requestId}` doc
- Detect Cathy's acceptance signal; when detected, generate a title and write it to the parent doc (set `status: 'accepted'`, `title: <generated>`)

### `packages/state/src/stores/openclaw-chat.store.ts`
- Update all collection path references from `sessions/` to `openclawWorkRequests/`
- Add `openclawConversationsState`: signal holding the list of work request metadata docs for the current user (metadata only — no messages)
- Add `createOpenclawConversation()`: creates a new metadata doc, returns the requestId
- Add `switchOpenclawConversation(requestId)`: activates a different conversation (replaces current `switchOpenclawSession`)
- Add `renameOpenclawConversation(requestId, title)`: writes a new title to the metadata doc
- Remove the old `switchOpenclawSession` export once `df-openclaw-chat-widget` is updated

### `packages/ui-lit/src/df-openclaw-chat-widget.ts`
- Add sidebar rendering `openclawConversationsState`
- Wire "New conversation" button to `createOpenclawConversation()`
- Wire sidebar item clicks to `switchOpenclawConversation()`
- Wire header title inline rename to `renameOpenclawConversation()`
- Remove superuser panel and agent-switching UI from this widget (move to a separate superuser-only widget in a future ticket, or gate behind the existing superuser signal — do not delete the signal, just don't expose the UI to regular users)

### `firestore.rules`
- Add rules for `openclawWorkRequests/{requestId}`:
  - read/write scoped to `request.auth.uid == resource.data.userId`
- Add rules for `openclawWorkRequests/{requestId}/messages/{messageId}`:
  - read/write scoped to authenticated user who owns the parent doc

### `guides/firebase-teaching/FIRESTORE_COLLECTION_NAMING.md`
- Move `openclawWorkRequests/` from Planned to Active in the registry
- Update `sessions/` status to `Retired — no new writes`

---

## Out of Scope (explicit)

- Superuser / agent-switching UI (separate ticket)
- File attachments (future ticket)
- Conversation deletion or archiving UI
- Search across conversations
- Real acceptance protocol — the surrogate string match used here must be replaced; this is an immediate follow-on ticket
- Migration of data from `sessions/` collection
