import {LitElement, html, css} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import {firebaseAuthState, signIn} from '@df/state';
import type {SignInCredentials} from '@df/types';

/**
 * Sign-in form component
 *
 * A presentation component that allows users to sign in with email and password.
 * Uses Firebase authentication via the shared auth store.
 *
 * @fires df-sign-in-success - Dispatched when sign-in succeeds
 * @fires df-sign-in-error - Dispatched when sign-in fails
 */
@customElement('df-sign-in')
export class DfSignIn extends SignalWatcher(LitElement) {
  @state() declare private email: string;
  @state() declare private password: string;

  constructor() {
    super();
    this.email = '';
    this.password = '';
  }

  static override styles = css`
    :host {
      display: block;
      font-family: var(--df-font-family, system-ui, sans-serif);
    }

    .sign-in-container {
      max-width: 400px;
      padding: var(--df-spacing-4, 1.5rem);
      border: 1px solid var(--df-border-color, #e0e0e0);
      border-radius: var(--df-border-radius, 8px);
      background: var(--df-surface-color, #fff);
    }

    .title {
      margin: 0 0 var(--df-spacing-4, 1.5rem) 0;
      font-size: var(--df-title-font-size, 1.5rem);
      font-weight: var(--df-title-font-weight, 600);
      color: var(--df-text-primary, #000);
    }

    .form {
      display: flex;
      flex-direction: column;
      gap: var(--df-spacing-3, 1rem);
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: var(--df-spacing-1, 0.25rem);
    }

    label {
      font-size: var(--df-label-font-size, 0.875rem);
      font-weight: var(--df-label-font-weight, 500);
      color: var(--df-text-secondary, #666);
    }

    input {
      padding: var(--df-input-padding, 0.75rem);
      border: 1px solid var(--df-input-border-color, #ccc);
      border-radius: var(--df-input-border-radius, 4px);
      font-size: var(--df-input-font-size, 1rem);
      font-family: inherit;
      transition: border-color 0.2s;
    }

    input:focus {
      outline: none;
      border-color: var(--df-primary-color, #1976d2);
      box-shadow: 0 0 0 2px var(--df-primary-color-alpha, rgba(25, 118, 210, 0.1));
    }

    input:disabled {
      background-color: var(--df-disabled-bg, #f5f5f5);
      cursor: not-allowed;
    }

    .button {
      padding: var(--df-button-padding, 0.75rem 1.5rem);
      border: none;
      border-radius: var(--df-button-border-radius, 4px);
      background: var(--df-primary-color, #1976d2);
      color: var(--df-button-text-color, #fff);
      font-size: var(--df-button-font-size, 1rem);
      font-weight: var(--df-button-font-weight, 500);
      cursor: pointer;
      transition: background 0.2s;
    }

    .button:hover:not(:disabled) {
      background: var(--df-primary-color-hover, #1565c0);
    }

    .button:disabled {
      background: var(--df-disabled-bg, #ccc);
      cursor: not-allowed;
    }

    .error {
      padding: var(--df-spacing-2, 0.5rem);
      border-radius: var(--df-border-radius, 4px);
      background: var(--df-error-bg, #ffebee);
      color: var(--df-error-text, #c62828);
      font-size: var(--df-error-font-size, 0.875rem);
    }

    .loading {
      text-align: center;
      color: var(--df-text-secondary, #666);
      font-size: var(--df-loading-font-size, 0.875rem);
    }
  `;

  override render() {
    const authState = firebaseAuthState.get();
    const isLoading = authState.authState === 'loading';
    const error = authState.error;

    return html`
      <div class="sign-in-container">
        <h2 class="title">Sign In</h2>

        ${error ? html`<div class="error">${error}</div>` : ''}

        <form class="form" @submit=${this._handleSubmit}>
          <div class="form-field">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              .value=${this.email}
              @input=${this._handleEmailInput}
              ?disabled=${isLoading}
              required
              autocomplete="email"
            />
          </div>

          <div class="form-field">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              .value=${this.password}
              @input=${this._handlePasswordInput}
              ?disabled=${isLoading}
              required
              autocomplete="current-password"
            />
          </div>

          <button
            type="submit"
            class="button"
            ?disabled=${isLoading}
          >
            ${isLoading ? 'Signing In...' : 'Sign In'}
          </button>

          ${isLoading ? html`<div class="loading">Please wait...</div>` : ''}
        </form>
      </div>
    `;
  }

  private _handleEmailInput(e: Event) {
    this.email = (e.target as HTMLInputElement).value;
  }

  private _handlePasswordInput(e: Event) {
    this.password = (e.target as HTMLInputElement).value;
  }

  private async _handleSubmit(e: Event) {
    e.preventDefault();

    const credentials: SignInCredentials = {
      email: this.email,
      password: this.password,
    };

    try {
      await signIn(credentials);

      // Dispatch success event
      this.dispatchEvent(
        new CustomEvent('df-sign-in-success', {
          detail: {email: this.email},
          bubbles: true,
          composed: true,
        })
      );

      // Clear form
      this.email = '';
      this.password = '';
    } catch (error) {
      // Dispatch error event
      this.dispatchEvent(
        new CustomEvent('df-sign-in-error', {
          detail: {
            error: error instanceof Error ? error.message : 'Sign in failed',
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
    'df-sign-in': DfSignIn;
  }
}
