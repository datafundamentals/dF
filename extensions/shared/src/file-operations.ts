import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Logger interface for logging operations
 */
export interface Logger {
    appendLine(message: string): void;
}

/**
 * Archive a file to the ./deleted/ directory
 * Reusable helper for extensions that need to archive files
 *
 * @param filePath - Absolute path to the file to archive
 * @param deletedDirName - Name of the deleted directory (default: 'deleted')
 * @param logger - Optional logger for output
 */
export async function archiveFileToDeleted(
    filePath: string,
    deletedDirName: string = 'deleted',
    logger?: Logger
): Promise<void> {
    const fileName = path.basename(filePath);
    const fileDir = path.dirname(filePath);
    const deletedDir = path.join(fileDir, deletedDirName);

    // Create deleted directory if it doesn't exist
    try {
        await vscode.workspace.fs.createDirectory(vscode.Uri.file(deletedDir));
        logger?.appendLine(`Created deleted directory: ${deletedDir}`);
    } catch {
        // Directory might already exist, that's ok
        logger?.appendLine(`Deleted directory exists: ${deletedDir}`);
    }

    const targetPath = path.join(deletedDir, fileName);
    const sourceUri = vscode.Uri.file(filePath);
    const targetUri = vscode.Uri.file(targetPath);

    // Close all editor tabs for the file being archived
    const tabs = vscode.window.tabGroups.all.flatMap(group => group.tabs);
    const fileTabs = tabs.filter(tab => {
        if (tab.input instanceof vscode.TabInputText) {
            return tab.input.uri.fsPath === filePath;
        }
        return false;
    });

    logger?.appendLine(`Closing ${fileTabs.length} tabs for: ${fileName}`);

    for (const tab of fileTabs) {
        await vscode.window.tabGroups.close(tab);
    }

    // Move the file
    await vscode.workspace.fs.rename(sourceUri, targetUri, { overwrite: true });
    logger?.appendLine(`Archived file to: ${targetPath}`);
}
