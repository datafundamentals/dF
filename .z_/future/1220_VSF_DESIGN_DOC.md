# 1220 VSF (Virtual Search/File) Design Document

**Targeted Functionality:** VS Code Extension / Elasticsearch Integration
**Architecture Model:** "Model C" (Elasticsearch as Source of Truth for specific files)

---

## 1. Executive Summary

This design solves the "Alternate Persistence" problem. Most files live on the local file system. However, some files are migrated to an Elasticsearch Vector Database. This tool allows users to:
1.  **Migrate** a local file to the DB.
2.  **Search** for that file later.
3.  **Edit** that file in the **Standard VS Code YAML Editor**, transparently reading/writing to the DB.

## 2. UX Workflow

### A. Daily Operations (Local)
99% of work happens on local files. `df-yaml-tools` continues to provide helper buttons (tags, snippets) for these local files.

### B. The Exception (Remote/Virtual)
When a user needs to edit a file that resides *only* in Elasticsearch:
1.  User opens `df-yaml-tools` Webview.
2.  User searches for the document.
3.  User clicks a result.
4.  VS Code opens a **Standard YAML Editor** tab. The content is fetched from Elasticsearch.
5.  User edits and saves (Cmd+S). The content is updated in Elasticsearch.

### C. The Migration (Ingestion)
1.  User opens a local file.
2.  User clicks "Migrate to Vector DB" in the Webview.
3.  The content is indexed. (The local file can now be archived/deleted).

## 3. System Architecture

We leverage VS Code's **Virtual Document** capabilities.

*   **Local Scheme (`file://`):** Standard filesystem access.
*   **Virtual Scheme (`elasticsearch://`):** Virtual access to ES records.

### 3.1 The Virtual Provider
We implement a `TextDocumentContentProvider` for the `elasticsearch` scheme.
*   **URI Structure:** `elasticsearch://{index}/{path}?id={es_id}`
    *   `index`: The ES index name.
    *   `path`: The display path (e.g., `folder/doc.yaml`) - **Must end in .yaml to trigger YAML editor**.
    *   `id`: The actual Elasticsearch `_id` used for retrieval.

### 3.2 Persistence Logic
Since `TextDocumentContentProvider` is read-only, we implement "Save" via the `workspace.onWillSaveTextDocument` event listener.
*   **Event:** Detect save on `elasticsearch://` URI.
*   **Action:** Extract ID from URI -> `POST` content to Elasticsearch `_update` API.

---

## 4. Implementation Plan (Ticket Mapping)

The implementation is broken down into the following tickets:

*   **1220a_BUILD_TIMESTAMP_LOG:** Infrastructure sanity check.
*   **1220b_MIGRATE_ACTIVE_FILE:** (Phase 1) Ingestion. Reads local editor -> Writes to ES.
*   **1220c_SEARCH_INPUT:** (Phase 2) Search UI.
*   **1220d_SEARCH_RESULTS_SELECTOR:** (Phase 2) Display results & trigger open.
*   **1220e_VIRTUAL_DOC_PROVIDER:** (Phase 3) The core "Read" logic. Registers the provider.
*   **1220f_UI_STATE_MANAGEMENT:** UX Polish.

---

## 5. Gotchas & Future Considerations

### 1. URI Encoding
Elasticsearch IDs and paths can contain special characters. We must use `encodeURIComponent` when constructing URIs and `decodeURIComponent` when parsing them in the provider.

### 2. Stale Data (Concurrency)
*   *MVP:* Last write wins.
*   *Future:* Implement Optimistic Concurrency Control (OCC) using `_seq_no` and `_primary_term` from ES. If a conflict is detected during save, prompt the user or show a diff.

### 3. "Is Dirty" State
Virtual documents behave slightly differently than file documents regarding the "dirty" indicator. We must ensure the `onWillSave` listener waits for the async upload to complete before clearing the dirty flag (or let VS Code handle it naturally).
