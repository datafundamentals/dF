import {LitElement, html, css} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import {firebaseAuthState, resetPassword} from '@df/state';
import type {PasswordResetRequest} from '@df/types';

/**
 * Password reset form component
 *
 * A presentation component that allows users to request a password reset email.
 *
 * @fires df-password-reset-success - Dispatched when reset email is sent
 * @fires df-password-reset-error - Dispatched when reset fails
 */
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
      font-family: var(--df-font-family, system-ui, sans-serif);
    }

    .reset-container {
      max-width: 400px;
      padding: var(--df-spacing-4, 1.5rem);
      border: 1px solid var(--df-border-color, #e0e0e0);
      border-radius: var(--df-border-radius, 8px);
      background: var(--df-surface-color, #fff);
    }

    .title {
      margin: 0 0 var(--df-spacing-2, 0.5rem) 0;
      font-size: var(--df-title-font-size, 1.5rem);
      font-weight: var(--df-title-font-weight, 600);
      color: var(--df-text-primary, #000);
    }

    .description {
      margin: 0 0 var(--df-spacing-4, 1.5rem) 0;
      font-size: var(--df-description-font-size, 0.875rem);
      color: var(--df-text-secondary, #666);
      line-height: 1.5;
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

    .success {
      padding: var(--df-spacing-2, 0.5rem);
      border-radius: var(--df-border-radius, 4px);
      background: var(--df-success-bg, #e8f5e9);
      color: var(--df-success-text, #2e7d32);
      font-size: var(--df-success-font-size, 0.875rem);
    }

    .loading {
      text-align: center;
      color: var(--df-text-secondary, #666);
      font-size: var(--df-loading-font-size, 0.875rem);
    }
  `;

  override render() {
    const authState = firebaseAuthState.get();
    const error = authState.error;

    return html`
      <div class="reset-container">
        <h2 class="title">Reset Password</h2>
        <p class="description">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        ${error ? html`<div class="error">${error}</div>` : ''}
        ${this.successMessage ? html`<div class="success">${this.successMessage}</div>` : ''}

        <form class="form" @submit=${this._handleSubmit}>
          <div class="form-field">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              .value=${this.email}
              @input=${this._handleEmailInput}
              ?disabled=${this.isSubmitting}
              required
              autocomplete="email"
            />
          </div>

          <button
            type="submit"
            class="button"
            ?disabled=${this.isSubmitting}
          >
            ${this.isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </button>

          ${this.isSubmitting ? html`<div class="loading">Please wait...</div>` : ''}
        </form>
      </div>
    `;
  }

  private _handleEmailInput(e: Event) {
    this.email = (e.target as HTMLInputElement).value;
    this.successMessage = ''; // Clear success message when user types
  }

  private async _handleSubmit(e: Event) {
    e.preventDefault();

    this.isSubmitting = true;
    this.successMessage = '';

    const request: PasswordResetRequest = {
      email: this.email,
    };

    try {
      await resetPassword(request);

      this.successMessage = `Password reset email sent to ${this.email}. Please check your inbox.`;

      // Dispatch success event
      this.dispatchEvent(
        new CustomEvent('df-password-reset-success', {
          detail: {email: this.email},
          bubbles: true,
          composed: true,
        })
      );

      // Clear form
      this.email = '';
    } catch (error) {
      // Dispatch error event
      this.dispatchEvent(
        new CustomEvent('df-password-reset-error', {
          detail: {
            error: error instanceof Error ? error.message : 'Password reset failed',
          },
          bubbles: true,
          composed: true,
        })
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
