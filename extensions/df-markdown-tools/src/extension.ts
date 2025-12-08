import * as vscode from 'vscode';
import * as path from 'path';

// Create output channel for debugging
const outputChannel = vscode.window.createOutputChannel('DF Markdown Tools');

export function activate(context: vscode.ExtensionContext) {
	outputChannel.appendLine('=== DF Markdown Tools Extension Activated ===');
	console.log('Congratulations, your extension "df-markdown-tools" is now active!');
    vscode.window.showInformationMessage('DF Tools Extension Activated!');

	let currentPanel: vscode.WebviewPanel | undefined = undefined;

	context.subscriptions.push(
		vscode.commands.registerCommand('df.openMarkdownTools', () => {
			outputChannel.appendLine('>>> Command: df.openMarkdownTools triggered');
			const columnToShowIn = vscode.ViewColumn.Beside;

			if (currentPanel) {
				outputChannel.appendLine('Panel already open, revealing it');
				currentPanel.reveal(columnToShowIn);
			} else {
				outputChannel.appendLine('Creating new webview panel');
				currentPanel = vscode.window.createWebviewPanel(
					'dfMarkdownTools',
					'DF Tools',
					columnToShowIn,
					{
						enableScripts: true,
                        // Restrict the webview to only loading content from our extension's `media` directory.
                        localResourceRoots: [
                            vscode.Uri.file(path.join(context.extensionPath, 'media', 'ui'))
                        ]
					}
				);

				currentPanel.onDidDispose(
					() => {
						outputChannel.appendLine('Panel disposed, clearing reference');
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
                        outputChannel.appendLine(`Received message from webview: ${message.command}`);
                        switch (message.command) {
                            case 'alert':
                                vscode.window.showInformationMessage(message.text);
                                return;
                            case 'requestContent':
                                if (currentPanel) {
                                    updateWebviewContext(currentPanel);
                                }
                                return;
                        }
                    },
                    undefined,
                    context.subscriptions
                );
			}

            // Update content based on active editor
            outputChannel.appendLine('Sending initial content to webview');
            updateWebviewContext(currentPanel);
		})
	);

    // Listen for active editor changes (registered globally, outside command)
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(_editor => {
            outputChannel.appendLine(`Active editor changed: ${_editor?.document.fileName || 'none'}`);
            if (currentPanel && currentPanel.visible) {
                outputChannel.appendLine('Panel visible, updating context');
                updateWebviewContext(currentPanel);
            }
        })
    );

    // Listen for document changes (registered globally, outside command)
    // This fires whenever text is edited, file becomes dirty
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(_event => {
            // Skip output channel and other non-file documents to avoid infinite loops
            if (_event.document.uri.scheme !== 'file') {
                return;
            }

            outputChannel.appendLine(`Document changed: ${_event.document.fileName}, isDirty=${_event.document.isDirty}`);
            if (currentPanel && currentPanel.visible) {
                outputChannel.appendLine('Panel visible, updating context');
                updateWebviewContext(currentPanel);
            }
        })
    );

    // Listen for file save events (explicitly handle save to update isDirty)
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(_document => {
            outputChannel.appendLine(`Document saved: ${_document.fileName}`);
            if (currentPanel && currentPanel.visible) {
                outputChannel.appendLine('Panel visible, updating context');
                updateWebviewContext(currentPanel);
            }
        })
    );
}

function updateWebviewContext(panel: vscode.WebviewPanel) {
    const editor = vscode.window.activeTextEditor;

    // Only send if we have an active editor
    if (!editor) {
        outputChannel.appendLine('No active editor, skipping update');
        return;
    }

    const fileName = path.basename(editor.document.fileName);
    const content = editor.document.getText();
    const isDirty = editor.document.isDirty;

    outputChannel.appendLine(`Sending to webview: fileName="${fileName}", isDirty=${isDirty}, contentLength=${content.length}`);

    panel.webview.postMessage({
        command: 'updateContent',
        data: { fileName, content, isDirty }
    });
}

function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    // We assume the UI package is built into media/ui
    const uiDistPath = vscode.Uri.joinPath(extensionUri, 'media', 'ui');
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(uiDistPath, 'assets', 'index.js'));
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src ${webview.cspSource}; font-src ${webview.cspSource};">
    <title>DF Tools</title>
</head>
<body>
    <df-markdown-tools-app></df-markdown-tools-app>
    <script type="module" src="${scriptUri}"></script>
</body>
</html>`;
}

export function deactivate() {}
