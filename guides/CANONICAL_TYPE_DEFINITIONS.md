# Canonical Type Definitions

> **Tier:** 2 (Load by Task)
>
> **For Agents:** Load this guide whenever you define, extend, or consume a shared `interface`/`type` — especially anything that crosses a package boundary (`@df/types`, `@df/state`, `@df/ui-lit`, `services/`).
>
> **For Humans:** Load this guide when reviewing type definitions or when a PR adds an interface that looks suspiciously like one that already exists.

**Status:** ✅ Adopted
**Last Updated:** 2026-06-19
**Applies To:** All shared data shapes in this monorepo

---

## Core Principle

**A shared shape is defined exactly once, in `@df/types`. Everyone else imports it.**

When a layer genuinely needs more than the canonical shape, it **extends** the canonical type — it never **re-declares** a parallel copy.

- ✅ **ONE** canonical definition in `packages/types/src/*`
- ✅ Consumers `import type { Foo } from '@df/types'`
- ✅ A layer that needs extra fields writes `interface FooLocal extends Foo { … }`
- ❌ **NEVER** hand-copy the same fields into a store, a component, a test, or a function

---

## Why This Matters

Copy-pasted interfaces are not a style nit — they cause real, silent failures:

1. **Drift.** Four copies of `AgenticConversation` means four places to remember when a field is added. Miss one and the copies disagree. The compiler cannot warn you, because each copy is internally valid.
2. **`as unknown as` casts metastasize.** When two copies drift apart, TypeScript correctly refuses to assign one to the other. The tempting "fix" is `value as unknown as OtherCopy`, which discards all type safety at exactly the boundary where you needed it most.
3. **The break surfaces far from the cause.** Adding `intent` to the canonical `AgenticConversation` broke a **test fixture** three packages away — because the fixture was a fifth hand-written copy. A single source of truth turns "five edits across five files" into "one edit, plus `extends` that inherit it for free."
4. **Reviewers can't tell which copy is authoritative.** Two interfaces with the same name and slightly different fields force every future reader to diff them by hand and guess which one is "right."

> If you find yourself typing the same field list a second time, stop. You are about to create a competing definition.

---

## The Pattern

### 1. Canonical definition — `@df/types`

```typescript
// packages/types/src/agentic-chat.types.ts
export interface AgenticConversation extends FirestoreDocument {
  userId: string;
  agentId: string;
  title: string | null;
  intent: string | null;
  summary: string | null;
  metrics: string | null;
  status: AgenticConversationStatus;
  createdAt: Date | null;
  lastMessageAt: Date | null;
  workRequestMarkdown?: string;
  attachments?: Attachment[];
}
```

### 2. A layer that needs extra fields — **extend**, don't re-declare

The store tracks `currentTurnNumber` (internal bookkeeping) and treats `attachments`
as always-present. It expresses *only the delta*:

```typescript
// packages/state/src/stores/agentic-chat.store.ts
import type {AgenticConversation as AgenticConversationBase} from '@df/types/agentic-chat.types';

interface AgenticConversation extends AgenticConversationBase {
  attachments: Attachment[];   // narrowed: required here, optional in the contract
  currentTurnNumber: number;   // internal-only field, never exposed to consumers
}
```

A new field on the canonical type now flows into this interface automatically.

### 3. A consumer that needs a subset — **import**, don't re-declare

A presentation component reads a subset of the fields. It does **not** need a smaller
copy — structural typing means the canonical (wider) type is accepted everywhere a
narrower one would be:

```typescript
// packages/ui-lit/src/df-agent-work-request-widget.ts
import type {AgenticConversation, AgenticMessage} from '@df/types';
// ...no local interface; canonical objects flow straight in.
```

### ❌ The anti-pattern this replaces

```typescript
// DON'T: a competing copy in the widget
interface AgenticConversation {        // same name, drifted shape
  id: string;
  userId: string;
  agentId: string;
  title: string | null;
  status: 'active' | 'accepted';
  // ...missing intent/summary/metrics — silently out of date
}

// DON'T: the cast this copy forces at every boundary
const messages = chatState.documents as unknown as AgenticMessage[];
```

Once the local copies are removed, that `as unknown as` cast becomes a plain, safe
assignment — the casts only existed to paper over the drift.

---

## Decision Guide

```
I need a type for a shared data shape.
│
├─ Does it already exist in @df/types?
│  │
│  ├─ Yes → import it.
│  │        │
│  │        └─ Do I need extra/narrowed fields for this layer only?
│  │           ├─ Yes → `interface Local extends Canonical { …delta only… }`
│  │           └─ No  → use the canonical type directly.
│  │
│  └─ No → is the shape used by more than one file/package, or persisted?
│         ├─ Yes → add it to @df/types and export it. (single source of truth)
│         └─ No  → a co-located private type is fine (see STANDARDS_STYLES.md).
```

> **Co-located types are still allowed.** A type used inside *one* component/file —
> a view-model, a form-state shape, an event detail — may live in that file or a
> `*.types.ts` beside it. This guide is about shapes that are **shared or persisted**,
> where multiple copies inevitably drift.

---

## Red Flags (stop and consolidate)

- You are about to write an `interface`/`type` whose name already exists elsewhere.
- You are re-typing a field list you have seen in another file.
- You reach for `as unknown as SomeType` to bridge two shapes that "should" be the same.
- A test fixture fails to type-check after a field is added to a shared interface — the fixture is an unmanaged copy; fix the *type relationship*, not just the fixture.
- Two files declare `interface Foo` with different field sets.

---

## References

- `packages/types/src/agentic-chat.types.ts` — canonical example of a shared contract
- `packages/state/src/stores/agentic-chat.store.ts` — canonical example of `extends`-ing the contract for internal fields
- `packages/ui-lit/src/df-agent-work-request-widget.ts` — canonical example of a consumer importing the shared type
- `guides/STANDARDS_STYLES.md` — broader TypeScript conventions (co-located vs. shared types)
- `guides/FUNCTIONS_PLACEMENT.md` — the same "single source of truth" philosophy applied to backend code
