# Material Design 3 Component Initialization Strategy

**Status:** ✅ Adopted
**Last Updated:** 2025-10-21
**Applies To:** All apps and packages using `@material/web` components

---

## Overview

Material Design 3 components from `@material/web` register themselves as custom elements in the browser's `CustomElementRegistry`. If the same component is imported multiple times across different files, the registry throws:

```
NotSupportedError: Failed to execute 'define' on 'CustomElementRegistry':
the name "md-elevation" has already been used with this registry
```

This guide establishes a **single source of truth** for MD3 component registration to prevent this error at any scale.

---

## The Problem: Why This Matters

### Without centralized initialization:
```
app/
├── component-a.ts  → imports @material/web/button/filled-button.js  ❌
├── component-b.ts  → imports @material/web/button/filled-button.js  ❌ DUPLICATE!
└── component-c.ts  → imports @material/web/button/outlined-button.js ❌
```

Each file independently imports MD3, causing:
1. **Registry errors** - Multiple registrations of the same component
2. **Maintenance burden** - Tracking which files import which components
3. **Scale problems** - With 6+ apps, managing duplicate imports becomes impossible
4. **Silent failures** - New components added without proper imports don't error clearly

### With centralized initialization (this approach):
```
packages/ui-lit/src/
└── material-design-init.ts  ✅ SINGLE SOURCE OF TRUTH
    └── imports ALL @material/web components used anywhere in the monorepo

apps/
├── app-a/
│   └── main.ts → imports '@df/ui-lit' → material-design-init.ts loaded ONCE
└── app-b/
    └── main.ts → imports '@df/ui-lit' → material-design-init.ts loaded ONCE (cached)
```

---

## The Solution: Unified Initialization

### 1. Single Registry File

**Location:** `packages/ui-lit/src/material-design-init.ts`

This file imports **ALL** Material Design 3 components used anywhere in the monorepo, covering:
- Buttons (filled, outlined, tonal, text)
- Form fields (text, select, checkbox)
- Progress indicators
- Icons and dialogs
- Any other MD3 components added in the future

**Why this location:**
- `@df/ui-lit` is the centralized UI component library
- All apps depend on it (or should)
- Natural entry point for Material Design infrastructure

### 2. Automatic Loading via Index

**File:** `packages/ui-lit/src/index.ts`

```typescript
/**
 * @df/ui-lit - Shared UI Components Library
 *
 * IMPORTANT: This module automatically imports Material Design 3 components
 * on load to prevent CustomElementRegistry duplicate registration errors.
 * See material-design-init.ts for details.
 */

// Import Material Design 3 components ONCE, before exporting any components
import './material-design-init.js';

export * from './my-element.js';
export * from './df-segmented-button.js';
// ... other exports
```

**Key insight:** When any component or app imports from `@df/ui-lit`, Material Design components are automatically initialized. No special knowledge required.

### 3. No App-Level Duplication

**WRONG:**
```typescript
// ❌ DON'T create per-app initialization files
apps/df-app-1/src/material-design-init.ts
apps/df-app-2/src/material-design-init.ts
apps/df-app-3/src/material-design-init.ts
```

**RIGHT:**
```typescript
// ✅ Single source of truth
packages/ui-lit/src/material-design-init.ts
```

---

## Guidelines for Developers & Agents

### When Adding a New App

**✅ DO:**
```typescript
// apps/my-new-app/src/main.ts
import './my-component.ts';  // Import your components normally
// Material Design is automatically initialized via @df/ui-lit
```

**❌ DON'T:**
```typescript
// ❌ Don't create app-level MD3 init files
import './material-design-init.ts';  // Unnecessary duplication
import '@material/web/button/filled-button.js';  // Import MD3 directly
```

### When Adding a New Component to @df/ui-lit

1. **Write your component** using MD3 elements (e.g., `<md-filled-button>`)
2. **Do NOT import** `@material/web` components in your component file
3. **Register your component** in `packages/ui-lit/src/index.ts`
4. **If you use a new MD3 component type:** Add it to `material-design-init.ts`

**Example:**
```typescript
// packages/ui-lit/src/my-new-component.ts
import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('my-new-component')
export class MyNewComponent extends LitElement {
  render() {
    return html`
      <md-filled-button>Click me</md-filled-button>  ✅ Uses MD3 element
      <!-- Component renders MD3 elements, doesn't import them -->
    `;
  }
}
```

```typescript
// packages/ui-lit/src/material-design-init.ts
// If you added md-some-new-element to your component, add it here:
import '@material/web/new-component/new-component.js';  ✅
```

### When Adding a New Firebase App

Each new Firebase app should import from `@df/ui-lit`:

```typescript
// apps/df-new-firebase-app/src/main.ts
import '@df/ui-lit/firebase';  // Firebase components (MD3 init happens automatically)

// Use any Firebase UI component - MD3 is already initialized
const authComponent = document.createElement('df-sign-in');
```

**No Material Design setup needed** - it's handled by the shared library.

---

## Enforcement: How to Know You're Following the Pattern

### Self-Check Questions:

1. **Are you creating a new `material-design-init.ts` file?**
   - ❌ **No.** Use the one in `packages/ui-lit/src/`

2. **Are you directly importing `@material/web` in a component?**
   - ❌ **No, unless it's a type import only** (e.g., `import type { MdButton } from '@material/web/button/filled-button.js'`)

3. **Are you in a new app and worried about MD3 initialization?**
   - ✅ **Don't worry.** Just import `@df/ui-lit` and it's handled automatically.

4. **Did you add a new MD3 component type (e.g., a dialog, tabs)?**
   - ✅ **Add it to `material-design-init.ts`** so all apps benefit.

---

## Automated Enforcement (Optional Future)

If this pattern is violated frequently, consider adding:

### Linting Rule (ESLint)
```javascript
// .eslintrc.cjs - future enhancement
{
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@material/web/**'],
            message: 'Import Material Design components via material-design-init.ts in @df/ui-lit. See guides/MATERIAL_DESIGN_INITIALIZATION.md',
            allowTypeImports: true
          }
        ]
      }
    ]
  }
}
```

### Build-time Assertion
Validate in build that only `material-design-init.ts` imports `@material/web`.

---

## Troubleshooting

### "NotSupportedError: md-button already registered"

**Cause:** A component or app is importing MD3 components directly.

**Fix:**
1. Remove the import statement from that file
2. Ensure the component is imported/exported via `@df/ui-lit` or a file that does
3. Verify `material-design-init.ts` includes the component

### "Component renders but styles are missing"

**Cause:** MD3 components weren't initialized before the component rendered.

**Fix:**
1. Ensure app imports from `@df/ui-lit` early in `main.ts`
2. Check that `material-design-init.ts` is imported in `packages/ui-lit/src/index.ts`

### "I added a new MD3 component and it's not working"

**Cause:** The component type isn't in `material-design-init.ts` yet.

**Fix:**
1. Open `packages/ui-lit/src/material-design-init.ts`
2. Add `import '@material/web/[component-type]/[component].js';`
3. Rebuild

---

## Reference: What Gets Imported

**File:** `packages/ui-lit/src/material-design-init.ts`

Currently registers:
- ✅ Buttons (filled, outlined, tonal, text)
- ✅ Text fields (outlined, filled)
- ✅ Selects (filled, outlined) + options
- ✅ Progress (circular, linear)
- ✅ Icons & icon buttons
- ✅ Dialogs
- ✅ Dividers

Add more as needed for new components.

---

## Decision Tree

```
I want to use Material Design components in my new component/app:

├─ You're adding a new component to @df/ui-lit?
│  └─ Just use <md-*> elements in your template ✅
│     (Don't import @material/web)
│     (If new component type, add to material-design-init.ts)
│
├─ You're creating a new app?
│  └─ Import from @df/ui-lit in main.ts ✅
│     (MD3 init happens automatically)
│
├─ You're writing a non-UI utility/store?
│  └─ Don't import @material/web ✅
│     (It's UI infrastructure, not business logic)
│
└─ You need a type from @material/web?
   └─ Use type-only import ✅
      import type { MdButton } from '@material/web/button/filled-button.js'
```

---

## Summary

| Pattern | Location | Who Does It | When |
|---------|----------|-----------|------|
| **MD3 Registration** | `packages/ui-lit/src/material-design-init.ts` | Centralized | Once, on app startup |
| **Component Creation** | Your component file | You | Per component |
| **MD3 in Components** | `packages/ui-lit/src/index.ts` | Auto-loaded | When `@df/ui-lit` is imported |
| **App Integration** | `apps/*/src/main.ts` | Auto-loaded | When app starts |

**Key principle:** Import from `@df/ui-lit`, not from `@material/web` directly.

---

## Performance & Memory Concerns

**Does centralized initialization waste memory or bloat bundles?**

**Quick answer:** No. Tree-shaking automatically removes unused imports during build.

**Detailed answer:** See `.z_/faq/PERFORMANCE_AND_IMPORTS.md` if you're concerned about:
- Bundle bloat
- Memory overhead
- Lighthouse score impact
- Tree-shaking details

Summary for the trusting:
- ✅ **Zero bundle impact** - Unused imports are tree-shaken out
- ✅ **No memory overhead** - Identical runtime footprint
- ✅ **Lighthouse safe** - No negative performance impact
- ✅ **Architecture win** - Better code at zero cost

---

## References

- **Performance FAQ** (optional): `.z_/faq/PERFORMANCE_AND_IMPORTS.md`
- **Monorepo Architecture**: `.claude/CLAUDE.md`
- **Build Configuration**: `guides/STANDARDS_STYLES.md` (Material Design 3 standards)
- **Tree-Shaking Documentation**: https://rollupjs.org/guide/en/#tree-shaking

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-10-21 | Initial document & unified approach implementation | Claude |

