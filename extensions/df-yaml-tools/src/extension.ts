import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import YAML, { isMap, isSeq, YAMLMap, YAMLSeq, Scalar, Pair } from 'yaml';

// Constants
const YAML_KEYS = {
	AI_TAGGING: 'AI-tagging',
	ARCHIVE_TAG: 'archive',
	BETTEROLOGY_TAG: 'betterology',
	MARKETING_TAG: 'marketing',
	CONTENT_TAG: 'content',
	DEV_TAG: 'dev',
	NBTRG_TAG: 'nbtrg',
	DELETED_DIR: 'deleted'
} as const;

// Create output channel for debugging
const outputChannel = vscode.window.createOutputChannel('DF YAML Tools');
let lastActiveEditor: vscode.TextEditor | undefined = undefined;

async function getYamlFilesInDirectory(filePath: string): Promise<string[]> {
    const dir = path.dirname(filePath);
    const files = await fs.promises.readdir(dir);

    // Filter for YAML files, excluding subdirectories
    const yamlFiles: string[] = [];
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = await fs.promises.stat(fullPath);

        // Only include files (not directories) with .yaml or .yml extension
        if (stat.isFile() && (file.endsWith('.yaml') || file.endsWith('.yml'))) {
            yamlFiles.push(file);
        }
    }

    // Sort alphabetically
    return yamlFiles.sort();
}

export function activate(context: vscode.ExtensionContext) {
	outputChannel.appendLine('=== DF YAML Tools Extension Activated ===');
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
                        ],
                        // Don't retain context when hidden - forces fresh load each time
                        retainContextWhenHidden: false
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
                const cacheToken = Date.now().toString();
                outputChannel.appendLine(`Creating webview with cache token: ${cacheToken}`);
				currentPanel.webview.html = getWebviewContent(
                    currentPanel.webview,
                    context.extensionUri,
                    cacheToken
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
                                        includeArchive: Boolean(message.includeArchive),
                                        includeBetterology: Boolean(message.includeBetterology),
                                        includeMarketing: Boolean(message.includeMarketing),
                                        includeContent: Boolean(message.includeContent),
                                        includeDev: Boolean(message.includeDev),
                                        includeNbtrg: Boolean(message.includeNbtrg)
                                    });
                                } else {
                                    vscode.window.showErrorMessage('YAML Tools panel is not available.');
                                }
                                return;
                            case 'deleteFile':
                                if (currentPanel) {
                                    await deleteActiveFile(currentPanel);
                                } else {
                                    vscode.window.showErrorMessage('YAML Tools panel is not available.');
                                }
                                return;
                            case 'navigateToFile':
                                if (currentPanel && message.fileName) {
                                    await navigateToFile(currentPanel, message.fileName);
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

async function updateWebviewContext(panel: vscode.WebviewPanel) {
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

    // Get list of YAML files in the same directory
    const yamlFiles = await getYamlFilesInDirectory(editor.document.fileName);

    outputChannel.appendLine(`Sending to webview: fileName="${fileName}", isDirty=${isDirty}, contentLength=${content.length}, yamlFiles=${yamlFiles.length}`);

    panel.webview.postMessage({
        command: 'updateContent',
        data: { fileName, content, isDirty, yamlFiles }
    });
}

async function addArchiveTagToActiveFile(panel: vscode.WebviewPanel) {
    await addTagsToActiveFile(panel, {
        tag: '',
        includeArchive: true,
        includeBetterology: false,
        includeMarketing: false,
        includeContent: false,
        includeDev: false,
        includeNbtrg: false
    });
}

async function addTagsToActiveFile(panel: vscode.WebviewPanel, opts: {
    tag: string;
    includeArchive: boolean;
    includeBetterology: boolean;
    includeMarketing: boolean;
    includeContent: boolean;
    includeDev: boolean;
    includeNbtrg: boolean;
}) {
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
        return item.items.some((child: Pair) => child.key?.toString() === YAML_KEYS.AI_TAGGING);
    });

    let aiMap: YAMLMap;
    let tagsSeq: YAMLSeq<Scalar | YAMLMap | YAMLSeq>;

    if (aiIndex >= 0) {
        aiMap = sequenceItems[aiIndex] as YAMLMap;
        const existingTags = aiMap.get(YAML_KEYS.AI_TAGGING, true) as unknown;
        if (!existingTags || !isSeq(existingTags)) {
            tagsSeq = new YAMLSeq();
            aiMap.set(YAML_KEYS.AI_TAGGING, tagsSeq);
        } else {
            tagsSeq = existingTags as YAMLSeq<Scalar | YAMLMap | YAMLSeq>;
        }
        if (aiIndex > 0) {
            sequenceItems.splice(aiIndex, 1);
            sequenceItems.unshift(aiMap);
        }
    } else {
        tagsSeq = new YAMLSeq();
        tagsSeq.items.push(new YAML.Scalar(YAML_KEYS.ARCHIVE_TAG));
        aiMap = new YAMLMap();
        aiMap.add(new YAML.Pair(YAML_KEYS.AI_TAGGING, tagsSeq));
        sequenceItems.unshift(aiMap);
    }

    // Parse comma-delimited tags (e.g., "frog, cat whiskers" -> ["frog", "cat whiskers"])
    const tagInput = opts.tag.trim();
    const parsedTags = tagInput
        ? tagInput.split(',').map(t => t.trim()).filter(t => t.length > 0)
        : [];

    // Helper function to handle tag add/remove
    const handleTag = (tagKey: string, include: boolean) => {
        const tagIndex = tagsSeq.items.findIndex((item: Scalar | YAMLMap | YAMLSeq | null | undefined) => item?.toString() === tagKey);
        const hasTag = tagIndex >= 0;

        if (include && !hasTag) {
            tagsSeq.items.unshift(new YAML.Scalar(tagKey));
        } else if (!include && hasTag) {
            // Remove tag when checkbox is unchecked
            tagsSeq.items.splice(tagIndex, 1);
        }
    };

    // Handle all checkbox tags
    handleTag(YAML_KEYS.ARCHIVE_TAG, opts.includeArchive);
    handleTag(YAML_KEYS.BETTEROLOGY_TAG, opts.includeBetterology);
    handleTag(YAML_KEYS.MARKETING_TAG, opts.includeMarketing);
    handleTag(YAML_KEYS.CONTENT_TAG, opts.includeContent);
    handleTag(YAML_KEYS.DEV_TAG, opts.includeDev);
    handleTag(YAML_KEYS.NBTRG_TAG, opts.includeNbtrg);

    // Add each parsed tag if it doesn't already exist
    for (const tag of parsedTags) {
        const alreadyHasTag = tagsSeq.items.some(item => item?.toString() === tag);
        if (!alreadyHasTag) {
            tagsSeq.items.push(new YAML.Scalar(tag));
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

    // Save the document after applying the edit
    await editor.document.save();

    const summaryParts = [];
    if (opts.includeArchive) summaryParts.push(YAML_KEYS.ARCHIVE_TAG);
    if (opts.includeBetterology) summaryParts.push(YAML_KEYS.BETTEROLOGY_TAG);
    if (opts.includeMarketing) summaryParts.push(YAML_KEYS.MARKETING_TAG);
    if (opts.includeContent) summaryParts.push(YAML_KEYS.CONTENT_TAG);
    if (opts.includeDev) summaryParts.push(YAML_KEYS.DEV_TAG);
    if (opts.includeNbtrg) summaryParts.push(YAML_KEYS.NBTRG_TAG);
    summaryParts.push(...parsedTags);
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
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>DF YAML Tools</title>
</head>
<body>
    <!-- Cache bust: ${versionToken} -->
    <df-yaml-tools-app></df-yaml-tools-app>
    <script type="module" src="${scriptUri.toString()}?v=${versionToken}"></script>
</body>
</html>`;
}

async function deleteActiveFile(panel: vscode.WebviewPanel) {
    const editor = vscode.window.activeTextEditor ?? lastActiveEditor;

    if (!editor) {
        vscode.window.showErrorMessage('No active editor found to delete.');
        return;
    }

    const filePath = editor.document.uri.fsPath;
    const fileName = path.basename(filePath);

    // Show confirmation dialog (VSCode standard)
    const answer = await vscode.window.showWarningMessage(
        `Are you sure you want to delete "${fileName}"?`,
        { modal: true },
        'Delete'
    );

    if (answer !== 'Delete') {
        outputChannel.appendLine('Delete cancelled by user');
        return;
    }

    try {
        outputChannel.appendLine('Starting delete workflow for: ' + fileName);

        // First, add "deleted" tag to the YAML
        outputChannel.appendLine('Adding deleted tag...');
        await addTagsToActiveFile(panel, {
            tag: YAML_KEYS.DELETED_DIR,
            includeArchive: false,
            includeBetterology: false,
            includeMarketing: false,
            includeContent: false,
            includeDev: false,
            includeNbtrg: false
        });

        // Save the file with the deleted tag
        await editor.document.save();

        const fileDir = path.dirname(filePath);
        const deletedDir = path.join(fileDir, YAML_KEYS.DELETED_DIR);

        // Create deleted directory if it doesn't exist
        try {
            await vscode.workspace.fs.createDirectory(vscode.Uri.file(deletedDir));
            outputChannel.appendLine(`Created deleted directory: ${deletedDir}`);
        } catch {
            // Directory might already exist, that's ok
            outputChannel.appendLine(`Deleted directory exists or created: ${deletedDir}`);
        }

        const targetPath = path.join(deletedDir, fileName);
        const sourceUri = vscode.Uri.file(filePath);
        const targetUri = vscode.Uri.file(targetPath);

        // Close all editor tabs for the file being deleted
        const tabs = vscode.window.tabGroups.all.flatMap(group => group.tabs);
        const fileTabs = tabs.filter(tab => {
            if (tab.input instanceof vscode.TabInputText) {
                return tab.input.uri.fsPath === filePath;
            }
            return false;
        });

        outputChannel.appendLine(`Found ${fileTabs.length} tabs for file: ${fileName}`);

        for (const tab of fileTabs) {
            await vscode.window.tabGroups.close(tab);
            outputChannel.appendLine(`Closed tab for: ${fileName}`);
        }

        // Clear the lastActiveEditor reference since we just closed it
        lastActiveEditor = undefined;

        // Move the file
        await vscode.workspace.fs.rename(sourceUri, targetUri, { overwrite: true });
        outputChannel.appendLine(`Moved file to: ${targetPath}`);

        // Close the webview panel
        panel.dispose();
        outputChannel.appendLine('Closed YAML Tools panel');

        vscode.window.showInformationMessage(`File moved to deleted folder: ${fileName}`);
    } catch (error) {
        const errorMsg = `Failed to delete file: ${String(error)}`;
        outputChannel.appendLine(errorMsg);
        vscode.window.showErrorMessage(errorMsg);
    }
}

async function navigateToFile(panel: vscode.WebviewPanel, fileName: string) {
    const editor = vscode.window.activeTextEditor ?? lastActiveEditor;

    if (!editor) {
        outputChannel.appendLine('No active editor for navigation');
        return;
    }

    // Get the directory of the current file
    const currentDir = path.dirname(editor.document.fileName);
    const targetPath = path.join(currentDir, fileName);

    try {
        // Open the target file in preview mode (like single-click in file explorer)
        // This allows navigating through files without filling up pinned tabs
        const document = await vscode.workspace.openTextDocument(targetPath);
        await vscode.window.showTextDocument(document, { preview: true, viewColumn: vscode.ViewColumn.One });

        outputChannel.appendLine(`Navigated to: ${fileName}`);

        // Update the webview with the new file's content
        await updateWebviewContext(panel);
    } catch (error) {
        const errorMsg = `Failed to navigate to file: ${String(error)}`;
        outputChannel.appendLine(errorMsg);
        vscode.window.showErrorMessage(errorMsg);
    }
}

export function deactivate() {}
