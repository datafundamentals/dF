import * as vscode from 'vscode';
import * as path from 'path';
import YAML, { isMap, isSeq, YAMLMap, YAMLSeq, Scalar, Pair } from 'yaml';

// Create output channel for debugging
const outputChannel = vscode.window.createOutputChannel('DF YAML Tools');
let lastActiveEditor: vscode.TextEditor | undefined = undefined;

export function activate(context: vscode.ExtensionContext) {
	outputChannel.appendLine('=== DF YAML Tools Extension Activated ===');
	console.log('Congratulations, your extension "df-yaml-tools" is now active!');
    vscode.window.showInformationMessage('DF YAML Tools Extension Activated!');

	let currentPanel: vscode.WebviewPanel | undefined = undefined;

	context.subscriptions.push(
		vscode.commands.registerCommand('df.openYamlTools', () => {
			outputChannel.appendLine('>>> Command: df.openYamlTools triggered');
			const columnToShowIn = vscode.ViewColumn.Beside;

			if (currentPanel) {
				outputChannel.appendLine('Panel already open, revealing it');
				currentPanel.reveal(columnToShowIn);
			} else {
				outputChannel.appendLine('Creating new webview panel');
				currentPanel = vscode.window.createWebviewPanel(
					'dfYamlTools',
					'DF YAML Tools',
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
				currentPanel.webview.html = getWebviewContent(
                    currentPanel.webview,
                    context.extensionUri,
                    // Bust webview cache between runs so UI updates show up
                    (context.extension.packageJSON?.version as string | undefined) ?? Date.now().toString()
                );

                // Handle messages from the webview
                currentPanel.webview.onDidReceiveMessage(
                    async message => {
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
                            case 'addArchiveTag':
                                if (currentPanel) {
                                    await addArchiveTagToActiveFile(currentPanel);
                                } else {
                                    vscode.window.showErrorMessage('YAML Tools panel is not available.');
                                }
                                return;
                            case 'addTags':
                                if (currentPanel) {
                                    await addTagsToActiveFile(currentPanel, {
                                        tag: (message.tag ?? '').toString(),
                                        includeArchive: Boolean(message.includeArchive)
                                    });
                                } else {
                                    vscode.window.showErrorMessage('YAML Tools panel is not available.');
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
            if (_editor) {
                lastActiveEditor = _editor;
            }
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

    lastActiveEditor = editor;
    const fileName = path.basename(editor.document.fileName);
    const content = editor.document.getText();
    const isDirty = editor.document.isDirty;

    outputChannel.appendLine(`Sending to webview: fileName="${fileName}", isDirty=${isDirty}, contentLength=${content.length}`);

    panel.webview.postMessage({
        command: 'updateContent',
        data: { fileName, content, isDirty }
    });
}

async function addArchiveTagToActiveFile(panel: vscode.WebviewPanel) {
    await addTagsToActiveFile(panel, { tag: '', includeArchive: true });
}

async function addTagsToActiveFile(panel: vscode.WebviewPanel, opts: { tag: string; includeArchive: boolean }) {
    const editor = vscode.window.activeTextEditor ?? lastActiveEditor;

    if (!editor) {
        vscode.window.showErrorMessage('No active editor found to tag.');
        panel.webview.postMessage({ command: 'taggingResult', status: 'error', message: 'No active editor found' });
        return;
    }

    if (editor.document.languageId !== 'yaml') {
        vscode.window.showErrorMessage('Active file is not YAML.');
        panel.webview.postMessage({ command: 'taggingResult', status: 'error', message: 'Active file is not YAML' });
        return;
    }

    const rawText = editor.document.getText();
    const rootKeyFromFile = path.basename(editor.document.fileName);

    let doc: YAML.Document;
    try {
        doc = YAML.parseDocument(rawText);
    } catch (error) {
        vscode.window.showErrorMessage('Failed to parse YAML.');
        panel.webview.postMessage({ command: 'taggingResult', status: 'error', message: 'Failed to parse YAML' });
        outputChannel.appendLine(`YAML parse error: ${String(error)}`);
        return;
    }

    if (!doc || doc.errors.length) {
        vscode.window.showErrorMessage('YAML contains syntax errors.');
        panel.webview.postMessage({ command: 'taggingResult', status: 'error', message: 'YAML contains syntax errors' });
        outputChannel.appendLine(`YAML errors: ${doc?.errors.map(e => e.message).join('; ')}`);
        return;
    }

    const rootContents = doc.contents;
    if (!rootContents || !isMap(rootContents)) {
        vscode.window.showErrorMessage('Expected YAML root to be a mapping.');
        panel.webview.postMessage({ command: 'taggingResult', status: 'error', message: 'Root is not a mapping' });
        return;
    }

    const availableRootKey = rootContents.has(rootKeyFromFile)
        ? rootKeyFromFile
        : rootContents.items[0]?.key?.toString();

    if (!availableRootKey) {
        vscode.window.showErrorMessage('Could not find a root key to tag.');
        panel.webview.postMessage({ command: 'taggingResult', status: 'error', message: 'No root key found' });
        return;
    }

    const sequenceNode = rootContents.get(availableRootKey, true) as unknown;
    if (!sequenceNode || !isSeq(sequenceNode)) {
        vscode.window.showErrorMessage('Expected root value to be a list.');
        panel.webview.postMessage({ command: 'taggingResult', status: 'error', message: 'Root value is not a list' });
        return;
    }

    // Find or create AI-tagging entry
    const sequenceItems = sequenceNode.items as Array<YAMLMap | YAMLSeq | Scalar | null | undefined>;

    const aiIndex = sequenceItems.findIndex((item: YAMLMap | YAMLSeq | Scalar | null | undefined) => {
        if (!item || !isMap(item)) return false;
        return item.items.some((child: Pair) => child.key?.toString() === 'AI-tagging');
    });

    let aiMap: YAMLMap;
    let tagsSeq: YAMLSeq<Scalar | YAMLMap | YAMLSeq>;

    if (aiIndex >= 0) {
        aiMap = sequenceItems[aiIndex] as YAMLMap;
        const existingTags = aiMap.get('AI-tagging', true) as unknown;
        if (!existingTags || !isSeq(existingTags)) {
            tagsSeq = new YAMLSeq();
            aiMap.set('AI-tagging', tagsSeq);
        } else {
            tagsSeq = existingTags as YAMLSeq<Scalar | YAMLMap | YAMLSeq>;
        }
        if (aiIndex > 0) {
            sequenceItems.splice(aiIndex, 1);
            sequenceItems.unshift(aiMap);
        }
    } else {
        tagsSeq = new YAMLSeq();
        tagsSeq.items.push(new YAML.Scalar('archive'));
        aiMap = new YAMLMap();
        aiMap.add(new YAML.Pair('AI-tagging', tagsSeq));
        sequenceItems.unshift(aiMap);
    }

    const normalizedTag = opts.tag.trim();
    if (!opts.includeArchive && !normalizedTag) {
        panel.webview.postMessage({ command: 'taggingResult', status: 'error', message: 'Enter a tag or enable archive' });
        return;
    }

    const hasArchive = tagsSeq.items.some((item: Scalar | YAMLMap | YAMLSeq | null | undefined) => item?.toString() === 'archive');
    if (opts.includeArchive && !hasArchive) {
        tagsSeq.items.unshift(new YAML.Scalar('archive'));
    }

    if (normalizedTag) {
        const alreadyHasTag = tagsSeq.items.some(item => item?.toString() === normalizedTag);
        if (!alreadyHasTag) {
            tagsSeq.items.push(new YAML.Scalar(normalizedTag));
        }
    }

    // Ensure the AI-tagging entry remains first
    const firstItem = sequenceItems[0];
    if (firstItem !== aiMap) {
        sequenceNode.items = [aiMap, ...sequenceItems.filter((item: typeof aiMap | YAMLSeq | Scalar | null | undefined) => item !== aiMap)];
    }

    const updatedText = doc.toString();

    if (updatedText === rawText) {
        panel.webview.postMessage({ command: 'taggingResult', status: 'success', message: 'Tags already present' });
        return;
    }

    const fullRange = new vscode.Range(
        editor.document.positionAt(0),
        editor.document.positionAt(rawText.length)
    );

    const edit = new vscode.WorkspaceEdit();
    edit.replace(editor.document.uri, fullRange, updatedText);

    const applied = await vscode.workspace.applyEdit(edit);
    if (!applied) {
        vscode.window.showErrorMessage('Could not apply YAML tag edit.');
        panel.webview.postMessage({ command: 'taggingResult', status: 'error', message: 'Could not apply edit' });
        return;
    }

    const summaryParts = [];
    if (opts.includeArchive) summaryParts.push('archive');
    if (normalizedTag) summaryParts.push(normalizedTag);
    const summary = summaryParts.length ? summaryParts.join(', ') : 'tagging';

    outputChannel.appendLine(`Tags added/ensured at top of YAML list: ${summary}`);
    panel.webview.postMessage({ command: 'taggingResult', status: 'success', message: `Added ${summary}` });
    updateWebviewContext(panel);
}

function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri, versionToken: string) {
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
    <title>DF YAML Tools</title>
</head>
<body>
    <df-yaml-tools-app></df-yaml-tools-app>
    <script type="module" src="${scriptUri.toString()}?v=${versionToken}"></script>
</body>
</html>`;
}

export function deactivate() {}
