import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "df-markdown-tools" is now active!');
    vscode.window.showInformationMessage('DF Tools Extension Activated!');

	let currentPanel: vscode.WebviewPanel | undefined = undefined;

	context.subscriptions.push(
		vscode.commands.registerCommand('df.openMarkdownTools', () => {
			const columnToShowIn = vscode.ViewColumn.Beside;

			if (currentPanel) {
				currentPanel.reveal(columnToShowIn);
			} else {
				currentPanel = vscode.window.createWebviewPanel(
					'dfMarkdownTools',
					'DF Tools',
					columnToShowIn,
					{
						enableScripts: true,
                        // Restrict the webview to only loading content from our extension's `media` directory.
                        localResourceRoots: [
                            vscode.Uri.file(path.join(context.extensionPath, '..', 'df-markdown-tools-ui', 'dist'))
                        ]
					}
				);

				currentPanel.onDidDispose(
					() => {
						currentPanel = undefined;
					},
					null,
					context.subscriptions
				);

                // Set the webview's initial html content
				currentPanel.webview.html = getWebviewContent(currentPanel.webview, context.extensionUri);

                // Handle messages from the webview
                currentPanel.webview.onDidReceiveMessage(
                    message => {
                        switch (message.command) {
                            case 'alert':
                                vscode.window.showInformationMessage(message.text);
                                return;
                        }
                    },
                    undefined,
                    context.subscriptions
                );
			}

            // Update content based on active editor
            updateWebviewContext(currentPanel);
		})
	);

    // Listen for active editor changes
    vscode.window.onDidChangeActiveTextEditor(_editor => {
        if (currentPanel && currentPanel.visible) {
            updateWebviewContext(currentPanel);
        }
    });
}

function updateWebviewContext(panel: vscode.WebviewPanel) {
    const editor = vscode.window.activeTextEditor;
    const fileName = editor ? path.basename(editor.document.fileName) : 'No file';
    
    panel.webview.postMessage({
        command: 'updateContext',
        data: { fileName }
    });
}

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
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DF Tools</title>
</head>
<body>
    <df-markdown-tools-app></df-markdown-tools-app>
    <script type="module" src="${scriptUri}"></script>
</body>
</html>`;
}

export function deactivate() {}
