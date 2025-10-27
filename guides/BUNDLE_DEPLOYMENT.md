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

Build and copy any app bundle in two commands:

```bash
# From monorepo root
pnpm --filter @df/<app-name> build:bundle
./scripts/copy-app-bundle.sh <app-name> /path/to/your/site/target-directory
```

**Example:**
```bash
pnpm --filter @df/df-firebase-teaching-app1 build:bundle
./scripts/copy-app-bundle.sh df-firebase-teaching-app ../my-11ty-site/public/firebase-app
```

The script will:
1. Build a fresh production bundle
2. Copy all assets to your target directory
3. Include an example integration file (if available)
4. Show next steps

## What's in a Bundle?

After building, the `dist/` directory contains:

```
dist/
├── index.html          # Standalone HTML page (shows all components)
├── assets/
│   ├── index-[hash].js # Main JavaScript bundle
│   └── *.js            # Code-split chunks (lazy loaded)
└── favicon files       # App icons
```

**Key Points:**
- ✅ **Self-contained:** All dependencies bundled (Lit, Material Web, etc.)
- ✅ **Optimized:** Vite minification, tree-shaking, code-splitting
- ✅ **Environment-baked:** Config from `.env.production` included at build time
- ✅ **Static:** No server-side rendering required, works on any static host

## Integration Methods

There are three ways to integrate a bundle into your site, each with different tradeoffs.

### Method 1: iframe Embed (Recommended for Simplicity)

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

**11ty example (in a `.md` or `.njk` file):**
```markdown
---
title: Firebase Demo
layout: base
---

# Interactive Firebase Demo

<iframe
  src="/firebase-app/index.html"
  width="100%"
  height="1200px"
  frameborder="0"
  title="Firebase Teaching App">
</iframe>
```

**Pros:**
- ✅ Zero configuration - just copy bundle and add iframe
- ✅ Complete style isolation (bundle styles won't affect your site)
- ✅ Works with any static site generator
- ✅ Easy to debug (separate browser console context)

**Cons:**
- ⚠️ Fixed height (though can use CSS or postMessage for dynamic sizing)
- ⚠️ "Feels" like an embed rather than native content
- ⚠️ Separate scroll context

### Method 2: Direct Script Include (Native Feel)

**Best for:** Making the app feel like part of your site, full control over layout

**How it works:**
```html
<!-- In your HTML template -->
<div id="app-demo">
  <!-- Web components from the app - see app's BUNDLE_INTEGRATION.md for component list -->
  <df-firebase-teaching-app></df-firebase-teaching-app>
  <df-auth-demo></df-auth-demo>
</div>

<script type="module" src="/firebase-app/assets/index-[hash].js"></script>
```

**Challenge:** The hash in the filename changes on every build.

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

### Method 3: Component Picker (Selective Integration)

**Best for:** Including only specific components, custom layouts

**How it works:**

Instead of including the entire app, pick individual components:

```html
<!-- Show only authentication demo -->
<div class="auth-only-demo">
  <df-auth-demo></df-auth-demo>
</div>

{% appBundleScript "/firebase-app" %}
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
./scripts/copy-app-bundle.sh df-firebase-teaching-app ../sites/my-11ty-site/static/wc
```

**Step 2: Configure 11ty passthrough copy** (`.eleventy.js`):
```javascript
module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("firebase-app");
};
```

**Step 3: Choose integration method:**
- **Quick:** Use iframe embed (Method 1)
- **Native:** Add shortcode and use direct script include (Method 2)
- **Custom:** Pick specific components (Method 3)

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
const bundlePath = "/firebase-app";
// For dynamic script src, read index.html and extract script path
---

<div id="app-demo">
  <df-firebase-teaching-app></df-firebase-teaching-app>
</div>

<!-- Astro handles script loading differently - consult Astro docs for best practices -->
<script is:inline type="module" src={`${bundlePath}/assets/index-[hash].js`}></script>
```

## Hugo Integration

Create `layouts/shortcodes/app-bundle.html`:
```html
{{ $bundlePath := .Get "path" }}
<iframe src="{{ $bundlePath }}/index.html" width="100%" height="1200px"></iframe>
```

Use in content:
```markdown
{{< app-bundle path="/firebase-app" >}}
```

## Generic Markdown (No SSG Features)

If your static site generator doesn't support shortcodes or scripting:

**Option 1: iframe (always works)**
```html
<iframe src="/firebase-app/index.html" width="100%" height="1200px"></iframe>
```

**Option 2: Manual script update**

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
