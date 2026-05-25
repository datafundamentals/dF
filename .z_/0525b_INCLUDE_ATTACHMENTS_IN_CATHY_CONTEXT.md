# Ticket 0525b - Include Session Attachments in Cathy Context

## Executive Summary

Ticket 0525a stored uploaded file metadata (`url`, `name`, `path`, `uploadedAt`) in the `attachments` array on the `openclawWorkRequests` Firestore document. This ticket makes Cathy aware of those files by including their URLs in the system context that `onOpenclawMessage` sends to the OpenClaw chat completions API.

**Prerequisite:** Ticket 0525a must be merged and deployed.

---

## Background: How `onOpenclawMessage` Works

The trigger at [services/functions/src/triggers/onOpenclawMessage.ts](services/functions/src/triggers/onOpenclawMessage.ts) already fetches the conversation document before sending a request to OpenClaw (line 81):

```typescript
const conversationSnap = await conversationRef.get();
const agentId = (conversationSnap.get('agentId') as string | undefined) ?? OPENCLAW_WORK_REQUEST_AGENT_ID;
```

It then builds a `systemContext` object (line 103) and sends the full message array to `/v1/chat/completions`. The `attachments` array is present on the conversation document from ticket 0525a but is not yet read or forwarded.

---

## Functional Requirements

### 1. Read Attachments from the Already-Fetched Conversation Snapshot

In `onOpenclawMessage`, read `attachments` from `conversationSnap` immediately after the existing `agentId` read:

```typescript
const rawAttachments = conversationSnap.get('attachments') as Array<{url: string; name: string}> | undefined;
const attachments = Array.isArray(rawAttachments) ? rawAttachments : [];
```

No additional Firestore reads are required — `conversationSnap` is already fetched.

### 2. Include Attachment URLs in the System Context

Extend the `systemContext` content string to include attachment information when the array is non-empty. The resulting system context should look like:

```
CONTEXT: The unique ID for this work request is ${requestId}. Status URL: ${statusUrl}.
Uploaded files available in this session:
- ${name}: ${url}
- ${name}: ${url}
```

When `attachments` is empty, the system context string should be identical to what it is today (no trailing newline or empty section).

### 3. No Other Changes Required

- The `messages` array shape (`{role, content}`) does not change.
- No new Firestore reads.
- No changes to the callable functions, the client, or `@df/state`.
- No changes to Firestore security rules (the function uses the admin SDK, which bypasses rules).

---

## Acceptance Criteria

1. When a conversation has one or more attachments, the system context forwarded to OpenClaw includes each file's `name` and `url`.
2. When a conversation has no attachments, the system context is byte-for-byte identical to the current output.
3. `pnpm build` passes in `services/functions/`.
4. Manual test: upload a file in the chat UI, send a message, confirm Cathy's reply references or acknowledges the file.

---

## Pre and Post Requirements

This ticket focuses on changes to `services/functions/`.

1. Before loading the following ticket description into your context, read and follow `guides/1_TICKET_BEFORE_LOADING.md`
2. Then read the contents of this file into your context.
3. After loading the contents of this ticket into your context, read and follow `guides/2_TICKET_AFTER_LOADING.md`
4. Please understand that you are always required to follow the contents of relevant guides/ documents, even if they are not enumerated as a part of this ticket.

---
