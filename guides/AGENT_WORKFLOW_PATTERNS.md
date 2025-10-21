# Agent Workflow Patterns

> **Tier:** 3 (Load on Demand)
>
> **For Agents:** Load this guide ONLY if:
> - You are running multi-step automation with multiple audit passes
> - You are delegating a complex ticket to another agent with explicit phases
> - You are explicitly instructed to use "two-phase" or "multi-phase prompting"
>
> For single-phase work (most tickets), follow `guides/TICKET_SESSION_CHECKLIST.md` instead.
>
> **For Humans:** Use this when coordinating complex multi-agent tasks or automating workflows.

These prompt frameworks keep MD3 standards top-of-mind for both human and AI collaborators. Use them when running multi-step automation or delegating complex tickets.

## Two-Phase Prompting

### Phase 1 – Build
```
Prompt: "Implement [feature] focusing on functionality and correctness."
Goal: Produce working code with tests.
Context: Ticket description, architecture docs, relevant source files.
Do not mention standards enforcement yet to reduce cognitive load.
```

### Phase 2 – Audit
```
Prompt: "Audit the implementation against STANDARDS_STYLES.md and 
TICKET_COMPLETION_CHECKLIST.md. Report ALL violations before we proceed. Do not fix yet—just report."
Goal: Produce a violation report (coding standards, missing docs/tests).
Context: Standards docs, diff from Phase 1, compliance tooling output.
```

### Phase 3 – Remediate
```
Prompt: "Fix the violations reported in Phase 2. Show git diff of changes."
Goal: Achieve compliance and regenerate reports.
Context: Violation report + codebase.
```

### Why It Works
- Forces an explicit standards pass instead of hoping the builder remembers everything
- Makes it easy to split responsibilities across multiple agents or humans
- Produces a written compliance log you can attach to tickets/PRs

## Decision Tree
If the audit returns **zero violations**, skip directly to a final verification run (`pnpm scan:compliance`, `pnpm lint`, `pnpm test`). Otherwise repeat the audit-remediate loop until clean.

## Implementation Notes
- Capture audit output in the PR description under "Standards Audit"
- Store unresolved findings in `.z_/future/` as technical debt tickets
- When automation is updated, refresh prompts to reference new tooling or docs
