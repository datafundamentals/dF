import {LitElement, html, css, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import type {PubSiteEntry, AppDeployStatus} from '@df/types';
import '@material/web/button/outlined-button.js';
import '@material/web/button/filled-button.js';

@customElement('df-dashboard-site-card')
export class DfDashboardSiteCard extends LitElement {
  @property({type: Object})
  declare site: PubSiteEntry | undefined;

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
      gap: 8px;
    }
    .header {
      font-weight: 600;
      font-size: 0.95rem;
      margin-bottom: 4px;
    }
    .site-meta {
      font-size: 0.8rem;
      opacity: 0.75;
    }
    .deploy-section {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid var(--vscode-panel-border, rgba(255, 255, 255, 0.12));
    }
    .deploy-title {
      font-size: 0.85rem;
      font-weight: 500;
      margin-bottom: 8px;
    }
    .app-deploy-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 8px;
      background: var(--vscode-editor-background, rgba(255, 255, 255, 0.02));
      border: 1px solid var(--vscode-panel-border, rgba(255, 255, 255, 0.12));
      border-radius: 8px;
      margin-bottom: 8px;
    }
    .app-name {
      font-weight: 500;
      font-size: 0.85rem;
    }
    .deploy-status {
      font-size: 0.8rem;
      opacity: 0.8;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .deploy-status-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .needs-deploy {
      color: var(--vscode-charts-yellow, #cca700);
    }
    .up-to-date {
      color: var(--vscode-charts-green, #388a34);
    }
    md-filled-button {
      --md-filled-button-container-height: 28px;
      --md-filled-button-label-text-size: 0.75rem;
    }
    md-outlined-button {
      --md-outlined-button-container-height: 28px;
    }
    .no-apps {
      font-size: 0.8rem;
      opacity: 0.6;
      font-style: italic;
    }
  `;

  private handleDeploy(appName: string): void {
    const site = this.site;
    if (!site) return;

    this.dispatchEvent(
      new CustomEvent('df-dashboard-run-command', {
        detail: {
          name: `DF: Deploy ${appName} → ${site.id}`,
          command: `pnpm deploy:copy-bundle ${appName} ../sites/${site.id}/static/wc`,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private renderAppDeployRow(status: AppDeployStatus) {
    const {appName, bundleTag, deployedTag, needsDeploy} = status;

    return html`
      <div class="app-deploy-row">
        <div class="app-name">${appName}</div>
        <div class="deploy-status">
          <div class="deploy-status-row">
            <span>Bundle: ${bundleTag ?? 'none'}</span>
          </div>
          <div class="deploy-status-row">
            <span>Deployed: ${deployedTag ?? 'never'}</span>
            ${needsDeploy
              ? html`<md-filled-button @click=${() => this.handleDeploy(appName)}>
                  Deploy
                </md-filled-button>`
              : html`<span class="up-to-date">✓ Up to date</span>`}
          </div>
        </div>
      </div>
    `;
  }

  override render() {
    const site = this.site;
    if (!site) {
      return nothing;
    }

    const hasApps = site.apps && site.apps.length > 0;
    const hasDeployStatus = site.appDeployStatus && site.appDeployStatus.length > 0;

    return html`
      <div class="card">
        <div class="header">${site.id}</div>
        ${site.url ? html`<div class="site-meta">${site.url}</div>` : nothing}
        ${site.host ? html`<div class="site-meta">Host: ${site.host}</div>` : nothing}

        ${hasApps
          ? html`
              <div class="deploy-section">
                <div class="deploy-title">App Deployments</div>
                ${hasDeployStatus
                  ? site.appDeployStatus!.map((status) => this.renderAppDeployRow(status))
                  : site.apps!.map(
                      (appName) => html`
                        <div class="app-deploy-row">
                          <div class="app-name">${appName}</div>
                          <div class="deploy-status">
                            <span>Status unknown</span>
                          </div>
                        </div>
                      `,
                    )}
              </div>
            `
          : html`<div class="no-apps">No apps assigned</div>`}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-dashboard-site-card': DfDashboardSiteCard;
  }
}
