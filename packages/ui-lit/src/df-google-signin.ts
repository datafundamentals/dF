/**
 * ⚠️ CRITICAL STANDARDS COMPLIANCE ⚠️
 *
 * This component MUST use Material Design 3 web components from @material/web.
 *
 * ✅ ALLOWED:
 * - <md-filled-button>, <md-outlined-button>, <md-text-button>
 * - <md-outlined-text-field>, <md-filled-text-field>
 * - <md-filled-select>, <md-outlined-select> with <md-select-option>
 * - <md-checkbox>
 *
 * ❌ FORBIDDEN:
 * - Native <button>, <input>, <select>, <textarea>
 *
 * See:
 * - /coding_docs/STANDARDS_STYLES.md#material-design-3
 * - /packages/ui-lit/templates/md3-component-template.ts
 * - /packages/ui-lit/src/df-upload-link.ts (compliant example)
 *
 * Build will FAIL if native HTML elements detected.
 */

import {LitElement, html, css} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import {signInWithGoogle} from '@df/state';

// Material Design 3 imports
import '@material/web/button/filled-button.js';
import '@material/web/progress/circular-progress.js';

/**
 * Google Sign-In Button Component
 *
 * A production-ready, reusable Google Sign-In button that works across all apps in the monorepo.
 *
 * **Features:**
 * - ✅ Works in production with real Google OAuth
 * - ✅ Works in emulator with test account picker (no real Google servers)
 * - ✅ Handles loading states automatically
 * - ✅ Dispatches events for success/error handling
 * - ✅ Fully customizable appearance
 * - ✅ Signals-first architecture for reactive state
 *
 * **Production Setup:**
 * 1. Firebase Console → Authentication → Sign-in method
 * 2. Enable "Google" provider
 * 3. Add authorized domains (your production URL)
 * 4. Deploy - it just works!
 *
 * @fires google-signin-success - Fired when user successfully signs in
 * @fires google-signin-error - Fired when sign-in fails
 *
 * @example Basic Usage
 * ```html
 * <df-google-signin></df-google-signin>
 * ```
 *
 * @example With Custom Text
 * ```html
 * <df-google-signin button-text="Continue with Google"></df-google-signin>
 * ```
 *
 * @example With Event Handlers
 * ```html
 * <df-google-signin
 *   @google-signin-success=${this.handleSuccess}
 *   @google-signin-error=${this.handleError}>
 * </df-google-signin>
 * ```
 *
 * @example Programmatic Usage
 * ```typescript
 * const button = document.querySelector('df-google-signin');
 * button.addEventListener('google-signin-success', (e) => {
 *   console.log('User signed in:', e.detail.user);
 * });
 * ```
 */
@customElement('df-google-signin')
export class DfGoogleSignin extends SignalWatcher(LitElement) {
  static override styles = css`
    :host {
      display: inline-block;
    }

    .google-signin-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    md-filled-button {
      --md-filled-button-container-color: #4285f4;
      --md-filled-button-label-text-color: #ffffff;
      --md-filled-button-hover-container-color: #357ae8;
      --md-filled-button-pressed-container-color: #2a66c7;
    }

    md-filled-button::part(button) {
      padding: 8px 24px;
      border-radius: 4px;
      font-family: 'Roboto', sans-serif;
      font-weight: 500;
      font-size: 14px;
      letter-spacing: 0.25px;
    }

    .google-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      margin-right: 8px;
      background: white;
      border-radius: 2px;
      padding: 2px;
    }

    .loading-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    md-circular-progress {
      --md-circular-progress-size: 24px;
      --md-circular-progress-active-indicator-color: #ffffff;
    }

    .error-message {
      color: var(--md-sys-color-error, #b3261e);
      font-size: 12px;
      margin-top: 8px;
    }
  `;

  /**
   * Text displayed on the sign-in button
   * @type {string}
   */
  @property({type: String, attribute: 'button-text'})
  buttonText = 'Sign in with Google';

  /**
   * Optional Google API scopes to request additional permissions
   * Example: ['https://www.googleapis.com/auth/calendar.readonly']
   * @type {string[]}
   */
  @property({type: Array})
  scopes: string[] = [];

  /**
   * Whether to show the Google logo icon in the button
   * @type {boolean}
   */
  @property({type: Boolean, attribute: 'show-icon'})
  showIcon = true;

  /**
   * Internal loading state
   * @private
   */
  @state()
  private loading = false;

  /**
   * Internal error message
   * @private
   */
  @state()
  private errorMessage: string | null = null;

  /**
   * Handle Google Sign-In button click
   * @private
   */
  private async handleSignIn() {
    this.loading = true;
    this.errorMessage = null;

    try {
      await signInWithGoogle(this.scopes);

      // Dispatch success event
      this.dispatchEvent(
        new CustomEvent('google-signin-success', {
          detail: {
            timestamp: Date.now(),
          },
          bubbles: true,
          composed: true,
        })
      );
    } catch (error) {
      let message = 'Failed to sign in with Google';

      // Handle specific error codes
      if (error && typeof error === 'object' && 'code' in error) {
        const code = (error as {code: string}).code;
        if (code === 'auth/popup-blocked') {
          message = 'Popup blocked. Please allow popups for this site.';
        } else if (code === 'auth/popup-closed-by-user') {
          message = 'Sign-in cancelled.';
        } else if (code === 'auth/unauthorized-domain') {
          message = 'This domain is not authorized. Add it in Firebase Console.';
        }
      }

      this.errorMessage = message;

      // Dispatch error event
      this.dispatchEvent(
        new CustomEvent('google-signin-error', {
          detail: {
            error: error instanceof Error ? error : new Error(message),
            message,
          },
          bubbles: true,
          composed: true,
        })
      );

      console.error('Google sign-in error:', error);
    } finally {
      this.loading = false;
    }
  }

  override render() {
    return html`
      <div class="google-signin-container">
        ${this.loading
          ? html`
              <div class="loading-container">
                <md-circular-progress indeterminate></md-circular-progress>
                <span>Signing in...</span>
              </div>
            `
          : html`
              <md-filled-button @click=${this.handleSignIn}>
                ${this.showIcon
                  ? html`
                      <span class="google-icon" slot="icon">
                        <svg viewBox="0 0 18 18" width="18" height="18">
                          <path
                            fill="#4285F4"
                            d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                          />
                          <path
                            fill="#34A853"
                            d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"
                          />
                          <path
                            fill="#EA4335"
                            d="M9 3.582c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.29C4.672 5.163 6.656 3.582 9 3.582z"
                          />
                        </svg>
                      </span>
                    `
                  : ''}
                ${this.buttonText}
              </md-filled-button>
            `}
      </div>
      ${this.errorMessage
        ? html` <div class="error-message">${this.errorMessage}</div> `
        : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-google-signin': DfGoogleSignin;
  }
}
