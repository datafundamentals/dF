import {css, html, LitElement, nothing} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import type {FirebaseUser, ExerciseType} from '@df/types';
import {EXERCISE_TYPE_CONFIG} from '../../../packages/types/dist/index.js';
import {
  firebaseAuthState,
  initializePushupStore,
  pushupCollectionState,
  logExerciseEntry,
  deletePushupEntry,
  refreshPushupEntries,
  teardownPushupStore,
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
  @state() private selectedExerciseType: ExerciseType = 'pushups';
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

    const pushups = this.initializedUserId ? pushupCollectionState.get() : null;

    return html`
      <section class="shell">
        ${isAuthenticated
          ? html`<h1 class="page-title">Fitness Log · ${authUser?.displayName || authUser?.email || 'User'}</h1>`
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
        ${isAuthenticated ? this.renderActivityAreas(pushups) : this.renderSignedOutMessage()}
      </section>
    `;
  }


  private renderSignedOutMessage() {
    return html`
      <div class="empty-state">
        <p>Authenticate above to unlock the pushup form and history feed.</p>
      </div>
    `;
  }

  private renderActivityAreas(pushups: ReturnType<typeof pushupCollectionState.get> | null) {
    if (!this.initializedUserId) {
      return html`<div class="empty-state">Initialising Firestore connection…</div>`;
    }

    const documents = pushups?.documents ?? [];
    const status = pushups?.status ?? 'idle';

    return html`
      <section class="activity-grid">
        <div class="card">
          <h3>Log exercise</h3>
          ${this.submitMessage
            ? html`<div class="status ${this.submitMessage.variant}">${this.submitMessage.text}</div>`
            : nothing}
          <form @submit=${this.handleSubmit}>
            <md-filled-select
              label="Exercise type"
              value=${this.selectedExerciseType}
              @change=${this.handleExerciseTypeChange}
              ?disabled=${this.isSubmitting}
            >
              ${Object.entries(EXERCISE_TYPE_CONFIG).map(
                ([type, config]) => html`
                  <md-select-option value=${type}>
                    <div slot="headline">${config.label}</div>
                  </md-select-option>
                `
              )}
            </md-filled-select>
            <md-outlined-text-field
              label="${EXERCISE_TYPE_CONFIG[this.selectedExerciseType].label} (${EXERCISE_TYPE_CONFIG[this.selectedExerciseType].unit})"
              type="number"
              required
              inputmode="numeric"
              helper=${EXERCISE_TYPE_CONFIG[this.selectedExerciseType].description}
              value=${this.formValue}
              @input=${this.handleValueInput}
              ?disabled=${this.isSubmitting}
            ></md-outlined-text-field>
            <md-outlined-text-field
              label="Optional note"
              value=${this.formNote}
              supporting-text="Example: morning warm-up"
              @input=${this.handleNoteInput}
              ?disabled=${this.isSubmitting}
            ></md-outlined-text-field>
            <md-filled-button ?disabled=${this.isSubmitting} type="submit">
              ${this.isSubmitting ? 'Saving…' : 'Save entry'}
            </md-filled-button>
          </form>
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
          ? html`<div class="empty-state">No exercises logged yet. Submit your first entry above.</div>`
          : html`
              <div style="overflow-x: auto;">
                <table class="history-table">
                  <tbody>
                    ${documents.map(
                      (entry) => html`
                        <tr>
                          <td>${EXERCISE_TYPE_CONFIG[entry.exerciseType].label}</td>
                          <td><strong>${entry.value}</strong> ${EXERCISE_TYPE_CONFIG[entry.exerciseType].unit}</td>
                          <td>${this.formatDate(entry.recordedAt)}</td>
                          <td>${entry.note || '-'}</td>
                          <td class="actions-cell">
                            <md-text-button @click=${() => this.handleDelete(entry.id)}>
                              Delete
                            </md-text-button>
                          </td>
                        </tr>
                      `
                    )}
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
      await initializePushupStore(
        getInitializedFirebaseApp(),
        user.uid,
        shouldUseEmulatorForService('firestore')
      );
      this.initializedUserId = user.uid;
      this.storeError = null;
    } catch (error) {
      console.error('[df-activity-log] Failed to initialize pushup store', error);
      this.storeError = 'Unable to connect to the Firestore emulator. Verify it is running and reload the page.';
    }
  }

  private resetStoreState(): void {
    teardownPushupStore();
    this.initializedUserId = null;
    this.storeError = null;
  }

  private handleExerciseTypeChange(event: Event): void {
    const target = event.target as HTMLSelectElement | null;
    if (target?.value) {
      this.selectedExerciseType = target.value as ExerciseType;
      this.formValue = '10';
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
      await logExerciseEntry({
        exerciseType: this.selectedExerciseType,
        value: parsed,
        note: this.formNote,
      });
      this.formValue = '10';
      this.formNote = '';
      const exerciseLabel = EXERCISE_TYPE_CONFIG[this.selectedExerciseType].label;
      this.submitMessage = {variant: 'success', text: `${exerciseLabel} entry saved to Firestore.`};
    } catch (error) {
      console.error('[df-activity-log] Failed to log exercise', error);
      this.submitMessage = {
        variant: 'error',
        text: (error as Error)?.message ?? 'Unable to save exercise. Check the console for details.',
      };
    } finally {
      this.isSubmitting = false;
    }
  }

  private async handleDelete(id: string): Promise<void> {
    try {
      await deletePushupEntry(id);
      this.submitMessage = {variant: 'success', text: 'Deleted entry.'};
    } catch (error) {
      console.error('[df-activity-log] Failed to delete entry', error);
      this.submitMessage = {variant: 'error', text: 'Could not delete entry. Please try again.'};
    }
  }

  private async handleRefresh(): Promise<void> {
    try {
      await refreshPushupEntries();
    } catch (error) {
      console.error('[df-activity-log] Failed to refresh pushups', error);
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
