import {css, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import type {FirebaseUser} from '@df/types';
import {
  firebaseAuthState,
  initializeGoldilocksTypeStore,
  goldilocksTypeCollectionState,
  teardownGoldilocksTypeStore,
  initializeGoldilocksConfigurationStore,
  goldilocksConfigurationCollectionState,
  teardownGoldilocksConfigurationStore,
  getInitializedFirebaseApp,
  shouldUseEmulatorForService,
} from '@df/state';

/**
 * Goldilocks Visualizer - Main component for the Goldilocks "Pick 2" tool
 *
 * This component orchestrates three sub-components:
 * 1. Configuration creator - Venn diagram interface for picking 2 out of 3 options
 * 2. Configurations history - Table view of saved configurations
 * 3. Goldilocks type CRUD - Manage type definitions (name, first, second, third)
 *
 * State management follows the signals-first architecture, with stores in @df/state
 * and presentation logic here in the component.
 */
@customElement('df-goldilocks-visualizer')
export class DfGoldilocksVisualizer extends SignalWatcher(LitElement) {
  @property({type: Boolean, attribute: 'use-demo-data'})
  declare useDemoData: boolean;

  static override styles = css`
    :host {
      display: block;
      color: var(--md-sys-color-on-surface, #0f172a);
    }

    .shell {
      background: var(--md-sys-color-surface, #ffffff);
      border-radius: 32px;
      padding: clamp(1.5rem, 4vw, 3rem);
      box-shadow: 0 30px 60px rgba(15, 23, 42, 0.12);
      border: 1px solid rgba(15, 23, 42, 0.08);
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }

    .page-title {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: #0f172a;
    }

    .card {
      border-radius: 24px;
      border: 1px solid rgba(148, 163, 184, 0.35);
      padding: 1.5rem;
      background: rgba(248, 250, 252, 0.85);
      backdrop-filter: blur(8px);
    }

    .card h3 {
      margin: 0 0 1rem;
      font-size: 1.1rem;
      color: #0f172a;
    }

    .empty-state {
      border-radius: 20px;
      padding: 2rem;
      border: 1px dashed rgba(148, 163, 184, 0.8);
      text-align: center;
      color: #475569;
    }

    .status {
      border-radius: 16px;
      padding: 0.85rem 1rem;
      font-size: 0.95rem;
    }

    .status.error {
      background: rgba(248, 113, 113, 0.18);
      color: #b91c1c;
    }
  `;

  @state() private initializedUserId: string | null = null;
  @state() private storeError: string | null = null;

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.resetStoreState();
  }

  override render() {
    // In demo mode, skip Firebase auth checks and use demo state
    if (this.useDemoData) {
      if (!this.initializedUserId) {
        this.initializedUserId = 'storybook-user';
      }
      return html`
        <section class="shell">
          <h1 class="page-title">Goldilocks Visualizer · Storybook User</h1>
          ${this.renderVisualizerAreas()}
        </section>
      `;
    }

    const auth = firebaseAuthState.get();
    const authUser = auth.authUser;
    const isAuthenticated = auth.authState === 'authenticated' && !!authUser;

    if (!isAuthenticated && this.initializedUserId) {
      this.resetStoreState();
    }

    if (isAuthenticated && authUser?.uid && authUser.uid !== this.initializedUserId && !this.storeError) {
      void this.initializeStores(authUser);
    }

    return html`
      <section class="shell">
        ${isAuthenticated
          ? html`
              <h1 class="page-title">
                Goldilocks Visualizer · ${authUser?.displayName || authUser?.email || 'User'}
              </h1>
            `
          : nothing}
        ${this.storeError
          ? html`<div class="status error">
              ${this.storeError}
              <div>
                <md-text-button @click=${this.retryInitialization}>
                  Try again
                </md-text-button>
              </div>
            </div>`
          : nothing}
        ${isAuthenticated ? this.renderVisualizerAreas() : this.renderSignedOutMessage()}
      </section>
    `;
  }

  private renderSignedOutMessage() {
    return html`
      <div class="empty-state">
        <p>Please sign in to use the Goldilocks Visualizer.</p>
      </div>
    `;
  }

  private renderVisualizerAreas() {
    if (!this.initializedUserId) {
      return html`<div class="empty-state">Initializing Firestore connection…</div>`;
    }

    const types = goldilocksTypeCollectionState.get();
    const configurations = goldilocksConfigurationCollectionState.get();

    return html`
      <!-- 1. TOP: Configuration Creator -->
      <section class="card">
        <h3>Create Configuration</h3>
        ${types.documents.length === 0
          ? html`<div class="empty-state">
              <p>Create a goldilocks type below to get started.</p>
            </div>`
          : html`
              <df-goldilocks-configuration-creator></df-goldilocks-configuration-creator>
            `}
      </section>

      <!-- 2. MIDDLE: Configurations History -->
      <section class="card">
        <h3>Saved Configurations</h3>
        ${configurations.documents.length === 0
          ? html`<div class="empty-state">
              <p>No configurations saved yet. Create one above!</p>
            </div>`
          : html`
              <df-goldilocks-configurations-list></df-goldilocks-configurations-list>
            `}
      </section>

      <!-- 3. BOTTOM: Goldilocks Type CRUD -->
      <df-goldilocks-types-crud></df-goldilocks-types-crud>
    `;
  }

  private async initializeStores(user: FirebaseUser): Promise<void> {
    try {
      await Promise.all([
        initializeGoldilocksTypeStore(
          getInitializedFirebaseApp(),
          user.uid,
          shouldUseEmulatorForService('firestore')
        ),
        initializeGoldilocksConfigurationStore(
          getInitializedFirebaseApp(),
          user.uid,
          shouldUseEmulatorForService('firestore')
        ),
      ]);
      this.initializedUserId = user.uid;
      this.storeError = null;
    } catch (error) {
      console.error('[df-goldilocks-visualizer] Failed to initialize stores', error);
      this.storeError =
        error instanceof Error ? error.message : 'Failed to initialize. Please refresh the page.';
    }
  }

  private resetStoreState(): void {
    teardownGoldilocksTypeStore();
    teardownGoldilocksConfigurationStore();
    this.initializedUserId = null;
    this.storeError = null;
  }

  private retryInitialization(): void {
    const auth = firebaseAuthState.get();
    if (auth.authUser) {
      this.storeError = null;
      void this.initializeStores(auth.authUser);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-goldilocks-visualizer': DfGoldilocksVisualizer;
  }
}
