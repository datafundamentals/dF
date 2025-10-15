# Ticket Session Checklist for Monorepo Management

Usage: `Ticket` is used in this document as you would also use pull request or story or github issue or jira task.

## Pre-Session Setup (Start Every Session)

### 1. Context Loading
- [ ] Read `guides/TICKET_SESSION_CHECKLIST.md` (this file)
- [ ] Review the root `README.md` for workspace-level commands
- [ ] Open the target app/package README for project-specific scripts
- [ ] Scan relevant standards in `guides/` (e.g., `STANDARDS_STYLES.md`, `WC_SHARED_DEFAULTS.md`, `TESTING_INTEGRATION.md`)

### 2. Environment Verification
- [ ] Confirm current working directory location
- [ ] Check git status and current branch
- [ ] Verify which project/app you're working on
- [ ] Confirm required services are running (if applicable)

### 3. Session Scope Definition
- [ ] Define clear session objective (1-3 features max)
- [ ] Identify if this is: Shared Resource / Project-Specific / Integration session
- [ ] Set session boundaries (what will NOT be done)
- [ ] Capture a lightweight task list (TodoWrite or equivalent notes)

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

## Pre-Exit Protocols (End Every Session)

### 8. Documentation Updates (MANDATORY)
- [ ] Update the standards or reference docs you touched inside `guides/`
- [ ] Refresh the relevant app/package README when commands or workflows change
- [ ] Record any future work or ideas in `.z_/future/` (never in `guides/`)
- [ ] Confirm every command in updated docs was tested or re-read directly from the associated `package.json`

### 9. Code Finalization
- [ ] Complete all active todos or document blockers
- [ ] Run final lint/typecheck/test commands
- [ ] **MANDATORY: If new web components were added, verify Storybook stories exist and build passes**
- [ ] **MANDATORY: Commit all session changes to git for clean checkpoint**
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
