# How to Reload the VS Code Extension

## Problem

After building new code, VS Code doesn't automatically reload the extension. You need to reload it manually.

## Solution

### Option 1: Full VS Code Reload (Easiest)

1. Close VS Code completely
2. Reopen VS Code
3. Open the DF Markdown Tools panel again

### Option 2: Extension Reload via Command Palette (Faster)

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type: `Developer: Reload Window`
3. Press Enter
4. VS Code reloads with the new extension code

### Option 3: Extension Development Host Reload

If you're running the extension in development mode:

1. Look for the "Extension Development Host" VS Code window
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P`) in that window
3. Type: `Developer: Reload Window`
4. Press Enter

## Verify the Extension Loaded

After reloading, check that:
1. The DF Markdown Tools panel opens
2. Shows "File: [filename]"
3. Edit your markdown file (add/remove text)
4. The button should change to "💾 Save first" (disabled)
5. Save the file (Ctrl+S)
6. The button should change back to "Count Tokens" (enabled)

## View the Debug Logs

To see the debug output verifying that `isDirty` is being received:

1. Open the Webview Developer Tools:
   - Right-click in the DF Markdown Tools panel → "Inspect"
   - Or press `Ctrl+Shift+I` when the webview is focused
2. Go to the "Console" tab
3. Look for messages like:
   ```
   [DF Tools] Content update - isDirty: true fileName: README.md
   [DF Tools] Content update - isDirty: false fileName: README.md
   ```

These show the isDirty state being received by the component.

## Troubleshooting

### Button still shows "Count Tokens" when file is unsaved

**Possible causes:**
1. Extension hasn't been reloaded yet
   - Solution: Reload VS Code window (Option 2 above)

2. isDirty isn't being detected
   - Check browser console for error messages
   - Verify file is actually unsaved (look for dot next to filename in tab)

3. Message not being received by component
   - Check console for `[DF Tools] Content update` messages
   - If missing, the message might not be getting through

### "Inspect" option not appearing

If right-click → "Inspect" doesn't show:

1. Make sure you're right-clicking **inside** the DF Markdown Tools panel
2. Not on the title bar or empty area

Alternatively, press `Ctrl+Shift+I` when the webview has focus.

## Build and Reload Cycle

After making changes to the extension or UI:

```
1. Make code changes
2. Run: pnpm build
3. Reload VS Code: Ctrl+Shift+P → "Developer: Reload Window"
4. Test the changes
```

## What Gets Reloaded

When you reload the window:
- ✅ Extension code from `extensions/df-markdown-tools/src/extension.ts`
- ✅ UI component code from `extensions/df-markdown-tools-ui/src/df-markdown-tools-app.ts`
- ✅ Built JavaScript bundles
- ✅ All HTML/CSS

What does NOT reload automatically:
- ❌ Open files (they stay open)
- ❌ Editor scroll position (preserved)
- ❌ Other VS Code state (preserved)

## Quick Checklist

After building and reloading, verify:

- [ ] DF Markdown Tools panel opens
- [ ] File name displays correctly
- [ ] Edit markdown file (no save)
- [ ] Button shows "💾 Save first"
- [ ] Button is disabled (grayed out)
- [ ] Status shows: "ℹ️ Save your changes before counting tokens"
- [ ] Save file (Ctrl+S)
- [ ] Button shows "Count Tokens" again
- [ ] Button is enabled (full color)
- [ ] Status message disappears
- [ ] Button click works

## Still Not Working?

If the isDirty protection still isn't appearing:

1. **Check console for errors**
   - Open: Right-click panel → Inspect → Console
   - Look for JavaScript errors
   - Look for missing `[DF Tools] Content update` messages

2. **Verify the build succeeded**
   ```bash
   pnpm build
   # Check output - should show "19 successful"
   ```

3. **Check that extension path is correct**
   - The extension looks for built files at:
   - `extensions/df-markdown-tools-ui/dist/`
   - Make sure this directory exists and has files

4. **Hard restart**
   - Close VS Code completely
   - Delete any `.vscode-server` or extension cache (if using WSL)
   - Reopen VS Code fresh

## Questions?

If you're still having issues:
1. Check the console logs (Right-click → Inspect)
2. Verify the build completed successfully
3. Reload the window
4. Check that the file actually has unsaved changes (look for dot in tab)

The safest approach is always: **Close VS Code completely and reopen it.**
