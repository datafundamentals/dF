# Practice Widget Playbook

This walkthrough extends the existing Web Components conventions (items 1 – 5 in the timeline) with a fully decoupled side-effects pipeline that you can reuse whenever a new feature needs shared state, signal wiring, and documentation inside the monorepo.

## What ships in this iteration
- **Shared component**: `packages/ui-lit/src/df-practice-widget.ts` renders a practice planner UI backed by signals.
- **Store + side effects**: `packages/state/src/stores/practice-widget.store.ts` owns signals, async task loading, and interval-based refresh logic.
- **Shared types**: `packages/types/src/practice-widget.ts` defines the contract consumed by UI and store code.
- **Sandbox app**: `apps/df-teaching-app` is a lightweight host showing how an app workspace consumes the shared widget and store.
- **Storybook coverage**: `apps/df-storybook/stories/df-practice-widget.stories.ts` exercises default, auto-refresh, and debugging scenarios.

## Pattern checklist (apply per feature)
1. **Model the contract first**
   - Add a types file under `packages/types/src`. Keep UI-friendly status flags and data shapes together.
   - Re-export through `packages/types/src/index.ts` so downstream packages get a typed surface.

2. **Author the store in `packages/state`**
   - Signals live at module scope; export a computed snapshot for consumers (`practiceWidgetState`).
   - Export imperative helpers for every mutation/side effect (`loadPracticeTasks`, `startAutoRefresh`, `resetPracticeWidget`).
   - Encapsulate async work inside the store. The widget never awaits data directly; instead it calls store helpers.
   - Guard side effects:
     - Track `pendingRequestId` to drop stale async responses.
     - Always tear down timers in `stopAutoRefresh`.
     - Provide `reset*` utilities so Storybook/tests/apps can rehydrate predictable state.

3. **Build the presentation layer in `packages/ui-lit`**
   - Extend `SignalWatcher(LitElement)` to auto re-render on store changes.
   - Treat store APIs like a service: setters trigger `loadPracticeTasks`, setters honour `startAutoRefresh` / `stopAutoRefresh`.
   - Keep DOM-only responsibilities inside the component (styles, events, small formatters). All business rules stay in the store.
   - Fire custom events (`df-practice-topic-change`) so host apps can react without reaching into internals.

4. **Expose shared entry points**
   - Update the relevant `index.ts` barrels in `packages/types`, `packages/state`, and `packages/ui-lit` so the new module is importable via `@df/*` aliases.

5. **Host in an app workspace**
   - Scaffold `apps/<feature>-app` with a small Lit shell that consumes the shared widget.
   - Use the host to demonstrate cross-component orchestrations (e.g., buttons that call store helpers directly).
   - Keep build scripts lean: `tsc` for emit plus `wds` for local serving is usually enough for a playground.

6. **Document and demo**
   - Add a Storybook story to visualise component usage. Reset the store before each render to avoid leaking side effects between stories.
   - Capture learnings in `docs/` so future contributors can repeat the setup without spelunking through commits.

## Running the new assets
- Practice app build: `pnpm --filter @df/df-teaching-app run build`
- Practice app watch mode: `pnpm --filter @df/df-teaching-app run build:watch`
- Practice app dev server: in another terminal, `pnpm --filter @df/df-teaching-app run serve`
- Storybook with practice widget: `pnpm --filter @df/df-storybook run dev`

With both the sandbox app and Storybook story you can verify signals wiring, observe interval cleanup, and exercise host-driven reloads without touching the web component internals.

## Reusing the approach
When the next feature arrives:
1. Define shared types.
2. Create a store that hides every side effect.
3. Render data inside a `SignalWatcher` component.
4. Wire a host app and Storybook story that lean on those exports.
5. Document the flow and repeat.

This closes the loop on item 10 from your list: the repo now contains a complete, documented example of decoupled signals + side effects ready to be cloned for upcoming apps.
