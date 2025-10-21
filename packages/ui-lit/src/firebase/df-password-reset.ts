/**
 * ⚠️ CRITICAL STANDARDS COMPLIANCE ⚠️
 *
 * MD3-compliant password reset form. Uses Material Web text fields and buttons.
 */

import {LitElement, html, css, nothing} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import {firebaseAuthState, resetPassword} from '@df/state';
import type {PasswordResetRequest} from '@df/types';
import type {MdOutlinedTextField} from '@material/web/textfield/outlined-text-field.js';

@customElement('df-password-reset')
export class DfPasswordReset extends SignalWatcher(LitElement) {
  @state() declare private email: string;
  @state() declare private isSubmitting: boolean;
  @state() declare private successMessage: string;

  constructor() {
    super();
    this.email = '';
    this.isSubmitting = false;
    this.successMessage = '';
  }

  static override styles = css`
    :host {
      display: block;
      font-family: var(--df-font-family, 'Roboto', sans-serif);
    }

    .surface {
      max-width: 440px;
      padding: 24px;
      border-radius: 16px;
      background: var(--md-sys-color-surface, #ffffff);
      border: 1px solid var(--md-sys-color-outline-variant, rgba(15, 23, 42, 0.12));
      box-shadow: 0 12px 32px rgba(15, 23, 42, 0.09);
    }

    h2 {
      margin: 0;
      font-size: 1.6rem;
      font-weight: 600;
      color: var(--md-sys-color-on-surface, #0f172a);
    }

    p.description {
      margin: 12px 0 24px;
      font-size: 0.95rem;
      line-height: 1.6;
      color: var(--md-sys-color-on-surface-variant, #475569);
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

    .feedback {
      padding: 12px;
      border-radius: 12px;
      font-size: 0.9rem;
    }

    .feedback.error {
      background: var(--md-sys-color-error-container, rgba(186, 26, 26, 0.12));
      color: var(--md-sys-color-on-error-container, #410e0b);
    }

    .feedback.success {
      background: var(--md-sys-color-secondary-container, rgba(63, 81, 181, 0.12));
      color: var(--md-sys-color-on-secondary-container, #1e1b4b);
    }
  `;

  override render() {
    const authState = firebaseAuthState.get();
    const error = authState.error;

    return html`
      <div class="surface">
        <h2>Reset Password</h2>
        <p class="description">
          Enter your email address and we'll send you a secure link to reset your password.
        </p>

        ${error ? html`<div class="feedback error" role="alert">${error}</div>` : nothing}
        ${this.successMessage ? html`<div class="feedback success">${this.successMessage}</div>` : nothing}

        <form @submit=${this._handleSubmit}>
          <md-outlined-text-field
            type="email"
            label="Email"
            .value=${this.email}
            autocomplete="email"
            ?disabled=${this.isSubmitting}
            required
            @input=${this._handleEmailInput}
          ></md-outlined-text-field>

          <md-filled-button type="submit" ?disabled=${this.isSubmitting}>
            ${this.isSubmitting ? 'Sending…' : 'Send Reset Link'}
          </md-filled-button>

          ${this.isSubmitting ? html`<md-circular-progress indeterminate></md-circular-progress>` : nothing}
        </form>
      </div>
    `;
  }

  private _handleEmailInput(event: Event) {
    this.email = (event.target as MdOutlinedTextField).value ?? '';
    this.successMessage = '';
  }

  private async _handleSubmit(event: Event) {
    event.preventDefault();

    this.isSubmitting = true;
    this.successMessage = '';

    const request: PasswordResetRequest = {email: this.email};

    try {
      await resetPassword(request);
      this.successMessage = `Password reset email sent to ${this.email}. Check your inbox.`;
      this.dispatchEvent(
        new CustomEvent('df-password-reset-success', {
          detail: {email: this.email},
          bubbles: true,
          composed: true,
        }),
      );
      this.email = '';
    } catch (error) {
      this.dispatchEvent(
        new CustomEvent('df-password-reset-error', {
          detail: {
            error: error instanceof Error ? error.message : 'Password reset failed',
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
    'df-password-reset': DfPasswordReset;
  }
}
