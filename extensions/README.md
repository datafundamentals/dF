# VS Code Extensions

This directory contains the source code for VS Code extensions.

## Architecture

We use a "Backend-for-Frontend" architecture where the VS Code Extension Host acts as the backend (Node.js) and the UI is a standard web application (Lit) running in a Webview.

### Structure

*   **`df-markdown-tools`**: The Extension Host (Backend).
    *   Contains `extension.ts` (Activation logic).
    *   Handles file system access, API calls, and secrets.
*   **`df-markdown-tools-ui`**: The UI (Frontend).
    *   A standard Lit application built with Vite.
    *   Communicates with the host via `postMessage`.

## Development

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```

2.  **Build the UI:**
    ```bash
    pnpm --filter @df/df-markdown-tools-ui build
    ```
    *Note: You can run `pnpm --filter @df/df-markdown-tools-ui dev` to watch for changes, but you need to rebuild for the extension to pick it up unless you configure hot reloading.*

3.  **Run the Extension:**
    *   Open `extensions/df-markdown-tools` in VS Code.
    *   Press `F5` to launch the Extension Development Host.

## Packaging

To package the extension for distribution (`.vsix`), you must ensure the UI assets are bundled into the extension.
*   Currently, the extension reads from `../df-markdown-tools-ui/dist`.
*   For production, add a build step to copy `dist` into `df-markdown-tools/media`.
