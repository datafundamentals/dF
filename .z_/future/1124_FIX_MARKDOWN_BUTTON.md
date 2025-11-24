# Ticket: Fix Missing Editor Title Icon for DF Markdown Tools

This ticket fixes a broken button in the almost bran new vscode extension which just started development in extensions/df-markdown-tools

## Status
- **Current Behavior**: The extension activates correctly. The command `df.openMarkdownTools` works via the Command Palette (`Cmd+Shift+P`) and the Right-Click Context Menu. The Webview opens and communicates with the Extension Host.
- **Issue**: The configured icon (`$(book)`) does **not** appear in the Editor Title bar (top-right of the editor tab) when a Markdown file is active, despite being configured in `package.json`.

## Current Configuration
`extensions/df-markdown-tools/package.json`:
```json
"contributes": {
  "commands": [
    {
      "command": "df.openMarkdownTools",
      "title": "Open DF Tools",
      "category": "DF",
      "icon": "$(book)"
    }
  ],
  "menus": {
    "editor/title": [
      {
        "command": "df.openMarkdownTools",
        "group": "navigation",
        "when": "resourceLangId == markdown"
      }
    ]
  }
}
```

## Investigation Steps & Suggestions

1.  **Verify Context Keys**:
    *   Open the "Extension Development Host".
    *   Run the command `Developer: Inspect Context Keys`.
    *   Click in the Markdown editor.
    *   Verify that `resourceLangId` is indeed `markdown`.

2.  **Check Overflow Menu**:
    *   The icon might be hidden in the "..." (More Actions) menu in the editor title bar if VS Code thinks there isn't enough space.

3.  **Experiment with `group`**:
    *   Try changing `"group": "navigation"` to `"group": "navigation@1"` to force ordering.
    *   Try removing `"group": "navigation"` to see if it defaults to the overflow menu, then add it back.

4.  **Icon Format**:
    *   We are using a Product Icon `$(book)`. Ensure this is valid for the current VS Code engine version (`^1.85.0`).
    *   Try a different icon (e.g., `$(preview)`) to rule out specific icon issues.
    *   Try using a local SVG file instead of a product icon (requires `icon: { "dark": "...", "light": "..." }` in the command definition).

5.  **Clean Environment**:
    *   Sometimes the Extension Host caches menu layouts. Try running `pnpm clean` or manually deleting `dist` and `out` folders before rebuilding.

## Goal
Ensure the "Book" icon appears prominently in the editor title bar whenever a Markdown file is active, providing one-click access to the DF Tools Webview.
