# Bundle Deployment Guide

> **Tier:** 4 (Human Only)
>
> **For Agents:** Skip this guide entirely. Bundle deployment is a human operations task.
>
> **For Humans:** This guide explains how to deploy any DF monorepo app bundle to external static sites (11ty, Astro, Hugo, etc.).

This guide explains how to deploy any DF monorepo app bundle to external static sites (11ty, Astro, Hugo, etc.).

## DANGER WILL ROBINSON

THIS DOCUMENT IS INTENTIONALLY INCOMPLETE AND INACCURATE AND MUST BE MODIFIED AS USED UNTIL IT PROVES OUT AS CORRECT

FOR A WORKING MODEL TO COMPARE AGAINST SEE APPWRITER IN THE LOCALLY RUNNING VERSION site/_includes/snippet/head-wc.njk

## Quick Start

Build and copy any app bundle in a single command:

```bash
# From monorepo root
pnpm deploy:copy-bundle <app-name> /path/to/your/site/target-directory
```

**Example 1:**
```bash
pnpm deploy:copy-bundle df-firebase-teaching-app ../my-11ty-site/public/firebase-app
```
**Example 2:**
```bash
pnpm deploy:copy-bundle df-chat-app ../sites/appwriter.com/static/wc/bundle
```

The script will:
1. Automatically detect the best build method (`build:rollup` or `build:bundle`)
2. Build a fresh production bundle
3. Copy all assets to your target directory
4. Include an example integration file (if available)
5. Show next steps

## What's in a Bundle?

If the app supports Rollup (like `df-firebase-teaching-app`), you get a clean single-file bundle:

```
dist/bundle/
├── <app-name>.js       # Single JavaScript bundle (no hash)
└── stats.html          # Bundle size analysis
```

If the app only supports Vite (legacy), you get hashed assets:

```
dist/
├── assets/
│   └── index-[hash].js
└── index.html
```

**Key Points (Rollup Bundle):**
- ✅ **Single File:** No hashing, easy to include (`<script src="/path/to/app.js"></script>`)
- ✅ **Self-contained:** All dependencies bundled (Lit, Material Web, etc.)
- ✅ **Optimized:** Minified, tree-shaken
- ✅ **Environment-baked:** Config from `.env.production` included at build time

## Integration Methods

There are three ways to integrate a bundle into your site, each with different tradeoffs.

### Method 1: Single File Include (Recommended)

**Best for:** Cleanest integration, no complex build scripts needed.

**How it works:**
```html
<!-- In your HTML template -->
<div id="app-demo">
  <df-firebase-teaching-app></df-firebase-teaching-app>
</div>

<script type="module" src="/firebase-app/bundle/df-firebase-teaching-app.js"></script>
```

**Pros:**
- ✅ **Stable Filename:** No hashes to manage
- ✅ **Simple:** Just one script tag
- ✅ **Native Feel:** Components integrate seamlessly

**Cons:**
- ⚠️ **Caching:** You may need to manually bust cache if you update the app (e.g. `?v=2`)

### Method 2: iframe Embed (Simplicity & Isolation)

**Best for:** Quick integration, complete isolation, avoiding style conflicts

**How it works:**
```html
<!-- In your markdown or HTML template -->
<iframe
  src="/firebase-app/index.html"
  width="100%"
  height="1200px"
  frameborder="0"
  style="border: 1px solid #ccc; border-radius: 8px;"
  title="Firebase Teaching App">
</iframe>
```

**Note:** This requires `build:bundle` (Vite build) instead of `build:rollup`.

**Pros:**
- ✅ Zero configuration - just copy bundle and add iframe
- ✅ Complete style isolation (bundle styles won't affect your site)
- ✅ Works with any static site generator
- ✅ Easy to debug (separate browser console context)

**Cons:**
- ⚠️ Fixed height (though can use CSS or postMessage for dynamic sizing)
- ⚠️ "Feels" like an embed rather than native content
- ⚠️ Separate scroll context

### Method 3: Direct Script Include (Vite Hashed)

**Best for:** If you prefer Vite's code splitting and hashing (advanced).

**How it works:**
```html
<script type="module" src="/firebase-app/assets/index-[hash].js"></script>
```

**Challenge:** The hash in the filename changes on every build. Requires shortcodes/scripts to resolve.

**Solution for 11ty - Use a shortcode:**

Create `.eleventy.js` helper:
```javascript
const fs = require('fs');
const path = require('path');

module.exports = function(eleventyConfig) {
  // Shortcode to get the bundle script path
  eleventyConfig.addShortcode("appBundleScript", function(bundlePath) {
    const indexHtml = fs.readFileSync(
      path.join('.', bundlePath, 'index.html'),
      'utf-8'
    );
    const scriptMatch = indexHtml.match(/<script type="module"[^>]*src="([^"]+)"/);
    if (scriptMatch) {
      return `<script type="module" src="${bundlePath}${scriptMatch[1]}"></script>`;
    }
    return '<!-- Bundle script not found -->';
  });

  // Copy bundle directory as passthrough
  eleventyConfig.addPassthroughCopy("firebase-app");
};
```

Then in your markdown/template:
```markdown
---
title: Firebase Demo
layout: base
---

# Interactive Firebase Demo

<div id="app-demo">
  <df-firebase-teaching-app></df-firebase-teaching-app>
  <df-auth-demo></df-auth-demo>
</div>

{% appBundleScript "/firebase-app" %}
```

**Pros:**
- ✅ Native feel (no iframe boundaries)
- ✅ Components integrate with page layout
- ✅ Single scroll context
- ✅ Full styling control

**Cons:**
- ⚠️ Requires build integration (shortcode or script)
- ⚠️ Potential style conflicts (bundle styles mix with site styles)
- ⚠️ More complex to debug (shared console context)

### Method 4: Component Picker (Selective Integration)

**Best for:** Including only specific components, custom layouts

**How it works:**

Instead of including the entire app, pick individual components:

```html
<!-- Show only authentication demo -->
<div class="auth-only-demo">
  <df-auth-demo></df-auth-demo>
</div>

<!-- Use Method 1 or 3 to include the script -->
<script type="module" src="/firebase-app/bundle/df-firebase-teaching-app.js"></script>
```

**Available components:**
Check the app's `guides/BUNDLE_INTEGRATION.md` for the full list of available web components.

**Pros:**
- ✅ Minimal footprint (only show what you need)
- ✅ Custom layouts and styling
- ✅ Faster perceived load (fewer components rendered)

**Cons:**
- ⚠️ Full bundle still loads (code-splitting helps but doesn't eliminate)
- ⚠️ Requires knowing component names (check app's guide)

## 11ty Integration Checklist

**Step 1: Copy bundle**
```bash
pnpm deploy:copy-bundle df-firebase-teaching-app ../sites/my-11ty-site/static/wc
```

**Step 2: Configure 11ty passthrough copy** (`.eleventy.js`):
```javascript
module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("firebase-app");
};
```

**Step 3: Choose integration method:**
- **Recommended:** Single File Include (Method 1)
- **Quick:** Use iframe embed (Method 2)
- **Advanced:** Use direct script include with hashing (Method 3)

**Step 4: Create page** (e.g., `src/firebase-demo.md`):
```markdown
---
title: Firebase Demo
layout: base
---

# Interactive Firebase Demo

<!-- Choose your integration method here -->
```

**Step 5: Build and deploy:**
```bash
npx @11ty/eleventy
# Deploy _site/ to your hosting
```

**Step 6: Test:**
- ✅ Page loads without errors (check browser console)
- ✅ Components render correctly
- ✅ Interactive features work (if applicable)

## Astro Integration

```astro
---
// src/pages/app-demo.astro
const bundlePath = "/firebase-app/bundle/df-firebase-teaching-app.js";
---

<div id="app-demo">
  <df-firebase-teaching-app></df-firebase-teaching-app>
</div>

<script is:inline type="module" src={bundlePath}></script>
```

## Hugo Integration

Create `layouts/shortcodes/app-bundle.html`:
```html
{{ $bundlePath := .Get "path" }}
<script type="module" src="{{ $bundlePath }}/bundle/df-firebase-teaching-app.js"></script>
```

Use in content:
```markdown
{{< app-bundle path="/firebase-app" >}}
```

## Generic Markdown (No SSG Features)

If your static site generator doesn't support shortcodes or scripting:

**Option 1: Single File (Recommended)**
```html
<script type="module" src="/firebase-app/bundle/df-firebase-teaching-app.js"></script>
```

**Option 2: iframe (always works)**
```html
<iframe src="/firebase-app/index.html" width="100%" height="1200px"></iframe>
```

**Option 3: Manual script update (Vite)**

After each build, manually update your template with the new hash:
```html
<script type="module" src="/firebase-app/assets/index-ABC123.js"></script>
```

(Check `firebase-app/index.html` for the current hash)

## Troubleshooting

### Bundle loads but shows blank page

**Check browser console** for errors. Common issues:
- Missing script tag (check syntax)
- Incorrect path (should match where you copied bundle)
- CORS errors (rare for static files)

**Fix:** Verify the script `src` path matches your bundle location.

### Components don't render (shows tags as text)

**Cause:** Script didn't load or JavaScript errors

**Fix:**
1. Check browser console for errors
2. Verify script tag has `type="module"`
3. Ensure script path is correct

### Path issues (assets not loading)

**Cause:** Bundle expects to be at site root, but you placed it in subdirectory

**Fix:** Ensure `<script src>` paths include subdirectory:
```html
<!-- If bundle is in /firebase-app/ -->
<script type="module" src="/firebase-app/assets/index-[hash].js"></script>
```

## Next Steps

1. **Copy your first bundle** using the script
2. **Try iframe integration** (quickest way to verify it works)
3. **Review app-specific guide** (`apps/<app-name>/guides/BUNDLE_INTEGRATION.md`) for component details
4. **Test thoroughly** before sharing publicly
5. **Deploy and share!**

## Related Documentation

- **App-specific integration:** Check `apps/<app-name>/guides/BUNDLE_INTEGRATION.md`
- **Build configuration:** See `apps/<app-name>/vite.config.ts`
- **Production deployment:** See app's README for Firebase Hosting deployment (if applicable)
