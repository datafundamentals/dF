# Standardization Follow-up Tickets

This ticket produces the plan; the items below should be tracked as individual follow-up tickets. Each entry includes the objective, scope, dependencies, and acceptance criteria so future work can reference the standards that motivated it.

## 1. Consolidate NPM info patterns - done
- **Goal:** Retire the legacy `AsyncComputed` demo inside `apps/df-npm-info-app/src/ui/npm-info.ts` so the app exposes a single canonical implementation driven by `@df/state`.
- **Scope:** Remove the unused UI component, move any documentation-worthy snippets into `coding_docs/` if still valuable, and ensure `df-npm-info-app` imports only shared widgets.
- **Dependencies:** `coding_docs/SHARED_WEB_COMPONENT_DEFAULTS.md` (signals guidance); this ticket.
- **Acceptance:** No duplicate NPM info components remain; Storybook and dev harness continue to work.

## 2. Refresh `apps/df-lit-starter` as canonical skeleton - done
- **Goal:** Refactor those portions of the stock Lit starter export with changes necessary to follow the signals-first architecture as outlined in /coding_docs/SHARED_WEB_COMPONENT_DEFAULTS.md, while maintaining as much of the lit starter structure as is reasonably practical.
- **Scope:** Introduce a simple store in `src/stores/`, a matching presentation component, and at least one test or story demonstrating usage. Update README/docs to link back to the standards doc.
- **Dependencies:** `coding_docs/SHARED_WEB_COMPONENT_DEFAULTS.md`, `coding_docs/CODING_STANDARDS_STYLES.md`.
- **Acceptance:** New developers can clone the starter and see a working signals-based example without visiting other apps.

## 3. Stand up automated test tooling
- **Goal:** Implement the Playwright (or agreed alternative) workflow described in the testing docs.
- **Scope:** Add the tooling configuration, scripts in `package.json`, and at least one smoke test that exercises a shared component. Update testing docs with concrete commands once implemented.
- **Dependencies:** `coding_docs/CODING_TESTING_STRATEGY.md`, `coding_docs/CODING_TEST_METHODOLOGY.md`.
- **Acceptance:** `pnpm` scripts run successfully on CI and locally; documentation reflects actual behaviour.

## 4. Clean up `df-npm-info-widget` and related stores
- **Goal:** Resolve outstanding TODOs/duplications noted during analysis (duplicate `declare global` blocks, ensure property declarations follow the standard patterns, add inline references to the standards doc).
- **Scope:** Review `packages/ui-lit/df-npm-info-widget.ts` and `packages/state/src/stores/npm-info.store.ts`, applying the property/event patterns in the shared standards doc.
- **Dependencies:** `coding_docs/SHARED_WEB_COMPONENT_DEFAULTS.md`.
- **Acceptance:** Widget and store satisfy the documented patterns; lint/build/test pass.

## 5. Promote shared AsyncComputed helper (optional)
- **Goal:** Decide whether the `renderAsyncComputed` helper belongs in a shared utility package.
- **Scope:** If promoted, relocate to `packages/utils` (or another shared location), update imports, and document usage. If intentionally local, record the rationale in the standards doc.
- **Dependencies:** This ticket, item 1.
- **Acceptance:** Clear decision recorded; code reflects it.

## 6. Harmonize Storybook coverage
- **Goal:** Ensure Storybook stories exist for every canonical component and align with the documentation patterns.
- **Scope:** Audit `apps/df-storybook/stories/`, add or update stories to include documentation blocks, events lists, and references to the standards doc.
- **Dependencies:** `coding_docs/SHARED_WEB_COMPONENT_DEFAULTS.md`, `coding_docs/CODING_STANDARDS_STYLES.md`.
- **Acceptance:** Running Storybook shows updated stories with consistent docs across components.
