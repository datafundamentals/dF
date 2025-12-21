# Technical Design Document: Dual-Persistence IDE Workflow

**CURRENT df-yaml-tool Status:** df-yaml-tool extends the functionality of the yaml editor, by offering convenience methods for editing the contents of the editor.

**df-yaml-tool Status to be ADDED::** While maintaining existing functionality, df-yaml-tool will add capability. The yaml editor will be enabled to also source from and write to a vector DB using the VFS - VSCode FileSystemProvider.

**Targeted Functionality:** VSCode Extension / Elasticsearch Integration

---

## 1. Executive Summary

This design solves the "Alternate Persistence" problem: managing files that can either exist as local YAML/Markdown files, or alternately as documents in an Elasticsearch (ES) Vector Database. The delta is to allow real-time, IDE-native editing of database records, while maintaining the same custom tooling (linting, formatting) used for local files.

## 2. UX Workflow Summary

### Daily Operations

Normal daily operations are done against a very small number of files for that day - which reside in the actual file system. In this normal daily workflow, there is no need for VFS or files written to the elasticsearch vector db, until EOD, when the day's work is written to elasticsearch, almost as-if an archiving function, from the perspective of workflow. Such daily operations make up for probably 99% of the workflow in the system, from a UX perspective. 

### The Workflow Exception - Reading or Editing Files Persisted on Elasticsearch

These workflow exceptions are few in number, but it does happen. 

Sometimes a user needs to read or edit a file from among the thousands to be persisted in Elasticsearch vector db.

In this rare instance, the user can utilize the df-yaml-tools webview to intiate an elasticsearch search for, and then load up into the yaml editor,  any single document (previously a system file) from the elasticsearch db.

Once loaded into the yaml file editor, the yaml file editor should function the same as if it was working with a system file. 

Similarly, the df-yaml-tool should continue to work with the contents of the yaml file editor exactly as it has been working against the content, when it was from system files opened up in the editor.

### The Manual Testing Workflow. 

Loading files to elasticsearch is a batch operation that happens externally at EOD. This does not in any way involve the df-yaml-tool.

There is, however, a rare but critical workflow use case, when the user wishes to load a single file into Elasticsearch using the df-yaml-tool webview - **and immediately view/edit** that same content in the already connected yaml editor.

This design provides for that workflow use case. (See follow-up Ticket 1220b)

## 3. System Architecture

We leverage the **VSCode FileSystemProvider API** to create a non-physical URI scheme.

[gemini3 please edit this portion to reflect your comments on the need to use FileSystemDirectoryHandle as a part of this work, if still applicable?]

* **Local Scheme (`file://`):** Standard filesystem access.
* **Virtual Scheme (`es-db://`):** Virtual access to ES records.
* **Unified Tooling:** Extension logic is "scheme-agnostic," applying YAML/Markdown features to any buffer regardless of its source.

---

## 4. Core Components

### 3.1 The Virtual File System (VFS)

A custom provider will map URIs to Elasticsearch REST API calls.

[gemini3 please review the URI Structure below - is this still valid? Not sure how this is used, or by what?]
* **URI Structure:** `es-db://{index_name}/{document_id}.{extension}`
* **Permissions:** Read/Write enabled; Delete/Rename (Optional/Phase 2).

### 3.2 The Persistence Logic (WCGW Guardrails)

To prevent "isDirty" state nightmares and revision collisions, the system implements **Optimistic Concurrency Control (OCC)**.

* **Sequence Tracking:** Every `readFile` operation caches the ES `_seq_no` and `_primary_term`.
* **Conflict Detection:** On `writeFile`, the provider sends these versions back to ES. If a 409 Conflict occurs (indicating a headless batch or another session updated the record), the save is rejected.
* **Resolution:** A native VSCode Diff View is triggered to allow manual merging.

### 3.3 Unified Extension Integration

Existing YAML/Markdown tooling must be decoupled from the filesystem.

* **Document Selectors:** Update all providers (hover, completion, formatting) to include `{ scheme: 'es-db' }`.
* **Context Awareness:** Tooling must remain functional even when no physical file path exists.

---

## 5. Proposed Implementation Phases (For Ticket Creation)

[gemini3 please review this section. It seems out of sync with our current tickets as planned? 1220a, 1220b etc? Else clarify distinction between phases and tickets?]

1. **Phase 1: VFS Infrastructure.** Register the `es-db` scheme and implement basic `readFile` connectivity.
2. **Phase 2: Metadata & Versioning.** Implement the `versionStore` to track ES sequence numbers.
3. **Phase 3: Persistence & OCC.** Implement `writeFile` with conflict detection and error handling.
4. **Phase 4: Tooling Unification.** Update `package.json` and Document Selectors to enable YAML/Markdown features on the new scheme.
5. **Phase 5: Search & Navigation.** Create a command/panel to allow users to "Open by ID" or search ES to hydrate the VFS.
6. **Phase 6: Conflict UI.** Implement the side-by-side Diff View for collision resolution.

---

## 6. Technical Appendix: Provider Boilerplate

```typescript
/**
 * ESFileSystemProvider
 * Bridges VSCode Editor buffers with Elasticsearch Documents.
 */
export class ESFileSystemProvider implements vscode.FileSystemProvider {
    // Logic for readFile, writeFile, and stat as discussed.
    // Includes hook for Optimistic Concurrency Control.
}

```

---

## 7. Design Constraints & Safety

* **No File Mirroring:** VFS files must never be written to the local disk by the provider; they exist only in the VSCode buffer to prevent the daily batch script from creating duplicates.
* **Path Isolation:** Logic relying on absolute local paths must be guarded or bypassed for `es-db` URIs.

---

## 8. Gotchas


[gemini3 please review - If there are differences that our latest changes have created do they affect the gotchas below?]

Here are some gotchas that might need to be considered before designing specific tickets. Please ignore any paths in this portion of the documentation, these are surrogates for the applicable paths within this monorepo.

When you move this to Copilot and start generating code, the **Conflict Resolution (Diff API)** is usually the trickiest part of the "WCGW" safety net. It’s the difference between a tool that "just works" and one that accidentally wipes out hours of headless batch work.

Here are the specific "Gotchas" and the logic you should include in your tickets for the Diff UI.

---

### 1. The "Read-Only" Remote Buffer

When a conflict occurs, you need to show the user what changed in Elasticsearch.

* **The Gotcha:** You shouldn't just overwrite the current editor.
* **The Design:** Create a "Shadow URI." If the user is editing `es-db://index/doc.yaml`, you can create a temporary URI like `es-db-readonly://index/doc.yaml?version=123`.
* **The Action:** Use `vscode.commands.executeCommand('vscode.diff', ...)` to open a side-by-side view.

### 2. Manual Resolution vs. Force Overwrite

Your design document should specify how the user "wins" the conflict:

* **Option A (Force):** A button that ignores the `_seq_no` and performs a standard write (risky).
* **Option B (Refresh):** A button that pulls the latest from ES, overwriting the local buffer (loses local work).
* **Option C (Manual Merge):** The user copies lines from the "Remote" side of the diff to their "Local" side and hits Save again.

### 3. The "Stale File" Problem

If you leave a virtual file open in a tab for three days, and your headless batch runs ten times in the background, your local version is wildly out of date.

* **The Guardrail:** In your `onDidOpenTextDocument` or `onDidSaveTextDocument` listeners, you might want to add a "Pre-flight Check" that pings ES to see if the `_seq_no` has changed while the tab was sitting idle.

### 4. URI Encoding for IDs

Elasticsearch IDs can contain characters that are "illegal" or "reserved" in URIs (like `/`, `?`, or `#`).

* **The Gotcha:** If an ES ID is `user/profile#1`, a URI like `es-db://index/user/profile#1.yaml` will break VSCode’s path parsing.
* **The Design:** Always `encodeURIComponent` the document ID when constructing the URI and `decodeURIComponent` it inside the `FileSystemProvider`.

