# 1220b Migrate Active File

## Goal
Implement "Migrate to Vector DB" functionality.

## Context
See [.z_/future/1220_VSF_DESIGN_DOC.md].
This is the ingestion step. Reads the active local file and sends it to Elasticsearch.

## Action Items

### 1. Create `elastic.store.ts` (State)
- [ ] Create `packages/state/src/stores/elastic.store.ts`.
- [ ] Implement `indexDocument(path: string, content: string)`.
    - [ ] POST to Elasticsearch.

### 2. Extension Host Logic
- [ ] In `extensions/df-yaml-tools/src/extension.ts`:
    - [ ] Listen for `GET_ACTIVE_EDITOR_CONTENT`.
    - [ ] Return `{ content, path }` of the active editor.

### 3. UI Implementation
- [ ] In `df-yaml-tools-app.ts`:
    - [ ] Add "Migrate" button.
    - [ ] Wire up: Click -> Request Content -> Receive Content -> Index to Store.

## Verification
- Open local YAML.
- Click Migrate.
- Verify success response from ES.
