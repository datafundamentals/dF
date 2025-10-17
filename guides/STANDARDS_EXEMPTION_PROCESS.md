# Standards Exemption Process

Automation blocks native HTML from entering the codebase by default. Rare exceptions are allowed but must be **explicitly justified** so future contributors understand the trade-off.

## When an Exemption Is Allowed
- Accessibility tooling has no Material Web equivalent yet (e.g., screen-reader probes)
- Browser APIs expose UI (e.g., `<input type="file">`) that must remain native but are visually hidden
- Polyfills or third-party widgets render native markup that cannot be wrapped safely

All other cases must be refactored to MD3 components.

## Required Steps
1. **Document the Reason**
   - Add a code comment directly above the offending line:
     ```ts
     // eslint-disable-next-line @df/md3/enforce-md3 -- explains why native element is required, link to ticket
     ```
   - Reference a follow-up issue if a future fix is expected.

2. **Update Compliance Records**
- Run `pnpm scan:compliance --json` and add the exemption note to `COMPLIANCE_REPORT.md`
- Log the exception in `.z_/future/STANDARDS_EXEMPTIONS.md` with:
  - File + line
  - Reason + approving reviewer
  - Planned review date
- If the exemption is for an MD3 gap, also update `.z_/future/MD3_GAPS.md`

3. **Notify Reviewers**
   - Mention the exemption in the PR description under "Compliance Notes"
   - Tag the standards reviewer (Agent C) to acknowledge the waiver

4. **Add Watchpoints**
   - Include automated tests to ensure the behavior covered by the exemption stays valid
   - Add monitoring/telemetry if production behavior could regress silently

## Review Cadence
- Revisit exemptions quarterly during standards retrospectives
- Retire exemptions immediately when Material Web provides an equivalent component

A good exemption is *documented, time-bounded, and observable*. Anything else should be treated as a blocker until an MD3-compliant solution is implemented.
