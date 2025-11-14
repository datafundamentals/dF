# Creating Compliant UI Components

> **Tier:** 2 (Load by Task)
>
> **For Agents:** Load this guide when building UI components for `@df/ui-lit`.
>
> **For Humans:** Load this guide when designing or reviewing UI components.

This playbook distills the MD3 standards that govern every Lit component shipped from `@df/ui-lit`. Use it alongside `packages/ui-lit/templates/md3-component-template.ts` and the automated tooling (`pnpm scan:compliance`).

## 1. Start With the Template
- Copy `packages/ui-lit/templates/md3-component-template.ts`
- Rename the class and element tag before writing logic
- Remove unused Material imports **after** implementation
- Keep the warning banner comment in place

## 2. Material Web Components — When Available
Material Web (MWC) is the fastest path to MD3 compliance. Use the official component whenever it exists.

| Interaction | Preferred Implementation | Notes |
|-------------|--------------------------|-------|
| Primary/secondary actions | `<md-filled-button>`, `<md-outlined-button>` | Use text slots for labels |
| Tertiary actions | `<md-text-button>` | No custom CSS hover states |
| Text input/textarea | `<md-outlined-text-field>` or `<md-filled-text-field>` | For multiline values, set `type="textarea"` |
| Dropdown | `<md-filled-select>` / `<md-outlined-select>` + `<md-select-option>` | Always provide `slot="headline"` |
| Checkboxes | `<md-checkbox>` | Use `@change` events |
| Radio buttons | `<md-radio>` | Wrap in `<md-radio-group>` when appropriate |
| File uploads | Pattern: MD3 button + hidden input (see `df-upload-link`) | Expose progress via signals |

### When MWC Doesn't Provide a Component
Some MD3 patterns (e.g., segmented buttons) are spec-only. In those cases:

- Implement the interaction yourself using MD3 metrics, typography, and elevation
- Keep native semantics for accessibility (e.g., `role="radio"`)
- Add an inline ESLint exemption with a link to the MD3 spec
- Document the rationale in code comments so future contributors understand the deviation
- Log the gap (and file path) in `.z_/future/MD3_GAPS.md`

> Example: `packages/ui-lit/src/df-segmented-button.ts` implements the MD3 segmented button spec because no official Material Web component exists yet.

## 3. Signals-First Rendering
- Consume state via `@lit-labs/signals` stores (`@df/state`)
- No local stores for shared data; components are presentation only
- Emit events for user interactions, let stores mutate data

## 4. Styling Guardrails
- Prefer MD3 design tokens (`--md-sys-color-*`, `--md-sys-typescale-*`)
- Avoid overriding component internals; use exposed CSS parts when available
- Keep layout CSS minimal: spacing, flex layouts, surfaces, transitions

## 5. Testing Requirements
- Add/extend Storybook stories under `apps/df-storybook`
- Unit test logic-heavy components with Vitest (see `packages/ui-lit/vitest.config.ts`)
- Integration tests live in `apps/df-firebase-teaching-app/tests`

## 6. Automated Validation
1. `pnpm scan:compliance` – static scanner + ESLint rule
2. Husky pre-commit hook (runs on staged files)
3. CI workflow (`Standards Compliance`) on every PR
4. Dashboard (`pnpm standards:dashboard`) for snapshots

If the scanner finds a legitimate exception (e.g., native `<input type="file">` hidden for file picker), follow the [Standards Exemption Process](./STANDARDS_EXEMPTION_PROCESS.md).

## 7. Documentation Checklist
- Update component JSDoc (public API, events)
- Link to compliant usage examples (README or Storybook)
- Note any limitations or agent prompts required for usage

## 8. Quick Reference
- `guides/STANDARDS_STYLES.md` – canonical repo-wide rules
- `guides/STANDARDS_COMPLIANCE_TROUBLESHOOTING.md` – how to fix lint/CI failures
- `guides/ADDING_STANDARDS_RULES.md` – extend the enforcement system when new rules emerge
