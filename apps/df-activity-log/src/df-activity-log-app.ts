import {css, html, LitElement, nothing} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import type {FirebaseUser, ActivityType} from '@df/types';
import {
  firebaseAuthState,
  initializeActivityStore,
  activityCollectionState,
  logActivityEntry,
  deleteActivityEntry,
  refreshActivityEntries,
  teardownActivityStore,
  initializeActivityTypeStore,
  activityTypeCollectionState,
  teardownActivityTypeStore,
  getInitializedFirebaseApp,
  shouldUseEmulatorForService,
} from '@df/state';

import '@df/ui-lit/firebase';

interface SubmitMessage {
  variant: 'success' | 'error';
  text: string;
}

@customElement('df-activity-log-app')
export class DfActivityLogApp extends SignalWatcher(LitElement) {
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

    header {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .badge {
      align-self: flex-start;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      background: rgba(16, 185, 129, 0.18);
      color: #047857;
      font-weight: 600;
      font-size: 0.85rem;
    }

    .page-title {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: #0f172a;
    }

    .hero-title {
      margin: 0;
      font-size: clamp(2rem, 5vw, 2.75rem);
      font-weight: 700;
      color: #0f172a;
    }

    .lead {
      margin: 0;
      max-width: 60ch;
      color: #475569;
      font-size: 1.05rem;
      line-height: 1.6;
    }

    .auth-panel,
    .activity-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .card {
      border-radius: 24px;
      border: 1px solid rgba(148, 163, 184, 0.35);
      padding: 1.5rem;
      background: rgba(248, 250, 252, 0.85);
      backdrop-filter: blur(8px);
    }

    .card h3 {
      margin: 0 0 0.5rem;
      font-size: 1.1rem;
      color: #0f172a;
    }

    .card p {
      margin: 0;
      color: #475569;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    md-filled-button,
    md-outlined-button,
    md-text-button {
      width: fit-content;
    }

    .history-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
      font-size: 0.95rem;
    }

    .history-table th {
      text-align: left;
      padding: 0.4rem 1rem;
      color: var(--md-sys-color-on-surface-variant, #475569);
      font-weight: 500;
      border-bottom: 1px solid var(--md-sys-color-outline-variant, rgba(148, 163, 184, 0.2));
    }

    .history-table td {
      border-bottom: 1px solid var(--md-sys-color-outline-variant, rgba(148, 163, 184, 0.1));
      color: var(--md-sys-color-on-surface, #0f172a);
    }

    .history-table tr:last-child td {
      border-bottom: none;
    }

    .history-table .actions-cell {
      text-align: right;
    }

    .history-meta {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      color: #475569;
    }

    .history-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .status {
      border-radius: 16px;
      padding: 0.85rem 1rem;
      font-size: 0.95rem;
    }

    .status.success {
      background: rgba(16, 185, 129, 0.15);
      color: #047857;
    }

    .status.error {
      background: rgba(248, 113, 113, 0.18);
      color: #b91c1c;
    }

    .summary-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .summary-tile {
      border-radius: 18px;
      padding: 1rem;
      background: rgba(226, 232, 240, 0.5);
      border: 1px solid rgba(15, 23, 42, 0.08);
    }

    .summary-tile dt {
      margin: 0;
      font-size: 0.85rem;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .summary-tile dd {
      margin: 0.4rem 0 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #0f172a;
    }

    .empty-state {
      border-radius: 20px;
      padding: 2rem;
      border: 1px dashed rgba(148, 163, 184, 0.8);
      text-align: center;
      color: #475569;
    }

    .collection-path {
      font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;
      font-size: 0.85rem;
      word-break: break-all;
    }
  `;

  @state() private initializedUserId: string | null = null;
  @state() private storeError: string | null = null;
  @state() private selectedActivityType: ActivityType = '';
  @state() private formValue = '10';
  @state() private formNote = '';
  @state() private isSubmitting = false;
  @state() private submitMessage: SubmitMessage | null = null;

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.resetStoreState();
  }

  override render() {
    const auth = firebaseAuthState.get();
    const authUser = auth.authUser;
    const isAuthenticated = auth.authState === 'authenticated' && !!authUser;

    if (!isAuthenticated && this.initializedUserId) {
      this.resetStoreState();
    }

    if (isAuthenticated && authUser?.uid && authUser.uid !== this.initializedUserId && !this.storeError) {
      void this.initializeStore(authUser);
    }

    const activities = this.initializedUserId ? activityCollectionState.get() : null;

    return html`
      <section class="shell">
        ${isAuthenticated
          ? html`
              <h1 class="page-title">
                Activity Log · ${authUser?.displayName || authUser?.email || 'User'}
                <span style="color: #10b981; font-size: 0.75em; margin-left: 0.5rem;">✓ v2.0.1</span>
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
        ${isAuthenticated ? this.renderActivityAreas(activities) : this.renderSignedOutMessage()}
      </section>
    `;
  }


  private renderSignedOutMessage() {
    return html`
      <div class="empty-state">
        <p>Authenticate above to unlock the activity form and history feed.</p>
      </div>
    `;
  }

  private renderActivityAreas(activities: ReturnType<typeof activityCollectionState.get> | null) {
    if (!this.initializedUserId) {
      return html`<div class="empty-state">Initialising Firestore connection…</div>`;
    }

    const documents = activities?.documents ?? [];
    const status = activities?.status ?? 'idle';
    const activityTypes = activityTypeCollectionState.get();
    const availableTypes = activityTypes.documents;

    // Auto-select first activity type if none selected and types are available
    if (availableTypes.length > 0 && !this.selectedActivityType) {
      this.selectedActivityType = availableTypes[0].typeName;
      this.formValue = String(availableTypes[0].defaultNumber);
    }

    // Find the currently selected activity type for form labels
    const selectedType = availableTypes.find((t) => t.typeName === this.selectedActivityType);

    return html`
      <section class="activity-grid">
        <div class="card">
          <h3>Log activity</h3>
          ${this.submitMessage
            ? html`<div class="status ${this.submitMessage.variant}">${this.submitMessage.text}</div>`
            : nothing}
          ${availableTypes.length === 0
            ? html`<div class="empty-state">
                No activity types available. Please add activity types below before logging activities.
              </div>`
            : html`
                <form @submit=${this.handleSubmit}>
                  <md-filled-select
                    key="activity-select-${availableTypes.length}"
                    label="Activity type"
                    value=${this.selectedActivityType}
                    @change=${this.handleActivityTypeChange}
                    ?disabled=${this.isSubmitting}
                  >
                    ${availableTypes.map(
                      (type) => html`
                        <md-select-option value=${type.typeName}>
                          <div slot="headline">${type.typeName}</div>
                        </md-select-option>
                      `
                    )}
                  </md-filled-select>
                  <md-outlined-text-field
                    label="${selectedType?.typeName || 'Activity'} (${selectedType?.unit || 'count'})"
                    type="number"
                    required
                    inputmode="numeric"
                    helper="Enter the value for this activity"
                    .value=${this.formValue}
                    @input=${this.handleValueInput}
                    ?disabled=${this.isSubmitting}
                  ></md-outlined-text-field>
                  <md-outlined-text-field
                    label="Optional note"
                    .value=${this.formNote}
                    supporting-text="Example: morning warm-up"
                    @input=${this.handleNoteInput}
                    ?disabled=${this.isSubmitting}
                  ></md-outlined-text-field>
                  <md-filled-button ?disabled=${this.isSubmitting} type="submit">
                    ${this.isSubmitting ? 'Saving…' : 'Save entry'}
                  </md-filled-button>
                </form>
              `}
        </div>
      </section>

      <section class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap;">
          <h3 style="margin:0;">History</h3>
          <div class="history-actions">
            ${status === 'loading'
              ? html`<md-linear-progress indeterminate></md-linear-progress>`
              : html`
                  <md-text-button @click=${this.handleRefresh}>
                    Refresh
                  </md-text-button>
                `}
          </div>
        </div>
        ${documents.length === 0
          ? html`<div class="empty-state">No activities logged yet. Submit your first entry above.</div>`
          : html`
              <div style="overflow-x: auto;">
                <table class="history-table">
                  <tbody>
                    ${documents.map((entry) => {
                      const typeInfo = availableTypes.find((t) => t.typeName === entry.activityType);
                      return html`
                        <tr>
                          <td>${typeInfo?.typeName || entry.activityType}</td>
                          <td><strong>${entry.value}</strong> ${typeInfo?.unit || 'count'}</td>
                          <td>${this.formatDate(entry.recordedAt)}</td>
                          <td>${entry.note || '-'}</td>
                          <td class="actions-cell">
                            <md-text-button @click=${() => this.handleDelete(entry.id)}>
                              Delete
                            </md-text-button>
                          </td>
                        </tr>
                      `;
                    })}
                  </tbody>
                </table>
              </div>
            `}
      </section>

      <df-activity-types-crud></df-activity-types-crud>
    `;
  }

  private async initializeStore(user: FirebaseUser): Promise<void> {
    try {
      await Promise.all([
        initializeActivityStore(
          getInitializedFirebaseApp(),
          user.uid,
          shouldUseEmulatorForService('firestore')
        ),
        initializeActivityTypeStore(
          getInitializedFirebaseApp(),
          user.uid,
          shouldUseEmulatorForService('firestore')
        ),
      ]);
      this.initializedUserId = user.uid;
      this.storeError = null;

      // Set default selected activity type to the first available activity type
      const activityTypes = activityTypeCollectionState.get();
      if (activityTypes.documents.length > 0 && !this.selectedActivityType) {
        this.selectedActivityType = activityTypes.documents[0].typeName;
        this.formValue = String(activityTypes.documents[0].defaultNumber);
      }
    } catch (error) {
      console.error('[df-activity-log] Failed to initialize stores', error);
      this.storeError = 'Unable to connect to the Firestore emulator. Verify it is running and reload the page.';
    }
  }

  private resetStoreState(): void {
    teardownActivityStore();
    teardownActivityTypeStore();
    this.initializedUserId = null;
    this.storeError = null;
  }

  private handleActivityTypeChange(event: Event): void {
    const target = event.target as HTMLSelectElement | null;
    if (target?.value) {
      this.selectedActivityType = target.value as ActivityType;

      // Set the default value from the selected activity type
      const activityTypes = activityTypeCollectionState.get();
      const selectedType = activityTypes.documents.find((t) => t.typeName === target.value);
      this.formValue = selectedType ? String(selectedType.defaultNumber) : '10';

      // Force re-render to update the label with new unit
      this.requestUpdate();
    }
  }

  private handleValueInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.formValue = target?.value ?? '';
  }

  private handleNoteInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.formNote = target?.value ?? '';
  }

  private async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.submitMessage = null;

    try {
      const parsed = Number(this.formValue);
      await logActivityEntry({
        activityType: this.selectedActivityType,
        value: parsed,
        note: this.formNote,
      });

      // Reset form with default value from the selected activity type
      const activityTypes = activityTypeCollectionState.get();
      const selectedType = activityTypes.documents.find((t) => t.typeName === this.selectedActivityType);
      this.formValue = selectedType ? String(selectedType.defaultNumber) : '10';
      this.formNote = '';

      this.submitMessage = {variant: 'success', text: `${this.selectedActivityType} entry saved to Firestore.`};
    } catch (error) {
      console.error('[df-activity-log] Failed to log activity', error);
      this.submitMessage = {
        variant: 'error',
        text: (error as Error)?.message ?? 'Unable to save activity. Check the console for details.',
      };
    } finally {
      this.isSubmitting = false;
    }
  }

  private async handleDelete(id: string): Promise<void> {
    try {
      await deleteActivityEntry(id);
      this.submitMessage = {variant: 'success', text: 'Deleted entry.'};
    } catch (error) {
      console.error('[df-activity-log] Failed to delete entry', error);
      this.submitMessage = {variant: 'error', text: 'Could not delete entry. Please try again.'};
    }
  }

  private async handleRefresh(): Promise<void> {
    try {
      await refreshActivityEntries();
    } catch (error) {
      console.error('[df-activity-log] Failed to refresh activities', error);
      this.submitMessage = {variant: 'error', text: 'Unable to refresh right now.'};
    }
  }

  private retryInitialization(): void {
    const auth = firebaseAuthState.get();
    if (auth.authUser) {
      this.storeError = null;
      void this.initializeStore(auth.authUser);
    }
  }

  private formatDate(date: Date | null): string {
    if (!date) {
      return 'Not set';
    }
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-activity-log-app': DfActivityLogApp;
  }
}
