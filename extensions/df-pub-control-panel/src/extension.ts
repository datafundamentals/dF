import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import type {PubSiteEntry} from '@df/types';

interface SiteConfig {
  ignore?: boolean;
  url?: unknown;
  description?: unknown;
  host?: unknown;
  status?: unknown;
  purpose?: unknown;
  theme?: unknown;
  content?: unknown;
  contentRoot?: unknown;
  since?: unknown;
  [key: string]: unknown;
}

interface SitesYaml {
  sites?: Record<string, SiteConfig>;
}

const outputChannel = vscode.window.createOutputChannel('DF Pub Control Panel');

export function activate(context: vscode.ExtensionContext) {
  outputChannel.appendLine('=== DF Pub Control Panel Extension Activated ===');

  let currentPanel: vscode.WebviewPanel | undefined;

  context.subscriptions.push(
    vscode.commands.registerCommand('df.openPubControlPanel', () => {
      const columnToShowIn = vscode.ViewColumn.Beside;

      if (currentPanel) {
        currentPanel.reveal(columnToShowIn);
        sendSitesUpdate(currentPanel);
        return;
      }

      currentPanel = vscode.window.createWebviewPanel(
        'dfPubControlPanel',
        'Pub Control Panel',
        columnToShowIn,
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.file(path.join(context.extensionPath, 'media', 'ui')),
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
        (message) => {
          if (message?.command === 'requestSites' && currentPanel) {
            sendSitesUpdate(currentPanel);
          }
        },
        undefined,
        context.subscriptions,
      );

      sendSitesUpdate(currentPanel);
    }),
  );
}

function sendSitesUpdate(panel: vscode.WebviewPanel) {
  const {sites, errorMessage} = loadSites();

  if (errorMessage) {
    panel.webview.postMessage({
      command: 'updateSitesError',
      data: {message: errorMessage},
    });
    return;
  }

  panel.webview.postMessage({
    command: 'updateSites',
    data: {
      sites,
      lastUpdated: Date.now(),
    },
  });
}

function loadSites(): {sites: PubSiteEntry[]; errorMessage?: string} {
  try {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return {sites: [], errorMessage: 'No workspace folder open.'};
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const sitesYamlPath = path.join(rootPath, 'SITES.yaml');

    if (!fs.existsSync(sitesYamlPath)) {
      return {sites: [], errorMessage: `SITES.yaml not found at ${sitesYamlPath}`};
    }

    const fileContent = fs.readFileSync(sitesYamlPath, 'utf8');
    const parsed = yaml.load(fileContent) as SitesYaml | undefined;

    if (!parsed?.sites) {
      return {sites: [], errorMessage: 'Invalid SITES.yaml structure.'};
    }

    const sites = Object.entries(parsed.sites)
      .filter(([, site]) => !site?.ignore)
      .map(([id, site]) => mapSiteEntry(id, site));

    outputChannel.appendLine(`Loaded ${sites.length} sites.`);
    return {sites};
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error reading SITES.yaml.';
    outputChannel.appendLine(`Error reading SITES.yaml: ${message}`);
    return {sites: [], errorMessage: message};
  }
}

function mapSiteEntry(id: string, site: SiteConfig): PubSiteEntry {
  const statusEntries = Array.isArray(site.status)
    ? site.status.filter((entry) => typeof entry === 'string')
    : site.status
      ? [String(site.status)]
      : undefined;

  return {
    id,
    url: typeof site.url === 'string' ? site.url : undefined,
    description: typeof site.description === 'string' ? site.description : undefined,
    host: typeof site.host === 'string' ? site.host : undefined,
    status: statusEntries,
    purpose: typeof site.purpose === 'string' ? site.purpose : undefined,
    theme: typeof site.theme === 'string' ? site.theme : undefined,
    content: typeof site.content === 'string' ? site.content : undefined,
    contentRoot: typeof site.contentRoot === 'string' ? site.contentRoot : undefined,
    since: typeof site.since === 'string' ? site.since : undefined,
  };
}

function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
  const uiDistPath = vscode.Uri.joinPath(extensionUri, 'media', 'ui');
  const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(uiDistPath, 'assets', 'index.js'));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src ${webview.cspSource}; font-src ${webview.cspSource};">
  <title>Pub Control Panel</title>
</head>
<body>
  <df-pub-control-panel></df-pub-control-panel>
  <script type="module" src="${scriptUri}"></script>
</body>
</html>`;
}

export function deactivate() {}
