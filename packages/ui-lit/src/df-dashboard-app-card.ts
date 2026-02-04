import {LitElement, html, css, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import type {AppEntry} from '@df/types';
import '@material/web/checkbox/checkbox.js';

@customElement('df-dashboard-app-card')
export class DfDashboardAppCard extends LitElement {
  @property({type: Object})
  declare app: AppEntry | undefined;

  static override styles = css`
    :host {
      display: block;
    }
    .card {
      background: var(--vscode-sideBar-background, rgba(255, 255, 255, 0.04));
      border: 1px solid var(--vscode-panel-border, rgba(255, 255, 255, 0.12));
      border-radius: 10px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .header {
      font-weight: 600;
      font-size: 0.95rem;
      margin-bottom: 4px;
    }
    .version {
      font-size: 0.8rem;
      opacity: 0.7;
    }
    .git-status-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .git-status-label {
      color: var(--vscode-foreground, var(--md-sys-color-on-surface, #1f1f1f));
      opacity: 0.9;
      font-size: 0.8rem;
    }
  `;

  override render() {
    const app = this.app;
    if (!app) {
      return nothing;
    }

    return html`
      <div class="card">
        <div class="header">${app.name}</div>
        <div class="version">v${app.version}</div>
        ${app.appChanges
          ? html`<div class="git-status-row">
              <md-checkbox
                touch-target="wrapper"
                ?checked=${!app.appChanges.hasChanges}
                disabled
              ></md-checkbox>
              <span class="git-status-label">
                ${app.appChanges.hasChanges
                  ? `App repo: ${app.appChanges.changedFileCount} files changed since release`
                  : 'App repo: No changes since release'}
              </span>
            </div>`
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-dashboard-app-card': DfDashboardAppCard;
  }
}
