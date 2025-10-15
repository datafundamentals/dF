# Shareable Web Component Coding Standards

## 1\. The Prime Directive: Design for Reusability

Our single most important architectural goal is to make every visual component **shareable** across different applications within the monorepo. To achieve this, components must be designed as **presentation-only** ("dumb") components whenever reasonably practical. The guidance in this document reflects the current state of `@df/state`, `@df/ui-lit`, and the teaching apps in this repo; revisit the upstream article [Reactive State with Signals in Lit](https://justinfagnani.com/2024/10/09/reactive-state-with-signals-in-lit/) for additional theory.

A presentation-only component is completely decoupled from its environment. It has three core characteristics:

1.  **No Business Logic:** It doesn't know *how* to save a user, add an item to a cart, or submit a form.
2.  **No Data Ownership:** It doesn't fetch its own data or connect to APIs.
3.  **No Environmental Awareness:** It doesn't know what application or page it's being used in.

Its sole responsibility is to render a user interface based on the state it is given and to announce user interactions. By enforcing this strict separation of concerns, we ensure a component can be dropped into any context without modification, maximizing its value and reducing code duplication.

## 2\. Our Standard for Decoupling: A Signals-First Architecture

To enforce and simplify the creation of presentation-only components, we use a **signals-first architecture** as the standard for managing all reactive state.

This approach effectively decouples components from a rigid parent-child hierarchy, allowing them to connect directly to a shared source of truth. The following sections detail how to implement this pattern.

### 2.0. Reference Implementations

When in doubt, review one or more of the canonical examples before writing code:

- **`apps/df-npm-info-app`** – End-to-end harness demonstrating side effects contained in `@df/state` and presentation logic in `@df/ui-lit` (source of truth for AsyncComputed usage inspired by the Fagnani article).  Also a browser harness demonstrating how Playwright exercises shared state and component events.
- **`apps/df-teaching-app`** – Example of computed signal orchestration, auto-refresh behaviour, and widget → store separation. Shows auto-refresh workflows, error forcing hooks, and host → widget contracts.
- **`packages/ui-lit/df-npm-info-widget.ts`** & **`packages/ui-lit/df-practice-widget.ts`** – “Golden” presentation components showing property patterns, event naming, and styling guidelines.

Treat these references as living specifications. Any new component pattern should either follow them verbatim or document why it intentionally deviates.

> **Why harnesses feel "live":** Our runtime harnesses deliberately connect presentation components to the real `@df/state` stores. That wiring means UI events still trigger fetches or other side effects—handled *outside* the component—so the preview looks functional.  The component remains presentation-only because it only renders signal values and dispatches events; side effects stay in the stores or harness code that listens to those events.

### 2.1. The Source of Truth: Centralized Signal State

All dynamic application state that can change over time **must** be managed in signals. This state should be co-located with the business logic that modifies it, typically in dedicated service or state files.

  * ✅ **Do:** Create state files (e.g., `user.state.ts`) that define and export signals and the functions that modify them.
  * ❌ **Don't:** Define shared state signals inside a component's class. A component's role is to consume or update state, not own it.

#### Example: A Standard State File

```typescript
// file: ./src/state/user.state.ts

import { signal } from '@lit-labs/signals';
import { userService } from '../services/user-service.ts';

// 1. Define and export the signal as the source of truth.
export const currentUser = signal({ name: 'Loading...', email: '' });

// 2. Define and export functions that encapsulate the logic for state changes.
export async function fetchUser(userId: string) {
  const user = await userService.fetch(userId);
  currentUser.value = user;
}

export async function updateUser(newName: string) {
  const updatedUser = { ...currentUser.value, name: newName };
  currentUser.value = updatedUser; // Optimistic update
  await userService.save(updatedUser);
}
```

### 2.2. Component Design: Direct Signal Consumption

Components achieve their presentation-only nature by connecting directly to the state signals they need, making them independent of their position in the component tree.

  * ✅ **Do:** Import signals directly into your components. Use tooling like the `@signal` decorator to ensure the component automatically re-renders when the signal's value changes, or extend `SignalWatcher(LitElement)` so the component automatically re-renders when the signal's value changes.
  * ❌ **Don't:** Pass reactive data via props from a parent unless you are selecting which signal to read. This creates unnecessary coupling and violates the principle of a component being self-sufficient.

#### 2 Examples: Signal-Consuming Components

This `user-display` component is purely presentational. It only knows how to render a user's name and email; it has no idea where that data comes from.

Please not two different examples, each with a different approach. Each approach has it's place.

Here is the first example.

```typescript
// file: ./src/components/user-display.ts
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { signal } from '@lit-labs/signals';

// 1. Import the signal directly.
import { currentUser } from '../state/user.state.ts';

@customElement('user-display')
@signal // This decorator links the component's lifecycle to any signals read in render().
export class UserDisplay extends LitElement {
  render() {
    // 2. Read the signal's value directly in the template.
    return html`
      <h2>Welcome, ${currentUser.value.name}!</h2>
      <p>Email: ${currentUser.value.email}</p>
    `;
  }
}
```

Here is the 2nd example.

```typescript
// file: ./src/components/user-display.ts
import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';

// 1. Import the signal directly.
import { currentUser } from '../state/user.state.ts';

@customElement('user-display')
export class UserDisplay extends SignalWatcher(LitElement) {
  override render() {
    // 2. Read the signal's value directly in the template.
    return html`
      <h2>Welcome, ${currentUser.value.name}!</h2>
      <p>Email: ${currentUser.value.email}</p>
    `;
  }
}
```

### 2.3. The Limited Role of Properties and Events

While signals are the default for all reactive data, properties and events are reserved for specific use cases that do not break the presentation-only model.

#### When to Use Properties (`@property`)

Use properties **only** for passing **static or configuration data**—data that does not change during the component's lifecycle.

  * **Configuration:** `variant="primary"`, `iconName="close"`
  * **Static Labels:** `label="First Name"`
  * **Identifiers:** A unique ID used by the component to select the *correct* signal from a larger state store (e.g., `<user-profile userId="123"></user-profile>`).

#### When to Use Events (`CustomEvent`)

Use events **only** for communicating **transient user actions** or relaying the user's intent. Persisted state transitions remain in stores.

  * **Notifications:** Notifying a parent that a one-time animation has completed.
  * **Layout Changes:** Requesting a parent container to `close` or `dismiss` the component (e.g., a modal's close button).
  * **Intent relays:** Forwarding search terms, filter tweaks, or other user-supplied values so a store can respond.

-----

## 3\. Technical Implementation Checklist

### 3.1. Component Development Workflow

#### **Pre-Development Setup**
- [ ] **Study existing component patterns** – Read through a similar component's full implementation (types → state → UI → tests) before starting.
- [ ] **Plan the state shape first** – Define or update shared types in `@df/types`.
- [ ] **Identify signal dependencies** – Map the signals and actions you’ll need from `@df/state`.
- [ ] **Verify downstream dependencies** - If a store touches another workspace (e.g., `@df/utils`), add the TS project reference and extend Storybook's Vite aliases before you run builds

#### **Package Export Checklist**
- [ ] **Add to types/src/index.ts** – Export new shared types.
- [ ] **Add to state/src/index.ts** – Export store functions and computeds.
- [ ] **Add to ui-lit/src/index.ts** – Export the component.
- [ ] **Add to ui-lit/package.json exports** – Map the component to its built output.
- [ ] **Build packages in order** – types → state → ui-lit → apps.

### 3.2. Critical Technical Patterns

#### **Property Declaration Pattern**
Always use the `declare` keyword with `@property` decorators to avoid property shadowing.

```typescript
// ❌ AVOID - causes property shadowing
@property({type: String}) variant: 'compact' | 'full' = 'full';

// ✅ CORRECT - use declare + constructor
@property({type: String}) declare variant: 'compact' | 'full';
constructor() {
  super();
  this.variant = 'full';
}
```

#### **CSS Custom Properties Pattern**
Use fallback values in usage, not in definition, to prevent circular references.

```css
/* ❌ AVOID - circular reference */
:host {
  --my-color: var(--my-color, #blue);
}

/* ✅ CORRECT - use fallbacks in usage */
.button {
  background: var(--my-color, #blue);
}
```

#### **Signal Architecture Pattern**
Follow consistent naming and structure for state management.

Here are a couple different, but similar examples.



```typescript
// Signal naming convention:
const [featureName]Signal = signal<Type>(defaultValue);
export const [featureName]State = computed<Config>(() => ({...}));

// Export action functions with clear verbs:
export function set[FeatureName](...args) { }
export function reset[FeatureName]() { }
export function update[FeatureName](...args) { }
```

```typescript
const topicSignal = signal<PracticeTopic>('web-components');
export const practiceWidgetState = computed<PracticeWidgetState>(() => ({
  topic: topicSignal.get(),
  // …
}));

export function setPracticeTopic(next: PracticeTopic) {
  topicSignal.set(next);
}
```

#### **Typed Exports**
When exporting helpers, return the computed value directly or expose factory helpers that wrap `computed`. Keep types in `@df/types` and import them as needed to avoid circular references.

#### **Signal Return Type Pattern**
When exporting a signal or computed instance, prefer `ReturnType<typeof createState>` instead of referencing the `Signal` namespace directly. Bundlers like Vite strip namespace types during build, and this pattern preserves accurate typings while remaining tool-friendly.

```typescript
function createAvatarState() {
  return computed<AvatarConfig>(() => ({ /* ... */ }));
}

export function avatarState(id = 'default'): ReturnType<typeof createAvatarState> {
  ensureAvatar(id);
  return ensureAvatarState(id);
}
```
#### **Event Design Pattern**
Follow consistent event naming and payload structure.

```typescript
// Event naming: df-[component]-[action]
this.dispatchEvent(
  new CustomEvent<PayloadType>('df-[component]-[action]', {
    detail: { /* typed payload */ },
    bubbles: true,
    composed: true,
  })
);
```

### 3.3. Testing and Debugging

#### **Build Order Dependencies**
Remember: types → state → ui-lit → apps. Turbo handles this automatically when using workspace scripts, but manual builds should respect the order.

#### **Common Issue Resolution**
- [ ] **Empty component?** → Check property shadowing (use `declare`).
- [ ] **No styling?** → Verify CSS custom property fallbacks.
- [ ] **Build fails?** → Confirm TypeScript references and run `pnpm --filter @df/types run build` first.
- [ ] **Types not found?** → Rebuild the types package and ensure exports are in place.

#### **Development Testing Progression**
1. **Types compile** – `pnpm --filter @df/types run build`
2. **State compiles** – `pnpm --filter @df/state run build`
3. **Components compile** – `pnpm --filter @df/ui-lit run build`
4. **App harnesses run** – `pnpm --filter <app> run dev` or `start:test`
5. **Playwright passes** – `pnpm --filter <app> run test`
6. **Full repo** – `pnpm build` and `pnpm test`

### 3.4. Storybook Story Guidelines

#### **Essential Examples**
- [ ] **Default** – Basic usage example.
- [ ] **Interactive** – Demonstrates event handling with live feedback.
- [ ] **Variants** – Capture visual or behavioral variants (compact, disabled, etc.).
- [ ] **Edge cases** – Include error, empty, and loading states.

#### **Story Documentation Pattern**
```typescript
const meta: Meta = {
  parameters: {
    docs: {
      description: {
        component: `
Brief description of purpose and key features.

## Events
- \`component-change\`: When X happens
- \`component-action\`: When Y happens

## Accessibility
- ARIA labels for screen readers
- Keyboard navigation support
        `,
      },
    },
  },
};
```

## Follow-up Work

Implementation tasks that align the codebase with this document are tracked in `guides/STANDARDIZATION_FOLLOWUPS.md`. Review that roster when planning new tickets so work stays narrow in scope and cites the relevant standards sections. For recurring alignment checks, follow the process documented in `guides/STANDARDIZATION_AUDIT_PLAYBOOK.md`.
