# 🎫 Ticket Completion Verification

> **Tier:** 2 (Load by Task)
>
> **For Agents:** Load this guide before marking a ticket as complete or opening a PR.
>
> **For Humans:** Copy this checklist into the ticket closing comment (or PR template) and confirm every item before calling work "done".

Copy this checklist into the ticket closing comment (or PR template) and confirm every item before calling work "done".

## Standards Compliance
- [ ] All UI uses MD3 components (`@material/web`) – **no native `<button>`, `<input>`, `<select>`, `<textarea>`**
- [ ] `pnpm scan:compliance` passes with zero violations
- [ ] `pnpm lint` passes with no warnings (run from repo root)
- [ ] TypeScript build succeeds (`pnpm build`)

## Code Quality
- [ ] No `console.log` statements in production code (`console.error` allowed for surfaced errors)
- [ ] No commented-out code blocks
- [ ] No `TODO`/`FIXME` without linked ticket numbers
- [ ] No `@ts-ignore` without justification comments and follow-up ticket

## Documentation
- [ ] Public APIs/classes/functions include JSDoc (where applicable)
- [ ] README / usage docs updated for user-facing changes
- [ ] CHANGELOG entry added if consumers are impacted
- [ ] Storybook stories added or updated for new/changed components

## Testing
- [ ] Unit tests cover new logic paths
- [ ] Integration tests updated where behavior changed
- [ ] Edge cases captured (error states, loading states, empty data)
- [ ] Manual testing notes captured in the ticket (scenarios + results)

## Review & Handoff
- [ ] Self-review performed (diff read top-to-bottom)
- [ ] Breaking changes called out with migration notes (if any)
- [ ] Documentation for follow-up work filed in `.z_/future/` (if needed)
- [ ] Compliance dashboards/report regenerated (`pnpm generate:compliance-report`)

> When in doubt, re-run the full standards suite: `pnpm scan:compliance && pnpm lint && pnpm test`.
