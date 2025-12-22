# 1220e Virtual Doc Provider

## Goal
Implement Read/Write for `elasticsearch://` URI scheme and post-migration workflow.

## Context
See [.z_/future/1220_VSF_DESIGN_DOC.md].

**Note:** In 1220b, files are migrated to Elasticsearch and archived to `./deleted/`. This ticket implements the virtual document provider so users can continue editing those files from Elasticsearch.

## Action Items

### 1. Register Provider
- [ ] In `extension.ts`, register `TextDocumentContentProvider` for `elasticsearch` scheme.

### 2. Implement Read
- [ ] `provideTextDocumentContent(uri)`:
    - [ ] Parse ID from URI.
    - [ ] Fetch content from ES (via Webview roundtrip or direct Node fetch - Direct Node fetch recommended for Provider stability).

### 3. Implement Write
- [ ] Listen to `onWillSaveTextDocument`.
- [ ] If scheme is `elasticsearch`:
    - [ ] Parse ID.
    - [ ] POST content to ES `_update`.

### 4. Post-Migration Workflow (From 1220b)
- [ ] After successful migration in 1220b:
    - [ ] Editor tab closes (local file archived to `./deleted/`).
    - [ ] Automatically open virtual document with `elasticsearch://{index}/{path}?id={docId}` URI.
    - [ ] User continues editing seamlessly, now backed by Elasticsearch.

**Alternative:** If automatic reopen is complex, provide "Reopen from Elasticsearch" command that:
- [ ] Detects files in `./deleted/` that exist in ES.
- [ ] Offers to open them as virtual documents.

## Verification
- Migrate a file using 1220b (file closes and archives to `./deleted/`).
- File should automatically reopen as virtual doc OR
- Use "Reopen from Elasticsearch" command to open it.
- Verify content loads from ES.
- Edit and Save (Cmd+S).
- Verify changes persist in ES.
