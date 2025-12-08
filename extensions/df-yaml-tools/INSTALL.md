# How to Install the DF YAML Tools Extension

## Prerequisites
- Visual Studio Code installed.

## Installation Steps

1.  **Locate the VSIX file:**
    The extension package file is located at:
    `extensions/df-yaml-tools/df-yaml-tools-0.0.1.vsix`

2.  **Install in VS Code:**
    - Open VS Code.
    - Go to the **Extensions** view (click the square icon on the sidebar or press `Cmd+Shift+X`).
    - Click the **...** (Views and More Actions) menu at the top right of the Extensions view.
    - Select **Install from VSIX...**.
    - Navigate to the file path mentioned above and select it.

3.  **Verify Installation:**
    - Open a YAML file (`.yaml` or `.yml`).
    - You should see the "DF yaml Tools" icon (tree icon) in the editor title bar (top right).
    - Click the icon to open the tools panel.

## Updating the Extension

To update the extension after making changes:
1.  Run `pnpm run pack` in the `extensions/df-yaml-tools` directory to generate a new `.vsix` file.
    *(Note: You may want to bump the version number in `package.json` first).*
2.  Repeat the installation steps above. VS Code will update the existing installation.

## Distribution

To share this extension with others:
- Simply send them the `.vsix` file.
- They can follow the same "Install from VSIX..." steps.
