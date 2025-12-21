# 1220e Virtual Doc Provider

## Goal
Implement Read/Write for `elasticsearch://` URI scheme.

## Context
See [.z_/future/1220_VSF_DESIGN_DOC.md].

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

## Verification
- Open virtual doc.
- Verify content loads.
- Edit and Save.
- Verify persistence in ES.
