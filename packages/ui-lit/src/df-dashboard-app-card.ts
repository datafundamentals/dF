import {LitElement, html, css, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import type {AppEntry} from '@df/types';
import '@material/web/checkbox/checkbox.js';
import '@material/web/button/text-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/select/filled-select.js';
import '@material/web/select/select-option.js';

@customElement('df-dashboard-app-card')
export class DfDashboardAppCard extends LitElement {
  @property({type: Object})
  declare app: AppEntry | undefined;

  @property({type: Array})
  declare assignedSites: string[];

  @property({type: Array})
  declare allSites: string[];

  @state()
  private selectedSiteId = '';

  constructor() {
    super();
    this.assignedSites = [];
    this.allSites = [];
  }

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
    .deploy-targets {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 4px;
    }
    .targets-title {
      font-size: 0.8rem;
      opacity: 0.8;
    }
    .target-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      background: var(--vscode-editor-background, rgba(255, 255, 255, 0.02));
      border: 1px solid var(--vscode-panel-border, rgba(255, 255, 255, 0.12));
      border-radius: 8px;
      padding: 6px 8px;
    }
    .target-site {
      word-break: break-word;
    }
    .add-target {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 6px;
    }
    md-filled-select {
      --md-filled-select-text-field-container-color: var(--vscode-input-background, rgba(255, 255, 255, 0.04));
      --md-filled-select-text-field-input-text-color: var(--vscode-input-foreground, #fff);
    }
    md-outlined-button {
      --md-outlined-button-container-height: 30px;
    }
    .actions-row {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--vscode-panel-border, rgba(255, 255, 255, 0.12));
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: flex-end;
    }
  `;

  private get unassignedSites(): string[] {
    return this.allSites.filter((siteId) => !this.assignedSites.includes(siteId));
  }

  private handleSelectedSiteChange(event: Event): void {
    const target = event.target as {value?: string};
    this.selectedSiteId = target.value ?? '';
  }

  private handleAddTarget(): void {
    const app = this.app;
    if (!app || !this.selectedSiteId) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent('df-dashboard-app-card-add-site', {
        detail: {appName: app.name, siteId: this.selectedSiteId},
        bubbles: true,
        composed: true,
      }),
    );
    this.selectedSiteId = '';
  }

  private handleRemoveTarget(siteId: string): void {
    const app = this.app;
    if (!app) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent('df-dashboard-app-card-remove-site', {
        detail: {appName: app.name, siteId},
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleDev(): void {
    const app = this.app;
    if (!app) return;

    this.dispatchEvent(
      new CustomEvent('df-dashboard-run-command', {
        detail: {
          name: `DF: ${app.name}`,
          command: `pnpm --filter ${app.name} dev`,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleBuild(): void {
    const app = this.app;
    if (!app) return;

    this.dispatchEvent(
      new CustomEvent('df-dashboard-run-command', {
        detail: {
          name: `DF: ${app.name}`,
          command: `pnpm --filter ${app.name} build`,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleTest(): void {
    const app = this.app;
    if (!app) return;

    this.dispatchEvent(
      new CustomEvent('df-dashboard-run-command', {
        detail: {
          name: `DF: ${app.name}`,
          command: `pnpm --filter ${app.name} test`,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleBundle(): void {
    const app = this.app;
    if (!app) return;

    this.dispatchEvent(
      new CustomEvent('df-dashboard-run-command', {
        detail: {
          name: `DF: Bundle ${app.name}`,
          command: `pnpm bundle:release ${app.name}`,
        },
        bubbles: true,
        composed: true,
      }),
    );

    // Auto-refresh dashboard after bundle completes (delay to allow build time)
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('df-dashboard-refresh'));
    }, 15000);
  }

  override render() {
    const app = this.app;
    if (!app) {
      return nothing;
    }

    return html`
      <div class="card">
        <div class="header">${app.name}</div>
        <div class="version">v${app.version}</div>
        ${app.bundleTag
          ? html`<div class="version">Bundle: ${app.bundleTag}</div>`
          : html`<div class="version">No bundle</div>`}
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
        <div class="deploy-targets">
          <div class="targets-title">Deploy targets</div>
          ${this.assignedSites.length > 0
            ? this.assignedSites.map(
                (siteId) => html`
                  <div class="target-row">
                    <span class="target-site">${siteId}</span>
                    <md-text-button @click=${() => this.handleRemoveTarget(siteId)}>
                      Remove
                    </md-text-button>
                  </div>
                `,
              )
            : html`<div class="version">No deploy targets</div>`}
        </div>
        <div class="add-target">
          <md-filled-select
            label="Add deploy target"
            .value=${this.selectedSiteId}
            @change=${this.handleSelectedSiteChange}
            ?disabled=${this.unassignedSites.length === 0}
          >
            <md-select-option value="">
              <div slot="headline">Choose a site</div>
            </md-select-option>
            ${this.unassignedSites.map(
              (siteId) => html`
                <md-select-option value=${siteId}>
                  <div slot="headline">${siteId}</div>
                </md-select-option>
              `,
            )}
          </md-filled-select>
          <md-outlined-button
            @click=${this.handleAddTarget}
            ?disabled=${!this.selectedSiteId}
          >
            Add site
          </md-outlined-button>
        </div>
        <div class="actions-row">
          <md-outlined-button @click=${this.handleDev}>
            Dev
          </md-outlined-button>
          <md-outlined-button @click=${this.handleBuild}>
            Build
          </md-outlined-button>
          <md-outlined-button @click=${this.handleTest}>
            Test
          </md-outlined-button>
          <md-outlined-button @click=${this.handleBundle}>
            Bundle
          </md-outlined-button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-dashboard-app-card': DfDashboardAppCard;
  }
}
