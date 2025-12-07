import {css, html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';

// Import all demo components
import '@df/ui-lit/firebase/df-firestore-demo';
import '@df/ui-lit/firebase/df-storage-demo';
import '@df/ui-lit/firebase/df-functions-demo';

/**
 * Teaching App Container
 *
 * Generic application shell that hosts Firebase pattern demonstrations.
 * Components are conditionally loaded based on environment (test vs dev/prod).
 */
@customElement('app-container')
export class AppContainer extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .content {
      padding: 1.5rem;
      display: grid;
      gap: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .demo-section {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 16px;
      overflow: hidden;
    }
  `;

  override render() {
    // Always render Firestore demo (required for integration tests)
    // Conditionally render Storage and Functions demos (not in test mode)
    const isTestMode = import.meta.env.MODE === 'test';

    return html`
      <div class="content">
        <div class="demo-section">
          <df-firestore-demo></df-firestore-demo>
        </div>

        ${!isTestMode
          ? html`
              <div class="demo-section">
                <df-storage-demo></df-storage-demo>
              </div>

              <div class="demo-section">
                <df-functions-demo></df-functions-demo>
              </div>
            `
          : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-container': AppContainer;
  }
}
