# Ticket: Markdown Tools - Future Enhancement Opportunities

**Parent Ticket:**  (1124 Token Counting Feature)
**Type:** Technical Debt / Feature Requests
**Priority:** Low (nice-to-have features)
**Effort:** 1-2 hours each (independent features)

## Overview

During development of the token counting feature, several enhancement opportunities were identified that would improve the user experience but weren't critical for MVP. This ticket documents them for future prioritization.

---

## Enhancement 1: Auto-Save Before Counting

**Current Behavior:**
- User must manually save before counting tokens
- Button shows "💾 Save first" when file is unsaved

**Proposed Enhancement:**
- Add option: "Auto-save before counting"
- User clicks "Count Tokens" → file auto-saves → tokens counted in one action

**Implementation Notes:**
- Use `await activeEditor.document.save()` before calling `updateTokenCount()`
- Add configuration option: `settings.json` property
- Consider adding keyboard shortcut for quick counting

**Acceptance Criteria:**
- [ ] Settings: User can enable/disable auto-save
- [ ] When enabled: Unsaved files auto-save before counting
- [ ] When disabled: Current behavior (button disabled)
- [ ] Default: Disabled (respects user's save habits)
- [ ] Works with multiple file types

**Related Code:**
- `extensions/df-markdown-tools-ui/src/df-markdown-tools-app.ts` - Add setting toggle
- `extensions/df-markdown-tools/src/extension.ts` - Add save logic before processing

---

## Enhancement 2: Frontmatter Validation on Save

**Current Behavior:**
- Frontmatter validation only happens when counting tokens
- Users might save invalid frontmatter without knowing

**Proposed Enhancement:**
- Validate frontmatter whenever markdown file is saved
- Show warning/error if frontmatter is malformed
- Suggest auto-fix for common issues

**Implementation Notes:**
- Hook into `onDidSaveTextDocument` event
- Call `validateFrontmatter()` from state store
- Show diagnostic message in VS Code problems panel
- Optional: Add code action to auto-fix

**Acceptance Criteria:**
- [ ] Validation runs on save
- [ ] Clear error message shown in problems panel
- [ ] User can dismiss/ignore if not fixing now
- [ ] No false positives (valid frontmatter shouldn't warn)
- [ ] Performance: Doesn't slow down save operation

**Related Code:**
- `packages/state/src/stores/markdown-tokens.store.ts` - Validation logic
- `extensions/df-markdown-tools/src/extension.ts` - Diagnostic collection

---

## Enhancement 3: Token Count History

**Current Behavior:**
- Shows current token count
- No history or comparison

**Proposed Enhancement:**
- Remember token counts for past saves
- Show trend: "Previous: 245, Now: 267 (+22)"
- Optional: Show count over time in simple chart

**Implementation Notes:**
- Store history in VS Code's memento (workspace memory)
- Keep last 10-20 counts per file
- Include timestamp and file path
- Display in a collapsible section

**Acceptance Criteria:**
- [ ] History persists across VS Code sessions (per workspace)
- [ ] Shows previous count and delta
- [ ] Maximum reasonable storage (don't bloat memento)
- [ ] Clear UI to show historical data
- [ ] Option to clear history

**Related Code:**
- `extensions/df-markdown-tools/src/extension.ts` - Store/retrieve from context.globalState
- `extensions/df-markdown-tools-ui/src/df-markdown-tools-app.ts` - Display history

---

## Enhancement 4: Batch Token Counting

**Current Behavior:**
- Count tokens one file at a time
- Manual for each file

**Proposed Enhancement:**
- "Count all files in folder" action
- Shows token counts for all markdown files
- Exportable summary (CSV, JSON)

**Implementation Notes:**
- File explorer context menu action
- Find all markdown files in folder recursively
- Queue processing to avoid overwhelming API
- Show progress bar

**Acceptance Criteria:**
- [ ] Folder context menu action works
- [ ] Processes multiple files efficiently
- [ ] Shows progress during processing
- [ ] Handles errors gracefully (skip invalid files)
- [ ] Export summary as CSV/JSON
- [ ] Rate limiting (don't spam API)

**Related Code:**
- `extensions/df-markdown-tools/src/extension.ts` - New command registration
- `extensions/df-markdown-tools-ui/src/df-markdown-tools-app.ts` - Display results table

---

## Enhancement 5: Smart Frontmatter Detection

**Current Behavior:**
- Validates YAML between `---` delimiters
- Generic error messages

**Proposed Enhancement:**
- Detect YAML syntax errors (not just structure)
- Suggest fixes for common mistakes
- Support alternative frontmatter formats (JSON, TOML)

**Implementation Notes:**
- Integrate YAML parser (e.g., `js-yaml`)
- Provide line-specific error messages
- Support format detection or user configuration
- Add tests for edge cases

**Acceptance Criteria:**
- [ ] Detects invalid YAML syntax
- [ ] Shows error location (line number)
- [ ] Suggests fixes for common issues
- [ ] Optional: Support JSON and TOML frontmatter
- [ ] Doesn't break performance

**Related Code:**
- `packages/state/src/stores/markdown-tokens.store.ts` - Add YAML parsing
- `packages/state/test-frontmatter.js` - Expand test cases

---

## Enhancement 6: VS Code Extension Settings

**Current Behavior:**
- All behavior is hardcoded

**Proposed Enhancement:**
- Add VS Code settings for extension configuration
- User can customize behavior without code changes

**Possible Settings:**
- `dfMarkdownTools.autoSaveBeforeCounting` (boolean)
- `dfMarkdownTools.validateFrontmatterOnSave` (boolean)
- `dfMarkdownTools.showTokenCountHistory` (boolean)
- `dfMarkdownTools.frontmatterFormat` (yaml|json|toml)
- `dfMarkdownTools.maxFileSizeForCounting` (number, bytes)

**Implementation Notes:**
- Define in `package.json` contributes.configuration
- Read with `vscode.workspace.getConfiguration()`
- React to changes with `onDidChangeConfiguration` listener

**Acceptance Criteria:**
- [ ] All settings documented
- [ ] Defaults are sensible
- [ ] Settings are editable in VS Code Settings UI
- [ ] Changes apply immediately (no restart needed)
- [ ] Settings scoped appropriately (user/workspace)

**Related Code:**
- `extensions/df-markdown-tools/package.json` - Add contributes.configuration
- `extensions/df-markdown-tools/src/extension.ts` - Read and react to settings

---

## Enhancement 7: Keyboard Shortcuts

**Current Behavior:**
- Only accessible via command palette or button
- No keyboard shortcut

**Proposed Enhancement:**
- Add default keyboard shortcuts
- User can customize in keybindings.json

**Suggested Shortcuts:**
- `Ctrl+Shift+Alt+T` (Windows/Linux): Count Tokens
- `Cmd+Shift+Alt+T` (Mac): Count Tokens
- `Ctrl+Shift+Alt+V` (Windows/Linux): Validate Frontmatter

**Implementation Notes:**
- Define in `package.json` keybindings
- Document in README
- Allow user customization via VS Code settings

**Acceptance Criteria:**
- [ ] Shortcuts are ergonomic
- [ ] Don't conflict with VS Code defaults
- [ ] Documented in README
- [ ] Work on Windows, Mac, Linux
- [ ] Can be rebound by user

**Related Code:**
- `extensions/df-markdown-tools/package.json` - Add keybindings

---

## Enhancement 8: Token Count Estimation

**Current Behavior:**
- Counts actual tokens via API
- No offline estimation

**Proposed Enhancement:**
- Add rough token estimation (no API call)
- Show before counting, refine with actual count
- Useful for quick estimates

**Implementation Notes:**
- Simple heuristic: 1 token ≈ 4 characters
- Show as "~estimated" vs "actual"
- Cache actual counts for learning

**Acceptance Criteria:**
- [ ] Estimation algorithm is documented
- [ ] Shows accuracy range (±10%)
- [ ] Clear UI distinction (estimated vs actual)
- [ ] Performance: Instant (no API call)
- [ ] Learning: Improves estimate accuracy over time

**Related Code:**
- `packages/state/src/stores/markdown-tokens.store.ts` - Add estimation function
- `extensions/df-markdown-tools-ui/src/df-markdown-tools-app.ts` - Show estimation state

---

## Implementation Priority Recommendation

**High Value, Low Effort (Do First):**
1. Enhancement 6: Settings UI (enables others)
2. Enhancement 7: Keyboard Shortcuts (UX improvement)
3. Enhancement 1: Auto-Save (quality of life)

**Medium Value, Medium Effort (Do Next):**
4. Enhancement 3: History (nice to have)
5. Enhancement 4: Batch Processing (useful for larger projects)

**Lower Priority (Defer):**
6. Enhancement 2: Save-time Validation (nice to have)
7. Enhancement 5: Smart YAML Parsing (scope creep)
8. Enhancement 8: Estimation (niche use case)

---

## Documentation for Future Agents

When implementing any of these enhancements:

1. Refer to `guides/VSCODE_EXTENSION_PATTERNS.md` for extension patterns
2. Refer to `guides/MARKDOWN_FEATURE_PATTERNS.md` for state management
3. Refer to `guides/DEBUGGING_GUIDE.md` for debugging approach
4. Test thoroughly with real markdown files
5. Update `DEBUGGING_GUIDE.md` if new logging is added
6. Document any new event listeners in code

---

## Notes

- These are independent enhancements; can be tackled in any order
- Each should be its own ticket if implemented
- Current implementation is solid MVP; these are nice-to-haves
- Prioritize based on user feedback and usage patterns

---

## Related Files

- `extensions/df-markdown-tools/` - Extension host code
- `extensions/df-markdown-tools-ui/` - UI component code
- `packages/state/src/stores/markdown-tokens.store.ts` - Business logic
- `guides/VSCODE_EXTENSION_PATTERNS.md` - Implementation guide
- `guides/MARKDOWN_FEATURE_PATTERNS.md` - Feature development guide
