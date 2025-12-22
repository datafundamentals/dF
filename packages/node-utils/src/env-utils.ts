import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

/**
 * Output channel interface for logging (compatible with VS Code OutputChannel)
 */
export interface Logger {
    appendLine(message: string): void;
}

/**
 * Environment utilities for reading API keys from ~/.env.keys
 * Shared across all dF extensions and Node.js tools
 */
export class EnvUtils {
    static getGeminiApiKey(logger?: Logger): string | undefined {
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
                    logger?.appendLine(`Error reading ${filePath}: ${e}`);
                }
            }
            return undefined;
        };

        // 1. Try Home Directory .env.keys
        if (!apiKey) {
            const homeEnvPath = path.join(os.homedir(), '.env.keys');
            apiKey = parseKey(homeEnvPath);
            if (apiKey) {
                logger?.appendLine('Loaded GEMINI_API_KEY from ~/.env.keys');
            }
        }

        // 2. Try loading from .env.keys in workspace root (if workspace is available)
        // Note: workspace.workspaceFolders is VS Code-specific, so this is optional
        if (!apiKey) {
            try {
                // For VS Code extensions, this would come from vscode.workspace.workspaceFolders
                // For CLI tools, this could be process.cwd()
                const workspaceRoot = process.cwd();
                const envKeysPath = path.join(workspaceRoot, '.env.keys');
                apiKey = parseKey(envKeysPath);
                if (apiKey) {
                    logger?.appendLine('Loaded GEMINI_API_KEY from workspace .env.keys');
                }
            } catch (e) {
                logger?.appendLine(`Error reading workspace .env.keys: ${e}`);
            }
        }
        return apiKey;
    }

    static getYoutubeApiKey(logger?: Logger): string | undefined {
        // 1. Try environment variable
        let apiKey = process.env.YOUTUBE_API_KEY;
        if (apiKey) return apiKey;

        // Helper to parse key from file
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
                    logger?.appendLine(`Error reading ${filePath}: ${e}`);
                }
            }
            return undefined;
        };

        // 2. Try Home Directory .env.keys
        const homeEnvPath = path.join(os.homedir(), '.env.keys');
        apiKey = parseKey(homeEnvPath, 'YOUTUBE_API_KEY');
        if (apiKey) {
            logger?.appendLine('Loaded YOUTUBE_API_KEY from ~/.env.keys');
            return apiKey;
        }

        // 3. Try .env file in workspace root
        try {
            const workspaceRoot = process.cwd();
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
            logger?.appendLine(`Error reading .env: ${e}`);
        }

        return undefined;
    }

    static getElasticApiKey(logger?: Logger): string | undefined {
        // 1. Try environment variable
        let apiKey = process.env.ELASTIC_API_KEY;
        if (apiKey) return apiKey;

        // Helper to parse key from file
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
                    logger?.appendLine(`Error reading ${filePath}: ${e}`);
                }
            }
            return undefined;
        };

        // 2. Try Home Directory .env.keys
        const homeEnvPath = path.join(os.homedir(), '.env.keys');
        apiKey = parseKey(homeEnvPath, 'ELASTIC_API_KEY');
        if (apiKey) {
            logger?.appendLine('Loaded ELASTIC_API_KEY from ~/.env.keys');
            return apiKey;
        }

        // 3. Try workspace .env.keys
        try {
            const workspaceRoot = process.cwd();
            const envKeysPath = path.join(workspaceRoot, '.env.keys');
            apiKey = parseKey(envKeysPath, 'ELASTIC_API_KEY');
            if (apiKey) {
                logger?.appendLine('Loaded ELASTIC_API_KEY from workspace .env.keys');
                return apiKey;
            }
        } catch (e) {
            logger?.appendLine(`Error reading workspace .env.keys: ${e}`);
        }

        return undefined;
    }
}
