/**
 * Pub Control Panel UI
 * Presentation-only component that renders site metadata from @df/state
 */

import {LitElement, html, css, nothing} from 'lit';
import {customElement} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import {
  pubControlPanelState,
  setPubControlPanelSites,
  setPubControlPanelError,
} from '@df/state';

import '@material/web/button/filled-button.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/checkbox/checkbox.js';

@customElement('df-pub-control-panel')
export class DfPubControlPanel extends SignalWatcher(LitElement) {
  override connectedCallback() {
    super.connectedCallback();
    // Listen for state updates from the VS Code extension
    window.addEventListener('df-pub-update-state', this.handleStateUpdate);
    window.addEventListener('df-pub-error', this.handleErrorUpdate);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('df-pub-update-state', this.handleStateUpdate);
    window.removeEventListener('df-pub-error', this.handleErrorUpdate);
  }

  private handleStateUpdate = (event: Event) => {
    const customEvent = event as CustomEvent;
    const {sites, lastUpdated} = customEvent.detail;
    setPubControlPanelSites(sites, lastUpdated);
  };

  private handleErrorUpdate = (event: Event) => {
    const customEvent = event as CustomEvent;
    const {message} = customEvent.detail;
    setPubControlPanelError(message);
  };

  static override styles = css`
    :host {
      display: block;
      padding: 16px;
      font-family: var(--vscode-font-family, 'Segoe UI', sans-serif);
      color: var(--vscode-foreground, var(--md-sys-color-on-surface, #1f1f1f));
      background: var(--vscode-editor-background, var(--md-sys-color-surface, #fff));
      box-sizing: border-box;
    }

    .container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 900px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .title-block {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    h1 {
      margin: 0;
      font-size: 1.35rem;
      font-weight: 600;
    }

    .subtitle {
      margin: 0;
      font-size: 0.9rem;
      opacity: 0.7;
    }

    .status-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      opacity: 0.7;
    }

    .status-row.error {
      color: var(--vscode-errorForeground, #d93025);
      opacity: 1;
    }

    .site-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
    }

    .site-card {
      background: var(--vscode-sideBar-background, rgba(255, 255, 255, 0.04));
      border: 1px solid var(--vscode-panel-border, rgba(255, 255, 255, 0.12));
      border-radius: 10px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .site-id {
      font-weight: 600;
      font-size: 0.95rem;
      word-break: break-word;
    }

    .site-meta {
      font-size: 0.8rem;
      opacity: 0.75;
      word-break: break-word;
    }

    .site-status {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 0.8rem;
      opacity: 0.8;
    }

    .git-status-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
    }

    .git-status-label {
      color: var(--vscode-foreground, var(--md-sys-color-on-surface, #1f1f1f));
      opacity: 0.9;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 999px;
      background: var(--vscode-badge-background, rgba(90, 90, 90, 0.3));
      color: var(--vscode-badge-foreground, #fff);
      font-size: 0.75rem;
      width: fit-content;
    }

    md-filled-button {
      --md-filled-button-container-color: var(--vscode-button-background, #0e639c);
      --md-filled-button-label-text-color: var(--vscode-button-foreground, #fff);
    }
  `;

  private handleRefresh() {
    this.dispatchEvent(
      new CustomEvent('df-pub-control-panel-refresh', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render() {
    const state = pubControlPanelState.get();
    const isLoading = state.status === 'loading';
    const isError = state.status === 'error';
    const hasSites = state.sites.length > 0;
    const lastUpdated = state.lastUpdated
      ? new Date(state.lastUpdated).toLocaleTimeString()
      : null;

    return html`
      <div class="container">
        <div class="header">
          <div class="title-block">
            <h1>Pub Control Panel</h1>
            <p class="subtitle">
              ${hasSites ? `${state.sites.length} sites loaded` : 'No sites loaded yet'}
            </p>
            <div class="status-row ${isError ? 'error' : ''}">
              ${isLoading
                ? html`<md-circular-progress indeterminate style="--md-circular-progress-size: 18px;"></md-circular-progress>
                    <span>Loading sites...</span>`
                : isError
                  ? html`<span>${state.errorMessage ?? 'Failed to load sites.'}</span>`
                  : lastUpdated
                    ? html`<span>Last updated ${lastUpdated}</span>`
                    : nothing}
            </div>
          </div>
          <md-filled-button @click=${this.handleRefresh} ?disabled=${isLoading}>
            Refresh
          </md-filled-button>
        </div>

        ${hasSites
          ? html`
              <div class="site-grid">
                ${state.sites.map(
                  (site) => html`
                    <div class="site-card">
                      <div class="site-id">${site.id}</div>
                      ${site.url ? html`<div class="site-meta">${site.url}</div>` : nothing}
                      ${site.host ? html`<div class="site-meta">Host: ${site.host}</div>` : nothing}
                      ${site.theme ? html`<div class="site-meta">Theme: ${site.theme}</div>` : nothing}
                      ${site.gitStatus
                        ? html`<div class="git-status-row">
                            <md-checkbox
                              touch-target="wrapper"
                              ?checked=${site.gitStatus.isInternal && !site.gitStatus.hasUncommittedChanges}
                              disabled
                            ></md-checkbox>
                            <span class="site-meta git-status-label"
                              >${site.gitStatus.isInternal
                                ? site.gitStatus.hasUncommittedChanges
                                  ? 'Has uncommitted changes'
                                  : 'All changes committed'
                                : 'External site'}</span
                            >
                          </div>`
                        : nothing}
                      ${site.status && site.status.length > 0
                        ? html`
                            <div class="site-status">
                              ${site.status.map(
                                (entry) => html`<span class="status-pill">${entry}</span>`,
                              )}
                            </div>
                          `
                        : nothing}
                    </div>
                  `,
                )}
              </div>
            `
          : html`
              <div class="site-card">
                <div class="site-id">No sites available</div>
                <div class="site-meta">Check that SITES.yaml is present and try Refresh.</div>
              </div>
            `}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-pub-control-panel': DfPubControlPanel;
  }
}
