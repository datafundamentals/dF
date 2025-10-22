/**
 * ⚠️ CRITICAL STANDARDS COMPLIANCE ⚠️
 *
 * Uses Material Design 3 controls for authentication UI.
 * This component wraps protected content and manages Google Sign-In flow.
 */

import {LitElement, html, css, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import {googleAuthUser, googleSignIn, googleSignOut} from '@df/state';
import '@material/web/button/filled-button.js';
import '@material/web/button/text-button.js';

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

  constructor() {
    super();
    this.headless = false;
    this.showHideUser = false;
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
  `;

  override render() {
    const user = googleAuthUser.get();

    if (!user) {
      return this._renderLoginScreen();
    }

    if (this.headless) {
      return html`<slot></slot>`;
    }

    return html`
      ${this._renderHeader(user)}
      ${this.showHideUser ? this._renderUserJson(user) : nothing}
      <slot></slot>
    `;
  }

  private _renderLoginScreen() {
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
      await googleSignIn();
      this._dispatchUserChanged(googleAuthUser.get());
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
      await googleSignOut();
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
