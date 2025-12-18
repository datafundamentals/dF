import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

export class EnvUtils {
    static getGeminiApiKey(outputChannel?: vscode.OutputChannel): string | undefined {
        let apiKey = process.env.GEMINI_API_KEY;

        // Helper to parse key from file
        const parseKey = (filePath: string): string | undefined => {
            if (fs.existsSync(filePath)) {
                try {
                    const envContent = fs.readFileSync(filePath, 'utf8');
                    // Simple parsing for GEMINI_API_KEY=value
                    const match = envContent.match(/^GEMINI_API_KEY=(.*)$/m);
                    if (match) {
                        let key = match[1].trim();
                        // Remove quotes if present
                        if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
                            key = key.slice(1, -1);
                        }
                        return key;
                    }
                } catch (e) {
                    outputChannel?.appendLine(`Error reading ${filePath}: ${e}`);
                }
            }
            return undefined;
        };

        // 1. Try Home Directory .env.keys
        if (!apiKey) {
            const homeEnvPath = path.join(os.homedir(), '.env.keys');
            apiKey = parseKey(homeEnvPath);
            if (apiKey) {
                outputChannel?.appendLine('Loaded GEMINI_API_KEY from ~/.env.keys');
            }
        }

        // 2. Try loading from .env.keys in workspace root
        if (!apiKey && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            try {
                const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
                const envKeysPath = path.join(workspaceRoot, '.env.keys');
                apiKey = parseKey(envKeysPath);
                if (apiKey) {
                    outputChannel?.appendLine('Loaded GEMINI_API_KEY from workspace .env.keys');
                }
            } catch (e) {
                outputChannel?.appendLine(`Error reading workspace .env.keys: ${e}`);
            }
        }
        return apiKey;
    }

    static getYoutubeApiKey(outputChannel?: vscode.OutputChannel): string | undefined {
        // 1. Try VS Code configuration
        const config = vscode.workspace.getConfiguration('dfMarkdownTools');
        let apiKey = config.get<string>('youtubeApiKey');

        if (apiKey) return apiKey;

        // 2. Try environment variable
        apiKey = process.env.YOUTUBE_API_KEY;
        if (apiKey) return apiKey;

        // Helper to parse key from file (duplicated for now to keep methods independent)
        const parseKey = (filePath: string, keyName: string): string | undefined => {
            if (fs.existsSync(filePath)) {
                try {
                    const envContent = fs.readFileSync(filePath, 'utf8');
                    const regex = new RegExp(`^${keyName}=(.*)$`, 'm');
                    const match = envContent.match(regex);
                    if (match) {
                        let key = match[1].trim();
                        if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
                            key = key.slice(1, -1);
                        }
                        return key;
                    }
                } catch (e) {
                    outputChannel?.appendLine(`Error reading ${filePath}: ${e}`);
                }
            }
            return undefined;
        };

        // 3. Try Home Directory .env.keys
        const homeEnvPath = path.join(os.homedir(), '.env.keys');
        apiKey = parseKey(homeEnvPath, 'YOUTUBE_API_KEY');
        if (apiKey) {
            outputChannel?.appendLine('Loaded YOUTUBE_API_KEY from ~/.env.keys');
            return apiKey;
        }

        // 4. Try .env file in workspace root
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            try {
                const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
                const envPath = path.join(workspaceRoot, '.env');
                if (fs.existsSync(envPath)) {
                    const envContent = fs.readFileSync(envPath, 'utf8');
                    const match = envContent.match(/YOUTUBE_API_KEY=(.*)/);
                    if (match) {
                        apiKey = match[1].trim();
                        return apiKey;
                    }
                }
            } catch (e) {
                outputChannel?.appendLine(`Error reading .env: ${e}`);
            }
        }
        return undefined;
    }
}
