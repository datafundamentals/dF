import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

interface SiteConfig {
    ignore?: boolean;
    url?: string;
    description?: string;
    [key: string]: any;
}

interface SitesYaml {
    sites: { [key: string]: SiteConfig };
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "df-pub-control-panel" is now active!');

    let currentPanel: vscode.WebviewPanel | undefined = undefined;

    context.subscriptions.push(
        vscode.commands.registerCommand('df.openPubControlPanel', () => {
            const columnToShowIn = vscode.ViewColumn.Beside;

            if (currentPanel) {
                currentPanel.reveal(columnToShowIn);
                // Refresh content when revealing
                updatePanelContent(currentPanel);
            } else {
                currentPanel = vscode.window.createWebviewPanel(
                    'dfPubControlPanel',
                    'Pub Control Panel',
                    columnToShowIn,
                    {
                        enableScripts: true
                    }
                );

                updatePanelContent(currentPanel);

                currentPanel.onDidDispose(
                    () => {
                        currentPanel = undefined;
                    },
                    null,
                    context.subscriptions
                );
            }
        })
    );
}

function updatePanelContent(panel: vscode.WebviewPanel) {
    console.log('Updating panel content...');
    const sites = getSites();
    panel.webview.html = getWebviewContent(sites);
}

function getSites(): string[] {
    try {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            console.error('No workspace folder open');
            return [];
        }

        const rootPath = workspaceFolders[0].uri.fsPath;
        const sitesYamlPath = path.join(rootPath, 'SITES.yaml');

        if (!fs.existsSync(sitesYamlPath)) {
            console.error(`SITES.yaml not found at ${sitesYamlPath}`);
            return [];
        }

        const fileContent = fs.readFileSync(sitesYamlPath, 'utf8');
        const parsed = yaml.load(fileContent) as SitesYaml;

        if (!parsed || !parsed.sites) {
            console.error('Invalid SITES.yaml structure');
            return [];
        }

        const siteKeys = Object.keys(parsed.sites).filter(key => {
            const site = parsed.sites[key];
            return !site.ignore;
        });
        
        console.log(`Found ${siteKeys.length} sites`);
        return siteKeys;

    } catch (error) {
        console.error('Error reading SITES.yaml:', error);
        return [];
    }
}

function getWebviewContent(sites: string[]) {
    const siteListHtml = sites.map(site => `<li>${site}</li>`).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pub Control Panel</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 20px; }
        ul { list-style-type: none; padding: 0; }
        li { padding: 8px 0; border-bottom: 1px solid #ccc; font-size: 1.1em; }
    </style>
</head>
<body>
    <h1>Pub Control Panel</h1>
    <p>Sites list:</p>
    <ul>
        ${sites.length > 0 ? siteListHtml : '<li>No sites found (or error reading SITES.yaml)</li>'}
    </ul>
</body>
</html>`;
}

export function deactivate() {}

