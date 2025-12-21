# 1220c Search Input

## Goal
Provide search interface for Elasticsearch.

## Context
See [.z_/future/1220_VSF_DESIGN_DOC.md].

## Action Items

### 1. Update `elastic.store.ts`
- [ ] Add `searchQuery` and `searchResults` signals.
- [ ] Implement `performSearch(query)`.

### 2. Create Search UI
- [ ] Add `<md-outlined-text-field>` and Search button.
- [ ] Bind to store.

## Verification
- Search for a known term.
- Verify results signal updates.
