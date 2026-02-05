# Coding Agent Tips: Adding Bash Launch Buttons to Dashboard

This guide explains how to add new "Bash Launch" buttons to the DF Dashboard. These buttons allow users to execute specific terminal commands (like `pnpm install`, `build`, `test`, etc.) directly from the dashboard UI within a named VS Code terminal.

## Architecture Overview

1.  **UI Component (`packages/ui-lit`)**: A Lit component (e.g., `df-dashboard-app-card.ts`) renders a button.
2.  **Event Dispatch**: When clicked, the component dispatches a standard DOM custom event: `df-dashboard-run-command`.
3.  **Webview Bridge**: The VS Code Webview wrapper (in `extensions/df-dashboard/src/extension.ts`) listens for this DOM event and forwards it to the Extension Host via `postMessage`.
4.  **Extension Host**: The Extension Host receives the message, finds (or creates) a terminal with the specified `name`, and sends the `command` text to it.

**Status**: The infrastructure (Steps 3 & 4) is fully implemented. You only need to work on Step 1 & 2 (The UI).

## How to Add Functionality

### 1. Locate the Component
*   **Repo-level buttons**: `packages/ui-lit/src/df-dashboard-df-card.ts`
*   **App-level buttons**: `packages/ui-lit/src/df-dashboard-app-card.ts`

### 2. Implement the Handler
Add a private method to the class to dispatch the command.

**Pattern:**
```typescript
  private handleMyAction(): void {
    // For App cards, use 'this.app.name' for dynamic context
    const app = this.app; 
    if (!app) return;

    this.dispatchEvent(
      new CustomEvent('df-dashboard-run-command', {
        detail: {
          // Terminal Name: appears in VS Code terminal dropdown
          name: `DF: ${app.name}`, 
          // Command: The actual bash string to execute
          command: `pnpm --filter ${app.name} my-script`,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }
```

For strict strings (like Repo card), you can use a helper:
```typescript
  private handleRunCommand(name: string, command: string): void {
    this.dispatchEvent(
      new CustomEvent('df-dashboard-run-command', {
        detail: { name, command },
        bubbles: true,
        composed: true,
      }),
    );
  }
```

### 3. Add the UI Button
Add the button to the `render()` method, typically inside `.actions-row`. Ensure you use Material Web Components.

```typescript
import '@material/web/button/outlined-button.js'; // Ensure import exists

// In render():
<md-outlined-button @click=${this.handleMyAction}>
  My Action label
</md-outlined-button>
```

## Build & Test Cycle

Because this involves multiple packages in a monorepo, you must rebuild the chain to see changes in the Extension Host.

**Command Chain:**
```bash
pnpm --filter @df/ui-lit run build && \
pnpm --filter @df/df-dashboard-ui run build && \
cd extensions/df-dashboard && \
pnpm run copy:ui && \
pnpm run compile
```

**Validation:**
1.  Reload the VS Code window (`Cmd+R` or "Developer: Reload Window").
2.  Open the Dashboard (`DF: Open Dashboard`).
3.  Click your new button.
4.  Verify the terminal opens with the correct name and CWD (it defaults to Monorepo Root).

## Troubleshooting
*   **"No projects found"**: The terminal is likely running in the wrong CWD. The infrastructure has been patched to fix this, but if new issues arise, check `handleRunTerminalCommand` in `extension.ts`.
*   **Button doesn't appear**: Did you import the button component (e.g., `outlined-button.js`)? Did you add `composed: true` to the CustomEvent?
*   **Old code loading**: VS Code caches extensions aggressively. Always run the full build chain and Reload Window.
