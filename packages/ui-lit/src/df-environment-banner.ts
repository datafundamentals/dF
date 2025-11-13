import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import type {FirebaseEnvironment} from '@df/firebase';
import {ENVIRONMENT_CONFIGS, getFirebaseEnvironmentConfig} from '@df/firebase';

/**
 * Displays the active Firebase connection mode so developers do not
 * accidentally run destructive operations against production data.
 */
@customElement('df-environment-banner')
export class DfEnvironmentBanner extends LitElement {
  /**
   * Optional override that forces the component into a specific Firebase
   * environment. Primarily useful for Storybook documentation.
   */
  @property({type: String}) declare environment?: FirebaseEnvironment;

  /**
   * Cache the default environment configuration so repeated renders
   * do not re-read the Vite env variable.
   */
  private readonly defaultConfig = getFirebaseEnvironmentConfig();

  /**
   * Uses the override value when provided, otherwise falls back to the
   * resolved config derived from Vite environment variables.
   */
  private get resolvedEnvironment(): FirebaseEnvironment {
    if (this.environment && this.environment in ENVIRONMENT_CONFIGS) {
      return this.environment as FirebaseEnvironment;
    }
    return this.defaultConfig.firestore || this.defaultConfig.storage || this.defaultConfig.functions
      ? 'fb-emulator'
      : 'fb-cloud';
  }

  private get resolvedConfig() {
    const env = this.resolvedEnvironment;
    return env === this.environment ? ENVIRONMENT_CONFIGS[env] : this.defaultConfig;
  }

  static override styles = css`
    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: 1000;
      font-family: var(--md-ref-typeface-plain, 'Roboto', 'Helvetica Neue', sans-serif);
    }

    .banner {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.85rem 1.2rem;
      border-left: 6px solid transparent;
      border-radius: 0 0 0.75rem 0.75rem;
      font-size: 0.95rem;
      line-height: 1.35;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.18);
    }

    .mode {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }

    .label {
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .description {
      margin: 0;
      color: rgba(0, 0, 0, 0.8);
      font-size: 0.9rem;
    }

    .banner.emulator {
      background: var(--df-env-banner-emulator-bg, #fff8e1);
      border-left-color: var(--df-env-banner-emulator-border, #f7b500);
      color: var(--df-env-banner-emulator-text, #4a3b00);
    }

    .banner.cloud {
      background: var(--df-env-banner-cloud-bg, #ffe5e5);
      border-left-color: var(--df-env-banner-cloud-border, #d32f2f);
      color: var(--df-env-banner-cloud-text, #5d0c0c);
    }

    .pill {
      padding: 0.15rem 0.5rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.05em;
    }

    .emulator .pill {
      background: rgba(255, 193, 7, 0.2);
      color: inherit;
    }

    .cloud .pill {
      background: rgba(244, 67, 54, 0.2);
      color: inherit;
    }
  `;

  override render() {
    const env = this.resolvedEnvironment;
    const config = this.resolvedConfig;
    const modeClass = env === 'fb-emulator' ? 'emulator' : 'cloud';

    return html`
      <section class="banner ${modeClass}" role="status" aria-live="polite">
        <div class="pill">${env}</div>
        <div class="mode">
          <span class="label">${config.label}</span>
          <p class="description">${config.description}</p>
        </div>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-environment-banner': DfEnvironmentBanner;
  }
}
