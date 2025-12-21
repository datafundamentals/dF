# 1220d Search Results Selector

## Goal
Display results and trigger Virtual Document opening.

## Context
See [.z_/future/1220_VSF_DESIGN_DOC.md].

## Action Items

### 1. Display Results
- [ ] Render list of results in Webview.

### 2. Trigger Open
- [ ] On click, send message to Host:
  ```typescript
  { command: 'openDocument', id: result._id, path: result._source.path }
  ```
- [ ] In Host:
    - [ ] Construct URI: `elasticsearch://[index]/[path]?id=[id]`.
    - [ ] `vscode.window.showTextDocument(uri)`.

## Verification
- Click result.
- Verify tab opens with correct URI (content empty until 1220e).
