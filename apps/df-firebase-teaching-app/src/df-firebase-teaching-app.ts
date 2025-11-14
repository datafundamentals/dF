import {css, html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';

import {checkEmulatorConnection, ensureEmulatorRunning} from './firebase-emulator-guard.js';

type EmulatorStatus = 'checking' | 'connected' | 'unavailable';

type ChecklistItem = {
  label: string;
  completed: boolean;
};

@customElement('df-firebase-teaching-app')
export class DfFirebaseTeachingApp extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
      border-radius: 24px;
      padding: 40px;
      box-sizing: border-box;
      background: rgba(255, 255, 255, 0.96);
      box-shadow: 0 25px 60px rgba(15, 23, 42, 0.24);
    }

    header {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 32px;
    }

    h1 {
      margin: 0;
      font-size: 2rem;
      color: #0f172a;
    }

    p {
      margin: 0;
      color: rgba(71, 85, 105, 0.95);
      line-height: 1.55;
    }

    section {
      display: grid;
      gap: 18px;
      border-radius: 18px;
      padding: 24px;
      background: rgba(15, 23, 42, 0.06);
      border: 1px solid rgba(148, 163, 184, 0.35);
    }

    h2 {
      margin: 0;
      font-size: 1.25rem;
      color: #0f172a;
    }

    ul {
      margin: 0;
      padding-left: 24px;
      color: rgba(51, 65, 85, 0.9);
      line-height: 1.6;
    }

    .status {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 12px;
      font-weight: 600;
    }

    .status[data-state='checking'] {
      background: rgba(30, 64, 175, 0.12);
      color: #1d4ed8;
    }

    .status[data-state='connected'] {
      background: rgba(22, 163, 74, 0.12);
      color: #15803d;
    }

    .status[data-state='unavailable'] {
      background: rgba(220, 38, 38, 0.12);
      color: #b91c1c;
    }

    code {
      background: rgba(15, 23, 42, 0.9);
      color: #f8fafc;
      padding: 2px 6px;
      border-radius: 6px;
      font-size: 0.9em;
    }
  `;

  @state()
  private declare emulatorStatus: EmulatorStatus;

  constructor() {
    super();
    this.emulatorStatus = 'checking';
  }

  override connectedCallback(): void {
    super.connectedCallback();
    ensureEmulatorRunning();
    void this.verifyEmulators();
  }

  private async verifyEmulators(): Promise<void> {
    const hasConnection = await checkEmulatorConnection();
    this.emulatorStatus = hasConnection ? 'connected' : 'unavailable';
  }

  override render() {
    const statusLabel = this.getStatusLabel();
    const checklist = this.getChecklist();

    return html`
      <header>
        <span class="status" data-state=${this.emulatorStatus}>${statusLabel}</span>
        <h1>Firebase Teaching Workspace</h1>
        <p>
          This application demonstrates Firebase integration patterns with cloud authentication
          and local emulators for Firestore, Storage, and Functions. Sign in with Google using
          your real account, then interact with emulated data services for safe development.
        </p>
      </header>

      <section aria-labelledby="emulator-setup">
        <h2 id="emulator-setup">Quick setup</h2>
        <ul>
          <li><code>pnpm install</code> (workspace-wide)</li>
          <li><code>pnpm --filter @df/df-firebase-teaching-app emulators:start</code></li>
          <li><code>pnpm --filter @df/df-firebase-teaching-app dev</code></li>
          <li>Sign in with Google (uses production auth)</li>
          <li>Interact with Firestore, Storage, and Functions (use emulators)</li>
        </ul>
      </section>

      <section aria-labelledby="checklist">
        <h2 id="checklist">Launch checklist</h2>
        <ul>
          ${checklist.map((item) => html`<li>${item.completed ? '✅' : '⬜️'} ${item.label}</li>`)}
        </ul>
      </section>
    `;
  }

  private getStatusLabel(): string {
    switch (this.emulatorStatus) {
      case 'connected':
        return 'Emulator suite detected';
      case 'unavailable':
        return 'Emulator suite not detected';
      default:
        return 'Checking emulator status...';
    }
  }

  private getChecklist(): ChecklistItem[] {
    return [
      {
        label: 'Install workspace dependencies',
        completed: true,
      },
      {
        label: 'Create Firebase config using environment variables',
        completed: false,
      },
      {
        label: 'Run `pnpm --filter @df/df-firebase-teaching-app emulators:start`',
        completed: this.emulatorStatus === 'connected',
      },
      {
        label: 'Run `pnpm --filter @df/df-firebase-teaching-app dev`',
        completed: false,
      },
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-firebase-teaching-app': DfFirebaseTeachingApp;
  }
}
