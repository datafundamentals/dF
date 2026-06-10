```markdown
# Architectural Design: Deterministic Agentic Workflow System

## 1. System Overview
This document outlines the architecture for a state-gated, event-driven document loop. The system orchestrates interactions between human users and isolated AI agents. It leverages a centralized, real-time database to manage state, utilizing background functions to process natural language inputs, validate business rules across multiple "gates," and execute autonomous tasks without relying on brittle, linear AI chains.

## 2. Infrastructure & Tech Stack
* **Repository Structure:** `pnpm` / `turbo` monorepo separating frontend components, cloud functions, and shared types.
* **Persistence & Event Bus:** Google Cloud Firestore.
* **Compute (Orchestration & Agents):** Firebase Cloud Functions (triggering on Firestore document mutations).
* **Frontend UI:** standards-based Web Components built with Lit, mirroring Firestore state directly.
* **AI Models:** * *Tier 1 (Triage/Extraction):* Fast, low-cost models (e.g., `gpt-4o-mini`).
    * *Tier 2 (Complex Evaluation):* Frontier models (e.g., `mistral-large-2407` or equivalent) reserved strictly for complex, scoped gate validations.

## 3. Database Schema (Firestore)

The architecture relies on four primary collections. Document state, rather than application code, drives the execution loop.

### 3.1. `workRequests/{requestId}`
The central truth engine and state machine.
```json
{
  "meta": {
    "status": "IN_PROGRESS",
    "turnState": "USER_TURN",       // Options: USER_TURN, PROCESSING
    "currentTurnId": "turn_101",
    "version": 3,
    "createdAt": "2026-06-08T19:50:00Z",
    "ownerId": "user_123",
    "category": "cloud_migration",
    "templateId": "tmpl_infra_v2",
    "searchTokens": { "draft": true, "auth": true }
  },
  "content": {
    "title": "Initial Draft Request",
    "description": "Enterprise auth module setup.",
    "budget": 5000,
    "security_tier": "SOC2"
  },
  "gates": {
    "gate_1_scope_clear": { "passed": true, "error_message": null },
    "gate_2_budget_valid": { "passed": false, "error_message": "Exceeds $2,500 tier." }
  },
  "loop_control": {
    "active_turn_counts": {
      "gate_1_scope_clear": 1,
      "gate_2_budget_valid": 2
    }
  }
}

```

### 3.2. `workRequests/{requestId}/messages/{messageId}`

An append-only collection tracking the human-agent conversation stream, kept separate from the core data payload.

```json
{
  "turnId": "turn_101",
  "sender": "AGENT",
  "agentName": "SummaryAgent",
  "text": "Budget adjusted. Gate 2 is failing due to vendor limits.",
  "timestamp": "2026-06-08T19:51:05Z"
}

```

### 3.3. `gate_definitions/{gateId}`

The dynamic rules registry. Treats agent behaviors and skills as data to prevent hardcoding AI prompts into the application layer.

```json
{
  "gateId": "gate_2_budget_valid",
  "displayName": "Budget Validation",
  "active": true,
  "modelTarget": "openai/gpt-4o-mini",
  "targetFields": ["budget"],
  "systemSkillMarkdown": "# Budget Analyst Persona\nReview the `content.budget` field..."
}

```

### 3.4. `templates/{templateId}`

Read-only blueprints for instantiating new requests.

```json
{
  "templateId": "tmpl_infra_v2",
  "displayName": "Infrastructure Request",
  "defaultContent": { "title": "New Infra Provision", "budget": 1000 },
  "requiredGates": ["gate_1_scope_clear", "gate_2_budget_valid"]
}

```

## 4. Execution Lifecycle (The Event Loop)

The system operates strictly via asynchronous document mutations, ensuring the UI remains responsive and humans are never blocked by AI execution times.

1. **Phase 1: Human Hand-off**
* User submits text via the Lit component.
* UI sets `meta.turnState = "PROCESSING"`, writes the text to the `messages` sub-collection, and locks the input area.


2. **Phase 2: Triage & Data Extraction**
* A Cloud Function fires, sending the user text and a structured **Tool** to a Tier 1 model.
* The model extracts variables and updates the `content` block in Firestore.
* The Triage function instantly streams a brief acknowledgment to the `messages` collection, releasing the UI lock if necessary.


3. **Phase 3: Parallel Gate Execution**
* Firestore `onUpdate` triggers evaluate which `content` fields changed.
* Corresponding background functions pull their rules from `gate_definitions` and execute in parallel.
* Agents write results atomically back to their specific keys in the `gates` object (e.g., `gates.gate_2_budget_valid`).
* *Circuit Breaker:* If `loop_control.active_turn_counts` for any gate exceeds 3, execution is halted to prevent infinite billing loops.


4. **Phase 4: Consolidation & Release**
* A final coordinator function aggregates all gate results.
* A summary message is drafted and appended to the `messages` collection.
* `meta.turnState` is reverted to `USER_TURN`, reenabling the UI.



## 5. Separation of Concerns: AI Boundaries

To maintain a fault-tolerant system, responsibilities are strictly divided between deterministic code and probabilistic AI.

* **Application Code (Firebase Functions):** Handles state transitions, math, basic validation, database routing, and execution limits. *Never use LLMs for application control flow.*
* **Skills (Markdown Data):** Shared domain knowledge (e.g., SOC2 guidelines, formatting rules) injected into the context window. Stored dynamically in Firestore.
* **Tools / Plugins:** JSON schemas provided to the LLM to enforce predictable data extraction (e.g., `update_work_request_fields`). Bridges the LLM back to deterministic application code.
* **MCP (Model Context Protocol):** Utilized exclusively when an agent must securely reach *outside* the Firebase environment (e.g., reading a live GitHub repository or querying an external vulnerability database).

## 6. UI Architecture & Navigation

The frontend avoids monolithic filtering by implementing a "Command Center" layout.

* **Data Binding:** The main workspace is a dumb pipe, mirroring the Firestore document snapshot. Gate statuses render as simple boolean visual indicators (e.g., red/green widgets).
* **Left Column (Registry):**
* *Scope Selector:* Flat UI toggles modifying Firestore metadata queries (`ownerId`, `status`).
* *Filter Bar:* Client-side prefix matching utilizing the `searchTokens` metadata map.
* *List View:* Scrollable cards that mutate the active URL/state upon click.


* **Templates:** Accessed via a standalone modal. Selection copies `defaultContent` into a new `workRequests` document and routes the user to the main workspace.

## 7. Phased Implementation Roadmap (Epics)

Work is scoped into isolated, independently testable increments.

* **Epic 1: State Locking & UI Shell**
* Build the Lit Web Component workspace bound to a Firestore snapshot.
* Implement input locking and spinner toggles based on `meta.turnState`.


* **Epic 2: Triage & Data Extraction**
* Implement the initial Cloud Function listening to `messages` writes.
* Configure the Tool schema to parse user text into the `content` block using a Tier 1 model.


* **Epic 3: The Circuit Breaker & Gate Router**
* Implement the `loop_control` validation middleware.
* Build the router function that matches `content` mutations to `gate_definitions` and resets gate statuses.


* **Epic 4: Stateless Gate Runners**
* Develop the generic Cloud Function wrapper that executes an isolated gate validation using dynamic Skill markdown.
* Build the consolidation function to summarize errors and return the system to `USER_TURN`.


* **Epic 5: Discovery & Navigation**
* Implement the two-column Command Center layout.
* Build the Template selector and "Spawn-on-Copy" instantiation logic.



```

```