# DF Markdown Tools Extension - Debugging Guide

**Date:** 2025-11-25
**Purpose:** Comprehensive guide to access logs and debug the extension

## Quick Reference

| Debug Target | How to Access | What You'll See |
|---|---|---|
| **Extension host** | Output → "DF Markdown Tools" | All extension state changes, file events |
| **Webview UI** | Right-click panel → Inspect → Console | Component state, token counting, errors |
| **Both together** | Split screen: both outputs visible | Full data flow from extension → UI |

---

## 1. Extension Host Logs (Recommended for Debugging)

This is where the extension sends all its debug information.

### How to View:

1. **Open Output Channel:**
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type: "Output: Focus Output"
   - Press Enter

2. **Switch to DF Markdown Tools:**
   - Look for dropdown at top right of Output panel
   - Select: "DF Markdown Tools" from the list

### What You'll See:

```
=== DF Markdown Tools Extension Activated ===
>>> Command: df.openMarkdownTools triggered
Creating new webview panel
Sending initial content to webview
Sending to webview: fileName="README.md", isDirty=false, contentLength=1234
Active editor changed: /Users/petecarapetyan/work/primary/dF/README.md
Document changed: /Users/petecarapetyan/work/primary/dF/README.md, isDirty=true
Panel visible, updating context
Sending to webview: fileName="README.md", isDirty=true, contentLength=1234
Document saved: /Users/petecarapetyan/work/primary/dF/README.md
Panel visible, updating context
Sending to webview: fileName="README.md", isDirty=false, contentLength=1234
```

### Key Log Messages to Look For:

| Message | Meaning |
|---------|---------|
| `=== DF Markdown Tools Extension Activated ===` | Extension started successfully |
| `>>> Command: df.openMarkdownTools triggered` | User clicked the button |
| `Creating new webview panel` | Panel UI is being created |
| `Sending to webview: ... isDirty=true` | File has unsaved changes |
| `Sending to webview: ... isDirty=false` | File is saved |
| `Document changed:` | User edited the file (text changed) |
| `Document saved:` | User saved the file (Ctrl+S) |
| `Panel visible, updating context` | Extension detected change and updated UI |

---

## 2. Webview Console (For UI Component Debugging)

This shows what the UI component is doing and any JavaScript errors.

### How to Access:

1. **Open Webview Inspector:**
   - Right-click inside the "DF Tools" panel
   - Select "Inspect Element"
   - OR press `Ctrl+Shift+I` when webview has focus

2. **Go to Console Tab:**
   - In the inspector that opened, click "Console"
   - You'll see any console.log() messages from the UI component

### What You'll See:

The UI component logs messages like:
```
[DF Tools] Content update - isDirty: false fileName: README.md
[DF Tools] Content update - isDirty: true fileName: README.md
[DF Tools] Token count: 123
[DF Tools] Error: Frontmatter is not properly structured
```

### Common Errors to Look For:

- **CSP (Content Security Policy) errors**: "Refused to load..."
- **Missing UI elements**: TypeError related to DOM
- **Message receive errors**: "Cannot read property 'isDirty'"

---

## 3. Typical Debugging Workflow

### Scenario 1: "isDirty state not updating"

1. Open DF Tools panel
2. Open Output → "DF Markdown Tools"
3. Edit markdown file
4. In the Output, you should see:
   - `Document changed: ... isDirty=true`
   - `Sending to webview: ... isDirty=true`
5. If you DON'T see these messages:
   - Extension code isn't running (check if build was applied, see Reloading section)
   - File isn't being detected (check file path in logs)

### Scenario 2: "Button doesn't disable when file is dirty"

1. Open both outputs: "DF Markdown Tools" AND webview console
2. Edit file and watch both outputs
3. Extension logs should show: `isDirty=true`
4. Webview console should show: `[DF Tools] Content update - isDirty: true`
5. If extension log shows `isDirty=true` but webview console doesn't:
   - Message isn't reaching the UI component (communication issue)
   - Check CSP errors in console
6. If webview console shows `isDirty=true` but button doesn't disable:
   - UI component not responding correctly to state (implementation issue)
   - Check for errors in webview console

### Scenario 3: "Token count returns error"

1. Open Output → "DF Markdown Tools"
2. Click "Count Tokens" button
3. In Output, look for:
   - `Sending to webview: ... contentLength=1234`
4. In webview console, look for:
   - Error messages about frontmatter validation
   - `[DF Tools] Error: ...`
5. If no token response appears:
   - Check the state store for errors
   - Verify content was sent (should see contentLength > 0)

---

## 4. Enabling More Verbose Logging

If the current logs aren't detailed enough, you can add more:

### In Extension Code (`extension.ts`):

```typescript
// Add to any function to trace execution:
outputChannel.appendLine(`DEBUG: variable_name = ${JSON.stringify(variable)}`);
```

Example:
```typescript
function updateWebviewContext(panel: vscode.WebviewPanel) {
    const editor = vscode.window.activeTextEditor;
    outputChannel.appendLine(`DEBUG: activeEditor = ${editor?.document.fileName}`);

    if (!editor) {
        outputChannel.appendLine('No active editor, skipping update');
        return;
    }

    const isDirty = editor.document.isDirty;
    outputChannel.appendLine(`DEBUG: isDirty = ${isDirty} (type: ${typeof isDirty})`);

    // ... rest of function
}
```

Then rebuild: `pnpm build`

### In UI Component (`df-markdown-tools-app.ts`):

```typescript
window.addEventListener('message', event => {
    const message = event.data;
    console.log('[DF Tools] Message received:', message);
    if (message.command === 'updateContent') {
        console.log('[DF Tools] isDirty value:', message.data.isDirty);
        this.isDirty = message.data.isDirty ?? false;
        console.log('[DF Tools] isDirty state set to:', this.isDirty);
    }
});
```

---

## 5. Output Channels Available in VS Code

When you press `Ctrl+Shift+P` → "Output: Focus Output", you can see:

- **DF Markdown Tools** ← The one we added for extension debugging
- **Extension Host** ← General VS Code extension system logs
- **Window** ← Overall VS Code window events

## 6. Common Issues and Solutions

### Issue: "Output channel is empty"

**Cause:** Extension hasn't been reactivated since rebuild

**Solution:**
1. Close VS Code completely
2. Rebuild: `pnpm build`
3. Reopen VS Code
4. Click the DF Tools button to activate extension
5. Now logs should appear

### Issue: "I see Extension Host logs but not DF Markdown Tools"

**Cause:** The output channel exists, but extension hasn't run yet

**Solution:**
1. Click the DF Tools button (or any markdown file action)
2. The output channel will populate with logs

### Issue: "Logs show old code behavior"

**Cause:** Turbo cache is serving old compiled code

**Solution:**
```bash
# Clear Turbo cache
pnpm build --force

# Or completely rebuild
rm -rf node_modules/.cache
pnpm build
```

---

## 7. Advanced: Debugging Token Counting

The token counting happens in `@df/state` package, not in the extension.

### To Debug Token Counting:

1. Edit: `packages/state/src/stores/markdown-tokens.store.ts`
2. Add logging to the `updateTokenCount()` function:
   ```typescript
   export async function updateTokenCount(content: string) {
       console.log('[DEBUG] updateTokenCount called with content length:', content.length);
       // ... existing code
   }
   ```
3. Rebuild: `pnpm build`
4. View logs in webview console: Right-click panel → Inspect → Console

---

## 8. Logging Best Practices

### Extension Host Logs (use for):
- ✅ File state changes (isDirty, save, open)
- ✅ Command execution
- ✅ Message passing between extension and webview
- ✅ Event listener triggers

### Webview Console (use for):
- ✅ Component state changes
- ✅ Message reception and handling
- ✅ Button clicks and user interactions
- ✅ Token counting results

### Don't Log:
- ❌ Large content strings (fills logs with noise)
- ❌ Every keystroke (creates spam)
- ❌ Every re-render cycle (too verbose)

### DO Log:
- ✅ State changes only (isDirty true → false)
- ✅ Event triggers (file saved, editor changed)
- ✅ Error conditions
- ✅ Function entry/exit for complex flows

---

## Quick Test Procedure

After making changes and rebuilding, use this procedure to verify:

1. **Terminal:** `pnpm build`
   - Verify: "19 successful" appears

2. **VS Code:** Close and reopen

3. **Extension:** Click DF Tools button
   - Should see: `=== DF Markdown Tools Extension Activated ===` in Output

4. **File:** Edit markdown file
   - Should see in Output: `Document changed: ... isDirty=true`

5. **Save:** Press Ctrl+S
   - Should see in Output: `Document saved: ...` then `isDirty=false`

6. **UI:** Button should disable/enable automatically
   - If not, check both Output and webview console for clues

---

## Emergency: Start from Scratch

If logs are confusing or not appearing:

```bash
# 1. Full clean build
pnpm build --force

# 2. Close VS Code completely
pkill -9 Code

# 3. Reopen VS Code
# 4. Reopen your markdown file
# 5. Click DF Tools button
# 6. Check Output → DF Markdown Tools
```

This ensures no cached code is running.

---

## Summary

- **For extension debugging:** Output → "DF Markdown Tools"
- **For UI debugging:** Right-click panel → Inspect → Console
- **For both:** Open both panes side-by-side
- **Most common issue:** Rebuild complete but VS Code serving cached old code
- **Solution:** Close and reopen VS Code

The logs now provide complete visibility into every step of the extension's operation!
