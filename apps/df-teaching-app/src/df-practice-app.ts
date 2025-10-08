import {SignalWatcher} from '@lit-labs/signals';
import {css, html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import '@df/ui-lit/df-practice-widget.js';
import {loadPracticeTasks, practiceWidgetState, resetPracticeWidget} from '@df/state';

@customElement('df-practice-app')
export class DfPracticeApp extends SignalWatcher(LitElement) {
  static override styles = css`
    :host {
      display: grid;
      gap: 24px;
      width: min(960px, 100%);
      background: rgba(255, 255, 255, 0.92);
      border-radius: 24px;
      padding: 32px;
      box-shadow: 0 20px 45px rgba(15, 23, 42, 0.12);
    }

    header {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    h1 {
      margin: 0;
      font-size: 1.8rem;
    }

    p {
      margin: 0;
      color: rgba(71, 85, 105, 0.95);
    }

    main {
      display: grid;
      gap: 24px;
    }

    .panel {
      border-radius: 16px;
      padding: 16px;
      background: rgba(15, 23, 42, 0.05);
      border: 1px solid rgba(148, 163, 184, 0.4);
    }

    pre {
      margin: 0;
      background: rgba(15, 23, 42, 0.75);
      color: #f8fafc;
      border-radius: 12px;
      padding: 16px;
      font-size: 0.85rem;
      max-height: 280px;
      overflow: auto;
    }

    button {
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font: inherit;
      cursor: pointer;
      background: #2563eb;
      color: #ffffff;
      transition: background-color 120ms ease;
    }

    button:hover {
      background: #1d4ed8;
    }

    .actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 16px;
    }
  `;

  override render() {
    const snapshot = practiceWidgetState.get();

    return html`
      <header>
        <h1>Practice runtime harness</h1>
        <p>Explore how a Lit component consumes signal-driven state with isolated side effects.</p>
      </header>

      <main>
        <df-practice-widget></df-practice-widget>

        <section class="panel" aria-label="store-state">
          <h2>Store snapshot</h2>
          <pre>${JSON.stringify(snapshot, null, 2)}</pre>
          <div class="actions">
            <button @click=${this.handleReload}>Reload from host</button>
            <button @click=${this.handleReset}>Reset store</button>
          </div>
        </section>
      </main>
    `;
  }

  private handleReload() {
    void loadPracticeTasks();
  }

  private handleReset() {
    resetPracticeWidget();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-practice-app': DfPracticeApp;
  }
}
