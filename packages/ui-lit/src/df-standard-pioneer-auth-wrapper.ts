import {SignalWatcher} from '@lit-labs/signals';
import {
  cfAuthState,
  cfLogout,
  initializeCfAuth,
  startCfLoginPopup,
  startCfLoginRedirect,
} from '@df/state';
import type {CfUser} from '@df/types';
import {css, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';

/** Protects slotted content with a Cloudflare Access session. */
@customElement('df-standard-pioneer-auth-wrapper')
export class DfStandardPioneerAuthWrapper extends SignalWatcher(LitElement) {
  @property({type: Boolean}) declare headless: boolean;
  @property({type: Boolean, attribute: 'show-hide-user'})
  declare showHideUser: boolean;
  @property({type: String}) declare bkgrd: string | null;
  @property({type: String, attribute: 'session-url'})
  declare sessionUrl: string;
  @property({type: String, attribute: 'login-url'}) declare loginUrl: string;
  @property({type: String, attribute: 'logout-url'}) declare logoutUrl: string;
  @property({type: Boolean, attribute: 'use-popup'}) declare usePopup: boolean;
  @state() declare private interactionError: string | null;

  private lastAnnouncedUser: CfUser | null | undefined;

  constructor() {
    super();
    this.headless = false;
    this.showHideUser = false;
    this.bkgrd = null;
    this.sessionUrl = '/cf-auth/whoami';
    this.loginUrl = '/cf-auth/login';
    this.logoutUrl = '/cdn-cgi/access/logout';
    this.usePopup = false;
    this.interactionError = null;
    this.lastAnnouncedUser = undefined;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    void initializeCfAuth({
      sessionUrl: this.sessionUrl,
      loginUrl: this.loginUrl,
      logoutUrl: this.logoutUrl,
    });
  }

  protected override updated(): void {
    const stateSnapshot = cfAuthState.get();
    if (!stateSnapshot.initialized) return;
    if (stateSnapshot.authUser === this.lastAnnouncedUser) return;
    this.lastAnnouncedUser = stateSnapshot.authUser;
    this.dispatchEvent(
      new CustomEvent('df-standard-pioneer-auth-wrapper-user-changed', {
        detail: {newValue: stateSnapshot.authUser},
        bubbles: true,
        composed: true,
      })
    );
  }

  static override styles = css`
    :host {
      display: block;
      font-family: var(--df-font-family, 'Roboto', sans-serif);
    }

    .full-screen {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 16px;
      box-sizing: border-box;
      min-height: 100vh;
      width: 100%;
      padding: 24px;
      background-position: center;
      background-size: cover;
      background-repeat: no-repeat;
      background-color: var(--md-sys-color-surface, #fff);
      color: var(--md-sys-color-on-surface, #1b1b1f);
    }

    .full-width-div {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      min-height: 50px;
      padding: 0 12px;
      background: var(--md-sys-color-surface-container, #eeeef2);
      border-radius: 5px;
    }

    .identity {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    .user-photo {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-name {
      margin: 0;
      overflow: hidden;
      font-size: 1.125rem;
      font-weight: 500;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-json {
      margin: 16px;
      padding: 16px;
      overflow-x: auto;
      border-radius: 8px;
      background: var(--md-sys-color-surface-container, #f0f0f0);
    }

    .user-json pre {
      margin: 0;
      font-family: var(--df-monospace-font-family, monospace);
      font-size: 0.875rem;
    }

    .error {
      color: var(--md-sys-color-error, #b3261e);
      text-align: center;
    }
  `;

  override render() {
    const snapshot = cfAuthState.get();
    const error = this.interactionError ?? snapshot.error;

    if (snapshot.authState === 'idle' || snapshot.authState === 'loading') {
      return html`
        <div class="full-screen" aria-label="Checking authentication">
          <md-circular-progress indeterminate></md-circular-progress>
        </div>
      `;
    }

    if (snapshot.authState !== 'authenticated' || !snapshot.authUser) {
      return this.renderLogin(error);
    }

    if (this.headless) return html`<slot></slot>`;

    return html`
      ${this.renderHeader(snapshot.authUser)}
      ${this.showHideUser ? this.renderUserJson(snapshot.authUser) : nothing}
      <slot></slot>
    `;
  }

  private renderLogin(error: string | null) {
    const styles = this.bkgrd ? {backgroundImage: `url(${this.bkgrd})`} : {};
    return html`
      <div class="full-screen" style=${styleMap(styles)}>
        ${error ? html`<p class="error" role="alert">${error}</p>` : nothing}
        <md-filled-button @click=${this.handleLogin}>Sign in</md-filled-button>
      </div>
    `;
  }

  private renderHeader(user: CfUser) {
    return html`
      <div class="full-width-div">
        <div class="identity">
          ${user.picture
            ? html`<img class="user-photo" src=${user.picture} alt="" />`
            : nothing}
          <h2 class="user-name">${user.name ?? user.email}</h2>
        </div>
        <md-text-button @click=${this.handleLogout} aria-label="Sign out">
          Log out
        </md-text-button>
      </div>
    `;
  }

  private renderUserJson(user: CfUser) {
    return html`<div class="user-json">
      <pre>${JSON.stringify(user, null, 2)}</pre>
    </div>`;
  }

  private readonly handleLogin = async (): Promise<void> => {
    this.interactionError = null;
    try {
      if (this.usePopup) await startCfLoginPopup();
      else startCfLoginRedirect();
    } catch (error) {
      this.interactionError =
        error instanceof Error ? error.message : 'Sign-in failed';
    }
  };

  private readonly handleLogout = (event: MouseEvent): void => {
    if (event.altKey) {
      this.showHideUser = !this.showHideUser;
      return;
    }
    cfLogout();
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'df-standard-pioneer-auth-wrapper': DfStandardPioneerAuthWrapper;
  }
}
