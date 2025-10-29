import {css, html, LitElement, nothing} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import type {FirebaseUser} from '@df/types';
import {
  firebaseAuthState,
  initializePushupStore,
  pushupCollectionState,
  pushupSummaryState,
  logPushupEntry,
  deletePushupEntry,
  refreshPushupEntries,
  getActivePushupCollectionPath,
  teardownPushupStore,
  getInitializedFirebaseApp,
  shouldUseEmulatorForService,
} from '@df/state';

import '@df/ui-lit/firebase';
import '@df/ui-lit/df-google-signin';

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

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1rem;
    }

    .history-item {
      border-radius: 20px;
      border: 1px solid rgba(226, 232, 240, 0.9);
      padding: 1rem 1.25rem;
      background: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .history-item strong {
      font-size: 1.35rem;
      color: #0f172a;
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
  @state() private formCount = '10';
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
    const summary = this.initializedUserId ? pushupSummaryState.get() : null;

    return html`
      <section class="shell">
        ${this.renderHero(isAuthenticated)}
        ${this.renderAuthPanel(isAuthenticated)}
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
        ${isAuthenticated ? this.renderActivityAreas(pushups, summary) : this.renderSignedOutMessage()}
      </section>
    `;
  }

  private renderHero(isAuthenticated: boolean) {
    const emulatorUi = 'http://127.0.0.1:5400'; // Emulator UI URL (not used in production)
    const usingEmulator = shouldUseEmulatorForService('firestore') || 
                          shouldUseEmulatorForService('auth') ||
                          shouldUseEmulatorForService('storage');
    const environmentLabel = usingEmulator ? 'Local Firebase emulator' : 'Production Firebase';
    const authStatus = isAuthenticated ? 'Signed in' : 'Guest mode';

    return html`
      <header>
        <span class="badge">${environmentLabel} • ${authStatus}</span>
        <h1 class="hero-title">Activity Log · Pushup Tracker</h1>
        <p class="lead">
          ${usingEmulator ? html`
            Log your pushup reps against the Firebase emulator. Every entry is stored beneath
            <code class="collection-path">activity/&lt;uid&gt;/pushups</code> so it stays scoped to your account.
            Start the emulator suite (see <code>guides/firebase-emulator-workflow.md</code>) and keep an eye on the dashboard at
            <a href=${emulatorUi} target="_blank" rel="noreferrer">${emulatorUi}</a> to inspect writes in real time.
          ` : html`
            Log your pushup reps to production Firebase. Every entry is stored beneath
            <code class="collection-path">activity/&lt;uid&gt;/pushups</code> so it stays scoped to your account.
          `}
        </p>
      </header>
    `;
  }

  private renderAuthPanel(isAuthenticated: boolean) {
    if (isAuthenticated) {
      return html`
        <div class="auth-panel">
          <div class="card">
            <h3>Signed in</h3>
            <df-user-profile></df-user-profile>
            <df-sign-out></df-sign-out>
          </div>
          <div class="card">
            <h3>Need another account?</h3>
            <p>Open an incognito window and authenticate again. Emulator auth persists to disk for teaching flows.</p>
          </div>
        </div>
      `;
    }

    return html`
      <div class="auth-panel">
        <div class="card">
          <h3>Sign in with email</h3>
          <df-sign-in></df-sign-in>
          <df-sign-up></df-sign-up>
          <df-password-reset></df-password-reset>
        </div>
        <div class="card">
          <h3>Or continue with Google</h3>
          <df-google-signin></df-google-signin>
        </div>
      </div>
    `;
  }

  private renderSignedOutMessage() {
    return html`
      <div class="empty-state">
        <p>Authenticate above to unlock the pushup form and history feed.</p>
      </div>
    `;
  }

  private renderActivityAreas(pushups: ReturnType<typeof pushupCollectionState.get> | null, summary: ReturnType<typeof pushupSummaryState.get> | null) {
    if (!this.initializedUserId) {
      return html`<div class="empty-state">Initialising Firestore connection…</div>`;
    }

    const documents = pushups?.documents ?? [];
    const status = pushups?.status ?? 'idle';
    const collectionPath = getActivePushupCollectionPath();

    return html`
      <section class="activity-grid">
        <div class="card">
          <h3>Activity summary</h3>
          <div class="summary-metrics">
            <dl class="summary-tile">
              <dt>Total pushups</dt>
              <dd>${summary?.totalPushups ?? 0}</dd>
            </dl>
            <dl class="summary-tile">
              <dt>Entries</dt>
              <dd>${summary?.entryCount ?? 0}</dd>
            </dl>
            <dl class="summary-tile">
              <dt>Last update</dt>
              <dd>${summary?.lastEntryAt ? this.formatDate(summary.lastEntryAt) : '—'}</dd>
            </dl>
          </div>
          ${collectionPath
            ? html`<p class="collection-path">Collection: ${collectionPath}</p>`
            : nothing}
        </div>
        <div class="card">
          <h3>Log pushups</h3>
          ${this.submitMessage
            ? html`<div class="status ${this.submitMessage.variant}">${this.submitMessage.text}</div>`
            : nothing}
          <form @submit=${this.handleSubmit}>
            <md-outlined-text-field
              label="Pushups"
              type="number"
              required
              inputmode="numeric"
              helper="Enter a whole number"
              value=${this.formCount}
              @input=${this.handleCountInput}
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
          ? html`<div class="empty-state">No pushups logged yet. Submit your first entry above.</div>`
          : html`
              <div class="history-list">
                ${documents.map(
                  (entry) => html`
                    <article class="history-item">
                      <div>
                        <strong>${entry.count}</strong>
                        <div class="history-meta">
                          <span>${this.formatDate(entry.recordedAt)}</span>
                          ${entry.note ? html`<span>${entry.note}</span>` : nothing}
                        </div>
                      </div>
                      <div class="history-actions">
                        <md-text-button @click=${() => this.handleDelete(entry.id)}>
                          Delete
                        </md-text-button>
                      </div>
                    </article>
                  `
                )}
              </div>
            `}
      </section>
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

  private handleCountInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.formCount = target?.value ?? '';
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
      const parsed = Number(this.formCount);
      await logPushupEntry({count: parsed, note: this.formNote});
      this.formCount = '10';
      this.formNote = '';
      this.submitMessage = {variant: 'success', text: 'Pushup entry saved to Firestore.'};
    } catch (error) {
      console.error('[df-activity-log] Failed to log pushups', error);
      this.submitMessage = {
        variant: 'error',
        text: (error as Error)?.message ?? 'Unable to save pushups. Check the console for details.',
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
