# Standardize: Migrate All Apps to Rollup Bundling Pattern

> **Note:** This ticket will likely need to be split into per-app sub-tickets as blockers and edge cases emerge.
>
> **Dependencies:** 
> - Requires successful completion of `POC_ROLLUP_BUNDLING_DF_ACTIVITY_LOG.md`
> - Requires successful completion of `DEPLOY_VALIDATE_DF_ACTIVITY_LOG.md`

## Context
After validating `df-activity-log` as the canonical Rollup bundling example (POC + production deployment), we need to **bring all other teaching/pattern apps up to the same standard**.

Currently, apps have inconsistent build configurations:
- Some use Vite library mode
- Some have no bundling at all
- Some use .env, others hardcode config
- None have production deployment patterns

## Objective
Migrate all apps in `apps/*` to use the proven Rollup bundling pattern, ensuring consistency and reducing maintenance burden.

## Success Criteria
- [ ] All apps have `rollup.config.js` matching canonical pattern
- [ ] All apps have `build:rollup` script
- [ ] All apps hardcode Firebase config (no .env for client config)
- [ ] All apps have bundle visualizer configured
- [ ] All apps produce `dist/[app-name].bundled.js`
- [ ] All apps have deployment checklist
- [ ] All apps have smoke tests in Playwright
- [ ] Documentation updated for each app

## Potential Sub-Tickets

This ticket should likely be split into:
1. **Migrate Firebase Teaching Apps 0-2** (First batch - lower risk)
2. **Migrate Firebase Teaching Apps 3-5** (Second batch)
3. **Migrate Feature Apps** (npm-info-app, lit-starter - special cases)
4. **Create Migration Lessons Learned Doc** (Aggregate all blockers/solutions)

## Apps to Migrate

### High Priority (Teaching Apps)
1. `df-firebase-teaching-app0` - Core Firebase patterns
2. `df-firebase-teaching-app` - Auth patterns
3. `df-firebase-teaching-app2` - Firestore patterns
4. `df-firebase-teaching-app3` - Storage patterns
5. `df-firebase-teaching-app4` - Functions patterns
6. `df-firebase-teaching-app5` - Composite patterns

### Medium Priority (Feature Apps)
7. `df-npm-info-app` - Signals-first example
8. `df-lit-starter` - Component starter (preserve 11ty demo)

### Special Cases
- `df-storybook` - No bundling needed (Storybook handles build)
- `df-chat` - May have unique requirements (investigate first)

## Migration Template (Per App)

### 1. Create Rollup Config
Copy from `df-activity-log`:

```bash
cp apps/df-activity-log/rollup.config.js apps/df-firebase-teaching-app/rollup.config.js
```

Update `input` and `output.file`:

```javascript
export default {
  input: 'dist/main.js',
  output: {
    file: 'dist/df-firebase-teaching-app.bundled.js', // ← Change this
    format: 'esm',
  },
  // ... rest same as canonical
};
```

### 2. Update package.json Scripts

```json
{
  "scripts": {
    "clean": "rimraf dist",
    "build": "tsc -p tsconfig.json",
    "build:rollup": "pnpm build && rollup -c",
    "build:watch": "tsc -p tsconfig.json --watch",
    "dev": "vite --mode production",
    "preview": "vite preview --host 127.0.0.1 --port 4XXX"
  }
}
```

### 3. Migrate Firebase Config

If app uses `.env`:

**Before** (`src/config/firebase.config.ts`):
```typescript
export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // ...
};
```

**After**:
```typescript
export const FIREBASE_CONFIG = {
  apiKey: "AIza...", // Hardcoded from .env
  authDomain: "project-id.firebaseapp.com",
  projectId: "project-id",
  // ...
};
```

Delete `.env` and `.env.example` (no longer needed for client config).

### 4. Create Test Bundle HTML

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Bundle Test - [App Name]</title>
  </head>
  <body>
    <your-app-root></your-app-root>
    <script type="module" src="./dist/[app-name].bundled.js"></script>
  </body>
</html>
```

### 5. Add Smoke Tests

Create `tests/integration/[app-name]-bundle.spec.ts`:

```typescript
import {test, expect} from '@playwright/test';

test.describe('[App Name] Bundle', () => {
  test('should load and render from bundle', async ({page}) => {
    await page.goto('http://localhost:8080/test-bundle.html');
    await expect(page.locator('your-app-root')).toBeVisible();
  });
});
```

### 6. Update App README

Add to `apps/[app-name]/README.md`:

```markdown
## Building for Production

\`\`\`bash
# Build bundle for deployment
pnpm --filter @df/[app-name] run build:rollup

# Output: dist/[app-name].bundled.js (~XXX KB gzipped)
\`\`\`

## Deployment

See [Deployment Pattern Guide](../../guides/DEPLOYMENT_PATTERN.md) for hosting instructions.

Bundle includes all dependencies (Firebase, Lit, Material Web, app code).
No external CDN dependencies required.
```

## Migration Order

Execute in this order to minimize merge conflicts and learn from each iteration:

### Phase 1: Low-Risk Apps (Week 1)
- `df-firebase-teaching-app0` (minimal complexity)
- `df-firebase-teaching-app` (auth patterns - already working in df-activity-log)

**Goal:** Identify common migration issues early

### Phase 2: Medium Complexity (Week 2)
- `df-firebase-teaching-app2` (Firestore patterns)
- `df-firebase-teaching-app3` (Storage patterns)

**Goal:** Prove pattern works across different Firebase features

### Phase 3: Complex Features (Week 3)
- `df-firebase-teaching-app4` (Functions - may have server-side concerns)
- `df-firebase-teaching-app5` (Composite - largest app)

**Goal:** Handle edge cases, document workarounds

### Phase 4: Special Cases (Week 4)
- `df-npm-info-app` (non-Firebase app)
- `df-lit-starter` (preserve 11ty upstream demo)

**Goal:** Document exceptions to standard pattern

## Validation Per App

Before marking app complete:

```bash
# 1. Build succeeds
pnpm --filter @df/[app-name] run build:rollup

# 2. Bundle size reasonable (<1.5 MB)
ls -lh apps/[app-name]/dist/[app-name].bundled.js

# 3. Visualizer shows composition
open apps/[app-name]/dist/bundle-stats.html

# 4. Local test works
npx serve apps/[app-name] -p 8080
# Open http://localhost:8080/test-bundle.html

# 5. Smoke test passes
pnpm exec playwright test tests/integration/[app-name]-bundle.spec.ts
```

## Special Case: df-lit-starter

`df-lit-starter` preserves the upstream 11ty demo pattern. Handle specially:

1. Keep existing 11ty build (`eleventy --input=demo --output=dist`)
2. Add **optional** Rollup bundling for component-only distribution
3. Document both paths in README (11ty demo vs component bundle)

```json
{
  "scripts": {
    "build": "eleventy --input=demo --output=dist",
    "build:bundle": "pnpm build:components && rollup -c",
    "build:components": "tsc -p tsconfig.json"
  }
}
```

## Special Case: df-npm-info-app

Non-Firebase app - verify pattern still works:

1. No Firebase config needed (signals-first, external API only)
2. Should have smallest bundle size (~200-300 KB)
3. Good test of pattern flexibility

## Known Potential Blockers

Document these as encountered:

1. **App has no `main.ts` entry point** → Create one or update Rollup input
2. **App uses dynamic imports** → Configure Rollup code-splitting
3. **App has multiple Firebase projects** → Clarify config per environment
4. **Build fails with TypeScript errors** → Fix TypeScript issues first
5. **Bundle >2 MB** → Investigate dependencies, may indicate architecture issue

## Rollback Plan

If migration breaks an app:

1. Revert `rollup.config.js` and `package.json` changes (human commits only)
2. Restore `.env` if deleted
3. Document issue in `.z_/future/ROLLUP_MIGRATION_BLOCKERS.md`
4. Continue with other apps
5. Return to blocked app after solution found

## Deliverables

- [ ] All apps migrated (or documented blockers)
- [ ] All apps have passing smoke tests
- [ ] Bundle sizes documented in each app's README
- [ ] Migration lessons learned documented in `guides/ROLLUP_MIGRATION_LESSONS.md`
- [ ] Updated root README with new build patterns
- [ ] Per-app sub-tickets created for any complex migrations

## Success Metrics

- At least 80% of apps successfully migrated
- No app has build regressions (all existing functionality works)
- Bundle sizes within expected ranges (documented per app)
- All smoke tests passing
- Clear documentation for any apps that couldn't migrate

## Notes
- This is largely mechanical work - use canonical example as template
- Each simple app should take ~30-60 minutes
- Complex apps may require dedicated sub-tickets
- Document all edge cases for future reference
- Blockers are learning opportunities - capture thoroughly
- Human review required before any commits
