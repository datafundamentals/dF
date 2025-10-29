# Documentation Audit: Update Guides for Rollup Bundling Architecture

> **Note:** This is a comprehensive audit ticket that may spawn multiple focused sub-tickets as conflicts are discovered.
>
> **Dependencies:** Can run in parallel with `STANDARDIZE_ROLLUP_ALL_APPS.md` but should reference completed POC

## Context
Extensive documentation exists in this monorepo, written before the Rollup bundling architecture was finalized. This documentation may now:

- Reference Vite library mode (outdated approach)
- Suggest .env for Firebase client config (unnecessary complexity)
- Recommend separate bundles (df-auth-wrapper + app) (causes duplication)
- Miss critical Rollup patterns (terser, visualizer, hardcoded config)
- Contradict the canonical `df-activity-log` example

**Scope**: All non-historical documentation (`guides/`, `apps/*/README.md`, `packages/*/README.md`, `.github/copilot-instructions.md`). 

**Explicitly excludes:** `.z_/future/historical/` - those docs are intentionally preserved as-is.

## Objective
Audit and update all existing documentation to align with proven Rollup bundling architecture, preventing future misdirection of humans and AI coding agents.

## Success Criteria
- [ ] All references to Vite library mode updated or removed
- [ ] All .env usage clarified (backend secrets only, not client config)
- [ ] All bundling examples reference Rollup canonical pattern
- [ ] New guide created: `guides/BUNDLING_ARCHITECTURE.md`
- [ ] Copilot instructions updated with bundling patterns
- [ ] All app READMEs have consistent build/deploy sections
- [ ] Conflicting advice removed or clearly marked as historical
- [ ] Audit findings documented for future reference

## Potential Sub-Tickets

This could be split into:
1. **Audit Phase** (Read all docs, document conflicts)
2. **Critical Updates** (Fix docs that directly contradict Rollup pattern)
3. **Create New Bundling Guide** (`BUNDLING_ARCHITECTURE.md`)
4. **Update Copilot Instructions** (Add bundling patterns)
5. **Standardize App READMEs** (Consistent build/deploy sections)

## Audit Checklist

### Root-Level Guides (`/guides/`)

- [ ] **`WC_SHARED_DEFAULTS.md`**
  - Check for bundling/deployment sections
  - Add reference to `BUNDLING_ARCHITECTURE.md` if missing
  - Verify no contradictory Vite advice
  
- [ ] **`STANDARDS_STYLES.md`**
  - Verify build patterns align with Rollup approach
  - Update any Vite-specific advice
  - Already updated with git commit policy ✓

- [ ] **`TESTING_INTEGRATION.md`**
  - Update bundle testing examples (smoke tests for bundled apps)
  - Add section on testing production bundles
  - Reference `test-bundle.html` pattern

- [ ] **`TICKET_SESSION_CHECKLIST.md`**
  - Add bundling verification steps (if creating/modifying apps)
  - Already updated with git commit policy ✓

- [ ] **`BUNDLE_DEPLOYMENT.md`** (if exists)
  - Verify aligns with new Rollup pattern
  - Update or deprecate if outdated

- [ ] **`FUNCTIONS_PLACEMENT.md`**
  - Verify no advice conflicts with single-bundle pattern
  - Clarify server-side vs client-side bundling

- [ ] **`.github/copilot-instructions.md`**
  - Add **Bundling Architecture** section with:
    - Rollup canonical pattern
    - When to use Rollup vs Vite
    - Firebase config hardcoding pattern
    - Bundle size expectations
    - Link to `guides/BUNDLING_ARCHITECTURE.md`

### Firebase Guides (`/apps/df-firebase-teaching-app*/guides/`)

Multiple apps have their own `guides/` folders. Check each:

- [ ] **`FIREBASE_PATTERNS.md`**
  - Update "Deployment" section with Rollup bundling
  - Add Firebase config hardcoding pattern
  - Remove .env advice for client config
  - Add reference to root `BUNDLING_ARCHITECTURE.md`

- [ ] **`AUTHENTICATION_PATTERNS.md`**
  - Verify no advice conflicts with bundled df-auth-wrapper
  - Clarify that auth wrapper is bundled with app, not separate

- [ ] **`FIREBASE_COOKBOOK.md`**
  - Update deployment recipes
  - Add Rollup bundling examples

- [ ] **`COMPOSITE_PATTERNS.md`**
  - Add bundling considerations for complex apps
  - Document bundle size implications

- [ ] **`PERFORMANCE_PATTERNS.md`**
  - Add bundle optimization patterns (terser config, tree-shaking)
  - Add visualizer analysis guidance

- [ ] **`TROUBLESHOOTING.md`**
  - Add common bundling issues:
    - Bundle too large (check visualizer)
    - Firebase not initializing (config not bundled)
    - Duplicate dependencies (check Rollup externals)
    - Bundle won't load (MIME type issues)

### App-Specific Documentation

For each app in `apps/*`:

- [ ] **README.md**
  - Update "Building" section with `build:rollup`
  - Update "Deployment" section with bundle approach
  - Remove outdated .env instructions
  - Add bundle size documentation
  - Link to `guides/BUNDLING_ARCHITECTURE.md`
  - Consistent format across all apps
  
- [ ] **Migration guides** (if present)
  - Mark as historical if they reference old patterns
  - Add note pointing to new bundling architecture
  - Consider moving to `.z_/future/historical/`

### Package Documentation

- [ ] **`packages/ui-lit/README.md`**
  - Update component bundling examples
  - Clarify when to bundle components separately vs with app
  - Note: Separate bundles only for npm distribution, not app deployment
  
- [ ] **`packages/firebase/README.md`**
  - Update deployment patterns
  - Clarify Firebase config handling (hardcoded in apps, not in package)
  - Add note about bundling implications

- [ ] **`packages/state/README.md`**
  - Verify bundle size implications documented
  - Add note about bundling with apps (not standalone)
  - Clarify signal sharing across bundle boundaries

### Additional Files to Check

- [ ] **Root `README.md`**
  - Update build/deployment overview
  - Add link to `BUNDLING_ARCHITECTURE.md`
  - Update quick start commands if needed

- [ ] **`WHY.md`** (if exists)
  - Verify architectural decisions align
  - Update if Vite library mode mentioned

- [ ] **`.z_/future/` files** (non-historical)
  - Check for outdated bundling references
  - Update any active planning docs

## Create New Guide: `guides/BUNDLING_ARCHITECTURE.md`

This is the **authoritative bundling reference** for the entire monorepo.

### Outline

```markdown
# Bundling Architecture

## Overview
- Why Rollup (not Vite library mode)
- Single bundle per app approach
- MPA deployment model

## Canonical Example
- Reference df-activity-log
- File structure
- Build pipeline

## Standard Rollup Config
- Complete config with all plugins
- Explanation of each plugin
- When to modify

## Build Pipeline
- TypeScript compilation step
- Rollup bundling step
- Output structure

## Firebase Config Pattern
- Hardcoded in app config file
- Why not .env for client
- When to use .env (backend secrets)

## Bundle Size Expectations
- Typical component sizes
- Firebase overhead
- Red flags (>1.5 MB)

## Deployment Pattern
- HTML structure
- CDN requirements
- Caching strategy

## When to Bundle Separately
- App bundles (default)
- Component bundles (npm distribution only)
- Decision tree

## Troubleshooting
- Common issues and solutions
- Bundle analysis with visualizer
- Tree-shaking problems

## Migration from Vite
- Step-by-step guide
- Common pitfalls
- Validation checklist
```

## Execution Plan

### Phase 1: Audit & Document (Week 1)
- Read all files in checklist
- Document findings in `.z_/future/DOCS_AUDIT_FINDINGS.md`
- Categorize issues:
  - **Critical**: Directly contradicts Rollup pattern (fix immediately)
  - **Update**: Needs minor changes for alignment (fix in Phase 2)
  - **Historical**: Outdated but not misleading (mark clearly)
  - **OK**: Already aligns with current pattern (no action)

### Phase 2: Critical Updates (Week 2)
- Fix Critical issues first (blocks agent/human work)
- Create `BUNDLING_ARCHITECTURE.md` guide
- Update Copilot instructions
- Update root README

### Phase 3: Systematic Updates (Week 3)
- Update all app READMEs with consistent pattern
- Update Firebase guides
- Update package documentation
- Cross-reference all updates

### Phase 4: Validation (Week 4)
- AI agent reads all updated docs, attempts to:
  - Build a new app from scratch using only docs
  - Deploy an existing app using only docs
  - Debug a bundle issue using only docs
- Document any remaining confusion
- Create follow-up tickets for unresolved issues

## Validation Criteria

### Must Pass
- [ ] AI agent successfully builds new app following only documentation
- [ ] AI agent successfully deploys app following only documentation  
- [ ] No references to Vite library mode remain (except as "don't do this")
- [ ] All .env usage clarified (backend only)
- [ ] Copilot instructions include bundling patterns
- [ ] `BUNDLING_ARCHITECTURE.md` created and comprehensive

### Should Pass (Document if Not)
- [ ] All app READMEs have identical build/deploy sections
- [ ] No conflicting advice across different guides
- [ ] All Firebase guides updated
- [ ] Troubleshooting covers common bundling issues

## Audit Findings Template

Create `.z_/future/DOCS_AUDIT_FINDINGS.md`:

```markdown
# Documentation Audit Findings

## Critical Issues (Fix Immediately)
1. [File path] - [Issue description] - [Recommended fix]

## Updates Needed (Align with Pattern)
1. [File path] - [Issue description] - [Recommended fix]

## Historical References (Mark Clearly)
1. [File path] - [Outdated pattern] - [Action: Add deprecation note]

## Already Aligned (No Action)
1. [File path] - [Confirmation]

## New Documentation Needed
1. [Topic] - [Justification] - [Proposed location]

## Recommendations
- [Pattern improvements discovered during audit]
```

## Deliverables

1. **Audit findings report** (`.z_/future/DOCS_AUDIT_FINDINGS.md`)
2. **New authoritative guide** (`guides/BUNDLING_ARCHITECTURE.md`)
3. **Updated Copilot instructions** (`.github/copilot-instructions.md`)
4. **Consistent app READMEs** (all apps have identical build/deploy sections)
5. **Updated Firebase guides** (all teaching app guides aligned)
6. **Validation report** (AI agent testing results)
7. **Follow-up tickets** (for any unresolved complex issues)

## Success Metrics

- Zero instances of Vite library mode advice (except explicit "don't use")
- All bundling references point to canonical df-activity-log
- AI agent can complete full workflow using only documentation
- No conflicting advice between guides
- Clear escalation path for edge cases

## Notes
- **This is the most critical ticket for long-term maintainability**
- Outdated docs cause more damage than no docs (misdirection vs discovery)
- AI coding agents are especially vulnerable to conflicting documentation
- Mark historical patterns clearly: "⚠️ Legacy Pattern - See BUNDLING_ARCHITECTURE.md"
- When in doubt, reference canonical example rather than explain
- This ticket can run in parallel with app migration but should inform it
- Expect to find contradictions - that's the point of the audit
- Document everything for future audits
