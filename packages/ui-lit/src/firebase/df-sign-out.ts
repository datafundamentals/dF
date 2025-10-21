/**
 * ⚠️ CRITICAL STANDARDS COMPLIANCE ⚠️
 *
 * Sign-out control rendered with Material Web buttons.
 */

import {LitElement, html, css, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import {firebaseAuthState, signOut} from '@df/state';

@customElement('df-sign-out')
export class DfSignOut extends SignalWatcher(LitElement) {
  @property({type: String}) declare variant: 'button' | 'link';

  constructor() {
    super();
    this.variant = 'button';
  }

  static override styles = css`
    :host {
      display: inline-flex;
      font-family: var(--df-font-family, 'Roboto', sans-serif);
    }
  `;

  override render() {
    const authState = firebaseAuthState.get();
    const isAuthenticated = authState.authState === 'authenticated';
    const isLoading = authState.authState === 'loading';

    if (!isAuthenticated && !isLoading) {
      return nothing;
    }

    const label = isLoading ? 'Signing Out…' : 'Sign Out';

    if (this.variant === 'link') {
      return html`
        <md-text-button @click=${this._handleClick} ?disabled=${isLoading}>
          ${label}
        </md-text-button>
      `;
    }

    return html`
      <md-filled-button @click=${this._handleClick} ?disabled=${isLoading}>
        ${label}
      </md-filled-button>
    `;
  }

  private async _handleClick() {
    try {
      await signOut();
      this.dispatchEvent(
        new CustomEvent('df-sign-out-success', {
          bubbles: true,
          composed: true,
        }),
      );
    } catch (error) {
      this.dispatchEvent(
        new CustomEvent('df-sign-out-error', {
          detail: {
            error: error instanceof Error ? error.message : 'Sign out failed',
          },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-sign-out': DfSignOut;
  }
}
