# What goes in this guides folder, and how?

**Instructions for coding agents:** When adding or changing the name of any guide within this folder, please make the appropriate changes below and update `.claude/CLAUDE.md` with the appropriate tier.

## What

- Core documentation organized in tiers to balance accessibility with context management
- Rulesets (procedural rules agents and humans must follow)
- Active patterns and standards
- Essential reference material organized by task type

## How

- must be markdown
- must be canonical
- must not have redundancies within or across markdown docs
- must be concise and non-ambiguous
- must not have contradictions with other docs
- **Each file must include its tier classification at the top** (see example below)

## Tier System

To prevent context bloat while keeping rulesets accessible, guides are organized by usage frequency:

### Tier 1: Always Load
These are loaded in every ticket session. Essential context for all work.

Example: `TICKET_SESSION_CHECKLIST.md`, `STANDARDS_STYLES.md`

### Tier 2: Load by Task
These are loaded conditionally based on work type (e.g., "I'm building a component").

Example: `CREATING_COMPLIANT_UI_COMPONENTS.md` (load when building), `TESTING_INTEGRATION.md` (load when testing)

**Agent instruction:** Load these guides only when the ticket description indicates this type of work.

### Tier 3: Load on Demand
These are specialized rulesets for troubleshooting or unusual workflows.

Example: `STANDARDS_COMPLIANCE_TROUBLESHOOTING.md` (load only if linting fails), `AGENT_WORKFLOW_PATTERNS.md` (load only for multi-step automation)

**Agent instruction:** Skip these unless you encounter the specific condition or are explicitly instructed to use them.

### Tier 4: Deep Reference (`.z_/faq/`)
These are optional deep-dive analysis and reassurance documents.

Example: `.z_/faq/PERFORMANCE_AND_IMPORTS.md` (read if you're worried about bundle size)

**Agent instruction:** Skip these entirely unless explicitly linked from an active guide.

---

## Adding a New Guide

1. Decide which tier it belongs in (see section above)
2. Add a tier indicator at the top of the file:
   ```markdown
   # Your Guide Title

   > **Tier:** 1 (Always Load) | 2 (Load by Task) | 3 (Load on Demand)
   >
   > **For Agents:** [Conditional load instructions]
   ```
3. Update the tier list in `.claude/CLAUDE.md`
4. Update this README if adding new tier guidance

---

## Relationship to `.z_/`

- use `.z_/WIP` for session-specific scratch notes that should not enter the permanent docs
- capture deferred or future-ticket work in `.z_/future` and promote it here once it becomes active scope
- keep personal archives in `.z_/historical`; they never move into `guides/` without deliberate curation
- use `.z_/faq/` for deep-dive analysis and reference materials that are valuable but not required for active tickets (Tier 4)

## Other, more specific guides folders:

- packages/guides
- services/guides
- packages/firebase/guides
- apps/df-firebase-teaching-app0/guides
