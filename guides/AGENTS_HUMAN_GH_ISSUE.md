# GitHub Issues + AI Agent Workflow

> **Tier:** 4 (Human Only)
>
> **For Agents:** Skip this guide entirely.
>
> **For Humans:** Use this as a guide for negotiating all things issues/chats/agents/PRs

## Understanding GitHub Issues + Copilot Agent Workflow

This document answers the general question of using github issues in the context of coding agents: **managing context across multiple tools**. This guide explains how GitHub Issues and Copilot chat sessions work together without competing.

There may still be some confusion, as some tickets might be done outside CoPilot but still using coding agents - so YMMV

---

## The Conceptual Model

### GitHub Issues = **Work Definition & Tracking**
- **What** needs to be done (requirements, acceptance criteria)
- **Why** it matters (business context, user impact)
- **Who** is assigned and **when** it's due
- **Discussion** thread (questions, decisions, clarifications)

### Copilot Chat = **Implementation Context**
- **How** to build it (technical approach, code changes)
- **Active workspace** awareness (files, symbols, recent edits)
- **Real-time guidance** during coding
- **Ephemeral** - chat history doesn't persist across sessions

**They're complementary, not competing:**
- Issue = "Build a Cloud Functions demo component showing callable functions"
- Chat = "How do I structure the callable function to match our monorepo patterns?"

---

## Recommended Workflow (Industry Standard)

### 1. **Issue → Branch → Chat → PR** Pattern

```bash
# Read GitHub Issue #42
# Understand: What feature? What acceptance criteria?

# Create branch from issue
git checkout -b 42-cloud-functions-demo

# Start Copilot chat session
# "I'm working on Issue #42. According to guides/FUNCTIONS_PLACEMENT.md, 
# where should I place app-specific callable functions?"

# Copilot suggests: apps/df-firebase-teaching-app1/functions/src/callable/

# Code with Copilot assistance
# Commit frequently

# When complete, push and create PR
git push origin 42-cloud-functions-demo
# PR description references: "Closes #42"
```

### 2. **Issue as Single Source of Truth**

**In the GitHub Issue:**
- [ ] Feature requirements
- [ ] Acceptance criteria
- [ ] Links to relevant guides (`guides/FUNCTIONS_PLACEMENT.md`)
- [ ] Design decisions made during planning
- [ ] **Reference to branch name** (`42-cloud-functions-demo`)

**In Copilot Chat:**
- "How do I implement requirement 3 from Issue #42?"
- "What's the correct import path for `@df/types` based on our standards?"
- "Review this function against `guides/WC_SHARED_DEFAULTS.md`"

**Chat supplements the issue, doesn't replace it.**

---

## Copilot-Specific Integration Features

### GitHub Copilot Can Reference Issues Directly

```
# In Copilot chat:
"What does Issue #42 require for the callable functions demo?"

# Copilot reads:
# - Issue title/description
# - Acceptance criteria
# - Comments/discussion
# - Linked files
```

**How it works:**
1. Copilot has **GitHub context** through your authenticated session
2. Reference `#42` or paste issue URL in chat
3. Copilot pulls issue content into conversation context

### Copilot Workspace (VSCode Extension)

**Experimental feature** that creates persistent context:
- Link chat session to specific issue
- Copilot maintains awareness of issue requirements across multiple chats
- Auto-suggests next steps based on issue state

**Enable:** VSCode Settings → Copilot → Workspace (requires GitHub Copilot subscription)

---

## Your Monorepo-Specific Adaptations

### Issue Template (Recommended)

Create `.github/ISSUE_TEMPLATE/feature.md`:

```markdown
## Feature Description
[Clear description of what needs to be built]

## Acceptance Criteria
- [ ] Component renders in Storybook
- [ ] Follows patterns in `guides/WC_SHARED_DEFAULTS.md`
- [ ] Uses Material Design 3 components (see `guides/STANDARDS_STYLES.md`)
- [ ] Integration test passes

## Relevant Documentation
- [`guides/FUNCTIONS_PLACEMENT.md`](../guides/FUNCTIONS_PLACEMENT.md)
- [`guides/TICKET_COMPLETION_CHECKLIST.md`](../guides/TICKET_COMPLETION_CHECKLIST.md)

## Package Location
- [ ] `packages/ui-lit/` (shared component)
- [ ] `apps/df-firebase-teaching-app1/` (app-specific)

## Branch Name
`<issue-number>-<feature-name>`
```

### PR Template (Recommended)

Create `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## Closes
Closes #[issue-number]

## Changes Made
- Added `df-functions-demo` component
- Implemented callable functions pattern
- Added Storybook stories

## Compliance Checklist
- [ ] Follows [`guides/WC_SHARED_DEFAULTS.md`](../guides/WC_SHARED_DEFAULTS.md)
- [ ] Uses Material Design 3 (no native HTML form elements)
- [ ] Storybook stories created
- [ ] Tests pass (`pnpm test`)
- [ ] Documentation updated

## Breaking Changes
None / [describe if any]
```

---

## Learning Resources

### Official GitHub Docs
- **GitHub Issues:** https://docs.github.com/en/issues
- **Pull Requests:** https://docs.github.com/en/pull-requests
- **GitHub Flow:** https://docs.github.com/en/get-started/quickstart/github-flow

### Copilot-Specific
- **Copilot Chat Best Practices:** https://docs.github.com/en/copilot/using-github-copilot/prompt-engineering-for-github-copilot
- **Copilot Workspace (Experimental):** https://githubnext.com/projects/copilot-workspace
- **Issue Referencing:** Built into Copilot - just type `#42` or paste issue URL

### Your Monorepo Guides (Already Written!)
- [`guides/TICKET_SESSION_CHECKLIST.md`](TICKET_SESSION_CHECKLIST.md) - **Read this!** It's your workflow bible
- [`guides/TICKET_COMPLETION_CHECKLIST.md`](TICKET_COMPLETION_CHECKLIST.md) - What "done" means
- [`guides/MULTI_AGENT_REVIEW.md`](MULTI_AGENT_REVIEW.md) - How to structure reviews

---

## Practical Example: Your First Collaborative Ticket

### Scenario: New contributor files Issue #99

**Issue #99:** "Add df-storage-upload component"

**Your workflow:**

1. **Review Issue**
   - Read requirements
   - Ask clarifying questions in issue comments
   - Assign to yourself

2. **Create Branch**
   ```bash
   git checkout -b 99-storage-upload-component
   ```

3. **Copilot Chat Session**
   ```
   "I'm implementing Issue #99. Based on guides/FIREBASE_PATTERNS.md, 
   should this component go in packages/ui-lit/ or 
   apps/df-firebase-teaching-app1/src/components/?"
   ```

4. **Code with Copilot**
   - Reference standards via chat
   - Use issue acceptance criteria as checklist

5. **Commit & Push**
   ```bash
   git commit -m "feat: Add df-storage-upload component (Issue #99)"
   git push origin 99-storage-upload-component
   ```

6. **Create PR**
   - GitHub auto-suggests linking to Issue #99
   - Fill in PR template
   - Request review

7. **Merge**
   - PR merged → Issue auto-closes
   - Branch deleted automatically

---

## Key Insight: Context Layers

**Think of it as three context layers:**

```
┌─────────────────────────────────────┐
│ GitHub Issue: WHAT & WHY            │  ← Persistent, team-visible
│ "Add storage upload component"      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ Your Monorepo Guides: HOW (RULES)   │  ← Persistent, standards
│ guides/FIREBASE_PATTERNS.md         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ Copilot Chat: HOW (IMPLEMENTATION)  │  ← Ephemeral, real-time
│ "Show me the import syntax for..."  │
└─────────────────────────────────────┘
```

**Issue = Contract**  
**Guides = Rules**  
**Chat = Assistant**

---

## Context Management Strategies

### When to Use GitHub Issue Comments
- Architectural decisions that affect the team
- Changes to acceptance criteria
- Questions that block progress
- Links to external resources/discussions

### When to Use Copilot Chat
- "How do I implement this function?"
- "What's the correct import path?"
- "Review this code against our standards"
- "Where should this file go?"

### When to Update Documentation
- New patterns emerge during implementation
- Standards need clarification
- Guide conflicts discovered
- Workflow improvements identified

---

## Transition Strategy (Solo → Collaborative)

### Phase 1: Practice with Self-Assigned Issues
1. Create Issue #100 "Test workflow integration"
2. Follow full cycle (branch → chat → code → PR → merge)
3. Refine templates based on what feels awkward

### Phase 2: Document Current Workflow
1. Create issue templates that reference your guides
2. Create PR template that links to `TICKET_COMPLETION_CHECKLIST.md`
3. Practice using issue numbers in Copilot chat

### Phase 3: Invite First Collaborator
1. Have them file an issue using your template
2. Review their PR using your checklist
3. Iterate on templates based on confusion points

---

## Next Steps

1. **Read** [`guides/TICKET_SESSION_CHECKLIST.md`](TICKET_SESSION_CHECKLIST.md) - it already defines your process
2. **Create templates** in `.github/` (issue + PR templates)
3. **Practice** with a self-assigned test issue:
   - Create Issue #100 "Test workflow integration"
   - Follow the full cycle (branch → chat → code → PR → merge)
4. **Invite collaborators** once you're comfortable with the flow

**Your guides already document this workflow** - you just need to formalize the GitHub integration layer. The standards and checklists you've built are **exactly** what should go in issue templates.

---

## TL;DR

**Issue = Persistent work definition (WHAT/WHY)**  
**Chat = Ephemeral implementation help (HOW)**  
**They don't compete - chat executes what the issue defines**

Reference issues in chat with `#42` or paste URL. Use your existing `guides/TICKET_SESSION_CHECKLIST.md` as the workflow blueprint. Create GitHub issue/PR templates that link to your monorepo guides.

**You've already built 90% of the system** - just need to connect GitHub Issues to your existing ticket process!
