# @df/ui-lit

## 🚨 Critical: Material Design 3 Requirement

All interactive UI elements in this package **must** use Material Web Components (v2.4+). The Firebase teaching app propagates these components across the monorepo; any native HTML that slips in here will multiply everywhere else.

### ✅ Allowed (Preferred Approach)
- Material Web components (`@material/web`) when they exist (buttons, fields, selects, etc.)
- Custom MD3 implementations **only** when the spec has no official component (e.g., segmented buttons)

Common components:
- `<md-filled-button>` / `<md-outlined-button>` for primary and secondary actions
- `<md-outlined-text-field>` / `<md-filled-text-field>` for text input and textarea scenarios
- `<md-filled-select>` / `<md-outlined-select>` (with `<md-select-option>`) for dropdowns
- `<md-checkbox>` / `<md-radio>` for boolean selection

Always cite the spec and add an ESLint exemption comment when you ship custom MD3 controls.
Log the exemption in `.z_/future/MD3_GAPS.md` so future agents understand why the native element exists.

### ❌ Forbidden (Native HTML)
- `<button>` – **Replace with MD3 button variants**
- `<input>` – **Use MD3 text fields, checkbox, radio, or switch components**
- `<select>` – **Use MD3 select components**
- `<textarea>` – **Use MD3 text field in textarea mode**

> ℹ️ Automated checks run via ESLint, `pnpm scan:compliance`, Husky pre-commit hooks, and GitHub Actions. Violations will fail locally _and_ in CI.

### Compliant Examples
- `src/firebase/df-firestore-form.ts`
- `src/df-upload-link.ts`
- `templates/md3-component-template.ts` (copy-on-write template)

### Additional Resources
- `/guides/STANDARDS_STYLES.md#material-design-3`
- `/guides/CREATING_COMPLIANT_UI_COMPONENTS.md`
- Material Web Docs: https://github.com/material-components/material-web
- Component Catalog: https://material-web.dev/components/

Always start new components by copying the template in `templates/md3-component-template.ts` and leave the warning header comment intact. If a native element is truly unavoidable, document the reason and add `// eslint-disable-next-line @df/md3/enforce-md3 -- reason` directly above the line.
