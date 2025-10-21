/**
 * ⚠️ CRITICAL STANDARDS COMPLIANCE ⚠️
 *
 * Uses Material Design 3 controls for the sign-in flow. If Material Web adds a
 * dedicated sign-in component in the future, replace this implementation and
 * remove the custom logic.
 */

import {LitElement, html, css, nothing} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import {firebaseAuthState, signIn} from '@df/state';
import type {SignInCredentials} from '@df/types';
import type {MdOutlinedTextField} from '@material/web/textfield/outlined-text-field.js';

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
      font-family: var(--df-font-family, 'Roboto', sans-serif);
    }

    .surface {
      max-width: 420px;
      padding: 24px;
      border-radius: 16px;
      background: var(--md-sys-color-surface, #ffffff);
      border: 1px solid var(--md-sys-color-outline-variant, rgba(15, 23, 42, 0.12));
      box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
    }

    h2 {
      margin: 0 0 20px;
      font-size: 1.6rem;
      font-weight: 600;
      color: var(--md-sys-color-on-surface, #0f172a);
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    md-circular-progress {
      display: block;
      margin: 16px auto 0;
    }

    .error {
      padding: 12px;
      border-radius: 12px;
      background: var(--md-sys-color-error-container, rgba(186, 26, 26, 0.12));
      color: var(--md-sys-color-on-error-container, #410e0b);
      font-size: 0.9rem;
    }
  `;

  override render() {
    const authState = firebaseAuthState.get();
    const isLoading = authState.authState === 'loading';
    const error = authState.error;

    return html`
      <div class="surface">
        <h2>Sign In</h2>
        ${error ? html`<div class="error" role="alert">${error}</div>` : nothing}

        <form @submit=${this._handleSubmit}>
          <md-outlined-text-field
            type="email"
            label="Email"
            .value=${this.email}
            autocomplete="email"
            ?disabled=${isLoading}
            required
            @input=${this._handleEmailInput}
          ></md-outlined-text-field>

          <md-outlined-text-field
            type="password"
            label="Password"
            .value=${this.password}
            autocomplete="current-password"
            ?disabled=${isLoading}
            required
            @input=${this._handlePasswordInput}
          ></md-outlined-text-field>

          <md-filled-button type="submit" ?disabled=${isLoading}>
            ${isLoading ? 'Signing In…' : 'Sign In'}
          </md-filled-button>

          ${isLoading ? html`<md-circular-progress indeterminate></md-circular-progress>` : nothing}
        </form>
      </div>
    `;
  }

  private _handleEmailInput(event: Event) {
    this.email = (event.target as MdOutlinedTextField).value ?? '';
  }

  private _handlePasswordInput(event: Event) {
    this.password = (event.target as MdOutlinedTextField).value ?? '';
  }

  private async _handleSubmit(event: Event) {
    event.preventDefault();

    const credentials: SignInCredentials = {
      email: this.email,
      password: this.password,
    };

    try {
      await signIn(credentials);
      this.dispatchEvent(
        new CustomEvent('df-sign-in-success', {
          detail: {email: this.email},
          bubbles: true,
          composed: true,
        }),
      );
      this.email = '';
      this.password = '';
    } catch (error) {
      this.dispatchEvent(
        new CustomEvent('df-sign-in-error', {
          detail: {
            error: error instanceof Error ? error.message : 'Sign in failed',
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
    'df-sign-in': DfSignIn;
  }
}
