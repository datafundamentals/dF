# Coding Standards & Styles

> **Tier:** 1 (Always Load)
>
> **For Agents & Humans:** Load this guide in every session. These are the active standards for all code.
>
> **See also:** `guides/WC_SHARED_DEFAULTS.md` is the canonical reference for signals-first component guidance. This document supplements it with broader stylistic expectations and repo-wide conventions.

## Typescript

- **Typescript Types** - As a general rule, use interface for defining the shape of objects and type for all other scenarios (unions, intersections, primitives, etc.). Shared, application-wide interfaces and types should be maintained in the src/types directory to enforce consistent data structures. For types that are only used within a single component, it is acceptable to define them within the component's file or in a co-located .types.ts file.
- **Class and Function Size** - Special care must be taken at all times to ensure that classes and functions are small, obvious in their intent, and focused on a single objective or set of objectives. The unix motto of "do one thing and do it well" is a primary objective for each function, and where practical, each class.
- **Copy Pasted and Redundant Code** - Copypasted and/or other forms of redundant code should be avoided. Code should be refactored as it is written to avoid such usage.
- **Unit Testing** Code should be unit tested as it is written, in order to identify regressions as they occur. Ideally such testing would be written in advance of the code itself, in order to keep the design of the code implementation focused and on target.

## Web Component Coding

- **Lit** – Always build web components with the current stable Lit release (see `packages/ui-lit/package.json`).
- **TypeScript** – Author all components in TypeScript; emit JavaScript through the package build steps.
- **Signals-first** – Presentation components consume state via signals exported from `@df/state`; they never own persisted data or business logic.

- **Visual Only** - Web Components should primarily focus on rendering UI. Application state that needs to be persisted or shared across different parts of the application must be managed in external src/stores classes. Internal, non-persisted UI state (e.g., animation state, toggling visibility of an element) can be managed within the component itself.
- **Material Design 3 (MD3) Components** - Prefer Material Web Components (`@material/web`) for interactive UI elements. When the MD3 spec does not ship an official component (e.g., segmented buttons), implement the pattern manually using MD3 tokens and document the exemption. This is a **strictly enforced** standard.
  - ✅ **REQUIRED**: `<md-filled-button>`, `<md-outlined-text-field>`, `<md-filled-select>`, etc.
  - ❌ **FORBIDDEN**: Native HTML elements `<button>`, `<input>`, `<select>`, `<textarea>`
  - 🔍 **ENFORCEMENT**: See `.z_/WIP/FIREBASE_TEACHING_APP_ROADMAP.md` Ticket 14 for automated linting, pre-commit hooks, and CI validation
  - 📚 **RATIONALE**: Teaching apps propagate patterns. MD3 violations multiply across all derived applications.
  - 🎨 **STYLING**: Use MD3 design tokens (`--md-sys-color-*`) in component CSS; avoid custom styling that conflicts with Material theming

#### MD3 Gaps (Spec-Only Components)
Some MD3 patterns do not have Material Web implementations yet. Approved custom builds must:

- Follow the MD3 spec exactly (layout, typography, colors, states)
- Keep native semantics for accessibility (e.g., `role="radio"` for segmented buttons)
- Include an inline `// eslint-disable-next-line @df/md3/enforce-md3 -- reason + spec link` comment
- Reference the spec in code comments for future maintainers
- Log the pattern in `.z_/future/MD3_GAPS.md` so the exemption is easy to audit

| Pattern | Spec Link | Example |
|---------|-----------|---------|
| Segmented buttons | https://m3.material.io/components/segmented-buttons/specs | `packages/ui-lit/src/df-segmented-button.ts`
| Floating action button (FAB) variations | https://m3.material.io/components/floating-action-button/specs | _TBD when implemented_ |
| Other gaps | [MD3 component catalog](https://m3.material.io/components) | Log future gaps in `.z_/future/MD3_GAPS.md` |

### Lit Component Implementation Patterns

#### **Property Declaration Pattern**
When using `@property` decorators, initialize values in the constructor instead of class fields to avoid property shadowing.

```typescript
// ❌ AVOID - causes property shadowing
@property({type: String}) variant: 'compact' | 'full' = 'full';

// ✅ CORRECT - use declare + constructor initialization
@property({type: String}) declare variant: 'compact' | 'full';
constructor() {
  super();
  this.variant = 'full';
}
```

#### **Event Naming Convention**
Events should follow the pattern: `df-[component-name]-[action-type]`

```typescript
// Examples:
'df-upload-link-change'
'df-segmented-button-change'
'df-modal-close'
'df-form-submit'
```

#### **CSS Architecture Guidelines**
- **Use CSS custom properties** for themability, but always include concrete fallbacks.
- **Follow BEM-style naming** for classes (`.component__element--modifier`).
- **Design mobile-first** then add responsive enhancements.
- **Avoid circular custom property references** – place fallbacks where the property is consumed, not defined.


## Signals-Based Reactive Architecture

### Core Philosophy
- **Standards-based approach** – Signals are the default reactive primitive across the monorepo.
- **Interoperability** – Shared state lives in `@df/state` and is imported directly by any component or app that needs it.
- **UI-agnostic state** – Signals and computed helpers expose business data; UI layers consume but never own that state.
- **Deep observability** – Use computed signals to derive view models whenever this is more effective than ad-hoc props-down events-up plumbing.

### Reference Implementation
- **Author's article**: [Reactive State with Signals in Lit](https://justinfagnani.com/2024/10/09/reactive-state-with-signals-in-lit/)
- **df-npm-info-app** – t bhe **Demo project** from the above article.This is arowser harness for async workflows and event dispatching.
- **df-lit-starter** – Demonstrates a host shell wired to shared state and components.
- **df-teaching-app** – Showcases a host harness orchestrating signals and the `df-practice-widget`.

## Shared State & Stores

- **Location** – All shared state lives in `packages/state/src/stores/*` and is exported via `packages/state/src/index.ts`.
- **Signal naming** – Use `camelCaseSignal` for internal writable signals and `somethingState` for exported computeds.
- **Side effects** – Encapsulate async work inside store functions; UI layers call them but never await results directly inside templates.
- **Lifecycle helpers** – Components extend `SignalWatcher` and read signals in `render()`; avoid manual subscriptions.
- **Upcoming Firebase work** – Additional guidance will ship with the dedicated Firebase ticket; until then do not introduce Firebase-specific contracts into new docs. (See `.z_/future` for planning notes.)

## Firebase & State Management

### Store Architecture
- **State changes are never handled within Web Components** - All persisted state changes must be executed in `src/stores/`
- **Signals for communication** - Use signals as the state communications layer between stores and components
- **AsyncComputed for async operations** - All async Firebase operations should use AsyncComputed pattern from `signal-utils/async-computed`

### AsyncComputed Patterns
- **Correct access pattern**: `await asyncComputed.complete; const result = asyncComputed.value;`
- **Incorrect patterns**: `await asyncComputed.value` or `await asyncComputed.get()` (both return undefined)
- **Status checking**: Use `asyncComputed.status` to check 'pending' | 'complete' | 'error'
- **Factory functions**: Export functions that return `new AsyncComputed(async () => { ... })` from stores
- **Component usage**: Create computed in component, await complete, then access value
- **Reference implementation**: See `src/stores/exampleAsync.ts` and `npmish.html` (author's demo)

### Firebase Patterns
- **Collection naming** - Use simple, direct naming for collections (e.g., `tags`, `players`, `documents`)
- **Document structure** - Keep document structures minimal and consistent:
  ```typescript
  // Example tag document
  { name: "foo", createdAt: timestamp }
  ```
- **Error handling** - Fire-and-forget operations should include error alerts for user feedback (acceptable anti-pattern for MVP)

## Authentication
- **Component protection** - Use conditional rendering based on `firebaseAuthState` signal
- **SignalWatcher pattern** – Any component that consumes authentication state must extend `SignalWatcher(LitElement)`.
- **Login UI** - Provide clear login prompts and user info when authenticated
- **No Authentication Emulator** - Auth Emulator remains forbidden for general development—**except one use case**: `apps/df-firebase-teaching-app1` for email/password user creation testing. See app-specific docs for details. Rationale: "Authentication with email/password is burdensome for users"
- **Boundary enforcement** – Authentication guards belong in host shells or wrappers (e.g., `df-auth-wrapper`), never in presentation components.
- **UI feedback** – Provide clear prompts for logged-out states and visible, accessible sign-out affordances.
- **Consolidated auth** - Use `firebaseAuthState` from `@df/state` as the single source of truth for all apps. Token storage (localStorage, sessionStorage, cookies) is handled automatically in the store, and is a YAGNI style enhancement for future use.

## Development Environment
- **Vite dev servers** – Each app exposes `dev`/`preview`/`start:test` scripts that launch Vite on a dedicated port.
- **Turbo graph** – Repository scripts (`pnpm build`, `pnpm test`, etc.) rely on Turbo to build dependencies in order.

- **Firebase Emulators** - Use local emulators for development (configured in `firebase.json`), excepting Auth Emulator which is sometimes problematical in this dev environment, and should be avoided.
- **Emulator connection** - Auto-connect to emulators when running on localhost
- **Environment detection** - Use `import.meta.env.DEV` or `location.hostname === 'localhost'` for dev-specific code

## Code Organization
- **Micro-iterations** - Implement features in small, discrete steps (commits reviewed by humans only)
- **Progressive complexity** - Start with simple implementations, refactor later as needs evolve
- **Todo tracking** - Use TodoWrite tool to track implementation progress for complex features, or equivalent functionality within your toolset
- **No commented-out code** - Commented-out code is not allowed except for brief periods between commits during active development. All dead code must be removed before committing to maintain code clarity and prevent confusion
- **Console log cleanup** - All `console.log()`, `console.debug()`, `console.warn()` statements must be removed before work is considered complete and checkpointed, except for essential error logging (`console.error()`) for production debugging. Temporary debug logs are acceptable during active development but must be cleaned up before task completion

> **Note for Coding Agents:** Never commit to git. Leave all changes in pending for human review and approval. See `TICKET_SESSION_CHECKLIST.md` for full policy.

## File Naming Conventions

### Guiding Principles
1. **Consistency within file type and context** - Files of the same type in the same domain should follow the same convention
2. **Readability over brevity** - Names should clearly indicate purpose and content
3. **Tooling compatibility** - Consider how different tools (bundlers, servers, etc.) handle different naming patterns
4. **Team cognitive load** - Minimize decision fatigue by having clear rules per context

### Convention by File Type

**TypeScript/JavaScript Source Files (`.ts`, `.js`)**
- **Components/Classes**: `PascalCase.ts` (matches class name)
- **Utilities/Services**: `kebab-case.ts`
- **Configuration**: `kebab-case.config.ts`
- **Types/Interfaces**: `kebab-case.types.ts`

**Web Components**
- **Custom Elements**: `kebab-case-element.ts` (matches HTML tag requirement)

**Stylesheets (`.css`, `.scss`)**
- **Global styles**: `kebab-case.css`
- **Component styles**: Match component name convention

**Configuration Files (`.json`, `.yaml`, `.config.*`)**
- **Follow ecosystem conventions**: `package.json`, `tsconfig.json`, `firebase.json`
- **Custom configs**: `kebab-case.config.ext`

**Documentation (`.md`)**
- **README files**: `UPPER_SNAKE_CASE.md` 
- **Documentation**: `kebab-case.md`
- **Content files**: `kebab-case.md` or `snake_case.md` for content management

**Scripts (`.sh`, executable files)**
- **Build/deployment**: `kebab-case.sh`
- **Utilities**: `snake_case.sh` for Unix compatibility

**Asset Files (`.png`, `.svg`, etc.)**
- **kebab-case** for web compatibility
- **No spaces, special characters**

### Context-Specific Rules

**Frontend UI Components**: Follow web standards (kebab-case for custom elements, PascalCase for classes)

**Backend Services**: Follow language/framework conventions (Node.js typically uses kebab-case)

**Content/Data Files**: Prioritize human readability and CMS compatibility

### Migration Strategy
1. Document current state with file inventory
2. Prioritize renaming files that cause tooling issues first
3. Rename in logical groups (all components, then services, etc.)
4. Update all references atomically per group

## Application Architecture

### Multi-Page Application (MPA) Pattern
- **No Single Page Applications (SPAs)** - Use multi-page applications with 11ty static site generator
- **Deployment target** – 11ty is the default hosting mechanism for shipped apps; treat each component bundle as an MPA widget consumed by 11ty.
- **Page-per-feature** – Each externally deployed feature maps to its own HTML page and host component inside the consuming 11ty site.
- **Natural navigation** – Rely on browser navigation/back-forward rather than client-side routers.
- **Component size limit** – Keep individual components under ~200 lines; if you approach 300 lines, split responsibilities.

### Development vs Production Structure
- **Vite for local dev** – Use the app-level Vite scripts for rapid iteration and Playwright integration.
- **Rollup bundles** – Each app/package owns a Rollup build that emits the artifacts consumed by 11ty deployments.
- **Rollup bundling** - Components are bundled for production deployment
  - Configured in `rollup.config.js` 
  - Bundles placed in `_site/ui/` for 11ty integration
- **External 11ty instances** – Customer-facing 11ty sites live outside this repo; keep our bundles clean and portable.
- **df-lit-starter exception** – `apps/df-lit-starter` intentionally preserves the upstream lit-starter-ts 11ty demo as part of the teaching experience; this is not a template for other apps.

### Component Organization
- **One component per page** – In dev mode, each HTML page typically hosts one primary web component.
- **Feature-focused components** – Components serve a single, well-defined purpose; compose rather than nest large UIs.
- **Cross-page navigation** – Use standard HTML links between pages, not client-side routing.

## File Structure & Organization
- **Component imports** – Import shared state from `@df/state` and UI elements from `@df/ui-lit`.
- Import Firebase config and stores from their canonical locations
- **Type safety** – Define shared types in `@df/types` and import them wherever needed.

## Documentation
- **Function documentation** - Include JSDoc comments for public functions, especially async operations
- **Error context** - Log errors with sufficient context for debugging
- **Status feedback** - Provide user feedback for long-running operations
