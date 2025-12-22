import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import YAML, { isMap, isSeq, YAMLMap, YAMLSeq, Scalar, Pair } from 'yaml';
import { EnvUtils } from '@df/node-utils';
import { archiveFileToDeleted, indexDocument, verifyDocument, searchDocuments, getDocument, updateDocument } from '@df/extensions-shared';
import { YoutubeService } from './services/YoutubeService';
import { YamlService } from './services/YamlService';
import { callGemini } from './services/gemini.service';

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

/**
 * Filesystem Provider for Elasticsearch documents
 * Enables reading/editing files stored in Elasticsearch via elasticsearch:// URI scheme
 */
class ElasticsearchFileSystemProvider implements vscode.FileSystemProvider {
	private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
	readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._emitter.event;

	/**
	 * Parse URI to extract index and document ID
	 * URI format: elasticsearch://{index}/{path}?id={docId}
	 */
	private parseUri(uri: vscode.Uri): { index: string; docId: string } | null {
		try {
			const index = uri.authority;
			const searchParams = new URLSearchParams(uri.query);
			const docId = searchParams.get('id');

			if (!index || !docId) {
				outputChannel.appendLine(`Invalid URI format: ${uri.toString()}`);
				return null;
			}

			return { index, docId };
		} catch (error) {
			outputChannel.appendLine(`Error parsing URI: ${String(error)}`);
			return null;
		}
	}

	watch(uri: vscode.Uri): vscode.Disposable {
		// No-op: we don't watch for external changes
		return new vscode.Disposable(() => {});
	}

	stat(uri: vscode.Uri): vscode.FileStat {
		// Return a basic file stat
		return {
			type: vscode.FileType.File,
			ctime: Date.now(),
			mtime: Date.now(),
			size: 0
		};
	}

	readDirectory(uri: vscode.Uri): [string, vscode.FileType][] {
		// Not needed for our use case
		return [];
	}

	createDirectory(uri: vscode.Uri): void {
		// Not needed for our use case
		throw vscode.FileSystemError.NoPermissions('Cannot create directories in Elasticsearch');
	}

	async readFile(uri: vscode.Uri): Promise<Uint8Array> {
		outputChannel.appendLine(`Reading file: ${uri.toString()}`);

		const parsed = this.parseUri(uri);
		if (!parsed) {
			throw vscode.FileSystemError.FileNotFound('Invalid URI format');
		}

		const { index, docId } = parsed;

		// Get API key
		const apiKey = EnvUtils.getElasticApiKey(outputChannel);
		if (!apiKey) {
			throw vscode.FileSystemError.Unavailable('ELASTIC_API_KEY not found');
		}

		try {
			// Fetch document from Elasticsearch
			const result = await getDocument(docId, apiKey, { index });

			if (!result.success || !result.content) {
				const error = result.error || 'Unknown error';
				outputChannel.appendLine(`Failed to fetch document: ${error}`);
				throw vscode.FileSystemError.FileNotFound(error);
			}

			outputChannel.appendLine(`Successfully read file (${result.content.length} bytes)`);
			return Buffer.from(result.content, 'utf8');

		} catch (error) {
			const errorMsg = String(error);
			outputChannel.appendLine(`Exception reading file: ${errorMsg}`);
			throw vscode.FileSystemError.Unavailable(errorMsg);
		}
	}

	async writeFile(uri: vscode.Uri, content: Uint8Array, options: { create: boolean; overwrite: boolean }): Promise<void> {
		outputChannel.appendLine(`Writing file: ${uri.toString()}`);

		const parsed = this.parseUri(uri);
		if (!parsed) {
			throw vscode.FileSystemError.FileNotFound('Invalid URI format');
		}

		const { index, docId } = parsed;

		// Get API key
		const apiKey = EnvUtils.getElasticApiKey(outputChannel);
		if (!apiKey) {
			throw vscode.FileSystemError.Unavailable('ELASTIC_API_KEY not found');
		}

		try {
			const contentString = Buffer.from(content).toString('utf8');
			const result = await updateDocument(docId, contentString, apiKey, { index });

			if (!result.success) {
				const error = result.error || 'Unknown error';
				outputChannel.appendLine(`Failed to write file: ${error}`);
				throw vscode.FileSystemError.Unavailable(error);
			}

			outputChannel.appendLine('Successfully wrote file to Elasticsearch');

			// Notify that the file has changed
			this._emitter.fire([{ type: vscode.FileChangeType.Changed, uri }]);

		} catch (error) {
			const errorMsg = String(error);
			outputChannel.appendLine(`Exception writing file: ${errorMsg}`);
			throw vscode.FileSystemError.Unavailable(errorMsg);
		}
	}

	delete(uri: vscode.Uri): void {
		throw vscode.FileSystemError.NoPermissions('Cannot delete Elasticsearch documents from this interface');
	}

	rename(oldUri: vscode.Uri, newUri: vscode.Uri): void {
		throw vscode.FileSystemError.NoPermissions('Cannot rename Elasticsearch documents');
	}
}

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
	outputChannel.appendLine(`Runtime timestamp: ${new Date().toLocaleTimeString()}`);
	vscode.window.showInformationMessage('DF YAML Tools Extension Activated!');

	let currentPanel: vscode.WebviewPanel | undefined = undefined;

	// Register Elasticsearch filesystem provider
	const elasticsearchProvider = new ElasticsearchFileSystemProvider();
	context.subscriptions.push(
		vscode.workspace.registerFileSystemProvider('elasticsearch', elasticsearchProvider, {
			isCaseSensitive: true,
			isReadonly: false
		})
	);
	outputChannel.appendLine('Registered elasticsearch:// filesystem provider (read/write enabled)');

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
                                vscode.window.showErrorMessage(message.text);
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
                            case 'extractYoutubeVitals':
                                if (currentPanel) {
                                    await extractYoutubeVitals(currentPanel);
                                }
                                return;
                            case 'migrateActiveFile':
                                if (currentPanel) {
                                    await handleMigrateActiveFile(currentPanel);
                                }
                                return;
                            case 'searchElastic':
                                if (currentPanel && message.query) {
                                    await handleSearchElastic(currentPanel, message.query, Boolean(message.fuzzy));
                                }
                                return;
                            case 'openDocument':
                                if (message.id && message.path) {
                                    await openVirtualDocument(message.id, message.path, message.index);
                                } else {
                                    vscode.window.showErrorMessage('Missing document id or path.');
                                }
                                return;
                        }
                    },
                    undefined,
                    context.subscriptions
                );
                
                // Initial update
                updateWebviewContext(currentPanel);
}
})
);

    // Track active editor changes
    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            lastActiveEditor = editor;
            if (currentPanel && currentPanel.visible) {
                updateWebviewContext(currentPanel);
            }
        }
    });

    // Track document changes (for isDirty state and content updates)
    vscode.workspace.onDidChangeTextDocument(event => {
        // Ignore output channel changes to prevent infinite loops
        if (event.document.uri.scheme === 'output') {
            return;
        }
        
        if (currentPanel && currentPanel.visible && lastActiveEditor && event.document === lastActiveEditor.document) {
            updateWebviewContext(currentPanel);
        }
    });

    // Initial update if panel is restored
    if (vscode.window.activeTextEditor) {
        lastActiveEditor = vscode.window.activeTextEditor;
    }
}

async function openVirtualDocument(id: string, docPath: string, indexOverride?: string) {
    const index = indexOverride || process.env.ELASTIC_INDEX || 'daily-batch';
    const safeIndex = encodeURIComponent(index);
    const safePath = docPath
        .split('/')
        .map(segment => encodeURIComponent(segment))
        .join('/');
    const safeId = encodeURIComponent(id);
    const uri = vscode.Uri.parse(`elasticsearch://${safeIndex}/${safePath}?id=${safeId}`);

    try {
        await vscode.window.showTextDocument(uri, { preview: true, viewColumn: vscode.ViewColumn.One });
        outputChannel.appendLine(`Opened virtual document: ${uri.toString()}`);
    } catch (error) {
        const errorMsg = `Failed to open virtual document: ${String(error)}`;
        outputChannel.appendLine(errorMsg);
        vscode.window.showErrorMessage(errorMsg);
    }
}

function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri, cacheToken: string) {
    // The UI is built into media/ui/assets/index.js
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'ui', 'assets', 'index.js'));
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DF YAML Tools</title>
</head>
<body>
    <df-yaml-tools-app></df-yaml-tools-app>
    <script type="module" src="${scriptUri}?v=${cacheToken}"></script>
</body>
</html>`;
}

async function updateWebviewContext(panel: vscode.WebviewPanel) {
    const apiKey = EnvUtils.getElasticApiKey(outputChannel);
    outputChannel.appendLine(`[DEBUG] updateWebviewContext: apiKey found? ${!!apiKey}`);

    const editor = vscode.window.activeTextEditor ?? lastActiveEditor;
    if (!editor) {
        // Send just API key and empty state
        panel.webview.postMessage({ 
            command: 'updateContent', 
            data: {
                fileName: 'No active file',
                content: '',
                isDirty: false,
                yamlFiles: [],
                apiKey
            }
        });
        return;
    }

    const fileName = path.basename(editor.document.fileName);
    
    // Check if it's a YAML file
    if (!fileName.endsWith('.yaml') && !fileName.endsWith('.yml')) {
        // Send API key even if not YAML
        panel.webview.postMessage({ 
            command: 'updateContent', 
            data: {
                fileName: fileName + ' (not YAML)',
                content: '',
                isDirty: false,
                yamlFiles: [],
                apiKey
            }
        });
        return;
    }

    try {
        const content = editor.document.getText();
        const isDirty = editor.document.isDirty;
        const yamlFiles = await getYamlFilesInDirectory(editor.document.fileName);
        
        panel.webview.postMessage({ 
            command: 'updateContent', 
            data: {
                fileName,
                content,
                isDirty,
                yamlFiles,
                apiKey
            }
        });
    } catch (error) {
        const errorMsg = `Failed to update context: ${String(error)}`;
        outputChannel.appendLine(errorMsg);
    }
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

    // Parse comma-delimited tags
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

async function handleSearchElastic(panel: vscode.WebviewPanel, query: string, fuzzy: boolean = false) {
    outputChannel.appendLine(`Searching Elasticsearch for: ${query} (fuzzy: ${fuzzy})`);
    
    const apiKey = EnvUtils.getElasticApiKey(outputChannel);
    if (!apiKey) {
        const errorMsg = 'ELASTIC_API_KEY not found';
        outputChannel.appendLine(errorMsg);
        panel.webview.postMessage({
            command: 'searchResult',
            status: 'error',
            message: errorMsg
        });
        return;
    }

    try {
        const result = await searchDocuments(query, apiKey, fuzzy);
        
        if (result.success) {
            outputChannel.appendLine(`Search successful. Found ${result.hits?.length || 0} hits.`);
            panel.webview.postMessage({
                command: 'searchResult',
                status: 'success',
                results: result.hits
            });
        } else {
            outputChannel.appendLine(`Search failed: ${result.error}`);
            panel.webview.postMessage({
                command: 'searchResult',
                status: 'error',
                message: result.error
            });
        }
    } catch (error) {
        const errorMsg = `Search exception: ${String(error)}`;
        outputChannel.appendLine(errorMsg);
        panel.webview.postMessage({
            command: 'searchResult',
            status: 'error',
            message: errorMsg
        });
    }
}

async function handleMigrateActiveFile(panel: vscode.WebviewPanel) {
    outputChannel.appendLine('migrateActiveFile command received');
    const editor = vscode.window.activeTextEditor ?? lastActiveEditor;

    if (!editor) {
        vscode.window.showErrorMessage('No active editor found to migrate.');
        panel.webview.postMessage({
            command: 'migrateResult',
            status: 'error',
            message: 'No active editor found'
        });
        return;
    }

    const filePath = editor.document.fileName;
    const content = editor.document.getText();
    const fileName = path.basename(filePath);

    outputChannel.appendLine(`Starting migration for: ${filePath}`);

    // Get API key from .env.keys
    const apiKey = EnvUtils.getElasticApiKey(outputChannel);
    if (!apiKey) {
        const errorMsg = 'ELASTIC_API_KEY not found in ~/.env.keys or environment variables';
        outputChannel.appendLine(errorMsg);
        vscode.window.showErrorMessage(errorMsg);
        panel.webview.postMessage({
            command: 'migrateResult',
            status: 'error',
            message: errorMsg
        });
        return;
    }

    try {
        // Step 1: Index the document to Elasticsearch
        const indexResult = await indexDocument(filePath, content, apiKey);

        if (!indexResult.success) {
            throw new Error(indexResult.error || 'Failed to index document');
        }

        outputChannel.appendLine(`Successfully indexed with doc ID: ${indexResult.docId}`);

        // Step 2: Verify the document exists in Elasticsearch
        outputChannel.appendLine(`Verifying document ${indexResult.docId}...`);
        const verified = await verifyDocument(indexResult.docId, apiKey);

        if (!verified) {
            throw new Error('Document indexed but verification failed');
        }

        outputChannel.appendLine('Document verified in Elasticsearch');

        // Step 3: Archive the local file to ./deleted/
        outputChannel.appendLine(`Archiving local file: ${fileName}`);
        await archiveFileToDeleted(filePath, YAML_KEYS.DELETED_DIR, outputChannel);

        // Step 4: Reopen as virtual document from Elasticsearch
        outputChannel.appendLine('Reopening file as virtual document from Elasticsearch...');
        const index = process.env.ELASTIC_INDEX || 'daily-batch';
        await openVirtualDocument(indexResult.docId, filePath, index);

        // Step 5: Update webview to show the new virtual document
        // Give VS Code a moment to open the document
        setTimeout(() => {
            if (panel && !panel.visible) {
                panel.reveal(vscode.ViewColumn.Beside);
            }
            updateWebviewContext(panel);
        }, 500);

        // Step 6: Success!
        vscode.window.showInformationMessage(`Successfully migrated and archived: ${fileName}`);
        panel.webview.postMessage({
            command: 'migrateResult',
            status: 'success',
            message: `Successfully migrated and archived: ${fileName}`
        });

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
        outputChannel.appendLine(`Migration failed: ${errorMsg}`);
        vscode.window.showErrorMessage(`Migration failed: ${errorMsg}`);
        panel.webview.postMessage({
            command: 'migrateResult',
            status: 'error',
            message: errorMsg
        });
    }
}

async function extractYoutubeVitals(panel: vscode.WebviewPanel) {
    outputChannel.appendLine('extractYoutubeVitals command received');
    const editor = vscode.window.activeTextEditor ?? lastActiveEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor found.');
        panel.webview.postMessage({ command: 'alert', text: 'No active editor found.' });
        return;
    }

    const rawText = editor.document.getText();
    const doc = YAML.parseDocument(rawText);
    
    // Use YamlService to find links
    outputChannel.appendLine('Searching for YouTube links...');
    const { targetNodes, fallbackNodes } = YamlService.findYoutubeLinks(doc);
    outputChannel.appendLine(`Found ${targetNodes.length} target nodes and ${fallbackNodes.length} fallback nodes.`);

    // If we have unprocessed nodes, process ALL of them.
    // If we have NO unprocessed nodes, process the first fallback node (re-run).
    const nodesToProcess = targetNodes.length > 0 ? targetNodes : (fallbackNodes.length > 0 ? [fallbackNodes[0]] : []);

    if (nodesToProcess.length === 0) {
        outputChannel.appendLine('No YouTube links found to process.');
        vscode.window.showErrorMessage('No YouTube link found.');
        panel.webview.postMessage({ command: 'alert', text: 'No YouTube link found.' });
        return;
    }

    // Get API Keys using EnvUtils
    outputChannel.appendLine('Checking API keys...');
    let geminiApiKey = EnvUtils.getGeminiApiKey(outputChannel);
    const youtubeApiKey = EnvUtils.getYoutubeApiKey(outputChannel);

    if (!geminiApiKey) {
        outputChannel.appendLine('GEMINI_API_KEY missing. Prompting user...');
        geminiApiKey = await vscode.window.showInputBox({
            prompt: 'Enter your Gemini API Key',
            password: true,
            ignoreFocusOut: true
        });

        if (!geminiApiKey) {
            outputChannel.appendLine('User cancelled API key input.');
            vscode.window.showErrorMessage('GEMINI_API_KEY is required.');
            panel.webview.postMessage({ command: 'alert', text: 'GEMINI_API_KEY is required.' });
            return;
        }
    }

    if (!youtubeApiKey) {
        outputChannel.appendLine('YOUTUBE_API_KEY missing. Will attempt fallback scraping.');
    }

    try {
        outputChannel.appendLine(`Processing ${nodesToProcess.length} video(s)...`);
        panel.webview.postMessage({ command: 'alert', text: `Extracting vitals for ${nodesToProcess.length} video(s)...` });
        
        // Process in parallel
        await Promise.all(nodesToProcess.map(async (selected) => {
            const youtubeUrl = selected.node.value as string;
            
            // 1. Get Video Details from YouTube API or Scraping
            let videoContext = `YouTube Video URL: ${youtubeUrl}`;
            try {
                const details = await YoutubeService.getVideoDetails(youtubeUrl, youtubeApiKey);
                videoContext += `\n\nVideo Title: ${details.title}\n\nVideo Description: ${details.description}\n\nChannel: ${details.channelTitle}\n\nPublished: ${details.publishedAt}\n\nDuration: ${details.duration}`;
                outputChannel.appendLine(`Fetched details for: ${details.title}`);
            } catch (e) {
                outputChannel.appendLine(`Failed to fetch YouTube details: ${e}`);
                // Fallback to just URL if API fails
            }

            // 2. Call Gemini
            const prompt = `Analyze the following YouTube video information and extract the title, summary, key points, and speakers.
    
${videoContext}

Return as JSON with keys: title, summary, keyPoints (array of strings), speakers (array of strings).`;

            const vitals = await callGemini({
                apiKey: geminiApiKey,
                prompt: prompt,
                logger: (msg) => outputChannel.appendLine(msg)
            });

            // 3. Update YAML
            YamlService.updateVitals(doc, selected.node, selected.path, vitals);
        }));

        const updatedText = doc.toString();
        const fullRange = new vscode.Range(
            editor.document.positionAt(0),
            editor.document.positionAt(rawText.length)
        );
        const edit = new vscode.WorkspaceEdit();
        edit.replace(editor.document.uri, fullRange, updatedText);
        await vscode.workspace.applyEdit(edit);
        await editor.document.save();
        
        panel.webview.postMessage({ command: 'alert', text: 'Vitals extracted!' });
        // Context update will happen automatically via onDidChangeTextDocument

    } catch (e) {
        vscode.window.showErrorMessage('Error: ' + e);
        outputChannel.appendLine('Error extracting vitals: ' + e);
        panel.webview.postMessage({ command: 'alert', text: 'Error: ' + e });
    }
}

export function deactivate() {}
