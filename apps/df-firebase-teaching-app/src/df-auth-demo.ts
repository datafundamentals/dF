import {css, html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import {initializeAuth, firebaseAuthState} from '@df/state';
import {getFirebaseApp} from '@df/firebase';
import {connectAuthToEmulator} from '@df/firebase/auth';
import {getFirebaseConfig, useEmulator} from './config/firebase.config.js';

// Import auth components
import '@df/ui-lit/firebase';

/**
 * Authentication demo component for the Firebase teaching app
 *
 * Demonstrates all authentication patterns:
 * - Sign in / Sign up
 * - Sign out
 * - User profile display
 * - Password reset
 * - Auth guards
 */
@customElement('df-auth-demo')
export class DfAuthDemo extends SignalWatcher(LitElement) {
  @state() declare private currentView: 'sign-in' | 'sign-up' | 'reset' | 'profile';

  constructor() {
    super();
    this.currentView = 'sign-in';
  }

  static override styles = css`
    :host {
      display: block;
      font-family: var(--df-font-family, system-ui, sans-serif);
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--df-spacing-4, 1.5rem);
    }

    .header {
      margin-bottom: var(--df-spacing-6, 2rem);
    }

    .title {
      margin: 0 0 var(--df-spacing-2, 0.5rem) 0;
      font-size: var(--df-title-size, 2rem);
      font-weight: var(--df-title-weight, 700);
      color: var(--df-text-primary, #000);
    }

    .subtitle {
      margin: 0;
      font-size: var(--df-subtitle-size, 1.125rem);
      color: var(--df-text-secondary, #666);
    }

    .layout {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: var(--df-spacing-6, 2rem);
      align-items: start;
    }

    @media (max-width: 768px) {
      .layout {
        grid-template-columns: 1fr;
      }
    }

    .sidebar {
      position: sticky;
      top: var(--df-spacing-4, 1.5rem);
    }

    .user-info {
      margin-bottom: var(--df-spacing-4, 1.5rem);
    }

    .nav {
      display: flex;
      flex-direction: column;
      gap: var(--df-spacing-2, 0.5rem);
    }

    .nav-button {
      padding: var(--df-spacing-3, 1rem);
      border: 1px solid var(--df-border-color, #e0e0e0);
      border-radius: var(--df-border-radius, 8px);
      background: var(--df-surface-color, #fff);
      color: var(--df-text-primary, #000);
      font-size: 1rem;
      font-weight: 500;
      text-align: left;
      cursor: pointer;
      transition: all 0.2s;
    }

    .nav-button:hover {
      background: var(--df-hover-bg, #f5f5f5);
      border-color: var(--df-primary-color, #1976d2);
    }

    .nav-button[data-active='true'] {
      background: var(--df-primary-color-light, #e3f2fd);
      border-color: var(--df-primary-color, #1976d2);
      color: var(--df-primary-color, #1976d2);
    }

    .main-content {
      min-height: 400px;
    }

    .info-box {
      padding: var(--df-spacing-4, 1.5rem);
      border-radius: var(--df-border-radius, 8px);
      background: var(--df-info-bg, #e3f2fd);
      border: 1px solid var(--df-info-border, #90caf9);
      margin-bottom: var(--df-spacing-4, 1.5rem);
    }

    .info-box h3 {
      margin: 0 0 var(--df-spacing-2, 0.5rem) 0;
      font-size: 1.125rem;
      color: var(--df-info-title, #1976d2);
    }

    .info-box p {
      margin: 0;
      font-size: 0.875rem;
      line-height: 1.5;
      color: var(--df-info-text, #0d47a1);
    }

    .protected-content {
      padding: var(--df-spacing-6, 2rem);
      border-radius: var(--df-border-radius, 8px);
      background: var(--df-success-bg, #e8f5e9);
      border: 2px dashed var(--df-success-border, #4caf50);
      text-align: center;
    }

    .protected-content h3 {
      margin: 0 0 var(--df-spacing-2, 0.5rem) 0;
      font-size: 1.5rem;
      color: var(--df-success-text, #2e7d32);
    }

    .protected-content p {
      margin: 0;
      color: var(--df-success-text-secondary, #388e3c);
    }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
    void this._initializeFirebaseAuth();
  }

  private async _initializeFirebaseAuth(): Promise<void> {
    try {
      const config = getFirebaseConfig();
      const app = getFirebaseApp(config);

      // Connect to emulator if in emulator mode
      if (useEmulator()) {
        // Check if emulator is available before connecting
        try {
          const emulatorCheck = await fetch('http://127.0.0.1:5400');
          if (emulatorCheck.ok) {
            const auth = getFirebaseAuth(app);
            connectAuthToEmulator(auth, {
              host: '127.0.0.1',
              port: 9155, // From firebase.json
            });

            // Initialize auth store only if emulator is available
            initializeAuth(app);
          } else {
            console.warn('[df-auth-demo] Emulator not available. Auth demo will not be functional.');
          }
        } catch (emulatorError) {
          console.warn('[df-auth-demo] Emulator not available. Auth demo will not be functional.', emulatorError);
        }
      } else {
        // Production mode - initialize normally
        initializeAuth(app);
      }
    } catch (error) {
      console.error('[df-auth-demo] Failed to initialize Firebase Auth:', error);
    }
  }

  override render() {
    // Check if auth is initialized before accessing state
    let isAuthenticated = false;
    try {
      const authState = firebaseAuthState.get();
      isAuthenticated = authState.authState === 'authenticated';
    } catch {
      // Auth not initialized - show login by default
      isAuthenticated = false;
    }

    return html`
      <div class="header">
        <h1 class="title">Authentication Pattern Demo</h1>
        <p class="subtitle">
          Firebase Authentication with signals-first architecture
        </p>
      </div>

      ${this._renderInfoBox()}

      <div class="layout">
        <aside class="sidebar">
          ${isAuthenticated ? html`
            <div class="user-info">
              <df-user-profile></df-user-profile>
            </div>
            <df-sign-out></df-sign-out>
          ` : ''}

          <nav class="nav">
            <button
              class="nav-button"
              data-active=${this.currentView === 'sign-in'}
              @click=${() => this.currentView = 'sign-in'}
            >
              Sign In
            </button>
            <button
              class="nav-button"
              data-active=${this.currentView === 'sign-up'}
              @click=${() => this.currentView = 'sign-up'}
            >
              Sign Up
            </button>
            <button
              class="nav-button"
              data-active=${this.currentView === 'reset'}
              @click=${() => this.currentView = 'reset'}
            >
              Reset Password
            </button>
            ${isAuthenticated ? html`
              <button
                class="nav-button"
                data-active=${this.currentView === 'profile'}
                @click=${() => this.currentView = 'profile'}
              >
                Protected Content
              </button>
            ` : ''}
          </nav>
        </aside>

        <main class="main-content">
          ${this._renderCurrentView()}
        </main>
      </div>
    `;
  }

  private _renderInfoBox() {
    return html`
      <div class="info-box">
        <h3>Test Credentials</h3>
        <p>
          Use any user from the seed data:<br />
          <strong>Email:</strong> alice.anderson@example.com (or any other seeded user)<br />
          <strong>Password:</strong> password123
        </p>
      </div>
    `;
  }

  private _renderCurrentView() {
    switch (this.currentView) {
      case 'sign-in':
        return html`
          <df-sign-in
            @df-sign-in-success=${this._handleSignInSuccess}
            @df-sign-in-error=${this._handleAuthError}
          ></df-sign-in>
        `;

      case 'sign-up':
        return html`
          <df-sign-up
            @df-sign-up-success=${this._handleSignUpSuccess}
            @df-sign-up-error=${this._handleAuthError}
          ></df-sign-up>
        `;

      case 'reset':
        return html`
          <df-password-reset
            @df-password-reset-success=${this._handleResetSuccess}
            @df-password-reset-error=${this._handleAuthError}
          ></df-password-reset>
        `;

      case 'profile':
        return html`
          <div class="protected-content">
            <h3>🎉 Protected Content</h3>
            <p>You can only see this because you're authenticated!</p>
          </div>
          <br />
          <df-user-profile></df-user-profile>
        `;

      default:
        return html`<p>Unknown view</p>`;
    }
  }

  private _handleSignInSuccess() {
    console.log('[df-auth-demo] Sign in successful');
    this.currentView = 'profile';
  }

  private _handleSignUpSuccess() {
    console.log('[df-auth-demo] Sign up successful');
    this.currentView = 'profile';
  }

  private _handleResetSuccess() {
    console.log('[df-auth-demo] Password reset email sent');
  }

  private _handleAuthError(e: CustomEvent) {
    console.error('[df-auth-demo] Auth error:', e.detail.error);
  }
}

// Import getFirebaseAuth for emulator connection
import {getFirebaseAuth} from '@df/firebase/auth';

declare global {
  interface HTMLElementTagNameMap {
    'df-auth-demo': DfAuthDemo;
  }
}
