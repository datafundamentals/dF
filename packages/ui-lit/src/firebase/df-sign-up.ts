/**
 * ⚠️ CRITICAL STANDARDS COMPLIANCE ⚠️
 *
 * Material Design 3 sign-up form using Material Web text fields and buttons.
 */

import {LitElement, html, css, nothing} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import {firebaseAuthState, signUp} from '@df/state';
import type {SignUpData} from '@df/types';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/button/filled-button.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/divider/divider.js';
import type {MdOutlinedTextField} from '@material/web/textfield/outlined-text-field.js';

@customElement('df-sign-up')
export class DfSignUp extends SignalWatcher(LitElement) {
  @state() declare private email: string;
  @state() declare private password: string;
  @state() declare private confirmPassword: string;
  @state() declare private displayName: string;
  @state() declare private validationError: string;
  @state() declare private isSubmitting: boolean;

  constructor() {
    super();
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.displayName = '';
    this.validationError = '';
    this.isSubmitting = false;
  }

  static override styles = css`
    :host {
      display: block;
      font-family: var(--df-font-family, 'Roboto', sans-serif);
    }

    .surface {
      max-width: 480px;
      padding: 28px;
      border-radius: 18px;
      background: var(--md-sys-color-surface, #ffffff);
      border: 1px solid var(--md-sys-color-outline-variant, rgba(15, 23, 42, 0.12));
      box-shadow: 0 16px 36px rgba(15, 23, 42, 0.1);
    }

    h2 {
      margin: 0;
      font-size: 1.7rem;
      font-weight: 600;
      color: var(--md-sys-color-on-surface, #0f172a);
    }

    p.description {
      margin: 12px 0 24px;
      font-size: 0.95rem;
      color: var(--md-sys-color-on-surface-variant, #4b5563);
      line-height: 1.6;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .feedback {
      padding: 12px;
      border-radius: 12px;
      font-size: 0.9rem;
    }

    .feedback.error {
      background: var(--md-sys-color-error-container, rgba(186, 26, 26, 0.12));
      color: var(--md-sys-color-on-error-container, #410e0b);
    }

    md-circular-progress {
      display: block;
      margin: 16px auto 0;
    }
  `;

  override render() {
    const authState = firebaseAuthState.get();
    const error = authState.error;

    return html`
      <div class="surface">
        <h2>Create an account</h2>
        <p class="description">
          Provide your email address and a strong password. You can optionally add a display name now or update it later.
        </p>

        ${error ? html`<div class="feedback error" role="alert">${error}</div>` : nothing}
        ${this.validationError ? html`<div class="feedback error" role="alert">${this.validationError}</div>` : nothing}

        <form @submit=${this._handleSubmit}>
          <md-outlined-text-field
            label="Display name"
            supporting-text="Optional"
            .value=${this.displayName}
            ?disabled=${this.isSubmitting}
            @input=${this._handleDisplayNameInput}
          ></md-outlined-text-field>

          <md-divider></md-divider>

          <md-outlined-text-field
            type="email"
            label="Email"
            .value=${this.email}
            autocomplete="email"
            ?disabled=${this.isSubmitting}
            required
            @input=${this._handleEmailInput}
          ></md-outlined-text-field>

          <md-outlined-text-field
            type="password"
            label="Password"
            supporting-text="Minimum 6 characters"
            .value=${this.password}
            autocomplete="new-password"
            ?disabled=${this.isSubmitting}
            required
            minlength="6"
            @input=${this._handlePasswordInput}
          ></md-outlined-text-field>

          <md-outlined-text-field
            type="password"
            label="Confirm password"
            .value=${this.confirmPassword}
            autocomplete="new-password"
            ?disabled=${this.isSubmitting}
            required
            minlength="6"
            @input=${this._handleConfirmPasswordInput}
          ></md-outlined-text-field>

          <md-filled-button type="submit" ?disabled=${this.isSubmitting}>
            ${this.isSubmitting ? 'Creating account…' : 'Sign Up'}
          </md-filled-button>

          ${this.isSubmitting ? html`<md-circular-progress indeterminate></md-circular-progress>` : nothing}
        </form>
      </div>
    `;
  }

  private _handleDisplayNameInput(event: Event) {
    this.displayName = (event.target as MdOutlinedTextField).value ?? '';
  }

  private _handleEmailInput(event: Event) {
    this.email = (event.target as MdOutlinedTextField).value ?? '';
    this._clearValidationError();
  }

  private _handlePasswordInput(event: Event) {
    this.password = (event.target as MdOutlinedTextField).value ?? '';
    this._clearValidationError();
  }

  private _handleConfirmPasswordInput(event: Event) {
    this.confirmPassword = (event.target as MdOutlinedTextField).value ?? '';
    this._clearValidationError();
  }

  private _clearValidationError() {
    this.validationError = '';
  }

  private async _handleSubmit(event: Event) {
    event.preventDefault();

    if (this.password !== this.confirmPassword) {
      this.validationError = 'Passwords do not match';
      return;
    }

    const payload: SignUpData = {
      email: this.email,
      password: this.password,
      displayName: this.displayName || undefined,
    };

    this.isSubmitting = true;

    try {
      await signUp(payload);
      this.dispatchEvent(
        new CustomEvent('df-sign-up-success', {
          detail: {email: this.email, displayName: this.displayName},
          bubbles: true,
          composed: true,
        }),
      );
      this.email = '';
      this.password = '';
      this.confirmPassword = '';
      this.displayName = '';
      this.validationError = '';
    } catch (error) {
      this.dispatchEvent(
        new CustomEvent('df-sign-up-error', {
          detail: {
            error: error instanceof Error ? error.message : 'Sign up failed',
          },
          bubbles: true,
          composed: true,
        }),
      );
    } finally {
      this.isSubmitting = false;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-sign-up': DfSignUp;
  }
}
