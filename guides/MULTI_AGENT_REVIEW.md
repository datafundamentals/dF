# Multi-Agent Review Protocol

Break reviews into specialised passes so no one forgets MD3 standards.

## Roles
- **Agent A – Builder**
  - Implements the feature
  - Runs functional tests + local verification
- **Agent B – Reviewer**
  - Reviews logic, architecture, performance
  - Ensures documentation/tests match the change
- **Agent C – Standards Auditor**
  - Runs automation (`pnpm scan:compliance`, `pnpm lint`, `pnpm generate:compliance-report`)
  - Verifies `guides/TICKET_COMPLETION_CHECKLIST.md`
  - Reviews against `/guides/STANDARDS_STYLES.md`
  - Approves or rejects exemptions documented in the PR

## Hand-off Script
1. Agent A completes Phase 1 (build) and Phase 2 (audit) from `AGENT_WORKFLOW_PATTERNS.md`
2. Agent B performs functional review and documents findings
3. Agent C receives:
   - PR link or diff
   - Audit report output
   - Any requested exemptions

Sample standards prompt:
```
prompt_agent_c: "Review this PR against STANDARDS_STYLES.md. Report ALL violations. Use TICKET_COMPLETION_CHECKLIST.md as your verification guide."
```

## Exit Criteria
- Compliance scanner passes
- Checklist complete with links to documentation updates
- Technical debt logged in `.z_/future/` if remediation deferred
- Release notes / changelog updated when required

This protocol keeps reviews laser-focused: Builder builds, Reviewer validates behaviour, Auditor enforces standards.
