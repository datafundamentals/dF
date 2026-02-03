import '@df/ui-lit/df-dashboard';
import {
  setDashboardError,
  setDashboardLoading,
  setDashboardSites,
} from '@df/state';
import type {PubSiteEntry} from '@df/types';

declare const acquireVsCodeApi: undefined | (() => { postMessage: (message: unknown) => void });

const vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : undefined;

function requestSites() {
  setDashboardLoading();
  vscode?.postMessage({ command: 'requestSites' });
}

window.addEventListener('message', (event) => {
  const message = event.data;
  if (message?.command === 'updateSites') {
    const payload = message.data ?? {};
    const sites = Array.isArray(payload.sites) ? (payload.sites as PubSiteEntry[]) : [];
    const lastUpdated = typeof payload.lastUpdated === 'number' ? payload.lastUpdated : undefined;
    setDashboardSites(sites, lastUpdated);
    return;
  }

  if (message?.command === 'updateSitesError') {
    const errorMessage = (message.data?.message ?? 'Failed to load sites').toString();
    setDashboardError(errorMessage);
  }
});

document.addEventListener('df-dashboard-refresh', () => {
  requestSites();
});

if (vscode) {
  requestSites();
} else {
  setDashboardError('VS Code API unavailable');
}
