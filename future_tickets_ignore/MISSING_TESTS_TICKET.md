# Missing Tests

Documented while auditing docs for the October 2025 standards ticket. Each item below should become its own narrow ticket or be grouped thoughtfully.

- `packages/utils/src/markdown.ts`: no unit coverage for the markdown parsing helpers; add tests that exercise headings, lists, and paragraph flushing.
- `packages/state/src/stores/*.ts`: stores such as `practice-widget.store.ts` and `npm-info.store.ts` rely exclusively on Playwright coverage. Add signal-focused unit tests (e.g., verifying status transitions and error forcing) so regressions are caught without browser runs.
- `packages/ui-lit/src/*.ts`: components (practice widget, npm info widget, upload link) are only tested through consuming apps. Add component-level tests via Web Test Runner or snapshot harnesses to lock down property/event contracts.
