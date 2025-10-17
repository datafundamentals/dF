# Adding New Standards Rules

This repo treats standards automation as code. Follow the checklist below whenever you extend enforcement beyond MD3 (e.g., typography, spacing, accessibility rules).

## 1. Define the Rule
- Document intent, edge cases, and fallback behavior in `guides/STANDARDS_STYLES.md`
- Align with the architecture council or ticket roadmap before coding

## 2. Update Tooling
1. **ESLint**
   - Create a rule inside `packages/config/eslint-rules`
   - Export it via `packages/config/src/index.ts`
   - Wire it into `eslint.config.js`
2. **Scanner**
   - Extend `scripts/compliance/check-md3-compliance.mjs` or add a dedicated module under `scripts/compliance`
   - Update `pnpm scan:compliance` output to include the new category
3. **CI**
   - Ensure the `Standards Compliance` workflow runs the new checks

## 3. Update Developer Experience
- Add guardrail warnings to templates and README files of affected packages
- Document quick fixes in `guides/STANDARDS_COMPLIANCE_TROUBLESHOOTING.md`
- Record any exemption process updates

## 4. Communicate the Change
- Announce in the `#md3-standards` channel
- Update the `Version History` section of `.z_/WIP/FIREBASE_TEACHING_APP_ROADMAP.md`
- Add a short entry to `COMPLIANCE_REPORT.md` describing the new rule and affected files

## 5. Measure Impact
- Run `pnpm standards:dashboard` before and after the change
- Capture deltas in compliance rate, lint failures, and exemptions
- Schedule a follow-up review after the next sprint to evaluate adoption

By following this process every new rule ships with docs, automation, and communication, keeping the monorepo agent-resistant.
