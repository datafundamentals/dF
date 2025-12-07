import {css, html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import {
  callCreateTodoAdvanced,
  callManualCleanup,
  callTodosExport,
  createTodoCallState,
  cleanupCallState,
  exportCallState,
  resetCreateTodoState,
  resetCleanupState,
  resetExportState,
  type CreateTodoAdvancedRequest,
} from '@df/state';

@customElement('df-functions-demo')
export class DfFunctionsDemo extends SignalWatcher(LitElement) {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--df-font-family, system-ui, sans-serif);
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      padding: 2rem;
    }

    .container {
      display: grid;
      gap: 1.5rem;
    }

    header {
      background: linear-gradient(130deg, rgba(99, 102, 241, 0.08), rgba(79, 70, 229, 0.06));
      border-radius: 24px;
      padding: 2rem;
      border: 1px solid rgba(99, 102, 241, 0.2);
    }

    h2 {
      margin: 0 0 0.75rem;
      font-size: 1.85rem;
      color: #1e293b;
      font-weight: 600;
    }

    h3 {
      margin: 0 0 1rem;
      font-size: 1.35rem;
      color: #334155;
      font-weight: 600;
    }

    p {
      margin: 0;
      color: #475569;
      line-height: 1.6;
    }

    .function-section {
      border-radius: 16px;
      padding: 1.5rem;
      background: rgba(241, 245, 249, 0.92);
      border: 1px solid rgba(148, 163, 184, 0.28);
    }

    .function-description {
      margin: 0 0 1.25rem;
      color: #64748b;
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .form-row {
      display: grid;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    label {
      font-size: 0.9rem;
      font-weight: 600;
      color: #475569;
    }


    .button-group {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      margin-top: 1rem;
    }

    .status {
      padding: 0.75rem 1rem;
      border-radius: 12px;
      font-size: 0.9rem;
      margin-top: 1rem;
    }

    .status.loading {
      background: rgba(59, 130, 246, 0.1);
      color: #1e40af;
      border: 1px solid rgba(59, 130, 246, 0.3);
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .status.success {
      background: rgba(34, 197, 94, 0.1);
      color: #15803d;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .status.error {
      background: rgba(239, 68, 68, 0.1);
      color: #b91c1c;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .result {
      margin-top: 1rem;
      padding: 1rem;
      background: white;
      border-radius: 12px;
      border: 1px solid rgba(148, 163, 184, 0.28);
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 0.85rem;
      white-space: pre-wrap;
      word-break: break-word;
      max-height: 300px;
      overflow-y: auto;
    }

    .callouts {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }

    .callout {
      border-radius: 16px;
      padding: 1rem 1.25rem;
      background: rgba(241, 245, 249, 0.92);
      border: 1px solid rgba(148, 163, 184, 0.28);
      color: #0f172a;
      font-weight: 600;
      text-align: center;
    }

    .init-error {
      background: rgba(220, 38, 38, 0.16);
      color: #b91c1c;
      padding: 1rem;
      border-radius: 12px;
    }
  `;

  @state() private initialized = false;
  @state() private initError: string | null = null;

  // Form state for createTodoAdvanced
  @state() private todoTitle = '';
  @state() private todoDescription = '';
  @state() private todoPriority: 'low' | 'medium' | 'high' = 'medium';

  // Form state for manualCleanup
  @state() private cleanupDays = 30;

  // Form state for export
  @state() private exportFormat: 'csv' | 'json' = 'csv';

  override connectedCallback(): void {
    super.connectedCallback();
    void this.initializeStore();
  }

  override render() {
    if (this.initError) {
      return html`
        <div class="container">
          <header>
            <h2>Cloud Functions Pattern</h2>
            <p>Unable to initialize Cloud Functions demo.</p>
          </header>
          <div class="init-error">${this.initError}</div>
        </div>
      `;
    }

    if (!this.initialized) {
      return html`
        <div class="container">
          <header>
            <h2>Cloud Functions Pattern</h2>
            <p>Initializing...</p>
          </header>
        </div>
      `;
    }

    return html`
      <div class="container">
        <header>
          <h2>Cloud Functions Pattern</h2>
          <p>
            This teaching demo demonstrates calling Cloud Functions from the client using signals-based state
            management. All functions run in the emulator for 100% offline development.
          </p>
        </header>

        <div class="callouts">
          <div class="callout">Callable Functions: 2</div>
          <div class="callout">HTTP Functions: 1</div>
          <div class="callout">Triggers: 3 (background)</div>
          <div class="callout">Scheduled: 1 (cron)</div>
        </div>

        ${this.renderCreateTodoFunction()} ${this.renderCleanupFunction()} ${this.renderExportFunction()}
      </div>
    `;
  }

  private renderCreateTodoFunction() {
    const state = createTodoCallState.get();

    return html`
      <div class="function-section">
        <h3>1. Callable Function: createTodoAdvanced</h3>
        <p class="function-description">
          Demonstrates a callable function with server-side business logic. The function calculates estimated effort
          and urgency score based on the todo details.
        </p>

        <div class="form-row">
          <div class="form-group">
            <label>Title *</label>
            <md-outlined-text-field
              type="text"
              .value=${this.todoTitle}
              @input=${(e: Event) => {
                this.todoTitle = (e.target as HTMLInputElement).value;
              }}
              placeholder="Enter todo title"
            ></md-outlined-text-field>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Description</label>
            <md-outlined-text-field
              type="textarea"
              rows="3"
              .value=${this.todoDescription}
              @input=${(e: Event) => {
                this.todoDescription = (e.target as HTMLInputElement).value;
              }}
              placeholder="Enter todo description"
            ></md-outlined-text-field>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Priority</label>
            <md-filled-select
              .value=${this.todoPriority}
              @change=${(e: Event) => {
                this.todoPriority = (e.target as HTMLSelectElement).value as 'low' | 'medium' | 'high';
              }}
            >
              <md-select-option value="low">
                <div slot="headline">Low</div>
              </md-select-option>
              <md-select-option value="medium" selected>
                <div slot="headline">Medium</div>
              </md-select-option>
              <md-select-option value="high">
                <div slot="headline">High</div>
              </md-select-option>
            </md-filled-select>
          </div>
        </div>

        <div class="button-group">
          <md-filled-button @click=${this.handleCreateTodo} ?disabled=${state.status === 'loading'}>
            Call Function
          </md-filled-button>
          <md-outlined-button @click=${this.handleResetCreateTodo} ?disabled=${state.status === 'loading'}>
            Reset
          </md-outlined-button>
        </div>

        ${state.status === 'loading'
          ? html`<div class="status loading">
              <md-circular-progress indeterminate></md-circular-progress>
              <span>Calling function...</span>
            </div>`
          : ''}
        ${state.status === 'success' && state.data
          ? html`<div class="status success">
                Success! Todo created with ID: ${state.data.todoId}
              </div>
              <div class="result">${JSON.stringify(state.data, null, 2)}</div>`
          : ''}
        ${state.status === 'error'
          ? html`<div class="status error">Error: ${state.error}</div>`
          : ''}
      </div>
    `;
  }

  private renderCleanupFunction() {
    const state = cleanupCallState.get();

    return html`
      <div class="function-section">
        <h3>2. Callable Function: manualCleanupExpiredTodos</h3>
        <p class="function-description">
          Demonstrates an administrative callable function. Deletes completed todos older than the specified number of
          days. Requires authentication.
        </p>

        <div class="form-row">
          <div class="form-group">
            <label>Days Old (1-365)</label>
            <md-outlined-text-field
              type="number"
              .value=${String(this.cleanupDays)}
              @input=${(e: Event) => {
                this.cleanupDays = parseInt((e.target as HTMLInputElement).value) || 30;
              }}
              min="1"
              max="365"
            ></md-outlined-text-field>
          </div>
        </div>

        <div class="button-group">
          <md-filled-button @click=${this.handleCleanup} ?disabled=${state.status === 'loading'}>
            Trigger Cleanup
          </md-filled-button>
          <md-outlined-button @click=${this.handleResetCleanup} ?disabled=${state.status === 'loading'}>
            Reset
          </md-outlined-button>
        </div>

        ${state.status === 'loading'
          ? html`<div class="status loading">
              <md-circular-progress indeterminate></md-circular-progress>
              <span>Running cleanup...</span>
            </div>`
          : ''}
        ${state.status === 'success' && state.data
          ? html`<div class="status success">${state.data.message}</div>
              <div class="result">${JSON.stringify(state.data, null, 2)}</div>`
          : ''}
        ${state.status === 'error'
          ? html`<div class="status error">Error: ${state.error}</div>`
          : ''}
      </div>
    `;
  }

  private renderExportFunction() {
    const state = exportCallState.get();

    return html`
      <div class="function-section">
        <h3>3. HTTP Function: todosExportAPI</h3>
        <p class="function-description">
          Demonstrates an HTTP function accessed via standard fetch. Exports todos in CSV or JSON format. Uses query
          parameters for configuration.
        </p>

        <div class="form-row">
          <div class="form-group">
            <label>Export Format</label>
            <md-filled-select
              .value=${this.exportFormat}
              @change=${(e: Event) => {
                this.exportFormat = (e.target as HTMLSelectElement).value as 'csv' | 'json';
              }}
            >
              <md-select-option value="csv" selected>
                <div slot="headline">CSV</div>
              </md-select-option>
              <md-select-option value="json">
                <div slot="headline">JSON</div>
              </md-select-option>
            </md-filled-select>
          </div>
        </div>

        <div class="button-group">
          <md-filled-button @click=${this.handleExport} ?disabled=${state.status === 'loading'}>
            Export Todos
          </md-filled-button>
          <md-outlined-button @click=${this.handleResetExport} ?disabled=${state.status === 'loading'}>
            Reset
          </md-outlined-button>
        </div>

        ${state.status === 'loading'
          ? html`<div class="status loading">
              <md-circular-progress indeterminate></md-circular-progress>
              <span>Exporting...</span>
            </div>`
          : ''}
        ${state.status === 'success' && state.data
          ? html`<div class="status success">Export complete! ${state.data.split('\n').length} lines returned</div>
              <div class="result">${state.data}</div>`
          : ''}
        ${state.status === 'error'
          ? html`<div class="status error">Error: ${state.error}</div>`
          : ''}
      </div>
    `;
  }

  private async initializeStore(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Functions auto-initialize when accessed
    this.initialized = true;
  }

  private async handleCreateTodo() {
    if (!this.todoTitle.trim()) {
      return;
    }

    const request: CreateTodoAdvancedRequest = {
      title: this.todoTitle,
      description: this.todoDescription || undefined,
      priority: this.todoPriority,
      tags: ['demo', 'functions'],
    };

    try {
      await callCreateTodoAdvanced(request);
    } catch (error) {
      // Error is already captured in the store
      console.error('Failed to create todo:', error);
    }
  }

  private handleResetCreateTodo() {
    this.todoTitle = '';
    this.todoDescription = '';
    this.todoPriority = 'medium';
    resetCreateTodoState();
  }

  private async handleCleanup() {
    try {
      await callManualCleanup({daysOld: this.cleanupDays});
    } catch (error) {
      // Error is already captured in the store
      console.error('Failed to run cleanup:', error);
    }
  }

  private handleResetCleanup() {
    this.cleanupDays = 30;
    resetCleanupState();
  }

  private async handleExport() {
    try {
      await callTodosExport(this.exportFormat);
    } catch (error) {
      // Error is already captured in the store
      console.error('Failed to export todos:', error);
    }
  }

  private handleResetExport() {
    this.exportFormat = 'csv';
    resetExportState();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-functions-demo': DfFunctionsDemo;
  }
}
