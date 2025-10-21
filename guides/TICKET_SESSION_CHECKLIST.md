# Ticket Session Checklist for Monorepo Management

> **Tier:** 1 (Always Load)
>
> **For Agents & Humans:** Load this guide at the start of every ticket session. Essential for consistent workflow.

Usage: `Ticket` is used in this document as you would also use pull request or story or github issue or jira task.

## Quick Start (TL;DR)

**For Agents:** Do sections 1-3 first → use the Tier Selection Matrix to load targeted docs → create a TodoWrite task list → begin coding. Check sections 8-10 before exit.

**For Humans:** Provide clear objectives in the ticket or chat. Approve scope before coding starts. Review session handoff notes before the next session.

---

## How to Use This Checklist

- Treat this file as the canonical Tier 1 entry point before any coding work begins.
- Distinguish responsibilities: humans add clarifications and approve scope; coding agents execute steps, surface questions, and record outcomes.
- Follow the tiering model: Tier 1 docs always load, Tier 2 docs load when triggered by scope, Tier 3 docs are optional references for edge cases.
- Re-run the tier evaluation whenever objectives shift, blockers appear, or a misunderstanding surfaces.
- Highlight opportunities to refine this checklist: surface suggestions in session notes, share them in chat, or draft proposed edits so humans can review and merge improvements quickly.

## Pre-Session Setup (Start Every Session)

### 1. Context Loading
- [ ] Identify ticket source and objective
	- GitHub issue / PR: capture link, copy stated objective into session notes, confirm any acceptance criteria
	- Chat / ad-hoc request: restate the user objective in session notes and secure human confirmation
- [ ] Confirm the current ticket objective is committed to notes or tracker before reading additional docs
- [ ] Apply the Tier Selection Matrix (below); load every Tier 2 doc whose trigger is met, then skim related Tier 3 references as needed
- [ ] Review the root `README.md` for workspace-level commands once per session (Tier 1)
- [ ] Open the target app/package README for project-specific scripts (Tier 1)
- [ ] Record which docs were loaded this cycle so resets can revisit them later

#### Tier Selection Matrix

| Trigger | Tier | Required Docs to Load | Notes |
| --- | --- | --- | --- |
| Building or editing Lit web components | Tier 2 | `guides/WC_SHARED_DEFAULTS.md`, `guides/STANDARDS_STYLES.md`, `guides/CREATING_COMPLIANT_UI_COMPONENTS.md` | Add `guides/AUDIT_STANDARDIZATION_PLAYBOOK.md` if aligning legacy code |
| Work touches shared UI packages or needs Storybook updates | Tier 2 | `packages/ui-lit/README.md`, `apps/df-storybook/README.md` | Confirm exports checklist before coding |
| Firebase-related changes (state, emulators, rules) | Tier 2 | `apps/df-firebase-teaching-app/guides/FIREBASE_PATTERNS.md` | Add auth/storage guides from same folder as required |
| Feature requires integration or Playwright tests | Tier 2 | `guides/TESTING_INTEGRATION.md`, `guides/TESTING_ARCHITECTURE_PATTERNS.md` | Load app-specific `tests/` README if present |
| Changes span multiple apps/services | Tier 2 | `guides/AUDIT_STANDARDIZATION_PLAYBOOK.md`, relevant service/app READMEs | Note cross-project impacts in session notes |
| **Trigger not listed above** | Tier 3 | `guides/README.md` | Scan the directory structure and cross-reference your objective. Most guides cluster by theme (testing, components, monorepo patterns). If still unclear, ask the human. |

> **Protocol:** Re-run the matrix whenever scope expands, blockers emerge, or a reset is triggered. Log newly loaded docs in session notes.

### 2. Environment Verification
- [ ] Confirm current working directory location
- [ ] Check git status and current branch
- [ ] Verify which project/app you're working on
- [ ] Confirm required services are running (if applicable)

### 3. Session Scope Definition — **START HERE**
- [ ] **[FIRST ACTION] Create a TodoWrite task list** with 3–5 objectives. This captures your scope and prevents drift.
  - If objectives are unclear, list them as questions and request human clarification before proceeding.
  - If the ticket says "investigate" or "explore," note that as a distinct objective and timebox it (e.g., "Investigate performance issues — 30 min max").
- [ ] Define clear session objective (1-3 features max)
- [ ] Identify if this is: Shared Resource / Project-Specific / Integration session, and ensure the ticket source (issue vs chat) aligns with that classification
- [ ] Set session boundaries (what will NOT be done)
- [ ] If scope changes mid-session, pause to re-run the Tier Selection Matrix before continuing

## During Session (Active Development)

### 4. Documentation Standards
- [ ] Keep the current task list up to date as work progresses
- [ ] Document architectural decisions in real time (inline comments or doc updates)
- [ ] Update relevant files with implementation notes as soon as behavior changes

### 5. Code Quality Protocols
- [ ] Follow existing code conventions and patterns
- [ ] Check existing dependencies before adding new ones
- [ ] Use shared components/utilities when available
- [ ] Run lint/typecheck commands when available
- [ ] Never commit secrets or sensitive data
- [ ] Verify that every command you record in docs or ticket notes matches the latest `package.json`
- [ ] **CRITICAL: If ticket adds web components, create Storybook stories for ALL new components**
- [ ] On any new discovery (e.g., work must be shared across apps), stop coding, reload the Tier Selection Matrix, and add missing guides to context before resuming

### 6. Monorepo Awareness
- [ ] Check if changes affect other apps/shared resources
- [ ] Update shared component versions if modified
- [ ] Maintain interface contracts between shared/project code
- [ ] Document cross-project implications

## Session Decision Points

### 7. When to Continue vs Exit
**Continue if:**
- [ ] Features are tightly coupled
- [ ] Iterating on related components
- [ ] Building directly on just-written code
- [ ] In productive flow state

**Exit if:**
- [ ] Moving to different codebase area
- [ ] Session accumulated debugging noise
- [ ] Switching between projects
- [ ] Token window getting heavy
- [ ] Major architectural changes needed
- [ ] Any exit or pause triggers a context reset: document current status, identify which tiers are now required, and reload missing guides upon return

## Context Reset Protocol

- Stop coding when objectives, scope, or terminology become unclear, or when a human/agent misalignment is detected.
- Summarize the current understanding in session notes and request confirmation from the human partner.
- Re-run the Tier Selection Matrix; load any newly relevant Tier 2/Tier 3 docs (e.g., discovering a component must be shared → load `guides/WC_SHARED_DEFAULTS.md`).
- Record the reset event (time, reason, docs loaded) to aid future audits.
- Resume work only after objectives, scope, and required docs are confirmed.

## Pre-Exit Protocols (End Every Session)

**⚠️ BLOCKER: Do NOT exit session until sections 8-10 are complete. These prevent context loss and ensure smooth continuity.**

### 8. Documentation Updates (MANDATORY)
- [ ] **✓ Update the standards or reference docs you touched inside `guides/`**
- [ ] **✓ Refresh the relevant app/package README when commands or workflows change**
- [ ] Record any future work or ideas in `.z_/future/` (never in `guides/`)
- [ ] **✓ Confirm every command in updated docs was tested or re-read directly from the associated `package.json`**
- [ ] Note which Tier 2/Tier 3 docs were loaded so the next session can resume with the same context quickly

### 9. Code Finalization (MANDATORY)
- [ ] **✓ Complete all active todos or document blockers**
- [ ] **✓ Run final lint/typecheck/test commands** — fix any failures before exit
- [ ] **✓ If new web components were added: verify Storybook stories exist and build passes**
- [ ] **✓ Commit all session changes to git for clean checkpoint**
- [ ] Tag incomplete work clearly for next session

### 10. Session Handoff Preparation
- [ ] Capture next-session notes in your ticket or `.z_/future/` if needed
- [ ] List immediate next priorities
- [ ] Document any blockers or dependencies
- [ ] Reference related shared resources

## Session Templates

### New Project Session Template
```markdown
# Session: [Project Name] - [Feature/Goal]
**Date:** [Date]
**Scope:** [Brief description]

## Pre-Session Context
- Previous work: [Reference or "First session"]
- Dependencies: [Shared resources needed]
- Related projects: [Any overlap concerns]

## Session Objectives
1. [Primary objective]
2. [Secondary objective if time permits]

## Architectural Decisions
[Document major decisions made during session]

## Next Session Setup
[What should the next session focus on]
```

### Shared Resource Session Template
```markdown
# Shared Resource Session: [Component/Service Name]
**Date:** [Date]
**Affected Projects:** [List apps that use this resource]

## Changes Made
[List modifications]

## Breaking Changes
[Any interface changes that affect consuming projects]

## Migration Notes
[How existing projects should adapt]

## Testing Completed
[What was verified]
```

## Emergency Protocols

### If Session Gets Derailed
- [ ] Use TodoWrite to capture current state
- [ ] Document what went wrong in session notes
- [ ] Exit cleanly with clear handoff documentation
- [ ] Start fresh session with lessons learned

### If Context Window Becomes Heavy
- [ ] Summarize current progress in TodoWrite
- [ ] Exit session immediately
- [ ] Create detailed handoff documentation
- [ ] Start new session with clean context

## Quality Assurance Checklist

### Before Any Code Changes
- [ ] Understand existing patterns and conventions
- [ ] Check for existing similar implementations
- [ ] Verify shared resource availability

### Before Session Exit
- [ ] All todos marked completed or explicitly handed off
- [ ] Documentation updated with session outcomes
- [ ] Clear next steps documented for continuity
- [ ] No temporary/debug code left in codebase

---

## Usage Notes

**This checklist should be:**
1. **Loaded at every session start** - Read this file first
2. **Referenced during development** - Check protocols before major decisions
3. **Completed before session exit** - Ensure clean handoffs

**Success metrics:**
- Every session has clear scope and outcomes
- Documentation accumulates across sessions
- Shared resources remain stable and versioned
- No session starts without proper context
- Clean handoffs enable productive follow-up sessions

**Remember:** This checklist serves the dual purpose of maintaining development velocity while building sustainable, organized systems that scale beyond individual sessions.

## Documentation Architecture Notes

- **Active references** live in `guides/` and should stay relevant to the current ticket.
- **Future planning** belongs in `.z_/future/` so active tickets stay focused.
- Avoid duplication between apps—consolidate shared concepts in `guides/`.
