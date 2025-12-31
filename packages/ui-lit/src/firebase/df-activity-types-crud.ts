/**
 * ✅ TEMPLATE: MD3-Compliant Component
 *
 * Copy this file when creating a new UI component. All required Material Web
 * imports are scaffolded for you and an inline warning ensures standards stay
 * front-of-mind. Delete any imports you do not need.
 */

import {LitElement, html, css, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import {
  activityTypeCollectionState,
  addActivityType,
  deleteActivityType,
  firebaseAuthState,
  getInitializedFirebaseApp,
  initializeActivityTypeStore,
  refreshActivityTypes,
  shouldUseEmulatorForService,
  teardownActivityTypeStore,
  updateActivityType,
  __setActivityTypeDemoState,
} from '@df/state';
import type {ActivityTypeDocument, FirestoreCollectionState} from '@df/types';

// ✅ Required MD3 imports (trim what you don't need).
// Prefer Material Web components whenever they exist. If the MD3 spec does not
// provide an official component, implement it manually using MD3 tokens and add
// an inline eslint-disable note with a link to the spec (see
// guides/STANDARDS_STYLES.md#md3-gaps).
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/select/filled-select.js';
import '@material/web/select/select-option.js';
import '@material/web/progress/linear-progress.js';

/**
 * ⚠️ CRITICAL STANDARDS COMPLIANCE ⚠️
 *
 * This component MUST use Material Design 3 web components from @material/web.
 *
 * ✅ ALLOWED:
 * - <md-filled-button>, <md-outlined-button>, <md-text-button>
 * - <md-outlined-text-field>, <md-filled-text-field>
 * - <md-filled-select>, <md-outlined-select> with <md-select-option>
 * - <md-checkbox>, <md-radio>
 *
 * ❌ FORBIDDEN:
 * - Native <button>, <input>, <select>, <textarea>
 *
 * See:
 * - /guides/STANDARDS_STYLES.md#material-design-3
 * - /packages/ui-lit/README.md
 * - /packages/ui-lit/src/df-upload-link.ts (compliant example)
 *
 * Build will FAIL if native HTML elements are detected.
 */
@customElement('df-activity-types-crud')
export class DfActivityTypesCrud extends SignalWatcher(LitElement) {
  @property({type: Boolean, attribute: 'use-demo-data'})
  declare useDemoData: boolean;

  @state() private initialized = false;
  @state() private initError: string | null = null;
  @state() private activeUserId: string | null = null;
  @state() private editingId: string | null = null;
  @state() private pendingDeleteId: string | null = null;
  @state() private isSubmitting = false;
  @state() private formMessage: {variant: 'success' | 'error'; text: string} | null = null;
  @state() private formError: string | null = null;

  @state() private typeName = '';
  @state() private unitMode: 'seconds' | 'count' | 'custom' = 'count';
  @state() private customUnit = '';
  @state() private defaultNumber = '';
  @state() private order = '';

  constructor() {
    super();
    this.useDemoData = false;
  }

  static override styles = css`
    :host {
      display: block;
      width: 100%;
      margin: 0 auto;
      box-sizing: border-box;
      border-radius: 24px;
      padding: clamp(1.25rem, 3vw, 2rem);
      background: var(--md-sys-color-surface, #ffffff);
      color: var(--md-sys-color-on-surface, #0f172a);
      border: 1px solid var(--md-sys-color-outline-variant, rgba(148, 163, 184, 0.35));
      box-shadow: 0 16px 32px rgba(15, 23, 42, 0.08);
    }

    .container {
      display: grid;
      gap: 1.25rem;
    }

    header {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    h2 {
      margin: 0;
      font-size: 1.4rem;
      font-weight: 600;
      color: var(--md-sys-color-on-surface, #0f172a);
    }

    .subtitle {
      margin: 0;
      color: var(--md-sys-color-on-surface-variant, #475569);
      line-height: 1.5;
      max-width: 60ch;
    }

    .status-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      align-items: center;
      justify-content: space-between;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      font-size: 0.85rem;
      background: var(--md-sys-color-surface-container-low, rgba(241, 245, 249, 0.9));
      color: var(--md-sys-color-on-surface, #0f172a);
    }

    .status-pill.error {
      background: var(--md-sys-color-error-container, rgba(239, 68, 68, 0.2));
      color: var(--md-sys-color-on-error-container, #b91c1c);
    }

    form {
      display: grid;
      gap: 0.9rem;
    }

    .form-grid {
      display: grid;
      gap: 0.9rem;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    }

    .form-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
    }

    .helper {
      font-size: 0.85rem;
      color: var(--md-sys-color-on-surface-variant, #64748b);
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .activity-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    .activity-table th {
      text-align: left;
      padding: 0.35rem 0.75rem;
      color: var(--md-sys-color-on-surface-variant, #475569);
      font-weight: 500;
      border-bottom: 1px solid var(--md-sys-color-outline-variant, rgba(148, 163, 184, 0.2));
    }

    .activity-table td {
      padding: 0.35rem 0.75rem;
      border-bottom: 1px solid var(--md-sys-color-outline-variant, rgba(148, 163, 184, 0.1));
    }

    .activity-table tr:last-child td {
      border-bottom: none;
    }

    .actions-cell {
      white-space: nowrap;
      text-align: right;
    }

    .empty-state {
      border-radius: 16px;
      padding: 1.5rem;
      border: 1px dashed var(--md-sys-color-outline-variant, rgba(148, 163, 184, 0.6));
      text-align: center;
      color: var(--md-sys-color-on-surface-variant, #64748b);
    }
  `;

  override render() {
    const auth = firebaseAuthState.get();
    const isAuthenticated = auth.authState === 'authenticated' && auth.authUser !== null;

    if (!isAuthenticated && this.activeUserId && !this.shouldUseDemoState()) {
      this.resetStoreState();
    }

    if (isAuthenticated && auth.authUser?.uid && auth.authUser.uid !== this.activeUserId && !this.initError) {
      void this.initializeStore();
    }

    if (!isAuthenticated && !this.initialized) {
      return html`
        <div class="container">
          <header>
            <h2>Activity types</h2>
            <p class="subtitle">
              Create the activity presets used for logging workouts. Each type stores a unit, default value, and
              ordering preference.
            </p>
          </header>
          <div class="status-pill">Sign in to manage activity types.</div>
        </div>
      `;
    }

    const collection = activityTypeCollectionState.get();

    return html`
      <div class="container">
        <header>
          <h2>Activity types</h2>
          <p class="subtitle">
            Create the activity presets used for logging workouts.
          </p>
        </header>

        <div class="status-row">
          <div class="status-pill">Status: ${collection.status}</div>
          <div class="status-pill">Total: ${collection.documents.length}</div>
          <md-text-button @click=${this.handleRefresh} ?disabled=${collection.status === 'loading'}>
            Refresh
          </md-text-button>
        </div>

        ${this.initError
          ? html`<div class="status-pill error">${this.initError}</div>`
          : nothing}
        ${this.formMessage
          ? html`<div class="status-pill ${this.formMessage.variant === 'error' ? 'error' : ''}">
              ${this.formMessage.text}
            </div>`
          : nothing}
        ${this.formError ? html`<div class="status-pill error">${this.formError}</div>` : nothing}

        <form @submit=${this.handleSubmit}>
          <div class="form-grid">
            <md-outlined-text-field
              label="Type name"
              .value=${this.typeName}
              required
              @input=${this.handleTypeNameInput}
              ?disabled=${this.isSubmitting}
            ></md-outlined-text-field>

            <md-filled-select
              label="Unit"
              .value=${this.unitMode}
              @change=${this.handleUnitModeChange}
              ?disabled=${this.isSubmitting}
            >
              <md-select-option value="seconds">
                <div slot="headline">Seconds</div>
              </md-select-option>
              <md-select-option value="count">
                <div slot="headline">Count</div>
              </md-select-option>
              <md-select-option value="custom">
                <div slot="headline">Custom</div>
              </md-select-option>
            </md-filled-select>

            ${this.unitMode === 'custom'
              ? html`
                  <md-outlined-text-field
                    label="Custom unit"
                    .value=${this.customUnit}
                    required
                    @input=${this.handleCustomUnitInput}
                    ?disabled=${this.isSubmitting}
                  ></md-outlined-text-field>
                `
              : nothing}

            <md-outlined-text-field
              label="Default number"
              type="number"
              inputmode="numeric"
              min="0"
              .value=${this.defaultNumber}
              required
              @input=${this.handleDefaultNumberInput}
              ?disabled=${this.isSubmitting}
            ></md-outlined-text-field>

            <md-outlined-text-field
              label="Order"
              type="number"
              inputmode="numeric"
              min="0"
              .value=${this.order}
              required
              @input=${this.handleOrderInput}
              ?disabled=${this.isSubmitting}
            ></md-outlined-text-field>
          </div>

          <div class="form-actions">
            <md-filled-button ?disabled=${this.isSubmitting} type="submit">
              ${this.isSubmitting ? 'Saving…' : this.editingId ? 'Save changes' : 'Add activity'}
            </md-filled-button>
            ${this.editingId
              ? html`
                  <md-text-button ?disabled=${this.isSubmitting} @click=${this.cancelEdit}>
                    Cancel edit
                  </md-text-button>
                `
              : nothing}
            <span class="helper">Default number and order must be numeric.</span>
          </div>
        </form>

        ${collection.status === 'loading'
          ? html`<md-linear-progress indeterminate></md-linear-progress>`
          : nothing}

        ${collection.documents.length === 0
          ? html`<div class="empty-state">No activity types yet. Add your first preset above.</div>`
          : html`
              <div class="table-wrapper">
                <table class="activity-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Type</th>
                      <th>Unit</th>
                      <th>Default</th>
                      <th class="actions-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${collection.documents.map((doc) => this.renderRow(doc))}
                  </tbody>
                </table>
              </div>
            `}
      </div>
    `;
  }

  private renderRow(doc: ActivityTypeDocument) {
    const isPendingDelete = this.pendingDeleteId === doc.id;
    return html`
      <tr>
        <td>${doc.order}</td>
        <td>${doc.typeName}</td>
        <td>${doc.unit}</td>
        <td>${doc.defaultNumber}</td>
        <td class="actions-cell">
          ${isPendingDelete
            ? html`
                <md-text-button @click=${() => this.confirmDelete(doc.id)}>Confirm</md-text-button>
                <md-text-button @click=${this.cancelDelete}>Cancel</md-text-button>
              `
            : html`
                <md-text-button @click=${() => this.beginEdit(doc)}>Edit</md-text-button>
                <md-text-button @click=${() => this.requestDelete(doc.id)}>Delete</md-text-button>
              `}
        </td>
      </tr>
    `;
  }

  private async initializeStore(): Promise<void> {
    const auth = firebaseAuthState.get();
    const userId = auth.authUser?.uid ?? null;
    if (this.initialized && userId && this.activeUserId === userId) {
      return;
    }

    try {
      if (this.shouldUseDemoState()) {
        this.applyDemoState();
        return;
      }

      if (!userId) {
        return;
      }

      await initializeActivityTypeStore(
        getInitializedFirebaseApp(),
        userId,
        shouldUseEmulatorForService('firestore')
      );

      this.initialized = true;
      this.activeUserId = userId;
    } catch (error) {
      console.error('[df-activity-types-crud] Failed to initialise activity types:', error);
      this.initError = 'Unable to initialise activity types. Ensure Firestore is available and reload.';
    }
  }

  private shouldUseDemoState(): boolean {
    const mode = (import.meta as ImportMeta & {env?: Record<string, string | undefined>}).env?.MODE;
    return mode === 'test' || this.useDemoData;
  }

  private applyDemoState(): void {
    const demoDocs: ActivityTypeDocument[] = [
      {
        id: 'activity-1',
        typeName: 'Pushups',
        unit: 'count',
        defaultNumber: 15,
        order: 1,
        createdAt: new Date('2025-09-18T10:00:00Z'),
        updatedAt: new Date('2025-09-19T10:00:00Z'),
        ownerId: 'demo',
      },
      {
        id: 'activity-2',
        typeName: 'Plank',
        unit: 'seconds',
        defaultNumber: 45,
        order: 2,
        createdAt: new Date('2025-09-18T10:05:00Z'),
        updatedAt: new Date('2025-09-19T10:05:00Z'),
        ownerId: 'demo',
      },
      {
        id: 'activity-3',
        typeName: 'Rowing',
        unit: 'meters',
        defaultNumber: 250,
        order: 3,
        createdAt: new Date('2025-09-18T10:10:00Z'),
        updatedAt: new Date('2025-09-19T10:10:00Z'),
        ownerId: 'demo',
      },
    ];

    const state: FirestoreCollectionState<ActivityTypeDocument> = {
      status: 'ready',
      documents: demoDocs,
      error: null,
      isListening: false,
      lastUpdated: Date.now(),
      currentPage: 1,
      pageSize: 10,
      hasNextPage: false,
      hasPreviousPage: false,
      queryDescription: this.useDemoData ? 'Storybook demo data' : 'Demo data (tests)',
    };

    __setActivityTypeDemoState(state);
    this.initialized = true;
  }

  private handleTypeNameInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.typeName = target?.value ?? '';
  }

  private handleUnitModeChange(event: Event): void {
    const target = event.target as HTMLSelectElement | null;
    if (!target?.value) {
      return;
    }
    this.unitMode = target.value as 'seconds' | 'count' | 'custom';
    if (this.unitMode !== 'custom') {
      this.customUnit = '';
    }
  }

  private handleCustomUnitInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.customUnit = target?.value ?? '';
  }

  private handleDefaultNumberInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.defaultNumber = target?.value ?? '';
  }

  private handleOrderInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.order = target?.value ?? '';
  }

  private async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.isSubmitting) {
      return;
    }

    if (this.shouldUseDemoState()) {
      this.formMessage = {variant: 'success', text: 'Demo mode: changes are not persisted.'};
      this.resetForm();
      return;
    }

    this.isSubmitting = true;
    this.formMessage = null;
    this.formError = null;

    try {
      const typeName = this.typeName.trim();
      if (!typeName) {
        throw new Error('Type name is required.');
      }

      const unit = this.unitMode === 'custom' ? this.customUnit.trim() : this.unitMode;
      if (!unit) {
        throw new Error('Unit is required.');
      }

      const defaultNumber = Number(this.defaultNumber);
      if (!Number.isFinite(defaultNumber)) {
        throw new Error('Default number must be numeric.');
      }

      const order = Number(this.order);
      if (!Number.isFinite(order)) {
        throw new Error('Order must be numeric.');
      }

      const draft = {
        typeName,
        unit,
        defaultNumber,
        order,
      };

      if (this.editingId) {
        await updateActivityType(this.editingId, draft);
        this.formMessage = {variant: 'success', text: 'Activity type updated.'};
      } else {
        await addActivityType(draft);
        this.formMessage = {variant: 'success', text: 'Activity type added.'};
      }

      this.resetForm();
    } catch (error) {
      this.formError = (error as Error)?.message ?? 'Unable to save activity type.';
    } finally {
      this.isSubmitting = false;
    }
  }

  private beginEdit(doc: ActivityTypeDocument): void {
    this.editingId = doc.id;
    this.typeName = doc.typeName;
    if (doc.unit === 'seconds' || doc.unit === 'count') {
      this.unitMode = doc.unit;
      this.customUnit = '';
    } else {
      this.unitMode = 'custom';
      this.customUnit = doc.unit;
    }
    this.defaultNumber = String(doc.defaultNumber ?? '');
    this.order = String(doc.order ?? '');
  }

  private cancelEdit(): void {
    this.resetForm();
  }

  private requestDelete(id: string): void {
    this.pendingDeleteId = id;
  }

  private cancelDelete = (): void => {
    this.pendingDeleteId = null;
  };

  private async confirmDelete(id: string): Promise<void> {
    this.pendingDeleteId = null;
    if (this.shouldUseDemoState()) {
      this.formMessage = {variant: 'success', text: 'Demo mode: changes are not persisted.'};
      return;
    }
    try {
      await deleteActivityType(id);
      this.formMessage = {variant: 'success', text: 'Activity type deleted.'};
    } catch (error) {
      this.formMessage = {variant: 'error', text: 'Unable to delete activity type.'};
    }
  }

  private async handleRefresh(): Promise<void> {
    if (this.shouldUseDemoState()) {
      this.formMessage = {variant: 'success', text: 'Demo mode: using preset data.'};
      return;
    }
    try {
      await refreshActivityTypes();
    } catch (error) {
      this.formMessage = {variant: 'error', text: 'Unable to refresh activity types.'};
    }
  }

  private resetForm(): void {
    this.editingId = null;
    this.typeName = '';
    this.unitMode = 'count';
    this.customUnit = '';
    this.defaultNumber = '';
    this.order = '';
  }

  private resetStoreState(): void {
    teardownActivityTypeStore();
    this.initialized = false;
    this.activeUserId = null;
    this.initError = null;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-activity-types-crud': DfActivityTypesCrud;
  }
}
