import '@df/ui-lit/df-pub-control-panel';
import {
  setPubControlPanelError,
  setPubControlPanelLoading,
  setPubControlPanelSites,
} from '@df/state';
import type {PubSiteEntry} from '@df/types';

declare const acquireVsCodeApi: undefined | (() => { postMessage: (message: unknown) => void });

const vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : undefined;

function requestSites() {
  setPubControlPanelLoading();
  vscode?.postMessage({ command: 'requestSites' });
}

window.addEventListener('message', (event) => {
  const message = event.data;
  if (message?.command === 'updateSites') {
    const payload = message.data ?? {};
    const sites = Array.isArray(payload.sites) ? (payload.sites as PubSiteEntry[]) : [];
    const lastUpdated = typeof payload.lastUpdated === 'number' ? payload.lastUpdated : undefined;
    setPubControlPanelSites(sites, lastUpdated);
    return;
  }

  if (message?.command === 'updateSitesError') {
    const errorMessage = (message.data?.message ?? 'Failed to load sites').toString();
    setPubControlPanelError(errorMessage);
  }
});

document.addEventListener('df-pub-control-panel-refresh', () => {
  requestSites();
});

if (vscode) {
  requestSites();
} else {
  setPubControlPanelError('VS Code API unavailable');
}
