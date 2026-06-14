# OpenClaw Work Request Workflow

> **Tier:** 2 (Load when working on df-agent-work-request or any agent/gate/turn related ticket)
>
> **Status:** Authoritative design — supersedes speculative sections of `apps/df-agent-work-request/src/tmp.md`

---

## Terminology Note

**"Work Request document"** and **"status document"** (used in tmp.md) refer to the same thing: the Firestore document at `openclawWorkRequests/{requestId}`. The word "document" alone is ambiguous — prefer "Work Request" when referring to this record to avoid confusion with generic Firestore document terminology.

---

## Purpose

A Work Request is a structured document that must pass all defined gates before it can be submitted into the system. The conversation between the user and agents is the mechanism for iteratively improving that document until all gates pass and the user is satisfied.

---

## Actors

| Actor | Responsibility |
|---|---|
| **User** | Provides input, reviews the document, clicks Submit when satisfied, if gates give him/her that option. |
| **Cathy** | Primary conversational agent — receives user input, updates the Work Request document for the User , replies with a summary of what changed |
| **Gate agents** | Specialized agents that evaluate specific fields or conditions on the document; they add, remove, or update gate states independently |
| **Human Gates** | Specialized humans that oversee **Gate Agents** and train get agents how to catch certain conditions with LLM skills, MCPs, and Plugins |
| **UI** | Renders current gate states directly from the document; shows the Submit button only when all gates pass |

---

## The Loop

1. User sends a message
2. Cathy updates the Work Request document and replies with what changed.
3. Human gates review document and train Gate Agents how to catch certain conditions.
4. Gate agents re-evaluate the document and update gate states on it
5. UI reflects current gate states
6. Repeat until all gates pass and the user clicks Submit

The loop continues regardless of whether previous turns have unresolved gates. Gate failures do not block user input — they accumulate as pending conditions on the document until resolved.

---

## Cathy's Role (Protocol)

Cathy's reply summarizes what she changed on the document. A verbose version of the protocol:

> "I received your message and updated the Work Request document accordingly. Other agents may now evaluate those changes and update gate states. Until their review is complete, some gates may remain blocked. Once they finish, any remaining issues will appear in the gates panel for you to address. In the meantime, feel free to suggest further changes."

The gates panel (UI responsibility, not Cathy's) shows which gates are currently passing or failing.

---

## Gates

- Gates belong to the **Work Request document**, not to individual turns or messages
- A gate can be:
  - **Deterministic** — code checks a field value (e.g. title is non-empty, budget is a number in range)
  - **Probabilistic** — an LLM evaluates free-form text for a quality condition
  - **Human approval** — a named person must explicitly approve
- Any gate can be toggled on or off by a change to the document's configuration
- The **Submit button** is the final human-approval gate — it only unlocks when all agent gates have passed

**Design principle:** Prefer structured fields over free-form text wherever possible. LLM-based gates on prose are brittle. Every field Cathy writes should have a declared type, even if its current gate is LLM-based, so a deterministic gate can replace it later without schema changes.

---

## Turns

A turn is a matched pair of messages — one user message and one Cathy reply — identified by a shared `turnNumber` field on both message documents.

- Turns are conversational scaffolding; the **document is the source of truth**
- Gate state is not owned by turns
- Multiple turns can accumulate with unresolved gates — this is expected and normal
- `turnNumber` is written to each user message at send time; Cathy's reply carries the same `turnNumber`

### Schema

```
openclawWorkRequests/{requestId}/messages/{messageId}
  role: 'user' | 'assistant'
  content: string
  turnNumber: number        ← identifies which turn this message belongs to
  createdAt: timestamp
  sessionId: string
  status: 'pending' | 'processing' | 'complete' | 'error'
```

---

## Relationship to tmp.md

`apps/df-agent-work-request/src/tmp.md` is a speculative design document written before implementation began. Some of its concepts (gate definitions, loop control, templates) remain useful as inspiration for future tickets. However, this guide takes precedence on any point where the two conflict. Specifically:

- tmp.md proposes a separate `turns` subcollection with text duplication — **not adopted**
- tmp.md's `meta.turnState = USER_TURN | PROCESSING` may still be useful for UI locking in a future ticket, but is out of scope until then
- tmp.md's gate and template schemas remain candidates for future tickets

---

## Out of Scope (Future Tickets)

- Persistence of gate states on the Work Request document
- The gates panel UI widget
- Agent-to-Firestore write permissions for gate updates
- Submit button unlock logic
- Work Request document field schema (title, budget, description, etc.)
- Git-based persistence for the awr-markdown-codemirror content

## Problems not solved yet

- Human and agent gates all pass document in current turn (n) state
- Then turn n+1 modifies state
- Modification of state may, or may not, be material
- Now, Human and agent gates must be closed, again
- Expensive to check if modification was material or not - especially at human level
