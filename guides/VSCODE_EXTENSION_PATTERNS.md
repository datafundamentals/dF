# VS Code Extension Development Patterns

**Last Updated:** 2025-11-25
**Applies to:** DF Markdown Tools Extension and similar webview-based extensions
**Audience:** Coding agents and developers building VS Code extensions with Lit web components

## Overview

This guide documents proven patterns and common pitfalls discovered during development of the DF Markdown Tools VS Code extension. Use this to accelerate development of similar extensions.

---

## 1. Extension-Webview Communication

### Problem
VS Code extensions run in the extension host (Node.js), while webviews run in an isolated web context. Communication between them is the critical path for any interactive extension.

### Solution: postMessage Pattern

**Extension Host → Webview:**
```typescript
// In extension.ts
panel.webview.postMessage({
    command: 'updateContent',
    data: { fileName, content, isDirty }
});
```

**Webview → Extension Host:**
```typescript
// In UI component
window.addEventListener('message', event => {
    const message = event.data;
    if (message.command === 'updateContent') {
        this.fileName = message.data.fileName;
        this.isDirty = message.data.isDirty ?? false;
    }
});
```

### Key Points
- Messages are serializable objects only (no functions, no DOM elements)
- Extension can send anytime; webview receives passively
- Use `??` (nullish coalescing) for safe defaults: `isDirty ?? false`
- Message structure should be versioned if it changes in future

---

## 2. Content Security Policy (CSP) for Webviews

### Problem
By default, webviews have a strict CSP that blocks scripts, styles, and fonts. This will silently fail and is hard to debug.

### Solution: CSP Meta Tag

```typescript
const meta = `<meta http-equiv="Content-Security-Policy"
    content="default-src 'none';
             style-src ${webview.cspSource};
             script-src ${webview.cspSource};
             font-src ${webview.cspSource};">`;
```

**What this does:**
- `default-src 'none'`: Block everything by default
- `style-src ${webview.cspSource}`: Allow styles from webview's source
- `script-src ${webview.cspSource}`: Allow scripts from webview's source
- `font-src ${webview.cspSource}`: Allow fonts from webview's source

**Debug tip:** If styles/scripts don't load, check browser console for CSP violations.

---

## 3. Webview Resource Loading

### Problem
Webviews can't load resources from arbitrary URLs. Built assets must be explicitly allowed and converted to webview URIs.

### Solution: localResourceRoots + asWebviewUri

```typescript
const currentPanel = vscode.window.createWebviewPanel(
    'panelId',
    'Panel Title',
    vscode.ViewColumn.Beside,
    {
        enableScripts: true,
        localResourceRoots: [
            vscode.Uri.file(path.join(context.extensionPath, '..', 'df-markdown-tools-ui', 'dist'))
        ]
    }
);

// Convert file paths to webview URIs
const uiDistPath = vscode.Uri.joinPath(extensionUri, '..', 'df-markdown-tools-ui', 'dist');
const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(uiDistPath, 'assets', 'index.js'));

// Use in HTML
webview.html = `<script type="module" src="${scriptUri}"></script>`;
```

**Key points:**
- `localResourceRoots` must include the directory where assets live
- Always use `asWebviewUri()` to convert file paths
- Use relative paths from extension root, not absolute paths

---

## 4. VS Code Event Listeners

### Critical Discovery: Event Listener Scope

**WRONG (doesn't work):**
```typescript
vscode.commands.registerCommand('my.command', () => {
    // Listener registered inside command handler
    vscode.workspace.onDidChangeTextDocument(event => {
        // This only fires once, then listener is garbage collected
        console.log('Document changed');
    });
});
```

**RIGHT (works):**
```typescript
// Listener registered at extension activation, outside any command
export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            // This listener persists for entire extension lifetime
            console.log('Document changed');
        })
    );
}
```

### Event Listeners Available

| Listener | Fires When | Use Case |
|----------|-----------|----------|
| `onDidChangeActiveTextEditor` | User switches between files | Update UI for new file |
| `onDidChangeTextDocument` | User edits text in any file | Detect unsaved changes, update isDirty |
| `onDidSaveTextDocument` | User saves file (Ctrl+S) | Respond to save, update isDirty=false |
| `onDidOpenTextDocument` | User opens a file | Initialize for new file |
| `onDidCloseTextDocument` | User closes a file | Cleanup references |

### Important: Document URI Scheme Filtering

**GOTCHA: Logging creates infinite loops!**

If you call `outputChannel.appendLine()` inside `onDidChangeTextDocument`, the output channel is treated as a document, which triggers another change event, creating an infinite loop.

**FIX: Filter by URI scheme**
```typescript
vscode.workspace.onDidChangeTextDocument(event => {
    // Skip non-file documents (output channels, terminals, etc.)
    if (event.document.uri.scheme !== 'file') {
        return;
    }

    // Now safe to log and process
    outputChannel.appendLine('Real file changed');
    updateUI(event.document);
});
```

---

## 5. Detecting Unsaved Changes (isDirty)

### Pattern
```typescript
const editor = vscode.window.activeTextEditor;
const isDirty = editor.document.isDirty;  // true = unsaved, false = saved

// Send to webview
panel.webview.postMessage({
    command: 'updateContent',
    data: { isDirty }
});
```

### When isDirty Changes
- `isDirty = true` when user types (triggered by `onDidChangeTextDocument`)
- `isDirty = false` when user saves (triggered by `onDidSaveTextDocument`)
- `isDirty = false` when file is first opened

### Important: Update Webview on Every Change
Don't rely on a single message. Send state updates when these events fire:
```typescript
context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(event => {
        if (event.document.uri.scheme === 'file' && currentPanel?.visible) {
            updateWebviewContext(currentPanel);  // Send updated isDirty
        }
    })
);
```

---

## 6. Debugging Strategies

### Output Channel Logging (Best for Extension Host)

```typescript
// At module level
const outputChannel = vscode.window.createOutputChannel('Your Extension Name');

// In activate()
export function activate(context: vscode.ExtensionContext) {
    outputChannel.appendLine('=== Extension Activated ===');
    // ... rest of code
}

// In event handlers
vscode.workspace.onDidChangeTextDocument(event => {
    outputChannel.appendLine(`Document changed: ${event.document.fileName}, isDirty=${event.document.isDirty}`);
});
```

**Access logs:**
1. `Ctrl+Shift+P` → "Output: Focus Output"
2. Select your extension name from dropdown

### Webview Console (For UI Component Debugging)

```typescript
// In Lit component
window.addEventListener('message', event => {
    console.log('[MyComponent] Message received:', event.data);
});
```

**Access console:**
1. Right-click in webview panel
2. Select "Inspect Element"
3. Go to "Console" tab

### Verify Both Sides
Keep both outputs visible side-by-side to trace complete data flow:
- Extension output shows what extension host is doing
- Webview console shows what UI component is doing
- Together they reveal communication issues

### Common Debugging Checklist
- [ ] Extension output shows `=== Extension Activated ===`?
- [ ] Event listeners firing? (Look for their log messages)
- [ ] `isDirty` value correct? (Check log before sending)
- [ ] Message reaching webview? (Check console.log in message handler)
- [ ] UI updating? (Visual check + console logs in render)

---

## 7. Common Pitfalls

### Pitfall 1: Event Listeners Inside Command Handler
**Problem:** Listener only fires once
**Solution:** Register listeners at extension activation, outside commands

### Pitfall 2: Infinite Loops from Logging
**Problem:** `outputChannel.appendLine()` in `onDidChangeTextDocument` causes infinite loop
**Solution:** Filter by URI scheme: `if (event.document.uri.scheme !== 'file') return;`

### Pitfall 3: Extension Code Not Reloading
**Problem:** Build succeeds but VS Code serves old cached code
**Solution:** Close VS Code completely and reopen (not just reload window)

### Pitfall 4: Webview CSP Blocking Assets
**Problem:** Styles/scripts silently fail to load
**Solution:** Check browser console for CSP violations, ensure `localResourceRoots` and `asWebviewUri()` are correct

### Pitfall 5: Trusting Type Safety Without Testing
**Problem:** TypeScript says code is correct, but runtime behavior differs
**Solution:** Always test event handler behavior with real user actions

### Pitfall 6: One-Time Message Delivery
**Problem:** Sending state once doesn't work; state changes but UI doesn't update
**Solution:** Send state updates on every relevant event (change, save, editor switch)

---

## 8. Testing Checklist

After implementing extension-webview features:

### Basic Functionality
- [ ] Panel opens when command is triggered
- [ ] Panel shows correct content for active file
- [ ] Panel updates when switching between files
- [ ] Panel closes cleanly without errors

### State Changes
- [ ] Edit file → see isDirty=true in logs
- [ ] Save file → see isDirty=false in logs
- [ ] Switch files → sees new file's isDirty state
- [ ] UI reflects state changes visually

### Error Handling
- [ ] No active editor → graceful handling (no crash)
- [ ] Large files → performance acceptable
- [ ] Rapid edits → no dropped updates
- [ ] Extension reload → no stale references

### Debugging
- [ ] Output channel logs appear and make sense
- [ ] Webview console shows message reception
- [ ] No infinite loops in logs
- [ ] No console errors (red X's)

---

## 9. File Structure Reference

```
extensions/
├── df-markdown-tools/              # Extension host
│   ├── src/
│   │   ├── extension.ts            # Main extension file (runs in Node.js)
│   │   └── ...
│   ├── dist/                       # Built extension (compiled TypeScript)
│   ├── package.json                # Extension manifest
│   └── tsconfig.json
│
└── df-markdown-tools-ui/           # Webview UI
    ├── src/
    │   ├── df-markdown-tools-app.ts  # Lit web component
    │   └── ...
    ├── dist/                       # Built UI (compiled + bundled by Vite)
    ├── vite.config.ts
    └── package.json
```

**Key insight:** Extension host and UI are separate builds in separate directories. They communicate only via `postMessage()`.

---

## 10. Related Guides

- `DEBUGGING_GUIDE.md` - Detailed debugging walkthrough
- `MARKDOWN_TOKEN_COUNTING_FEATURE.md` - Specific pattern for similar features
- VS Code API Docs: https://code.visualstudio.com/api

---

## Summary

Key patterns for successful VS Code extension development:

1. ✅ Use `postMessage()` for extension ↔ webview communication
2. ✅ Register event listeners at activation, not in command handlers
3. ✅ Filter document events by URI scheme to avoid infinite loops
4. ✅ Keep both extension and webview logs visible while debugging
5. ✅ Always send state updates on relevant events
6. ✅ Use CSP meta tags correctly in webview HTML
7. ✅ Use `asWebviewUri()` to convert file paths for webviews
8. ✅ Close VS Code completely after rebuilds to clear cache
9. ✅ Test with real user actions, not just unit tests
10. ✅ Document patterns as you discover them for future agents

These patterns have been battle-tested on the DF Markdown Tools extension. Apply them to new extensions to significantly reduce debugging time.
