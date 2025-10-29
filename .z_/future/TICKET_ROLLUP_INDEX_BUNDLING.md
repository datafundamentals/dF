# Rollup Bundling Architecture - Ticket Index

> **Context:** These tickets emerged from extensive experimentation with bundling approaches (Vite library mode, separate bundles, .env configurations). After proving that a single Rollup bundle from app directories is the optimal solution, we need to standardize this across the monorepo.

## Ticket Overview

### 1. POC: Complete df-activity-log Rollup Bundling
**File:** `POC_ROLLUP_BUNDLING_DF_ACTIVITY_LOG.md`  
**Dependencies:** None  
**Estimated Effort:** 1-2 days  
**Status:** Ready to start

**Objective:** Prove the single-bundle Rollup approach works end-to-end with df-activity-log as canonical example.

**Key Deliverables:**
- Working `rollup.config.js` in df-activity-log
- Bundle <1 MB minified
- Local test HTML proves bundle works
- Auth and Firestore operations functional

**Success unlocks:** All downstream tickets

---

### 2. Deploy & Validate: df-activity-log Production Deployment
**File:** `DEPLOY_VALIDATE_DF_ACTIVITY_LOG.md`  
**Dependencies:** POC ticket must complete first  
**Estimated Effort:** 3-5 days  
**Status:** Blocked (waiting for POC)

**Objective:** Prove bundle works in real production hosting environments (Netlify, Vercel).

**Potential Sub-Tickets:**
- Hosting setup & configuration
- Performance testing & baselines
- Automated testing (Playwright)
- Deployment factory/template creation

**Key Deliverables:**
- Live deployments (2+ hosts)
- Lighthouse reports
- Playwright smoke tests
- Deployment pattern guide

**Success unlocks:** Confidence to migrate other apps

---

### 3. Standardize: Migrate All Apps to Rollup Bundling
**File:** `STANDARDIZE_ROLLUP_ALL_APPS.md`  
**Dependencies:** POC + Deploy & Validate tickets  
**Estimated Effort:** 2-4 weeks  
**Status:** Blocked (waiting for POC + validation)

**Objective:** Bring all apps in monorepo up to same bundling standard.

**Likely Sub-Tickets:**
- Migrate Firebase teaching apps 0-2 (first batch)
- Migrate Firebase teaching apps 3-5 (second batch)
- Migrate feature apps (npm-info, lit-starter)
- Create migration lessons learned doc

**Key Deliverables:**
- All apps have `build:rollup` working
- All apps have smoke tests
- Bundle sizes documented
- Migration lessons captured

**Known Risks:**
- Apps may have unique edge cases requiring custom solutions
- Some apps may not be compatible (document exceptions)
- Humans may execute tickets out of dependency order (expect mistakes)

---

### 4. Documentation Audit: Update Guides for Rollup Architecture
**File:** `DOCS_AUDIT_BUNDLING_ARCHITECTURE.md`  
**Dependencies:** POC complete (for reference example)  
**Estimated Effort:** 2-3 weeks  
**Status:** Can start in parallel with Standardize ticket

**Objective:** Audit all existing docs, remove/update contradictory advice, create authoritative bundling guide.

**Likely Sub-Tickets:**
- Audit phase (read & document conflicts)
- Critical updates (fix blocking contradictions)
- Create `BUNDLING_ARCHITECTURE.md` guide
- Update Copilot instructions
- Standardize app READMEs

**Key Deliverables:**
- Audit findings report
- New `guides/BUNDLING_ARCHITECTURE.md` (authoritative reference)
- Updated Copilot instructions
- Consistent app READMEs
- Validation report (AI agent testing)

**Critical Importance:** Prevents future misdirection of humans and AI agents.

---

## Dependency Graph

```
POC_ROLLUP_BUNDLING
       ├──> DEPLOY_VALIDATE
       │         └──> STANDARDIZE_ROLLUP_ALL_APPS
       │
       └──> DOCS_AUDIT (can run in parallel with STANDARDIZE)
```

## Execution Strategy

### Recommended Sequence (Ideal)
1. **POC** → Get canonical example working
2. **Deploy & Validate** → Prove it works in production
3. **Standardize** + **Docs Audit** → Migrate everything (parallel)

### Human-Friendly Sequence (Realistic)
Given that humans may work out of order or jump between tickets:

- **Start with POC** (absolute prerequisite)
- **Document everything learned** during POC for other tickets
- **Deploy & Validate can be partial** (one hosting provider to start)
- **Standardize one app at a time** (learn from each migration)
- **Docs audit can happen concurrently** (as contradictions are found)

### Recovery from Out-of-Order Execution
If tickets executed out of dependency order:

1. **No catastrophic failures** - worst case is wasted effort
2. **Document blockers** in ticket notes
3. **Return to prerequisite ticket** when blocked
4. **Use blockers to inform upstream tickets** (valuable feedback)

## Notes on Ticket Splitting

All tickets include notes about potential sub-tickets because:

1. **Scope may be too ambitious** for single ticket
2. **Blockers will emerge** during execution
3. **Human capacity is limited** (better to split than abandon)
4. **Learning happens incrementally** (each sub-ticket informs the next)

### When to Split a Ticket

**Split if:**
- Ticket has been open >1 week with <50% completion
- Multiple unrelated blockers discovered
- Scope creep has added >3 unplanned tasks
- Natural breakpoint emerges (e.g., "first 3 apps done, pause to document lessons")

**Don't split if:**
- Just one blocker (solve it first)
- >80% complete (finish it)
- Dependencies would become too granular (overhead > benefit)

## Key Learnings from Experimentation Phase

These tickets build on lessons from **failed experiments**:

### What Didn't Work
1. **Vite library mode** - Wrong tool (hashed assets, .env dependency)
2. **Separate bundles** - Duplication (~745KB + 353KB)
3. **Building from packages/** - No Firebase config access
4. **.env for client config** - Unnecessary complexity

### What Works
1. **Rollup from app directory** - Full control, config access
2. **Single bundle** - No duplication, simpler deployment
3. **Hardcoded config** - Explicit, Firebase keys are public anyway
4. **TypeScript → Rollup pipeline** - Clean separation of concerns

## Success Criteria (All Tickets)

### Must Achieve
- df-activity-log fully functional as canonical example
- At least one production deployment validated
- At least 50% of apps successfully migrated
- `BUNDLING_ARCHITECTURE.md` guide created
- No contradictory bundling advice in active docs

### Should Achieve
- All teaching apps migrated
- Multiple production deployments
- 100% of apps migrated
- All app READMEs standardized
- AI agent can complete workflow using only docs

### Document if Not Achieved
- Apps that cannot be migrated (with reasons)
- Performance issues (bundle size, load time)
- Hosting compatibility problems
- Documentation gaps discovered

## File Locations

All ticket files are in `.z_/future/`:

```
.z_/future/
├── POC_ROLLUP_BUNDLING_DF_ACTIVITY_LOG.md
├── DEPLOY_VALIDATE_DF_ACTIVITY_LOG.md
├── STANDARDIZE_ROLLUP_ALL_APPS.md
├── DOCS_AUDIT_BUNDLING_ARCHITECTURE.md
└── ROLLUP_BUNDLING_TICKETS_INDEX.md  ← This file
```

Additional files that will be created:

```
.z_/future/
├── DOCS_AUDIT_FINDINGS.md  ← Created during audit ticket
├── ROLLUP_MIGRATION_BLOCKERS.md  ← Created during standardize ticket
└── ROLLUP_MIGRATION_LESSONS.md  ← Created after standardize ticket
```

## Quick Reference

**Starting a ticket?**
1. Read the ticket file completely
2. Check dependencies (are prerequisite tickets done?)
3. Review canonical example (df-activity-log after POC)
4. Document as you go (don't wait until end)

**Blocked on a ticket?**
1. Document the blocker clearly
2. Can you work around it? (try first)
3. Is prerequisite ticket done? (if not, do that first)
4. Should ticket be split? (if too ambitious)

**Finishing a ticket?**
1. All success criteria met? (or exceptions documented)
2. Deliverables created?
3. Lessons learned captured?
4. Next ticket unlocked? (notify human)

---

**Remember:** These tickets exist to prevent future confusion and wasted effort. The goal is not perfection, but clarity and consistency. Document failures as thoroughly as successes - they're equally valuable.
