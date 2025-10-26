/**
 * Demo component for df-auth-wrapper
 *
 * Demonstrates Google-only authentication with the df-auth-wrapper component.
 * This component shows both headless and header modes.
 *
 * IMPORTANT: This component is purely presentational. It assumes that
 * Google Auth has already been initialized by the consuming app via
 * initializeGoogleAuthForTeachingApp() from init-google-auth.ts.
 *
 * This follows the "Consumer Configures" pattern where:
 * - The app owns Firebase initialization (with its .env.production config)
 * - Components only present state and UI
 * - No coupling between packages and app-level environment variables
 */

import {LitElement, html, css} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import '@df/ui-lit/df-auth-wrapper';
import '@material/web/checkbox/checkbox.js';

@customElement('df-auth-wrapper-demo')
export class DfAuthWrapperDemo extends LitElement {
  @state() declare private mode: 'headless' | 'header';

  constructor() {
    super();
    this.mode = 'header';
  }

  static override styles = css`
    :host {
      display: block;
      font-family: var(--df-font-family, 'Roboto', sans-serif);
      padding: 24px;
    }

    .demo-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 32px;
    }

    .header h1 {
      margin: 0 0 8px;
      font-size: 2rem;
      color: var(--md-sys-color-on-surface, #000);
    }

    .header p {
      margin: 0;
      color: var(--md-sys-color-on-surface-variant, #666);
    }

    .mode-toggle {
      margin: 24px 0;
      padding: 16px;
      background: var(--md-sys-color-surface-container, #f5f5f5);
      border-radius: 8px;
    }

    .mode-toggle label {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.875rem;
      color: var(--md-sys-color-on-surface, #000);
    }

    .protected-content {
      padding: 24px;
      background: var(--md-sys-color-primary-container, #e3f2fd);
      border-radius: 8px;
      margin-top: 16px;
    }

    .protected-content h2 {
      margin: 0 0 16px;
      color: var(--md-sys-color-on-primary-container, #004080);
    }

    .protected-content p {
      margin: 0 0 12px;
      color: var(--md-sys-color-on-primary-container, #004080);
    }

    .event-log {
      margin-top: 24px;
      padding: 16px;
      background: var(--md-sys-color-surface-variant, #f0f0f0);
      border-radius: 8px;
      font-family: monospace;
      font-size: 0.875rem;
      max-height: 200px;
      overflow-y: auto;
    }

    .event-log h3 {
      margin: 0 0 12px;
      font-family: var(--df-font-family, 'Roboto', sans-serif);
      font-size: 1rem;
    }

    .event-log pre {
      margin: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  `;

  override render() {
    return html`
      <div class="demo-container">
        <div class="header">
          <h1>🔐 Auth Wrapper Demo</h1>
          <p>Google Sign-In only (no emulator support)</p>
        </div>

        <div class="mode-toggle">
          <label>
            <md-checkbox
              .checked=${this.mode === 'headless'}
              @change=${this._toggleMode}
            ></md-checkbox>
            Headless mode (no header with user info)
          </label>
        </div>

        <df-auth-wrapper
          ?headless=${this.mode === 'headless'}
          @df-auth-wrapper-user-changed=${this._handleUserChanged}
        >
          <div class="protected-content">
            <h2>🎉 Welcome! You're Authenticated</h2>
            <p>This content is only visible when you're signed in with Google.</p>
            <p>
              <strong>Features demonstrated:</strong>
            </p>
            <ul>
              <li>Google Sign-In popup authentication</li>
              <li>Automatic token storage (localStorage, sessionStorage, cookie)</li>
              <li>Headless vs. Header display modes</li>
              <li>User info display (photo, name)</li>
              <li>Sign out functionality</li>
              <li>Custom event dispatching</li>
            </ul>
            <p>
              <em>Alt+Click the LOGOUT button to see debug user JSON</em>
            </p>
          </div>
        </df-auth-wrapper>

        <div class="event-log" id="eventLog">
          <h3>Event Log</h3>
          <pre id="logContent">Waiting for auth events...</pre>
        </div>
      </div>
    `;
  }

  private _toggleMode() {
    this.mode = this.mode === 'headless' ? 'header' : 'headless';
  }

  private _handleUserChanged(event: CustomEvent) {
    const {newValue} = event.detail;
    const logContent = this.shadowRoot?.getElementById('logContent');
    if (logContent) {
      const timestamp = new Date().toLocaleTimeString();
      const user = newValue
        ? `${newValue.displayName} (${newValue.email})`
        : 'null (signed out)';
      logContent.textContent = `[${timestamp}] User changed: ${user}\n${logContent.textContent}`;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-auth-wrapper-demo': DfAuthWrapperDemo;
  }
}
