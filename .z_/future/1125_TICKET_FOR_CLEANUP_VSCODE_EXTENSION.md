# Ticket: Clean Up VS Code Extension Comments

**Parent Ticket:** #1124 (Token Counting Feature)
**Type:** Technical Debt
**Priority:** Low
**Effort:** 0.5-1 hour

## Problem

The `getWebviewContent()` function in `extensions/df-markdown-tools/src/extension.ts` (lines 112-135) contains verbose, outdated comments that were used during development to document uncertainty about Vite's output structure.

**Current Code:**
```typescript
function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    // We assume the UI package is built into ../df-markdown-tools-ui/dist
    const uiDistPath = vscode.Uri.joinPath(extensionUri, '..', 'df-markdown-tools-ui', 'dist');
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(uiDistPath, 'assets', 'index.js'));
    // Note: Vite might output different filenames, we might need to read the manifest or assume a fixed name.
    // For this nominal test, we configured vite to output assets/[name].js, so it should be index.js if the entry is main.ts?
    // Wait, vite outputs based on the input name. If input is index.html -> main.ts, it usually produces index.js or main.js.
    // Let's assume we need to find the JS file or just point to the one we know.
    // Actually, with the vite config I wrote: entryFileNames: `assets/[name].js`, and main.ts is the entry (via index.html), it might be `assets/index.js` or `assets/main.js`.
    // Let's check the vite config again.

    // To be safe, let's just inject the script tag pointing to the built file.
    // But we need to know the name.
    // I'll update the vite config to be deterministic if possible, or just list the dir.

    return `<!DOCTYPE html>
<html lang="en">
// ... rest of HTML
```

## Solution

Replace with concise, actionable comments that document:
1. **Why** the path structure exists
2. **What** to do if the build output location changes
3. **Where** to find related configuration

**Cleaned Up Version:**
```typescript
function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
    // The webview UI is built separately and placed in ../df-markdown-tools-ui/dist
    // The Vite config outputs assets to assets/index.js
    const uiDistPath = vscode.Uri.joinPath(extensionUri, '..', 'df-markdown-tools-ui', 'dist');
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(uiDistPath, 'assets', 'index.js'));

    // If the Vite output changes, update the path above.
    // See: extensions/df-markdown-tools-ui/vite.config.ts -> build.rollupOptions.output.entryFileNames

    return `<!DOCTYPE html>
<html lang="en">
// ... rest of HTML
```

## Files to Modify

- `extensions/df-markdown-tools/src/extension.ts` (lines 112-135)
  - Remove verbose uncertainty comments
  - Replace with concise documentation
  - Keep reference to Vite config location

## Acceptance Criteria

- [ ] Comments are concise (max 2-3 lines each)
- [ ] Comments explain **why**, not implementation details
- [ ] Reference to Vite config included for maintainability
- [ ] No functional changes to the code
- [ ] Build still succeeds: `pnpm build`
- [ ] Extension still works as expected in VS Code

## Why This Matters

- **Code maintainability**: Clear, concise comments help future developers
- **Reduces cognitive load**: Less noise makes actual logic easier to follow
- **Prevents confusion**: Outdated uncertainty comments waste developer time
- **Professional quality**: Clean code demonstrates attention to detail

## Related Documentation

- `guides/VSCODE_EXTENSION_PATTERNS.md` - General extension patterns
- `extensions/df-markdown-tools-ui/vite.config.ts` - Actual Vite configuration

## Notes

This is low priority and can be deferred. It's not blocking any functionality, but improves code quality for future maintainers (both humans and agents).
