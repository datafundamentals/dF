# Standards Compliance Troubleshooting

Use this guide whenever lint, the compliance scanner, or CI fails due to MD3 enforcement.

## 1. Understand the Failure Output
- **ESLint**: reported under rule `@df/md3/enforce-md3`
- **Scanner (`pnpm scan:compliance`)**: groups violations by file with line + column
- **Pre-commit Hook**: stops the commit and echoes the same scanner output
- **CI Workflow**: surfaces artifacts in the "Standards Compliance" job

## 2. Common Fixes
| Error | Fix |
|-------|-----|
| Native `<button>` | Replace with `<md-filled-button>` / `<md-outlined-button>` / `<md-text-button>`
| Native `<input type="text">` | Replace with `<md-outlined-text-field>`
| Native `<input type="checkbox">` | Replace with `<md-checkbox>`
| Native `<select>` | Replace with `<md-filled-select>` + `<md-select-option>` items
| Native `<textarea>` | Replace with `<md-filled-text-field type="textarea">`

## 3. If the Replacement Is Non-trivial
1. Copy code from an existing compliant component (`df-upload-link`, `df-firestore-form`)
2. Import the necessary Material modules at the top of the file
3. Map events from the Material component back to your store (usually `@change` or `@input`)
4. Update CSS to rely on MD3 design tokens rather than custom colors
5. If Material Web doesn’t have an equivalent (MD3 gap), follow the guidance in `guides/STANDARDS_STYLES.md#md3-gaps` and add the exemption to `.z_/future/MD3_GAPS.md`

## 4. Regenerate Reports
- `pnpm scan:compliance` – ensures local environment is clean
- `pnpm generate:compliance-report` – refreshes `COMPLIANCE_REPORT.md`
- `pnpm standards:dashboard` – updates snapshot metrics for retrospectives

## 5. When Automation Seems Wrong
1. Verify the violation is not inside a comment block or string literal
2. Ensure the file is within the enforcement scope (`packages/ui-lit/src/`, teaching app components)
3. For legitimate exceptions follow the [Standards Exemption Process](./STANDARDS_EXEMPTION_PROCESS.md)
4. If the rule needs enhancement, file a ticket referencing `guides/ADDING_STANDARDS_RULES.md`

## 6. CI Failures You Cannot Reproduce
- Make sure you ran `pnpm install` after pulling the latest changes
- Delete `.turbo` and rerun `pnpm lint` if caches are stale
- Inspect the workflow logs for the `Standards Compliance` job
- Re-run locally with `pnpm scan:compliance --json` and compare against CI output

## 7. Escalation Path
1. Create a short Loom or screenshot showing the failure (optional but helpful)
2. Post in `#md3-standards` Slack channel with the failing command + output
3. Tag the current standards reviewer (Agent C) for triage

Staying compliant is cheaper than cleaning up regressions. Treat every violation as a small incident and document the fix for future contributors.
