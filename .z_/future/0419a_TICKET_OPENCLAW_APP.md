# Ticket: df-openclaw-chat — OpenClaw Chat UI App (v0.0.1)

- **Repo:** [datafundamentals/dF](https://github.com/datafundamentals/dF.git)
- **Location:** `apps/df-openclaw-chat/`
- **Name:** `df-openclaw-chat`
- **UI Heading:** Chatty Cathy Work Request System
- **Openclaw Agent:** Cathy
- **UI Slogan:** I am here to help you compose an Openclaw system request!
- **Status:** Approved — ready for development


---

## Context

Humans (executive users) interact with this instance of Openclaw to request specific chunks of work. OpenClaw exposes a session-based agent API. In this specific openclaw system, there is currently no web UI for a human to have a threaded conversation with an agent session, to negotiate a complex work request into this system of agents. This app provides that user interface, deployed as a standard dF web component.

---

## Goal of this iteration of the app.

A minimal, deployable chat Web Component that lets an authorized user exchange messages with the single OpenClaw agent authorized to converse with an openclaw session, in real time, until a perfectly formed work request is accepted into the system.

In this iteration of this app, the first instance of the work request for a user is theoretically ephemeral, but this iteration of the app never allows the user to grab a different work request, so only becomes truly ephemeral in a future iteration of the app.

In this iteration of the app there is also no submit function for a work request - the initial exchange stays open because the work request is never finalized.

--- 
## Special Requirements

The coding work in this ticket begins by cloning apps/df-chat-app into apps/df-openclaw-chat and then modifying that.

This step provides several benefits:
- speeds up development process
- sets styling standards by example
- makes compliance with coding standards easier
- inherits features otherwise declared out of scope for this ticket (auth, etc)

---

## Data Model

### `sessions/{sessionId}/messages/{messageId}`

```
{
  role: "user" | "assistant",
  content: string,
  createdAt: Timestamp,
  sessionId: string,
  status: "pending" | "processing" | "complete"
}
```

The `status` field is owned by the Firebase Function bridge. The app writes `"pending"` on send; the bridge updates to `"processing"` immediately on trigger, then `"complete"` after OpenClaw responds. The app uses this flag to drive the disabled state of the composer in `df-openclaw-chat-widget`.

---

## Architecture

### Message Flow

```
App → writes user message to Firestore (status: "pending")
         ↓  (Firestore trigger)
    Firebase Function (bridge)
         ↓  sets status: "processing" on triggering doc
         ↓  sessions_send
       OpenClaw  (separate system — not a Firebase Function, not Firestore-aware)
         ↓  response
    Firebase Function (bridge)
         ↓  writes new assistant message doc (status: "complete")
         ↓  updates original user doc to status: "complete"
App ← onSnapshot fires → UI updates
```

OpenClaw is not Firestore-aware. It exposes a session-based API and that is all. The Firebase Function is the bridge — it owns the call to OpenClaw and the write-back to Firestore. The app uses `onSnapshot` as the async delivery channel (Firestore as push notification substrate).

### Firebase Function — Operation Detail

- **Trigger:** `firestore.onWrite` scoped to `sessions/{sessionId}/messages/{messageId}`
- **Condition:** Execute only when `change.after.data().role === "user"` and `status === "pending"` (idempotency guard — prevents duplicate execution on retries)
- **Operation sequence:**
  1. Update triggered document: `status → "processing"`
  2. Extract `content` and `sessionId`
  3. POST to OpenClaw Session API via HTTPS/JSON
  4. Await OpenClaw response (standard 540-second Cloud Function timeout applies)
  5. Write new document: `{ role: "assistant", content: [response], status: "complete", createdAt: serverTimestamp(), sessionId }`
  6. Update original document: `status → "complete"`
- **Runtime:** Node.js, Firebase Functions v2

### Types (`packages/types/src/openclaw-chat.types.ts`)

```typescript
export interface OpenclawMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt: Timestamp;
  sessionId: string;
  status: 'pending' | 'processing' | 'complete';
}
```

### State Store (`packages/state/src/stores/openclaw-chat.store.ts`)

State Store owns all data manipulation operations within the app's code. (Because, view components only display data created or modified elsewhere.)

Responsibilities:
- Subscribe to `sessions/{sessionId}/messages` via `onSnapshot` — write to local state
- `sendOpenclawMessage(content)` — writes user message to Firestore with `status: "pending"`, sets internal `sendStatusSignal` to `'sending'`; triggers the Firebase Function bridge
- `loadSession(sessionId)` — sets active session, starts Firestore subscription; clears previous subscription if one existed
- Sets `sendStatusSignal` to `'idle'` once the message document transitions to `status: "complete"` in Firestore (observed via `onSnapshot`)

Exported signals (follow dF naming convention):
- `openclawChatMessagesState` — computed; exposes `{ status, documents, error, isListening }` shape matching `FirestoreCollectionState<OpenclawMessage>`
- `openclawChatSendState` — computed; exposes `{ status: 'idle' | 'sending' | 'error', error: string | null }`

The `openclawChatSendState.status === 'sending'` value is what `df-openclaw-chat-widget` reads to drive the disabled state of the composer. See `df-chat-widget` / `chat.store` in this repo for the reference implementation of this pattern.

Unsubscribe on session change or unmount in future iterations of this app.

### Session Persistence

For v0.0.1: on first app load, generate a `sessionId` (via OpenClaw), store it in Firestore under the authenticated user's document. On subsequent logins, retrieve and resume that same session. This satisfies the requirement that the exchange stays open — there is no mechanism for the user to start a new session in this iteration.

The deeper question of ephemeral vs. persistent sessions, and of session lifecycle tied to a formally submitted WorkRequest, is deferred to a future iteration where `sessionId` carries more meaning.

---

## Work Request Continuity

This Work Request Continuity section is provided for understanding of the design only. Since it is not fully implemented in this iteration of the app, please read only as related to this current iteration.

### The Ephemeral Session (Reset each new work request into system)
* **How it works:** A new `sessionId` is generated every time the user makes a new work request, into the system.
* **Mental Model:** Each work request gets it's own session.

### The Persistent Session (Persist across logins)
* **How it works:** The `sessionId` is stored with the specific Work Request in Firestore. When they log back in, the app retrieves that ID and resumes the thread.
* **Mental Model:** A WorkRequest is the central unit of organization for the user.

### The "Session Lifecycle" Flow
1.  **App Start:** Check if `user.currentSessionId` exists and is "active" (e.g., created in the last 2 hours).
2.  **If No:** Request a new session from OpenClaw; save ID to Firestore.
3.  **During Chat:** Use that ID for all transport.
4.  **On Completion:** Once the request is "fully formed" and sent to the background, the app clears the `currentSessionId`.

---

## Visual Components

### A reminder about coding standards in dF view components

This reminder should not be necessary, because all of this is found in https://github.com/datafundamentals/dF/tree/dev/guides, so it is furnished within this ticket only as a courtesy to the coding agent. You are still required to follow the guides, even if a detail is not mentioned also in this ticket.

If all else fails, please feel free to re-read docs in the guides, and also to observe how df-app-chat is coded. Both of these sources should be imperfect but generally in the right direction, in terms of intent.

Visual component code is kept super clean and easily maintainable, and does not allow for code that is non-visual, no matter how convenient that might be for the coding agent. Sloppy compliance in this regard will not pass code review.

Visual components display data as represented in signals variables which are modified in back end state stores. The visual components are never modified by the visual component. Commands sent to the state store, from the view component, might result in a different data state, but this would in turn only be seen once reflected by the signals variable. Following these simple restrictions results in super clean view code, and carefully distinct data manipulation code elsewhere. This rigor around separation of concerns is a primary focus of all coding within this repository. Please consult any and all https://github.com/datafundamentals/dF/tree/dev/guides documentation as is required to fully grok the importance and discipline of this rigor.

### Components — Placement Decision

All components belong in `/packages/ui-lit`, not `/apps`. Per dF guides: `/apps` is app-specific; `/packages` is shareable. Even components built exclusively for this app belong in `/packages` because they may become shareable in a future iteration.

The existing `df-chat-app` in this repo uses a single `df-chat-widget` component (in `packages/ui-lit`) that handles the message list, input field, send button, and disabled state in one unit. Study it as a reference — it is the closest existing example to what this app requires.

Do not modify `df-chat-widget` itself. It imports `chatMessagesState` and `chatSendState` directly from `@df/state` by name and is tightly coupled to the `df-chat-app` data model. Modifying it would risk breaking that app. Instead, this ticket requires a new component, **`df-openclaw-chat-widget`**, in `packages/ui-lit`, modeled on `df-chat-widget` but importing from the openclaw-specific signals defined in this spec.

**`df-openclaw-chat-widget`** (`packages/ui-lit/src/df-openclaw-chat-widget.ts`)
- Extends `SignalWatcher(LitElement)` — standard pattern for all dF components
- Imports `openclawChatMessagesState` and `openclawChatSendState` directly from `@df/state`
- Renders message list (user vs assistant styling via `role` field)
- Renders composer: `<md-outlined-text-field>` + `<md-filled-button>` (MD3 mandatory)
- Disabled state: `openclawChatSendState.status === 'sending'`
- On submit: calls `sendOpenclawMessage(content)` from the store; clears field
- Lifecycle: `connectedCallback` starts the Firestore listener; `disconnectedCallback` stops it
- Dispatches `df-openclaw-chat-widget-message-sent` and `df-openclaw-chat-widget-error` events

---

## Secrets and Configuration

For v0.0.1: follow the same pattern used by `df-chat-app` for environment variables and secrets. Do not introduce a new pattern.

A more deliberate secrets/configuration architecture (consolidated `.env` strategy, etc.) is out of scope for this iteration and will be addressed as a cross-codebase concern in a future ticket.

---

## Acceptance Criteria

- [ ] Authorized user can send a message and see the assistant reply appear without page refresh

---

## Out of Scope ( for v0.0.1)

- Token-by-token streaming
- Multiple concurrent sessions per user
- Message history beyond current session
- Admin UI for whitelist management
- Mobile optimization beyond basic responsive layout
- Authentication
- Whitelist of users
- Deployment concerns
---

_First drafted by Brian (Software Compliance Architect) — 2026-04-16_
_Updated 2026-04-16: Architecture section added; Open Question #2 resolved_
_Pete edited on 2026-04-18 for brian's review_
_Updated 2026-04-18: Addendum incorporated and deleted; components placement decision added; session persistence for v0.0.1 clarified; status field and Firebase Function detail added; secrets deferred to v0.0.2_
_Updated 2026-04-18: Component architecture corrected after dF repo review — single df-openclaw-chat-widget in packages/ui-lit; signal naming convention applied; types file added; status set to Approved_
