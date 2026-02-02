import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import {loadSites, repairSiteFrontmatter} from '@df/node-utils';

const outputChannel = vscode.window.createOutputChannel('DF Pub Control Panel');

export function activate(context: vscode.ExtensionContext) {
  outputChannel.appendLine('=== DF Pub Control Panel Extension Activated ===');
  outputChannel.appendLine(getUiBundleInfo(context.extensionUri));

  let currentPanel: vscode.WebviewPanel | undefined;

  context.subscriptions.push(
    vscode.commands.registerCommand('df.openPubControlPanel', async () => {
      const columnToShowIn = vscode.ViewColumn.Beside;

      if (currentPanel) {
        currentPanel.reveal(columnToShowIn);
        await sendSitesUpdate(currentPanel);
        return;
      }

      outputChannel.appendLine(getUiBundleInfo(context.extensionUri));

      currentPanel = vscode.window.createWebviewPanel(
        'dfPubControlPanel',
        'Pub Control Panel',
        columnToShowIn,
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.file(path.join(context.extensionPath, 'media', 'ui')),
            vscode.Uri.joinPath(context.extensionUri, '..', '..', 'packages', 'ui-lit', 'dist'),
          ],
        },
      );

      currentPanel.webview.html = getWebviewContent(currentPanel.webview, context.extensionUri);

      currentPanel.onDidDispose(
        () => {
          currentPanel = undefined;
        },
        null,
        context.subscriptions,
      );

      currentPanel.webview.onDidReceiveMessage(
        async (message) => {
          if ((message?.command === 'requestSites' || message?.command === 'refresh') && currentPanel) {
            await sendSitesUpdate(currentPanel);
          }
          if (message?.command === 'repairFrontmatter' && currentPanel) {
            await handleRepairFrontmatter(currentPanel, message.data?.siteId);
          }
        },
        undefined,
        context.subscriptions,
      );

      await sendSitesUpdate(currentPanel);
    }),
  );
}

async function sendSitesUpdate(panel: vscode.WebviewPanel) {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    panel.webview.postMessage({
      command: 'updateSitesError',
      data: {message: 'No workspace folder open.'},
    });
    return;
  }

  const rootPath = workspaceFolders[0].uri.fsPath;
  const sitesYamlPath = path.join(rootPath, 'SITES.yaml');
  const sitesDirectory = path.join(path.dirname(rootPath), 'sites');

  const {sites, errorMessage} = await loadSites({
    sitesYamlPath,
    sitesDirectory,
    onWarning: (message) => outputChannel.appendLine(`WARNING: ${message}`),
  });

  if (errorMessage) {
    outputChannel.appendLine(`Error: ${errorMessage}`);
    panel.webview.postMessage({
      command: 'updateSitesError',
      data: {message: errorMessage},
    });
    return;
  }

  const withContentChanges = sites.filter((s) => s.contentChanges).length;
  const withContentRootChanges = sites.filter((s) => s.contentRootChanges).length;
  outputChannel.appendLine(
    `Loaded ${sites.length} sites (${withContentChanges} with site repo changes, ${withContentRootChanges} with content repo changes)`,
  );

  panel.webview.postMessage({
    command: 'updateSites',
    data: {
      sites,
      lastUpdated: Date.now(),
    },
  });
}

async function handleRepairFrontmatter(panel: vscode.WebviewPanel, siteId?: string) {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return;
  }

  const rootPath = workspaceFolders[0].uri.fsPath;
  const sitesYamlPath = path.join(rootPath, 'SITES.yaml');
  const sitesDirectory = path.join(path.dirname(rootPath), 'sites');

  const {sites, errorMessage} = await loadSites({
    sitesYamlPath,
    sitesDirectory,
    onWarning: (message) => outputChannel.appendLine(`WARNING: ${message}`),
  });

  if (errorMessage) {
    outputChannel.appendLine(`Repair error: ${errorMessage}`);
    return;
  }

  const workspaceRoot = path.dirname(sitesYamlPath);
  const repairedSites = await Promise.all(
    sites.map(async (site) => {
      if (siteId && site.id !== siteId) {
        return site;
      }
      if (!site.contentRoot) {
        return site;
      }
      try {
        const repaired = await repairSiteFrontmatter(workspaceRoot, site);
        outputChannel.appendLine(
          `Repaired frontmatter for ${site.id}: pleaseReview=${repaired.frontmatterStatus?.pleaseReviewCount ?? 0}`,
        );
        return repaired;
      } catch (err) {
        outputChannel.appendLine(`Repair failed for ${site.id}: ${err}`);
        return site;
      }
    }),
  );

  panel.webview.postMessage({
    command: 'updateSites',
    data: {
      sites: repairedSites,
      lastUpdated: Date.now(),
    },
  });
}

function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
  const uiDistUri = vscode.Uri.joinPath(extensionUri, '..', '..', 'packages', 'ui-lit', 'dist');
  const bundleHash = getUiBundleHash(extensionUri);
  const baseScriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(uiDistUri, 'df-pub-control-panel.bundled.js'),
  );
  const scriptUri = bundleHash ? `${baseScriptUri}?v=${bundleHash}` : `${baseScriptUri}?v=${Date.now()}`;

  const nonce = getNonce();

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' ${webview.cspSource}; font-src ${webview.cspSource}; connect-src ${webview.cspSource};">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pub Control Panel</title>
    <style>
        body { padding: 0; margin: 0; background: transparent; }
    </style>
</head>
<body>
    <df-pub-control-panel></df-pub-control-panel>

    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        
        // Listen for messages from the extension
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'updateSites':
                    window.dispatchEvent(new CustomEvent('df-pub-update-state', { detail: message.data }));
                    break;
                case 'updateSitesError':
                    window.dispatchEvent(new CustomEvent('df-pub-error', { detail: message.data }));
                    break;
            }
        });

        // Request initial data
        vscode.postMessage({ command: 'requestSites' });
        
        // Listen for refresh requests from UI
        window.addEventListener('df-pub-control-panel-refresh', () => {
             vscode.postMessage({ command: 'refresh' });
        });

        // Listen for repair frontmatter requests from UI
        window.addEventListener('df-pub-control-panel-repair-frontmatter', (event) => {
             vscode.postMessage({ command: 'repairFrontmatter', data: event.detail });
        });

    </script>
    <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export function deactivate() {}

function getUiBundleInfo(extensionUri: vscode.Uri): string {
  const uiBundlePath = path.join(
    extensionUri.fsPath,
    '..',
    '..',
    'packages',
    'ui-lit',
    'dist',
    'df-pub-control-panel.bundled.js',
  );

  if (!fs.existsSync(uiBundlePath)) {
    return `UI bundle missing: ${uiBundlePath}`;
  }

  const stats = fs.statSync(uiBundlePath);
  const buffer = fs.readFileSync(uiBundlePath);
  const hash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 12);

  return `UI bundle: ${path.basename(uiBundlePath)} size=${stats.size} mtime=${stats.mtime.toISOString()} sha256=${hash}`;
}

function getUiBundleHash(extensionUri: vscode.Uri): string | null {
  const uiBundlePath = path.join(
    extensionUri.fsPath,
    '..',
    '..',
    'packages',
    'ui-lit',
    'dist',
    'df-pub-control-panel.bundled.js',
  );

  if (!fs.existsSync(uiBundlePath)) {
    return null;
  }

  const buffer = fs.readFileSync(uiBundlePath);
  return crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 12);
}
