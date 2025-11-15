/**
 * Development-only component for seeding Firestore with reference data
 *
 * This component is ONLY displayed when accessing from localhost or 127.0.0.1.
 * This safety check prevents accidental usage in production environments.
 *
 * It provides a simple interface to populate Firestore with seed data
 * for development and testing purposes.
 */

import {LitElement, html, css, nothing} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import {seedDataStore} from '@df/state';

@customElement('df-seed-data')
export class DfSeedData extends SignalWatcher(LitElement) {
  @state() declare private isSeeding: boolean;

  constructor() {
    super();
    this.isSeeding = false;
  }

  /**
   * Check if component should be visible
   * Only show on localhost/127.0.0.1
   */
  private get shouldRender(): boolean {
    // Only show on localhost - sufficient safety check for dev-only component
    if (typeof window === 'undefined') return false;

    const host = window.location.hostname;
    const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host === '::1';

    // Debug: log hostname check (remove after testing if needed)
    if (!isLocalhost) {
      console.debug(`[df-seed-data] Not rendering on host: ${host}`);
    }

    return isLocalhost;
  }

  static override styles = css`
    :host {
      display: block;
    }

    .seed-panel {
      padding: 16px;
      border-radius: 12px;
      background: var(--md-sys-color-inverse-surface, #313033);
      color: var(--md-sys-color-inverse-on-surface, #f4eff4);
      border: 1px solid var(--md-sys-color-outline-variant, rgba(0, 0, 0, 0.12));
      margin-bottom: 16px;
    }

    .seed-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      font-weight: 600;
      font-size: 0.95rem;
    }

    .seed-badge {
      background: var(--md-sys-color-primary, #6750a4);
      color: white;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.05em;
    }

    .seed-description {
      font-size: 0.9rem;
      margin-bottom: 12px;
      line-height: 1.5;
      opacity: 0.9;
    }

    .seed-controls {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }

    .seed-progress {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 12px;
    }

    .progress-bar {
      flex: 1;
      height: 6px;
      border-radius: 3px;
      background: rgba(255, 255, 255, 0.2);
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--md-sys-color-primary, #6750a4);
      transition: width 0.3s ease;
    }

    .progress-text {
      font-size: 0.85rem;
      min-width: 40px;
      text-align: right;
    }

    .seed-status {
      font-size: 0.9rem;
      margin-top: 12px;
      padding: 8px 12px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.1);
    }

    .seed-status.error {
      background: rgba(255, 82, 82, 0.2);
      color: #ff5252;
    }

    .seed-status.success {
      background: rgba(76, 175, 80, 0.2);
      color: #4caf50;
    }

    md-circular-progress {
      --md-circular-progress-size: 20px;
    }
  `;

  override render() {
    // Don't render if not in emulator mode on localhost
    if (!this.shouldRender) {
      return nothing;
    }

    const state = seedDataStore.state.get();
    const isLoading = state.status === 'loading';

    return html`
      <div class="seed-panel">
        <div class="seed-header">
          <span class="seed-badge">DEV ONLY</span>
          <span>Firestore Seed Data</span>
        </div>

        <p class="seed-description">
          Populate Firestore with reference data (flowers, continents, elements, instruments, todos).
          This is a development-only tool.
        </p>

        <div class="seed-controls">
          <md-filled-button
            ?disabled=${isLoading}
            @click=${this._handleSeed}
          >
            ${isLoading ? 'Seeding...' : 'Seed Firestore'}
          </md-filled-button>
        </div>

        ${state.status === 'loading' ? html`
          <div class="seed-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${state.progress}%"></div>
            </div>
            <div class="progress-text">${state.progress}%</div>
          </div>
          <div class="seed-status">
            ${state.currentStep}
          </div>
        ` : nothing}

        ${state.status === 'ready' && state.isComplete ? html`
          <div class="seed-status success">
            ✓ ${state.currentStep}
          </div>
        ` : nothing}

        ${state.status === 'error' ? html`
          <div class="seed-status error">
            ✗ Error: ${state.error}
          </div>
        ` : nothing}
      </div>
    `;
  }

  private async _handleSeed() {
    this.isSeeding = true;
    try {
      await seedDataStore.seedFirestoreCollections();
    } finally {
      this.isSeeding = false;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-seed-data': DfSeedData;
  }
}
