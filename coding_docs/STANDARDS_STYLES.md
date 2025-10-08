# Coding Standards & Styles

> **See also:** `coding_docs/SHARED_WEB_COMPONENT_DEFAULTS.md` is the canonical reference for signals-first component guidance. This document supplements it with broader stylistic expectations.

## Typescript

- **Typescript Types** - As a general rule, use interface for defining the shape of objects and type for all other scenarios (unions, intersections, primitives, etc.). Shared, application-wide interfaces and types should be maintained in the src/types directory to enforce consistent data structures. For types that are only used within a single component, it is acceptable to define them within the component's file or in a co-located .types.ts file.
- **Class and Function Size** - Special care must be taken at all times to ensure that classes and functions are small, obvious in their intent, and focused on a single objective or set of objectives. The unix motto of "do one thing and do it well" is a primary objective for each function, and where practical, each class.
- **Copy Pasted and Redundant Code** - Copypasted and/or other forms of redundant code should be avoided. Code should be refactored as it is written to avoid such usage.
- **Unit Testing** Code should be unit tested as it is written, in order to identify regressions as they occur. Ideally such testing would be written in advance of the code itself, in order to keep the design of the code implementation focused and on target.

## Web Component Coding

- **Lit** - Web Components to be coded with the latest stable version of Lit as made available and documented by the Google Chrome team.
- **Typescript** - As Lit is designed for usage in both javascript and typescript projects, only typescript Lit usage should be use in this project.
- **Visual Only** - Web Components should primarily focus on rendering UI. Application state that needs to be persisted or shared across different parts of the application must be managed in external src/stores classes. Internal, non-persisted UI state (e.g., animation state, toggling visibility of an element) can be managed within the component itself.
- **Material Design 3** - All web component coding to follow Material Design 3 coding standards, importing directly when available, implementing internally when not available for import from the Material Design repository.

### Lit Component Implementation Patterns

#### **Property Declaration Pattern**
When using `@property` decorators, initialize values in constructor, not as class fields, to avoid property shadowing.

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
- **Use CSS custom properties** for themability, but with concrete fallbacks
- **Follow BEM-style naming** for classes (`.component__element--modifier`)
- **Design mobile-first** then add responsive enhancements
- **Avoid circular custom property references** - use fallbacks in usage, not definition


## Signals-Based Reactive Architecture

### Core Philosophy
- **Standards-based approach** - Signals represent a potential web standard for reactive programming
- **Interoperability** - Code should work across libraries and frameworks through universal reactive primitives
- **UI-agnostic state** - Business logic and data models live in signals, separate from UI components
- **Deep observability** - Fine-grained reactivity through signal-based data structures

### Reference Implementation
- **Author's article**: [Reactive State with Signals in Lit](https://justinfagnani.com/2024/10/09/reactive-state-with-signals-in-lit/)
- **Demo projects**: `npmish.html` and related AsyncComputed examples in codebase

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
- **Component protection** - Use conditional rendering based on `isLoggedIn.get()` signal
- **SignalWatcher pattern** - Components accessing auth state must extend `SignalWatcher(LitElement)`
- **Login UI** - Provide clear login prompts and user info when authenticated
- **No Authentication Emulator** - Use direct, non-emulated firebase authentication, not the emulator, even when other emulators are in use.

## Development Environment
- **Firebase Emulators** - Use local emulators for development (configured in `firebase.json`), excepting Auth Emulator which is sometimes problematical in this dev environment, and should be avoided.
- **Emulator connection** - Auto-connect to emulators when running on localhost
- **Environment detection** - Use `import.meta.env.DEV` or `location.hostname === 'localhost'` for dev-specific code

## Code Organization
- **Micro-iterations** - Implement features in small, discrete steps with frequent git commits
- **Progressive complexity** - Start with simple implementations, refactor later as needs evolve
- **Todo tracking** - Use TodoWrite tool to track implementation progress for complex features
- **No commented-out code** - Commented-out code is not allowed except for brief periods between commits during active development. All dead code must be removed before committing to maintain code clarity and prevent confusion
- **Console log cleanup** - All `console.log()`, `console.debug()`, `console.warn()` statements must be removed before work is considered complete and checkpointed, except for essential error logging (`console.error()`) for production debugging. Temporary debug logs are acceptable during active development but must be cleaned up before task completion

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
- **Page-per-feature principle** - Each distinct feature gets its own HTML page and web component
- **Natural navigation** - Leverage browser navigation, bookmarking, and back/forward buttons
- **Component size limit** - Aim to keep individual components under 200 lines. If you approach ~300 lines, pause and evaluate whether the component has taken on multiple responsibilities and should be split into smaller pieces or delegated to separate pages/components.

### Development vs Production Structure  
- **`dev/` folder** - Development and testing environment only
  - Individual HTML pages for testing components (`dev/rag.html`, `dev/pageAuthor.html`)
  - Direct component imports for development
  - Not used in production deployments
- **Rollup bundling** - Components are bundled for production deployment
  - Configured in `rollup.config.js` 
  - Bundles placed in `_site/ui/` for 11ty integration
- **11ty integration** - Static site generator consumes bundled components
  - Components can be deployed across multiple 11ty sites
  - Maintains component reusability across different contexts

### Component Organization
- **One component per page** - Each HTML page typically hosts one primary web component
- **Feature-focused components** - Components should serve a single, well-defined purpose
- **Cross-page navigation** - Use standard HTML links between pages, not client-side routing

## File Structure & Organization
- **Component imports** - Import Firebase config and stores from their canonical locations
- **Type safety** - Use TypeScript interfaces for Firebase document structures

## Documentation
- **Function documentation** - Include JSDoc comments for public functions, especially async operations
- **Error context** - Log errors with sufficient context for debugging
- **Status feedback** - Provide user feedback for long-running operations