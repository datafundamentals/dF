# Ticket 0525a - Connect Upload To Cathy Session

## Executive Summary

In the df-openclaw-chat app, Upload capability was recently added. So now, within the app, a user can upload a file, and it is stored in firebase storage. 

This ticket attaches that file upload link to the session, such that any subsequent consumer of this session (agentic or otherwise) can access this file as part of this session context.

---

## Functional Requirements

### 1. Schema Update (Types & Store)
- Export a new `Attachment` type from [packages/types/src/openclaw-chat.types.ts](packages/types/src/openclaw-chat.types.ts):
  ```typescript
  export interface Attachment {
    url: string;
    name: string;
    path: string; // Firebase storage path for deletion tracking
    uploadedAt: Date;
  }
  ```
- Add an `attachments` field to `OpenclawConversation` in the same file:
  ```typescript
  attachments?: Attachment[];
  ```
- Update the local `OpenclawConversation` interface inside [packages/state/src/stores/openclaw-chat.store.ts](packages/state/src/stores/openclaw-chat.store.ts) to also include `attachments?: Attachment[]`.
- Update `normalizeConversationDoc` in that same store to normalize the `attachments` array: convert each entry's `uploadedAt` from a Firestore `Timestamp` to a `Date`, and pass through `url`, `name`, and `path` unchanged. If the field is absent, default to `[]`.

### 2. Store Logic (@df/state)
- Implement `addAttachmentToOpenclawConversation(conversationId: string, attachment: Attachment)`:
  - Uses `arrayUnion` to add the attachment object to the Firestore document's `attachments` field.
- Implement `removeAttachmentFromOpenclawConversation(conversationId: string, path: string)`:
  - Reads the current document, filters the `attachments` array to exclude the entry matching `path`, then writes the filtered array back via `updateDoc`. This approach is required because Firestore's `arrayRemove` does exact deep equality matching, which fails when `uploadedAt` is stored as a Firestore `Timestamp` but provided as a JavaScript `Date`.

### 3. Upload Store & Event Enrichment (@df/ui-lit)
- In [packages/ui-lit/src/df-upload-link-store.ts](packages/ui-lit/src/df-upload-link-store.ts), change `uploadFileTask` to return `{ downloadUrl: string; storagePath: string }` instead of a bare URL string. The `storagePath` is already constructed inside the function as `uploads/${sanitizedIdentifier}/${timestamp}_${file.name}` — expose it in the return value.
- In [packages/ui-lit/src/df-upload-link.ts](packages/ui-lit/src/df-upload-link.ts), update `_processFileUpload` to destructure `{ downloadUrl, storagePath }` from `uploadFileTask`. Set `this.linkUrl = downloadUrl`. Fire the `upload-link-gather-url` event with an enriched detail:
  ```typescript
  {
    linkUrl: downloadUrl,
    storagePath,
    fileName: file.name,
    uploadedAt: new Date(),
  }
  ```

### 4. UI Integration (@df/ui-lit)
- **Upload Hook**: In `DfOpenclawChatWidget`, update `handleFileUploaded(event: CustomEvent)`:
  - Read `linkUrl`, `storagePath`, `fileName`, and `uploadedAt` from `event.detail`.
  - Build an `Attachment` object: `{ url: linkUrl, name: fileName, path: storagePath, uploadedAt }`.
  - Call `addAttachmentToOpenclawConversation` using the current `activeConversationId` from `openclawActiveConversationState`.
- **Delete Hook**: In `DfOpenclawChatWidget`, update `confirmFileDelete(event: Event)`:
  - Upon successful storage deletion, call `removeAttachmentFromOpenclawConversation` with the current `activeConversationId` and `this.pendingDeleteFile.path` to clean up the link in the Firestore session.
- **Visual Feedback**: (Optional but recommended) Ensure the `df-file-list` correctly reflects that these files are now "attached" to the session.

### 5. Firestore Security Rules
- No change required. The `update` rule on `openclawWorkRequests` does not use `hasOnlyAllowedFields`, so writing the new `attachments` field via `updateDoc` is already permitted. The `create` rule's `hasOnlyAllowedFields` constraint is not a concern because conversations are never created with attachments pre-populated.

### 6. Agentic Context
- The objective is strictly accessibility: By placing the URLs in the session document, backend agents (like "Cathy") can now be updated in future tickets to read these URLs and process file contents during the conversation.

---

## Pre and Post Requirements

This ticket focuses on changes to `apps/df-openclaw-chat` or related code.

1. Before loading the following ticket description into your context, read and follow `guides/1_TICKET_BEFORE_LOADING.md`
2. Then read the contents of this file into your context.
3. After loading the contents of this ticket into your context, read and follow `guides/2_TICKET_AFTER_LOADING.md`
4. Please understand that you are always required to follow the contents of relevant guides/ documents, even if they are not enumerated as a part of this ticket.

---
