import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import {firebaseAuthState, signOut} from '@df/state';

/**
 * Sign-out button component
 *
 * A presentation component that displays a button to sign out the current user.
 * Only shows when a user is authenticated.
 *
 * @fires df-sign-out-success - Dispatched when sign-out succeeds
 * @fires df-sign-out-error - Dispatched when sign-out fails
 */
@customElement('df-sign-out')
export class DfSignOut extends SignalWatcher(LitElement) {
  @property({type: String}) declare variant: 'button' | 'link';

  constructor() {
    super();
    this.variant = 'button';
  }

  static override styles = css`
    :host {
      display: inline-block;
      font-family: var(--df-font-family, system-ui, sans-serif);
    }

    .button {
      padding: var(--df-button-padding, 0.75rem 1.5rem);
      border: none;
      border-radius: var(--df-button-border-radius, 4px);
      background: var(--df-secondary-color, #757575);
      color: var(--df-button-text-color, #fff);
      font-size: var(--df-button-font-size, 1rem);
      font-weight: var(--df-button-font-weight, 500);
      cursor: pointer;
      transition: background 0.2s;
    }

    .button:hover:not(:disabled) {
      background: var(--df-secondary-color-hover, #616161);
    }

    .button:disabled {
      background: var(--df-disabled-bg, #ccc);
      cursor: not-allowed;
    }

    .link {
      background: none;
      border: none;
      padding: 0;
      color: var(--df-link-color, #1976d2);
      text-decoration: underline;
      font-size: var(--df-link-font-size, 1rem);
      cursor: pointer;
    }

    .link:hover:not(:disabled) {
      color: var(--df-link-hover-color, #1565c0);
    }

    .link:disabled {
      color: var(--df-disabled-text, #999);
      cursor: not-allowed;
    }

    .hidden {
      display: none;
    }
  `;

  override render() {
    const authState = firebaseAuthState.get();
    const isAuthenticated = authState.authState === 'authenticated';
    const isLoading = authState.authState === 'loading';

    if (!isAuthenticated && !isLoading) {
      return html`<span class="hidden"></span>`;
    }

    const buttonClass = this.variant === 'link' ? 'link' : 'button';

    return html`
      <button
        class=${buttonClass}
        @click=${this._handleClick}
        ?disabled=${isLoading}
      >
        ${isLoading ? 'Signing Out...' : 'Sign Out'}
      </button>
    `;
  }

  private async _handleClick() {
    try {
      await signOut();

      // Dispatch success event
      this.dispatchEvent(
        new CustomEvent('df-sign-out-success', {
          bubbles: true,
          composed: true,
        })
      );
    } catch (error) {
      // Dispatch error event
      this.dispatchEvent(
        new CustomEvent('df-sign-out-error', {
          detail: {
            error: error instanceof Error ? error.message : 'Sign out failed',
          },
          bubbles: true,
          composed: true,
        })
      );
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-sign-out': DfSignOut;
  }
}
