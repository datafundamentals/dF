import {LitElement, html, css, nothing} from 'lit';
import {customElement} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import {dashboardState} from '@df/state';
import '@material/web/checkbox/checkbox.js';
import '@material/web/button/outlined-button.js';

@customElement('df-dashboard-df-card')
export class DfDashboardDfCard extends SignalWatcher(LitElement) {
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
    .actions-row {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--vscode-panel-border, rgba(255, 255, 255, 0.12));
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    md-outlined-button {
      --md-outlined-button-container-height: 30px;
    }
  `;

  private handleRunCommand(name: string, command: string): void {
    this.dispatchEvent(
      new CustomEvent('df-dashboard-run-command', {
        detail: {
          name,
          command,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render() {
    const state = dashboardState.get();
    const status = state.dfRepoStatus;

    if (!status) {
      return nothing;
    }

    return html`
      <div class="card">
        <div class="header">dF Monorepo</div>
        <div class="git-status-row">
          <md-checkbox
            touch-target="wrapper"
            ?checked=${status.isInternal && !status.hasUncommittedChanges}
            disabled
          ></md-checkbox>
          <span class="git-status-label">
            ${status.isInternal
              ? status.hasUncommittedChanges
                ? 'Repo: Has uncommitted changes'
                : 'Repo: All changes committed'
              : 'Repo: External'}
          </span>
        </div>
        <div class="actions-row">
          <md-outlined-button @click=${() => this.handleRunCommand('DF: Install', 'pnpm install')}>
            Install
          </md-outlined-button>
          <md-outlined-button @click=${() => this.handleRunCommand('DF: Build', 'pnpm build')}>
            Build
          </md-outlined-button>
          <md-outlined-button @click=${() => this.handleRunCommand('DF: Lint', 'pnpm lint')}>
            Lint
          </md-outlined-button>
          <md-outlined-button @click=${() => this.handleRunCommand('DF: Test', 'pnpm test')}>
            Test
          </md-outlined-button>
          <md-outlined-button @click=${() => this.handleRunCommand('DF: Storybook', 'pnpm --filter @df/df-storybook run dev')}>
            Storybook
          </md-outlined-button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-dashboard-df-card': DfDashboardDfCard;
  }
}
