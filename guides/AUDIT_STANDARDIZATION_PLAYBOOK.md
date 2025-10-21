# Standardization Audit Playbook

> **Tier:** 3 (Load on Demand)
>
> **For Agents:** Load this guide ONLY if:
> - You are explicitly tasked with conducting a standardization audit
> - The ticket explicitly mentions "audit" or "standards health check"
> - You are running a pre-migration compliance check
>
> Typical usage: Monthly audits, before large refactors, or when asked to assess codebase compliance.

Use this playbook whenever you need to re-align the monorepo with the documented coding standards, or as a recurring health check (monthly or before large migrations). It translates the work from the September 2025 consistency ticket into a repeatable process.

## 0. Prerequisites
- Read the canonical standards documents:
  - `guides/SHARED_WEB_COMPONENT_DEFAULTS.md`
  - `guides/CODING_STANDARDS_STYLES.md`
  - `guides/CODING_TESTING_STRATEGY.md`
  - `guides/CODING_TEST_METHODOLOGY.md`
- Review the current follow-up roster in `guides/STANDARDIZATION_FOLLOWUPS.md` and note any open items.

## 1. Establish Scope & Snapshot
1. Confirm the current branch and run `git status` to ensure a clean working tree.
2. List newly added apps/packages/services since the previous audit:
   - `ls apps/`
   - `ls packages/`
   - `ls services/`
3. Record the audit date and participants in session notes (optional: add an entry in `guides/sessions/`).

## 2. Documentation Consistency Pass
1. Diff the standards docs against the last audit (e.g., `git diff HEAD~N -- guides/` or compare to main).
2. For each change, confirm that dependent documents were updated. Examples:
   - If `SHARED_WEB_COMPONENT_DEFAULTS.md` gains a new pattern, ensure `CODING_STANDARDS_STYLES.md` references it.
   - If testing guidance changes, verify the checklists in `TICKET_SESSION_CHECKLIST.md` and the follow-up roster reflect it.
3. Capture discrepancies in a scratchpad for later ticket creation.

## 3. Codebase Sampling
Perform a lightweight audit of representative code from each workspace. Suggested checklist:
- **Apps** (`apps/*`)
  - Confirm at least one harness/story demonstrates the standards patterns (signals-first, presentation-only components).
  - Spot-check import paths to ensure they use shared packages (`@df/state`, `@df/ui-lit`, etc.).
- **Packages** (`packages/*`)
  - Verify exports match the documentation (types → state → ui-lit → df-storybook).
  - Ensure naming conventions and property/event patterns follow the standards doc.
- **Services** (if applicable)
  - Confirm any shared utilities align with the docs and the follow-up roster.

## 4. Runtime & Tooling Verification
1. Run `pnpm build` (or targeted builds) to ensure the repo is healthy.
2. If automated tests exist, run the documented commands. If they do not, note the gap and update the follow-up roster.
3. Launch Storybook or dev harnesses to confirm reference components still work as advertised.

## 5. Follow-up Ticket Definition
1. Consolidate findings into discrete, small-scope tickets.
2. For each ticket, include:
   - Goal and rationale (cite the relevant standards section).
   - Affected workspaces/files.
   - Acceptance criteria (build/test expectations).
3. Append or update entries in `guides/STANDARDIZATION_FOLLOWUPS.md` so future work remains traceable.

## 6. Documentation Updates & Exit
1. If the standards themselves changed during the audit, update cross-references immediately.
2. Summarize the audit in session notes (e.g., `guides/sessions/<date>-standardization-audit.md`). Include:
   - Date & participants
   - Key decisions
   - List of follow-up tickets
3. Commit the documentation changes and ensure the branch is ready for review.

---

## Optional: Prompt Template for Coding Agents
```
You are auditing the df monorepo for standards compliance.
1. Read the canonical docs listed in STANDARDIZATION_AUDIT_PLAYBOOK.md.
2. Compare them with the current code in apps/, packages/, and services/.
3. Identify mismatches or outdated guidance.
4. Update documentation if needed and record follow-up tickets in guides/STANDARDIZATION_FOLLOWUPS.md.
5. Report findings with references to files, sections, and proposed tickets.
```

## Suggested Cadence
- **Monthly** during active development.
- **Before** onboarding new contributors or starting major refactors.
- **After** large merges that touch shared packages or standards documentation.
