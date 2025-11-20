# Ticket 1122: Audit & Fix Generated Build Output in .gitignore

**Status:** Planning
**Priority:** Medium
**Scope:** Repository Hygiene & Configuration

## Problem Statement

During Ticket 1117 cleanup, discovered that generated build output folders are being committed to git when they shouldn't be:

**Example:** `services/auth-functions/lib/` and `services/functions/lib/`
- These are TypeScript compilation output (`tsc` → JavaScript)
- Should never be committed
- Bloats repository history with auto-generated code

**Root cause:** `.gitignore` pattern was incomplete/malformed
- Had: `apps/df-firebase-teaching-app0/functions/lib/` (typo with "0", app-specific)
- Should have: `**/lib/` (universal pattern for all build outputs)

## Scope of Issue

This is likely a systemic problem across the monorepo. Every service/app with a `package.json` that has a build step should be audited:

### Current Status
- ✅ `services/auth-functions/` - FIXED: lib/ now in .gitignore
- ✅ `services/functions/` - FIXED: lib/ now in .gitignore
- ❓ `apps/*/functions/` - Unknown: Each app may have its own functions/ folder with generated output
- ❓ Other `**/lib/` folders - Unknown: Any build output folder might be incorrectly tracked

### Build Output Folders to Check
Common TypeScript/Node.js build outputs that should be gitignored:

```
lib/              # TypeScript → JavaScript output
dist/             # Bundled/minified output (already in .gitignore ✅)
build/            # Build artifacts (already in .gitignore ✅)
out/              # Alternative output folder
.next/            # Next.js build output
.parcel-cache/    # Parcel cache (already in .gitignore ✅)
tsc-output/       # Alternative TypeScript output
```

## Implementation Plan

### Phase 1: Audit (Quick scan)
1. Find all `package.json` files that have build scripts
2. For each build script, identify the output folder
3. Categorize by:
   - Already in .gitignore ✅
   - Missing from .gitignore ❌
   - Incorrectly tracked in git (needs `git rm --cached`)

### Phase 2: Fix .gitignore
1. Add missing patterns to `.gitignore`
2. Remove malformed/app-specific entries
3. Add clarifying comments about what each pattern is for
4. Ensure patterns use universal wildcards (`**/`) where appropriate

### Phase 3: Clean Git History
1. Remove incorrectly committed files from git tracking
2. Keep files in working directory (needed for local builds)
3. Verify `git status` is clean

### Phase 4: Document
1. Add comment to `.gitignore` explaining build output policy
2. Create a small guide for future packages: "What to add to .gitignore when creating a new build step"

## Questions to Answer

1. **Are there other `lib/` folders being tracked?**
   ```bash
   git ls-files | grep '/lib/' | head -20
   ```

2. **Are there other build output folders beyond `dist/`, `build/`, `lib/`?**
   ```bash
   git ls-files | grep -E '/(dist|build|lib|out|tsc-output|\.next)/' | head -20
   ```

3. **Which apps have their own `functions/` folders with build output?**
   ```bash
   find apps -name "functions" -type d | xargs -I {} ls -la {}/
   ```

4. **Do all services have matching .gitignore patterns?**
   - `services/auth-functions/` ✅
   - `services/functions/` ✅
   - `services/` (others?) ❓

## Success Criteria

- [ ] Audit complete: All `package.json` build scripts identified
- [ ] All build output folders checked for git tracking
- [ ] `.gitignore` updated with comprehensive patterns
- [ ] Universal patterns (`**/lib/`) used instead of app-specific entries
- [ ] All incorrectly committed build output removed from git
- [ ] Working directories still have files needed for local builds
- [ ] `git status` shows no untracked generated files
- [ ] Documentation added to `.gitignore` explaining the rules
- [ ] Future developers know what to add to `.gitignore` for new build steps

## Related Files

- `.gitignore` - Main configuration (updated in Ticket 1117)
- `services/auth-functions/package.json` - Example with build script
- `services/functions/package.json` - Example with build script
- All `apps/*/package.json` - Potential sources of build output

## Notes

### Why This Matters

**Repository bloat:** Generated files inflate git history and slow down clones
**Merge conflicts:** Auto-generated code changing between branches causes unnecessary conflicts
**Noise in git diff:** Hard to spot real changes when build output is included
**Deployment issues:** Build output should never be deployed to repo—it should be rebuilt during deployment

### Policy Going Forward

**Build Output Rule:**
> All auto-generated code (compilation output, transpilation, bundling, etc.) should be in `.gitignore` using universal patterns. Generated files are never committed. They are rebuilt on-demand via build scripts.

**Exception:**
> Pre-built library distributions that are committed as part of release strategy (rare, must be documented)

## References

- Ticket 1117: df-user-admin-app creation (discovered this issue)
- `.gitignore` - recently updated with `**/lib/` pattern
- `services/auth-functions/lib/` - example of generated build output
- `services/functions/lib/` - example of generated build output

---

**Ticket Created:** 2025-11-19
**Effort Estimate:** 1-2 hours (mostly auditing, quick fixes)
**Blocker:** No (this is cleanup/hygiene, not blocking other work)
**Complexity:** Low (straightforward audit and pattern updates)
