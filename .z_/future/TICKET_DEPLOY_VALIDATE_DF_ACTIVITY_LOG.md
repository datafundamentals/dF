# Deploy & Validate: df-activity-log Production Deployment Testing

> **Note:** This ticket may be split into multiple smaller tickets as implementation details emerge.
> 
> **Dependencies:** Requires successful completion of `POC_ROLLUP_BUNDLING_DF_ACTIVITY_LOG.md`

## Context
After POC ticket proves Rollup bundling works locally, we need **real-world validation** that our bundle architecture works in production deployment scenarios.

This ticket is about **proving the assumptions** we've made about MPA deployment to 11ty, CDN hosting, and bundle consumption patterns.

## Objective
Deploy `df-activity-log` bundle to multiple real hosting environments and validate performance, functionality, and developer experience.

## Success Criteria
- [ ] Bundle deployed to at least 2 different hosting providers (e.g., Netlify, Vercel, Cloudflare Pages)
- [ ] Lighthouse scores documented (Performance, Accessibility, Best Practices, SEO)
- [ ] Manual testing checklist completed for each deployment
- [ ] Automated smoke tests pass (Playwright against live URLs)
- [ ] Bundle size tracking implemented (CI fails if bundle >threshold)
- [ ] CDN caching validated (correct headers, compression served)
- [ ] Real user monitoring baseline established (optional: Sentry/LogRocket)
- [ ] Deployment factory/template created for future apps

## Potential Sub-Tickets

This ticket could be split into:
1. **Hosting Setup & Configuration** (Netlify + Vercel configs)
2. **Performance Testing & Baselines** (Lighthouse, bundle size tracking)
3. **Automated Testing** (Playwright smoke tests for production)
4. **Deployment Factory** (Template/guide creation)

## Implementation Steps

### 1. Netlify Deployment

Create `apps/df-activity-log/netlify.toml`:

```toml
[build]
  command = "pnpm --filter @df/df-activity-log run build:rollup"
  publish = "apps/df-activity-log"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    Content-Encoding = "br"

[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

Create deployment HTML at `apps/df-activity-log/index-prod.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Activity Log · Pushup Tracker</title>
    <meta name="description" content="Track your pushup reps with Firebase-backed activity logging" />
    <!-- ... rest of head ... -->
  </head>
  <body>
    <df-activity-log-app></df-activity-log-app>
    <script type="module" src="/dist/df-activity-log.bundled.js"></script>
  </body>
</html>
```

### 2. Vercel Deployment

Create `apps/df-activity-log/vercel.json`:

```json
{
  "buildCommand": "pnpm --filter @df/df-activity-log run build:rollup",
  "outputDirectory": "apps/df-activity-log",
  "headers": [
    {
      "source": "/dist/(.*).js",
      "headers": [
        {"key": "Cache-Control", "value": "public, max-age=31536000, immutable"},
        {"key": "Content-Encoding", "value": "br"}
      ]
    }
  ]
}
```

### 3. Lighthouse Testing

Create `apps/df-activity-log/scripts/lighthouse-test.mjs`:

```javascript
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';

const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
const options = {
  logLevel: 'info',
  output: 'html',
  onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  port: chrome.port,
};

const runnerResult = await lighthouse('https://your-netlify-url.netlify.app', options);
const reportHtml = runnerResult.report;
fs.writeFileSync('lighthouse-report.html', reportHtml);

console.log('Performance score:', runnerResult.lhr.categories.performance.score * 100);
chrome.kill();
```

Add to `package.json`:
```json
{
  "scripts": {
    "lighthouse": "node scripts/lighthouse-test.mjs"
  },
  "devDependencies": {
    "lighthouse": "^11.0.0",
    "chrome-launcher": "^1.0.0"
  }
}
```

### 4. Automated Smoke Tests

Create `tests/integration/df-activity-log-production.spec.ts`:

```typescript
import {test, expect} from '@playwright/test';

const PRODUCTION_URLS = [
  'https://df-activity-log.netlify.app',
  'https://df-activity-log.vercel.app',
];

for (const url of PRODUCTION_URLS) {
  test.describe(`Production deployment: ${url}`, () => {
    test('should load bundle and render app', async ({page}) => {
      await page.goto(url);
      await expect(page.locator('df-activity-log-app')).toBeVisible({timeout: 10000});
    });

    test('should load Firebase and show auth UI', async ({page}) => {
      await page.goto(url);
      await expect(page.locator('df-auth-wrapper')).toBeVisible();
      // Verify auth state loaded (signed out initially)
      await expect(page.getByText(/sign in/i)).toBeVisible();
    });

    test('bundle size should be within threshold', async ({page, request}) => {
      const response = await request.get(`${url}/dist/df-activity-log.bundled.js`);
      const buffer = await response.body();
      const sizeKB = buffer.length / 1024;
      
      console.log(`Bundle size: ${sizeKB.toFixed(2)} KB`);
      expect(sizeKB).toBeLessThan(1000); // Fail if >1 MB uncompressed
    });
  });
}
```

### 5. Bundle Size Tracking

Create `apps/df-activity-log/.bundlesize.json`:

```json
{
  "files": [
    {
      "path": "dist/df-activity-log.bundled.js",
      "maxSize": "800 KB",
      "compression": "none"
    },
    {
      "path": "dist/df-activity-log.bundled.js",
      "maxSize": "250 KB",
      "compression": "gzip"
    }
  ]
}
```

Add to CI workflow (`.github/workflows/bundle-size.yml`):

```yaml
name: Bundle Size Check
on: [pull_request]
jobs:
  size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm --filter @df/df-activity-log run build:rollup
      - uses: andresz1/size-limit-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

### 6. Manual Testing Checklist

Create `apps/df-activity-log/DEPLOYMENT_CHECKLIST.md`:

```markdown
# Deployment Validation Checklist

## Functional Testing
- [ ] App loads without console errors
- [ ] Firebase initializes (check Network tab for firestore.googleapis.com)
- [ ] Sign in with Google works
- [ ] User profile displays after auth
- [ ] Can submit pushup entry
- [ ] Entry appears in activity summary
- [ ] Sign out works
- [ ] Offline persistence works (airplane mode test)

## Performance Testing
- [ ] Lighthouse Performance score >90
- [ ] First Contentful Paint <1.5s
- [ ] Time to Interactive <3s
- [ ] Bundle loads in <2s (fast 3G)
- [ ] No layout shift (CLS <0.1)

## Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS 15+)
- [ ] Mobile Chrome (Android)

## CDN/Caching Validation
- [ ] Bundle served with `Content-Encoding: br` or `gzip`
- [ ] Bundle has `Cache-Control: immutable`
- [ ] HTML has `Cache-Control: must-revalidate`
- [ ] Second page load uses cached bundle (0ms fetch)

## Security Headers
- [ ] CSP header present
- [ ] X-Frame-Options set
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy set
```

### 7. Deployment Factory Template

Create `guides/DEPLOYMENT_PATTERN.md`:

```markdown
# Rollup Bundle Deployment Pattern

## Overview
Standard process for deploying Rollup-bundled apps to production hosting.

## Prerequisites
- App has `build:rollup` script in package.json
- Firebase config hardcoded in `src/config/firebase.config.ts`
- Production Firebase rules deployed (`firebase deploy --only firestore:rules`)

## Hosting Setup (Netlify Example)

1. **Create `netlify.toml`**:
```toml
[build]
  command = "pnpm --filter @df/your-app run build:rollup"
  publish = "apps/your-app"

[[headers]]
  for = "/dist/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

2. **Create production HTML** (apps/your-app/index.html or index-prod.html):
```html
<script type="module" src="/dist/your-app.bundled.js"></script>
<your-app-root></your-app-root>
```

3. **Deploy**:
```bash
netlify deploy --prod
```

## Validation Checklist
- Run Lighthouse audit (Performance >90)
- Run Playwright smoke tests
- Check bundle size (<1 MB uncompressed)
- Verify CDN caching (immutable bundles)
- Test in 3 browsers (Chrome, Firefox, Safari)

## Troubleshooting
- **Bundle not loading**: Check MIME type (`application/javascript`)
- **Auth not working**: Verify Firebase config projectId matches console
- **Large bundle**: Run visualizer, check for duplicate dependencies
```

## Validation Criteria

### Must Pass
- All smoke tests pass on both deployments
- Lighthouse Performance >85 on both
- Bundle size <1 MB (uncompressed), <300 KB (gzipped)
- Manual checklist 100% complete

### Should Pass (Document if Not)
- Lighthouse Performance >90
- Bundle size <800 KB (uncompressed), <250 KB (gzipped)
- All security headers present

## Deliverables
1. Live deployments on Netlify + Vercel (URLs documented)
2. Lighthouse reports (HTML files in repo)
3. Playwright test suite passing
4. Deployment factory guide (`guides/DEPLOYMENT_PATTERN.md`)
5. Bundle size baseline documented
6. Performance regression thresholds set in CI

## Notes
- This ticket proves the architecture works in real world
- Failures here invalidate the POC and require architecture changes
- Success here unlocks migration of other apps to same pattern
- Consider splitting into smaller tickets if hosting config becomes complex
