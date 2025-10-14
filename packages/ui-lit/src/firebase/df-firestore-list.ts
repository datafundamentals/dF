/**
 * ⚠️ CRITICAL STANDARDS COMPLIANCE ⚠️
 * 
 * This component MUST use Material Design 3 web components from @material/web.
 * 
 * ✅ ALLOWED:
 * - <md-filled-button>, <md-outlined-button>, <md-text-button>
 * - <md-outlined-text-field>, <md-filled-text-field>
 * - <md-filled-select>, <md-outlined-select> with <md-select-option>
 * 
 * ❌ FORBIDDEN:
 * - Native <button>, <input>, <select>, <textarea>
 * 
 * See: /coding_docs/STANDARDS_STYLES.md#material-design-3
 */

import {SignalWatcher} from '@lit-labs/signals';
import {LitElement, html, css, nothing} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import type {TodoDocument, FirestoreCollectionState, TodoFilterState} from '@df/types';
import {
  addTodo,
  deleteTodo,
  loadNextTodoPage,
  loadPreviousTodoPage,
  resetTodoFilters,
  setTodoFilters,
  setTodoPageSize,
  startTodoRealtime,
  stopTodoRealtime,
  todoCollectionState,
  todoFilterState,
  toggleTodoCompletion,
  updateTodo,
} from '@df/state';

// MD3 Component Imports
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/select/filled-select.js';
import '@material/web/select/select-option.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';

import './df-firestore-item.js';
import './df-firestore-form.js';
import './df-firestore-delete.js';

import type {FirestoreFormSubmitDetail} from './df-firestore-form.js';

@customElement('df-firestore-list')
export class DfFirestoreList extends SignalWatcher(LitElement) {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
      box-sizing: border-box;
      border-radius: 24px;
      padding: 2rem;
      background: var(--md-sys-color-surface-container-low, linear-gradient(160deg, rgba(241, 245, 249, 0.92), rgba(226, 232, 240, 0.82)));
      border: 1px solid var(--md-sys-color-outline-variant, rgba(148, 163, 184, 0.35));
    }

    header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
    }

    h2 {
      margin: 0;
      font-size: 1.85rem;
      color: var(--md-sys-color-on-surface, #0f172a);
    }

    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
    }

    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin: 1.5rem 0 2rem;
    }

    .filters label {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      font-size: 0.85rem;
      color: var(--md-sys-color-on-surface-variant, #475569);
      font-weight: 600;
    }

    /* MD3 components handle their own styling */
    md-filled-select,
    md-outlined-text-field {
      min-width: 160px;
    }

    .list {
      display: grid;
      gap: 1.25rem;
    }

    .empty-state {
      padding: 2.5rem;
      border: 2px dashed var(--md-sys-color-primary, rgba(59, 130, 246, 0.35));
      border-radius: 18px;
      text-align: center;
      color: var(--md-sys-color-on-surface-variant, #475569);
      background: var(--md-sys-color-primary-container, rgba(191, 219, 254, 0.18));
    }

    .error-state {
      padding: 1rem 1.25rem;
      border-radius: 14px;
      background: var(--md-sys-color-error-container, rgba(220, 38, 38, 0.16));
      color: var(--md-sys-color-on-error-container, #b91c1c);
      margin-bottom: 1.5rem;
    }

    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      margin: 2rem 0 1.5rem;
      flex-wrap: wrap;
    }

    /* MD3 buttons handle their own styling - removed custom button CSS */

    .toolbar-controls {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .toolbar-select {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      font-size: 0.85rem;
      color: var(--md-sys-color-on-surface-variant, #475569);
      font-weight: 600;
    }

    .pagination {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .status-indicator {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.85rem;
      padding: 0.4rem 0.75rem;
      border-radius: 999px;
      background: rgba(16, 185, 129, 0.14);
      color: #047857;
    }

    .status-indicator[data-offline='true'] {
      background: rgba(220, 38, 38, 0.14);
      color: #b91c1c;
    }

    .load-more-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      margin-top: 2rem;
      padding: 1.5rem;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05));
      border: 1px dashed var(--md-sys-color-primary, rgba(99, 102, 241, 0.3));
    }

    .load-more-button {
      min-width: 200px;
    }

    .load-more-hint {
      margin: 0;
      font-size: 0.85rem;
      color: var(--md-sys-color-on-surface-variant, #64748b);
      text-align: center;
    }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      z-index: 99;
    }

    .modal-content {
      position: relative;
      max-width: min(95vw, 640px);
      width: 100%;
    }

    /* MD3 icon button handles its own styling */
    md-icon-button.modal-close {
      position: absolute;
      top: -3.5rem;
      right: 0;
      --md-icon-button-icon-color: #fff;
    }

    @media (max-width: 900px) {
      :host {
        padding: 1.25rem;
      }

      header {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `;

  @state() private searchTerm = '';
  @state() private isFormOpen = false;
  @state() private formMode: 'create' | 'edit' = 'create';
  @state() private editingTodo: TodoDocument | null = null;
  @state() private deleteTarget: TodoDocument | null = null;
  @state() private realtimeEnabled = false;
  @state() private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  @state() private localError: string | null = null;
  @state() private isLoadingMore = false;

  private onlineListener = () => (this.isOnline = true);
  private offlineListener = () => (this.isOnline = false);

  override connectedCallback(): void {
    super.connectedCallback();
    this.updateRealtimeFromState();
    window.addEventListener('online', this.onlineListener);
    window.addEventListener('offline', this.offlineListener);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('online', this.onlineListener);
    window.removeEventListener('offline', this.offlineListener);
  }

  override render() {
    const collection = todoCollectionState.get();
    const filters = todoFilterState.get();
    const tags = this.collectTags(collection);
    const documents = this.applySearch(collection.documents, this.searchTerm);

    return html`
      <header>
        <div>
          <h2>Firestore Todos</h2>
          <div class="controls">
            <span class="status-indicator" data-offline=${!this.isOnline}>${this.isOnline ? 'Online' : 'Offline'}</span>
            <span class="status-indicator" data-offline=${!this.realtimeEnabled}
              >${this.realtimeEnabled ? 'Real-time: ON' : 'Real-time: OFF'}</span
            >
          </div>
        </div>
        <div class="controls">
          <md-outlined-button @click=${this.handleToggleRealtime}>
            ${this.realtimeEnabled ? 'Disable real-time' : 'Enable real-time'}
          </md-outlined-button>
          <md-filled-button @click=${this.openCreateForm}>Create todo</md-filled-button>
        </div>
      </header>

      ${collection.error ? html`<div class="error-state">${collection.error}</div>` : nothing}

      <section class="filters">
        <label>
          Priority
          <md-filled-select .value=${filters.priority} @change=${this.handlePriorityChange}>
            <md-select-option value="all">
              <div slot="headline">All priorities</div>
            </md-select-option>
            <md-select-option value="low">
              <div slot="headline">Low</div>
            </md-select-option>
            <md-select-option value="medium">
              <div slot="headline">Medium</div>
            </md-select-option>
            <md-select-option value="high">
              <div slot="headline">High</div>
            </md-select-option>
          </md-filled-select>
        </label>

        <label>
          Tag
          <md-filled-select .value=${filters.tag} @change=${this.handleTagChange}>
            <md-select-option value="all">
              <div slot="headline">All tags</div>
            </md-select-option>
            ${tags.map((tag) => html`
              <md-select-option value=${tag}>
                <div slot="headline">${tag}</div>
              </md-select-option>
            `)}
          </md-filled-select>
        </label>

        <label>
          Show completed
          <md-filled-select .value=${filters.showCompleted ? 'yes' : 'no'} @change=${this.handleCompletedChange}>
            <md-select-option value="yes">
              <div slot="headline">Yes</div>
            </md-select-option>
            <md-select-option value="no">
              <div slot="headline">No</div>
            </md-select-option>
          </md-filled-select>
        </label>

        <label>
          Search title
          <md-outlined-text-field
            type="search"
            .value=${this.searchTerm}
            placeholder="Search displayed results"
            @input=${(event: Event) => (this.searchTerm = (event.target as HTMLInputElement).value)}
          ></md-outlined-text-field>
        </label>

        <md-outlined-button type="button" @click=${this.handleResetFilters}>Reset filters</md-outlined-button>
      </section>

      <section class="toolbar">
        <div class="toolbar-controls">
          <span>Page ${collection.currentPage}</span>
          <label class="toolbar-select">
            Page size
            <md-filled-select .value=${String(collection.pageSize)} @change=${this.handlePageSizeChange}>
              <md-select-option value="5">
                <div slot="headline">5 per page</div>
              </md-select-option>
              <md-select-option value="10">
                <div slot="headline">10 per page</div>
              </md-select-option>
              <md-select-option value="15">
                <div slot="headline">15 per page</div>
              </md-select-option>
            </md-filled-select>
          </label>
        </div>

        <div class="pagination">
          <md-outlined-button type="button" ?disabled=${!collection.hasPreviousPage} @click=${this.loadPrevious}>
            Previous page
          </md-outlined-button>
          <md-outlined-button type="button" ?disabled=${!collection.hasNextPage} @click=${this.loadNext}>
            Next page
          </md-outlined-button>
        </div>
      </section>

      ${collection.status === 'loading'
        ? html`<div class="empty-state">Loading todos...</div>`
        : documents.length
          ? html`
              <section class="list">
                ${documents.map(
                  (todo) => html`
                    <df-firestore-item
                      .todo=${todo}
                      @df-firestore-item-toggle=${this.handleToggleTodo}
                      @df-firestore-item-edit=${this.handleEditTodo}
                      @df-firestore-item-delete=${this.handleDeleteRequest}
                    ></df-firestore-item>
                  `
                )}
              </section>
              
              ${collection.hasNextPage ? html`
                <div class="load-more-container">
                  <md-outlined-button 
                    class="load-more-button"
                    @click=${this.handleLoadMore}
                    ?disabled=${this.isLoadingMore}
                  >
                    ${this.isLoadingMore ? 'Loading...' : 'Load more todos'}
                  </md-outlined-button>
                  <p class="load-more-hint">
                    Progressive loading: Click to append ${collection.pageSize} more items
                  </p>
                </div>
              ` : nothing}
            `
          : html`<div class="empty-state">No todos match the current filters.</div>`}

      ${this.isFormOpen ? this.renderFormModal() : nothing}
      ${this.deleteTarget ? this.renderDeleteModal() : nothing}

      ${this.localError ? html`<div class="error-state">${this.localError}</div>` : nothing}
    `;
  }

  private renderFormModal() {
    return html`
      <div class="modal-backdrop" role="dialog" aria-modal="true">
        <div class="modal-content">
          <md-icon-button class="modal-close" @click=${this.closeForm} aria-label="Close">
            <md-icon>close</md-icon>
          </md-icon-button>
          <df-firestore-form
            .mode=${this.formMode}
            .todo=${this.editingTodo}
            @df-firestore-form-submit=${this.handleFormSubmit}
            @df-firestore-form-cancel=${this.closeForm}
          ></df-firestore-form>
        </div>
      </div>
    `;
  }

  private renderDeleteModal() {
    if (!this.deleteTarget) {
      return nothing;
    }

    return html`
      <div class="modal-backdrop" role="dialog" aria-modal="true">
        <div class="modal-content">
          <md-icon-button class="modal-close" @click=${this.closeDeleteModal} aria-label="Close">
            <md-icon>close</md-icon>
          </md-icon-button>
          <df-firestore-delete
            .todoId=${this.deleteTarget.id}
            .todoTitle=${this.deleteTarget.title}
            @df-firestore-delete-confirm=${this.confirmDelete}
            @df-firestore-delete-cancel=${this.closeDeleteModal}
          ></df-firestore-delete>
        </div>
      </div>
    `;
  }

  private handlePriorityChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value as TodoFilterState['priority'];
    void setTodoFilters({priority: value});
  }

  private handleTagChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    void setTodoFilters({tag: value});
  }

  private handleCompletedChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    void setTodoFilters({showCompleted: value === 'yes'});
  }

  private handleResetFilters() {
    void resetTodoFilters();
    this.searchTerm = '';
  }

  private async handlePageSizeChange(event: Event) {
    const value = Number((event.target as HTMLSelectElement).value);
    await setTodoPageSize(value);
  }

  private async loadNext() {
    try {
      await loadNextTodoPage();
    } catch (error) {
      this.showLocalError(error);
    }
  }

  private async loadPrevious() {
    try {
      await loadPreviousTodoPage();
    } catch (error) {
      this.showLocalError(error);
    }
  }

  private async handleLoadMore() {
    this.isLoadingMore = true;
    try {
      await loadNextTodoPage();
    } catch (error) {
      this.showLocalError(error);
    } finally {
      this.isLoadingMore = false;
    }
  }

  private showLocalError(error: unknown) {
    this.localError = error instanceof Error ? error.message : 'Unexpected error occurred.';
    setTimeout(() => {
      this.localError = null;
    }, 4000);
  }

  private handleToggleRealtime() {
    this.realtimeEnabled = !this.realtimeEnabled;
    if (this.realtimeEnabled) {
      startTodoRealtime();
    } else {
      stopTodoRealtime();
    }
  }

  private updateRealtimeFromState() {
    const {isListening} = todoCollectionState.get();
    this.realtimeEnabled = isListening;
  }

  private openCreateForm() {
    this.formMode = 'create';
    this.editingTodo = null;
    this.isFormOpen = true;
  }

  private handleEditTodo(event: CustomEvent<TodoDocument>) {
    this.formMode = 'edit';
    this.editingTodo = event.detail;
    this.isFormOpen = true;
  }

  private closeForm() {
    this.isFormOpen = false;
    this.editingTodo = null;
  }

  private async handleFormSubmit(event: CustomEvent<FirestoreFormSubmitDetail>) {
    const {mode, draft, todoId} = event.detail;

    try {
      if (mode === 'create') {
        await addTodo(draft);
      } else if (todoId) {
        await updateTodo(todoId, draft);
      }
      this.isFormOpen = false;
      this.editingTodo = null;
    } catch (error) {
      this.showLocalError(error);
    }
  }

  private handleDeleteRequest(event: CustomEvent<{id: string; title: string}>) {
    const {id, title} = event.detail;
    const todo = todoCollectionState
      .get()
      .documents.find((entry) => entry.id === id) ?? {id, title, description: '', priority: 'medium', tags: [], createdAt: null, updatedAt: null, completed: false, dueDate: null};

    this.deleteTarget = todo;
  }

  private closeDeleteModal() {
    this.deleteTarget = null;
  }

  private async confirmDelete(event: CustomEvent<{id: string}>) {
    try {
      await deleteTodo(event.detail.id);
      this.closeDeleteModal();
    } catch (error) {
      this.showLocalError(error);
    }
  }

  private async handleToggleTodo(event: CustomEvent<{id: string; completed: boolean}>) {
    try {
      await toggleTodoCompletion(event.detail.id, event.detail.completed);
    } catch (error) {
      this.showLocalError(error);
    }
  }

  private applySearch(documents: readonly TodoDocument[], term: string): readonly TodoDocument[] {
    const query = term.trim().toLowerCase();
    if (!query) {
      return documents;
    }

    return documents.filter((doc) => doc.title.toLowerCase().includes(query));
  }

  private collectTags(collection: FirestoreCollectionState<TodoDocument>): string[] {
    const set = new Set<string>();
    for (const todo of collection.documents) {
      for (const tag of todo.tags) {
        set.add(tag);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-firestore-list': DfFirestoreList;
  }
}
