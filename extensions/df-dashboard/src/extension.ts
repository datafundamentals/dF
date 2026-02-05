import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
type NodeUtilsModule = typeof import('@df/node-utils');

const outputChannel = vscode.window.createOutputChannel('DF Dashboard');
let nodeUtilsPromise: Promise<NodeUtilsModule> | undefined;

function loadNodeUtils(): Promise<NodeUtilsModule> {
  if (!nodeUtilsPromise) {
    const dynamicImport = new Function(
      'specifier',
      'return import(specifier)',
    ) as (specifier: string) => Promise<NodeUtilsModule>;
    nodeUtilsPromise = dynamicImport('@df/node-utils');
  }
  return nodeUtilsPromise;
}

export function activate(context: vscode.ExtensionContext) {
  outputChannel.appendLine('=== DF Dashboard Extension Activated ===');
  outputChannel.appendLine(getUiBundleInfo(context.extensionUri));

  let currentPanel: vscode.WebviewPanel | undefined;

  context.subscriptions.push(
    vscode.commands.registerCommand('df.openDashboard', async () => {
      const columnToShowIn = vscode.ViewColumn.Beside;

      if (currentPanel) {
        currentPanel.reveal(columnToShowIn);
        await sendSitesUpdate(currentPanel, context.extensionPath);
        return;
      }

      outputChannel.appendLine(getUiBundleInfo(context.extensionUri));

      currentPanel = vscode.window.createWebviewPanel(
        'dfDashboard',
        'Dashboard',
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
            await sendSitesUpdate(currentPanel, context.extensionPath);
          }
          if (message?.command === 'repairFrontmatter' && currentPanel) {
            await handleRepairFrontmatter(currentPanel, context.extensionPath, message.data?.siteId);
          }
          if (message?.command === 'addAppSiteTarget' && currentPanel) {
            await handleAppSiteTargetMutation(
              currentPanel,
              context.extensionPath,
              message.data,
              'add',
            );
          }
          if (message?.command === 'removeAppSiteTarget' && currentPanel) {
            await handleAppSiteTargetMutation(
              currentPanel,
              context.extensionPath,
              message.data,
              'remove',
            );
          }
        },
        undefined,
        context.subscriptions,
      );

      await sendSitesUpdate(currentPanel, context.extensionPath);
    }),
  );
}

async function sendSitesUpdate(panel: vscode.WebviewPanel, extensionPath: string) {
  const {
    loadSites,
    getGitStatus,
    getFirebaseApps,
    enhanceAppWithChanges,
  } = await loadNodeUtils();
  const rootPath = resolveRootPath(extensionPath);

  if (!rootPath) {
    panel.webview.postMessage({
      command: 'updateSitesError',
      data: {message: 'No SITES.yaml found (checked extension root and workspace).'},
    });
    return;
  }

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

  // We change logic for git status to match root path logic
  const dfRepoGitStatus = await getGitStatus(rootPath);

  // Scan for firebase apps and check for changes since release
  const firebaseApps = await getFirebaseApps(rootPath);
  const appsWithChanges = await Promise.all(
    firebaseApps.map((app) => enhanceAppWithChanges(rootPath!, app)),
  );

  panel.webview.postMessage({
    command: 'updateSites',
    data: {
      sites,
      lastUpdated: Date.now(),
      dfRepoStatus: {
        isInternal: true,
        hasUncommittedChanges: dfRepoGitStatus.hasUncommittedChanges,
        untrackedFiles: dfRepoGitStatus.untrackedFiles,
        modifiedFiles: dfRepoGitStatus.modifiedFiles,
      },
      apps: appsWithChanges,
    },
  });
}

async function handleRepairFrontmatter(panel: vscode.WebviewPanel, extensionPath: string, siteId?: string) {
  const {
    loadSites,
    repairSiteFrontmatter,
  } = await loadNodeUtils();
  const rootPath = resolveRootPath(extensionPath);

  if (!rootPath) {
    return;
  }

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

async function handleAppSiteTargetMutation(
  panel: vscode.WebviewPanel,
  extensionPath: string,
  data: unknown,
  mode: 'add' | 'remove',
) {
  const {updateSiteAppTarget} = await loadNodeUtils();
  const rootPath = resolveRootPath(extensionPath);
  if (!rootPath) {
    panel.webview.postMessage({
      command: 'updateSitesError',
      data: {message: 'No SITES.yaml found (checked extension root and workspace).'},
    });
    return;
  }

  const siteId =
    data && typeof data === 'object' && 'siteId' in data && typeof data.siteId === 'string'
      ? data.siteId.trim()
      : '';
  const appName =
    data && typeof data === 'object' && 'appName' in data && typeof data.appName === 'string'
      ? data.appName.trim()
      : '';

  if (!siteId || !appName) {
    panel.webview.postMessage({
      command: 'updateSitesError',
      data: {message: 'Missing siteId or appName for deploy target update.'},
    });
    return;
  }

  const sitesYamlPath = path.join(rootPath, 'SITES.yaml');
  const result = updateSiteAppTarget({
    sitesYamlPath,
    siteId,
    appName,
    mode,
  });

  if (result.errorMessage) {
    outputChannel.appendLine(`App target update error: ${result.errorMessage}`);
    panel.webview.postMessage({
      command: 'updateSitesError',
      data: {message: result.errorMessage},
    });
    return;
  }

  outputChannel.appendLine(
    `${mode === 'add' ? 'Added' : 'Removed'} app "${appName}" ${mode === 'add' ? 'to' : 'from'} site "${siteId}"`,
  );

  await sendSitesUpdate(panel, extensionPath);
}

function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
  const uiDistUri = vscode.Uri.joinPath(extensionUri, '..', '..', 'packages', 'ui-lit', 'dist');
  const bundleHash = getUiBundleHash(extensionUri);
  const baseScriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(uiDistUri, 'df-dashboard.bundled.js'),
  );
  const scriptUri = bundleHash ? `${baseScriptUri}?v=${bundleHash}` : `${baseScriptUri}?v=${Date.now()}`;

  const nonce = getNonce();

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' ${webview.cspSource}; font-src ${webview.cspSource}; connect-src ${webview.cspSource};">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <style>
        body { padding: 0; margin: 0; background: transparent; }
    </style>
</head>
<body>
    <df-dashboard></df-dashboard>

    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        
        // Listen for messages from the extension
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'updateSites':
                    window.dispatchEvent(new CustomEvent('df-dashboard-update-state', { detail: message.data }));
                    break;
                case 'updateSitesError':
                    window.dispatchEvent(new CustomEvent('df-dashboard-error', { detail: message.data }));
                    break;
            }
        });

        // Request initial data
        vscode.postMessage({ command: 'requestSites' });
        
        // Listen for refresh requests from UI
        window.addEventListener('df-dashboard-refresh', () => {
             vscode.postMessage({ command: 'refresh' });
        });

        // Listen for repair frontmatter requests from UI
        window.addEventListener('df-dashboard-repair-frontmatter', (event) => {
             vscode.postMessage({ command: 'repairFrontmatter', data: event.detail });
        });

        // Listen for app/site deploy target changes from UI
        window.addEventListener('df-dashboard-app-card-add-site', (event) => {
             vscode.postMessage({ command: 'addAppSiteTarget', data: event.detail });
        });

        window.addEventListener('df-dashboard-app-card-remove-site', (event) => {
             vscode.postMessage({ command: 'removeAppSiteTarget', data: event.detail });
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

function resolveRootPath(extensionPath: string): string | undefined {
  const dFMonorepoRoot = path.resolve(extensionPath, '..', '..');
  const dFSitesYaml = path.join(dFMonorepoRoot, 'SITES.yaml');

  if (fs.existsSync(dFSitesYaml)) {
    return dFMonorepoRoot;
  }

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders && workspaceFolders.length > 0) {
    return workspaceFolders[0].uri.fsPath;
  }

  return undefined;
}

function getUiBundleInfo(extensionUri: vscode.Uri): string {
  const uiBundlePath = path.join(
    extensionUri.fsPath,
    '..',
    '..',
    'packages',
    'ui-lit',
    'dist',
    'df-dashboard.bundled.js',
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
    'df-dashboard.bundled.js',
  );

  if (!fs.existsSync(uiBundlePath)) {
    return null;
  }

  const buffer = fs.readFileSync(uiBundlePath);
  return crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 12);
}
