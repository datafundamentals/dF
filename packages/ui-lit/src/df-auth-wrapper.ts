/**
 * ⚠️ CRITICAL STANDARDS COMPLIANCE ⚠️
 *
 * Uses Material Design 3 controls for authentication UI.
 * This component wraps protected content and manages Google Sign-In flow.
 */

import {LitElement, html, css, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import {firebaseAuthState, signInWithGoogle, signOut} from '@df/state';
import '@material/web/button/filled-button.js';
import '@material/web/button/text-button.js';
import '@material/web/button/filled-tonal-button.js';
import './firebase/df-sign-in.js';
import './firebase/df-sign-up.js';
import './firebase/df-password-reset.js';

type EmailPwView = 'sign-in' | 'sign-up' | 'reset';

/**
 * Authentication wrapper component for Google Sign-In.
 *
 * Wraps protected content and shows it only when user is authenticated.
 * Provides two display modes:
 * - headless: Shows only login button or content (no header)
 * - default: Shows header with user info and logout button when authenticated
 *
 * The component automatically stores auth tokens in localStorage/sessionStorage
 * and emits events when user state changes.
 *
 * @fires df-auth-wrapper-user-changed - Dispatched when user signs in or out
 *
 * @property {boolean} headless - If true, hides the header with user info
 * @property {boolean} showHideUser - If true, shows raw user object JSON (debug mode)
 * @property {boolean} emailPw - If true, exposes developer-only email/password UI for emulator workflows
 *
 * @example Headless mode
 * ```html
 * <df-auth-wrapper headless>
 *   <h1>Protected Content</h1>
 *   <p>Only visible when signed in</p>
 * </df-auth-wrapper>
 * ```
 *
 * @example With header
 * ```html
 * <df-auth-wrapper>
 *   <div>
 *     <h1>Welcome to My App</h1>
 *     <p>Your protected content here</p>
 *   </div>
 * </df-auth-wrapper>
 * ```
 */
@customElement('df-auth-wrapper')
export class DfAuthWrapper extends SignalWatcher(LitElement) {
  @property({type: Boolean}) declare headless: boolean;
  @property({type: Boolean}) declare showHideUser: boolean;
  @property({type: Boolean}) declare emailPw: boolean;
  @state() private declare emailPwView: EmailPwView;

  constructor() {
    super();
    this.headless = false;
    this.showHideUser = false;
    this.emailPw = false;
    this.emailPwView = 'sign-in';
  }

  static override styles = css`
    :host {
      display: block;
      font-family: var(--df-font-family, 'Roboto', sans-serif);
    }

    .full-screen {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      width: 100%;
    }

    .login-button {
      padding: 16px 32px;
      font-size: 16px;
    }

    .full-width-div {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 50px;
      padding: 8px 16px;
      border-bottom: 1px solid var(--md-sys-color-outline-variant, #ccc);
      background: var(--md-sys-color-surface, #fff);
    }

    .full-width-div > div {
      text-align: center;
      flex-grow: 1;
    }

    .user-photo {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-name {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 500;
      color: var(--md-sys-color-on-surface, #000);
    }

    .user-json {
      padding: 16px;
      background: var(--md-sys-color-surface-container, #f0f0f0);
      border-radius: 8px;
      margin: 16px;
      overflow-x: auto;
    }

    .user-json pre {
      margin: 0;
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
    }

    .dev-login {
      width: min(1200px, 100%);
      padding: 32px;
      border-radius: 24px;
      border: 1px solid var(--md-sys-color-outline-variant, rgba(15, 23, 42, 0.12));
      background: var(--md-sys-color-surface, #fff);
      box-shadow: 0 32px 80px rgba(15, 23, 42, 0.18);
    }

    .dev-grid {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    @media (min-width: 1024px) {
      .dev-grid {
        flex-direction: row;
      }
    }

    .dev-card {
      flex: 1;
      border-radius: 20px;
      border: 1px solid var(--md-sys-color-outline-variant, rgba(15, 23, 42, 0.08));
      background: var(--md-sys-color-surface-container-high, #f8f9ff);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .google-panel {
      background: linear-gradient(145deg, rgba(59, 130, 246, 0.08), rgba(99, 102, 241, 0.08));
    }

    .google-panel h2,
    .email-pw-panel h2 {
      margin: 0;
      font-size: 1.4rem;
      color: var(--md-sys-color-on-surface, #0f172a);
    }

    .google-panel p,
    .email-pw-panel p {
      margin: 0;
      color: var(--md-sys-color-on-surface-variant, #475569);
      line-height: 1.5;
    }

    .email-pw-panel {
      background: var(--md-sys-color-surface, #fff);
    }

    .email-pw-nav {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .email-pw-tab[data-active='true'] {
      --md-filled-tonal-button-container-color: var(--md-sys-color-primary-container, #e0e7ff);
      --md-filled-tonal-button-label-text-color: var(--md-sys-color-on-primary-container, #1e3a8a);
    }

    .email-pw-content {
      margin-top: 8px;
    }

    .email-pw-note {
      font-size: 0.85rem;
      color: var(--md-sys-color-on-surface-variant, #5f6b7c);
      background: var(--md-sys-color-surface-container-low, #eef2ff);
      border-radius: 12px;
      padding: 12px;
    }

    .credential-callout {
      margin-top: 12px;
      padding: 12px;
      border-radius: 12px;
      background: var(--md-sys-color-surface-container, #f6f7fb);
      font-size: 0.9rem;
      border: 1px dashed var(--md-sys-color-outline-variant, rgba(15, 23, 42, 0.2));
    }

    .credential-callout code {
      background: rgba(15, 23, 42, 0.08);
      padding: 2px 6px;
      border-radius: 6px;
      font-size: 0.85rem;
    }

    .info-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      background: var(--md-sys-color-primary-container, rgba(59, 130, 246, 0.12));
      color: var(--md-sys-color-on-primary-container, #102a83);
    }
  `;

  override render() {
    const {authUser, authState} = firebaseAuthState.get();

    if (authState !== 'authenticated' || !authUser) {
      return this._renderLoginScreen();
    }

    if (this.headless) {
      return html`<slot></slot>`;
    }

    return html`
      ${this._renderHeader(authUser)}
      ${this.showHideUser ? this._renderUserJson(authUser) : nothing}
      <slot></slot>
    `;
  }

  private _renderLoginScreen() {
    if (!this.emailPw) {
      return html`
        <div class="full-screen">
          <md-filled-button
            class="login-button"
            @click=${this._handleLoginClick}
          >
            Sign in with Google
          </md-filled-button>
        </div>
      `;
    }

    return html`
      <div class="full-screen">
        <div class="dev-login" aria-live="polite">
          <div class="dev-grid">
            <section class="dev-card google-panel">
              <h2>Google Sign-In (Production)</h2>
              <p>
                Use this flow when testing against a production Firebase project. The popup requires
                real OAuth credentials and will not work with the Auth Emulator.
              </p>
              <md-filled-button
                class="login-button"
                @click=${this._handleLoginClick}
              >
                Sign in with Google
              </md-filled-button>
              <p class="email-pw-note">
                Need Auth emulator triggers instead? Use the developer email/password panel to create
                throwaway accounts. This UI is intentionally hidden unless 
                <code>emailPw</code> is enabled.
              </p>
            </section>
            ${this._renderEmailPwPanel()}
          </div>
        </div>
      </div>
    `;
  }

  private _renderEmailPwPanel() {
    return html`
      <section class="dev-card email-pw-panel" aria-labelledby="emailPwHeading">
        <div>
          <p class="info-pill">Developer Workflow</p>
          <h2 id="emailPwHeading">Email/Password (Emulator Only)</h2>
          <p>
            Copy-only UI for writing Firebase Functions that react to 
            <code>functions.auth.user()</code> events. Never expose this panel to real users.
          </p>
          <div class="credential-callout">
            <strong>Seeded credentials</strong>
            <div>Email: <code>alice.anderson@example.com</code></div>
            <div>Password: <code>password123</code></div>
          </div>
        </div>
        <div class="email-pw-nav" role="tablist" aria-label="Email/password auth flows">
          ${this._renderEmailPwTab('sign-in', 'Sign In', 'Use emulator accounts')}
          ${this._renderEmailPwTab('sign-up', 'Create User', 'Trigger auth.onCreate')}
          ${this._renderEmailPwTab('reset', 'Reset Password', 'Send emulator reset email')}
        </div>
        <div class="email-pw-content">
          ${this._renderEmailPwView()}
        </div>
      </section>
    `;
  }

  private _renderEmailPwTab(view: EmailPwView, label: string, description: string) {
    const isActive = this.emailPwView === view;
    return html`
      <md-filled-tonal-button
        class="email-pw-tab"
        data-active=${isActive}
        aria-pressed=${isActive}
        title=${description}
        @click=${() => this._setEmailPwView(view)}
      >
        ${label}
      </md-filled-tonal-button>
    `;
  }

  private _renderEmailPwView() {
    switch (this.emailPwView) {
      case 'sign-up':
        return html`
          <df-sign-up @df-sign-up-success=${this._handleEmailPwSuccess}></df-sign-up>
        `;
      case 'reset':
        return html`
          <df-password-reset
            @df-password-reset-success=${this._handleEmailPwSuccess}
          ></df-password-reset>
        `;
      default:
        return html`
          <df-sign-in @df-sign-in-success=${this._handleEmailPwSuccess}></df-sign-in>
        `;
    }
  }

  private _setEmailPwView(view: EmailPwView) {
    this.emailPwView = view;
  }

  private _handleEmailPwSuccess() {
    this.emailPwView = 'sign-in';
  }

  private _renderHeader(user: {photoURL?: string | null; displayName?: string | null}) {
    return html`
      <div class="full-width-div">
        ${user.photoURL
          ? html`<img class="user-photo" src="${user.photoURL}" alt="User photo" />`
          : nothing}
        <h2 class="user-name">${user.displayName || 'User'}</h2>
        <md-text-button
          @click=${this._handleLogoutClick}
          aria-label="Sign out"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="60"
            height="12"
            viewBox="0 0 60 12"
          >
            <text
              x="3"
              y="10"
              style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:extra-condensed;font-size:12.7px;font-family:'Arial';stroke-width:0"
              fill="black"
            >
              LOGOUT
            </text>
          </svg>
        </md-text-button>
      </div>
    `;
  }

  private _renderUserJson(user: unknown) {
    return html`
      <div class="user-json">
        <pre>${JSON.stringify(user, null, 2)}</pre>
      </div>
    `;
  }

  private async _handleLoginClick() {
    try {
      await signInWithGoogle();
      const {authUser} = firebaseAuthState.get();
      this._dispatchUserChanged(authUser);
    } catch (error) {
      console.error('Login failed:', error);
      alert(error instanceof Error ? error.message : 'Login failed');
    }
  }

  private async _handleLogoutClick(event: MouseEvent) {
    // Alt+click toggles debug user display (legacy feature)
    if (event.altKey) {
      this.showHideUser = !this.showHideUser;
      return;
    }

    try {
      await signOut();
      this._dispatchUserChanged(null);
    } catch (error) {
      console.error('Logout failed:', error);
      alert(error instanceof Error ? error.message : 'Logout failed');
    }
  }

  private _dispatchUserChanged(user: unknown) {
    this.dispatchEvent(
      new CustomEvent('df-auth-wrapper-user-changed', {
        detail: {newValue: user},
        bubbles: true,
        composed: true,
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-auth-wrapper': DfAuthWrapper;
  }
}
