import {SignalWatcher} from '@lit-labs/signals';
import {css, html, LitElement, nothing} from 'lit';
import {customElement} from 'lit/decorators.js';
import {
  DEFAULT_LIT_STARTER_NAME,
  incrementLitStarterCount,
  litStarterState,
  resetLitStarterState,
  setLitStarterName,
} from '@df/state';
import '@df/ui-lit/my-element.js';

@customElement('my-app')
export class MyApp extends SignalWatcher(LitElement) {
  static override styles = css`
    :host {
      display: grid;
      padding: 32px;
      gap: 24px;
      box-sizing: border-box;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      min-height: 100vh;
      color: #f8fafc;
      font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    header {
      display: grid;
      gap: 8px;
      max-width: 720px;
    }

    header > h1 {
      margin: 0;
      font-weight: 600;
      font-size: clamp(2rem, 4vw, 2.6rem);
      letter-spacing: -0.02em;
    }

    header > p {
      margin: 0;
      color: rgba(241, 245, 249, 0.82);
      font-size: 1rem;
      max-width: 540px;
    }

    main {
      display: grid;
      gap: 24px;
      align-content: start;
      max-width: 720px;
    }

    .panel {
      background: rgba(15, 23, 42, 0.85);
      border-radius: 20px;
      padding: 24px;
      border: 1px solid rgba(148, 163, 184, 0.35);
      box-shadow: 0 30px 80px rgba(15, 23, 42, 0.35);
    }

    .controls {
      display: grid;
      gap: 16px;
    }

    .field {
      display: grid;
      gap: 8px;
    }

    label {
      font-size: 0.9rem;
      color: rgba(226, 232, 240, 0.85);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 600;
    }

    input[type='text'] {
      background: rgba(15, 23, 42, 0.55);
      border: 1px solid rgba(148, 163, 184, 0.45);
      border-radius: 12px;
      padding: 12px 16px;
      color: inherit;
      font: inherit;
      outline: none;
      transition: border-color 120ms ease, box-shadow 120ms ease;
    }

    input[type='text']:focus {
      border-color: rgba(96, 165, 250, 0.85);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.35);
    }

    .actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    button {
      appearance: none;
      border: none;
      border-radius: 999px;
      padding: 10px 18px;
      font: inherit;
      cursor: pointer;
      transition: transform 120ms ease, box-shadow 120ms ease;
    }

    button.primary {
      background: #2563eb;
      color: #f8fafc;
      box-shadow: 0 12px 30px rgba(37, 99, 235, 0.35);
    }

    button.secondary {
      background: rgba(148, 163, 184, 0.25);
      color: rgba(241, 245, 249, 0.9);
      border: 1px solid rgba(148, 163, 184, 0.4);
    }

    button:hover {
      transform: translateY(-1px);
      box-shadow: 0 16px 40px rgba(37, 99, 235, 0.4);
    }

    button.secondary:hover {
      box-shadow: 0 12px 30px rgba(148, 163, 184, 0.35);
    }

    section.state-panel {
      margin-top: 12px;
      border-radius: 16px;
      padding: 16px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(148, 163, 184, 0.25);
      display: grid;
      gap: 12px;
    }

    section.state-panel header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    section.state-panel h2 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    section.state-panel pre {
      margin: 0;
      font-size: 0.85rem;
      background: rgba(15, 23, 42, 0.85);
      border-radius: 12px;
      padding: 16px;
      overflow: auto;
      max-height: 220px;
      color: rgba(148, 163, 184, 0.95);
    }

    my-element {
      width: 100%;
    }

    @media (max-width: 720px) {
      :host {
        padding: 24px;
      }

      header > h1 {
        font-size: clamp(1.8rem, 6vw, 2.3rem);
      }

      .actions {
        gap: 10px;
      }

      button {
        width: 100%;
        justify-content: center;
      }
    }
  `;

  override render() {
    const snapshot = litStarterState.get();
    const lastInteraction = snapshot.lastInteractionTs
      ? new Date(snapshot.lastInteractionTs).toLocaleTimeString()
      : nothing;

    return html`
      <header>
        <h1>Signal-driven Lit starter shell</h1>
        <p>
          This reference app shows how a host component consumes shared UI primitives
          and signal-backed state from the monorepo packages.
        </p>
      </header>

      <main>
        <div class="panel">
          <div class="controls">
            <div class="field">
              <label for="starter-name">Display name</label>
              <input
                id="starter-name"
                type="text"
                autocomplete="off"
                spellcheck="false"
                .value=${snapshot.name}
                @input=${this.handleNameInput}
              />
              <p style="margin:0;color:rgba(226,232,240,0.65);font-size:0.85rem;">
                Leave blank to fall back to "${DEFAULT_LIT_STARTER_NAME}".
              </p>
            </div>
            <div class="actions">
              <button class="primary" type="button" @click=${this.handleIncrement}>
                Increment via store
              </button>
              <button class="secondary" type="button" @click=${this.handleReset}>
                Reset store
              </button>
            </div>
          </div>

          <my-element
            name=${snapshot.name}
            .count=${snapshot.clickCount}
            @count-changed=${this.handleIncrement}
          >
            <p style="margin-top:16px;color:rgba(30,41,59,0.8);">
              Shared content slot rendered inside the shared <code>&lt;my-element></code>.
            </p>
          </my-element>
        </div>

        <section class="state-panel" aria-label="lit-starter-store-state">
          <header>
            <h2>Store snapshot</h2>
            ${lastInteraction
              ? html`<span style="font-size:0.85rem;color:rgba(148,163,184,0.8);">
                  Last interaction: ${lastInteraction}
                </span>`
              : nothing}
          </header>
          <pre>${JSON.stringify(snapshot, null, 2)}</pre>
        </section>
      </main>
    `;
  }

  private handleNameInput(event: Event) {
    const target = event.target as HTMLInputElement | null;
    setLitStarterName(target?.value ?? DEFAULT_LIT_STARTER_NAME);
  }

  private handleIncrement() {
    incrementLitStarterCount();
  }

  private handleReset() {
    resetLitStarterState();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-app': MyApp;
  }
}
