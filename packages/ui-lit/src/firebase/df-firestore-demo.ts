import {css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import {getInitializedFirebaseApp, shouldUseEmulatorForService} from '@df/state';
import {
  initializeTodosStore,
  todoCollectionState,
  __setTodoDemoState,
  __setTodoDemoFilters,
  firebaseAuthState,
} from '@df/state';
import type {FirestoreCollectionState, TodoDocument, TodoFilterState} from '@df/types';

import './df-firestore-list.js';

@customElement('df-firestore-demo')
export class DfFirestoreDemo extends SignalWatcher(LitElement) {
  static override styles = css`
    :host {
      display: block;
      margin: 0 auto;
      box-sizing: border-box;
      border-radius: 24px;
      padding: 2rem;
      background: var(--md-sys-color-surface, #ffffff);
      color: var(--md-sys-color-on-surface, #0f172a);
      border: 1px solid var(--md-sys-color-outline-variant, rgba(148, 163, 184, 0.35));
      box-shadow: 0 22px 45px rgba(15, 23, 42, 0.08);
    }

    .container {
      display: grid;
      gap: 1.5rem;
    }

    header {
      background: var(
        --md-sys-color-surface-container-high,
        linear-gradient(130deg, rgba(99, 102, 241, 0.08), rgba(79, 70, 229, 0.06))
      );
      border-radius: 24px;
      padding: 2rem;
      border: 1px solid var(--md-sys-color-outline-variant, rgba(99, 102, 241, 0.2));
    }

    h2 {
      margin: 0 0 0.75rem;
      font-size: 1.85rem;
      color: var(--md-sys-color-on-surface, #1e293b);
      font-weight: 600;
    }

    p {
      margin: 0;
      color: var(--md-sys-color-on-surface-variant, #475569);
      line-height: 1.6;
    }

    .callouts {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }

    .callout {
      border-radius: 16px;
      padding: 1rem 1.25rem;
      background: var(--md-sys-color-surface-container-low, rgba(241, 245, 249, 0.92));
      border: 1px solid var(--md-sys-color-outline-variant, rgba(148, 163, 184, 0.28));
      color: var(--md-sys-color-on-surface, #0f172a);
      font-weight: 600;
      text-align: center;
    }

    .callout--info {
      background: var(--md-sys-color-secondary-container, rgba(59, 130, 246, 0.12));
      color: var(--md-sys-color-on-secondary-container, #1d4ed8);
    }

    .callout--error {
      background: var(--md-sys-color-error-container, rgba(220, 38, 38, 0.16));
      color: var(--md-sys-color-on-error-container, #b91c1c);
    }
  `;

  @property({type: Boolean, attribute: 'use-demo-data'})
  declare useDemoData: boolean;

  @state() private initialized = false;
  @state() private initError: string | null = null;

  constructor() {
    super();
    this.useDemoData = false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    void this.initializeStore();
  }

  override render() {
    const collection = todoCollectionState.get();
    const auth = firebaseAuthState.get();
    const isAuthenticated = auth.authUser !== null;

    // Auto-initialize when user signs in
    if (isAuthenticated && !this.initialized) {
      void this.initializeStore();
    }

    // Show authentication requirement message if not authenticated
    if (!isAuthenticated && !this.initialized) {
      return html`
        <div class="container">
          <header>
            <h2>Firestore CRUD Pattern</h2>
            <p>
              This teaching demo initialises the shared Firestore store, enables IndexedDB persistence, and connects to
              the emulator so you can explore create, read, update, delete flows in real-time.
            </p>
          </header>

          <div class="callout callout--info">
            ℹ️ Please sign in using the Authentication widget above to access Firestore todos.
          </div>
        </div>
      `;
    }

    return html`
      <div class="container">
        <header>
          <h2>Firestore CRUD Pattern</h2>
          <p>
            This teaching demo initialises the shared Firestore store, enables IndexedDB persistence, and connects to
            the emulator so you can explore create, read, update, delete flows in real-time.
          </p>
        </header>

        <div class="callouts">
          <div class="callout">Status: ${collection.status}</div>
          <div class="callout">Query: ${collection.queryDescription ?? 'Default'}</div>
          <div class="callout">Docs in view: ${collection.documents.length}</div>
        </div>

        ${this.initError
          ? html`<div class="callout callout--error">
              ${this.initError}
            </div>`
          : html`<df-firestore-list></df-firestore-list>`}
      </div>
    `;
  }

  private async initializeStore(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      if (this.shouldUseDemoState()) {
        this.applyDemoState();
        return;
      }

      // Wait for authentication before initializing Firestore
      const auth = firebaseAuthState.get();
      if (!auth.authUser) {
        // Not authenticated yet - wait for user to sign in
        // The component will re-render when firebaseAuthState changes
        return;
      }

      await initializeTodosStore(
        getInitializedFirebaseApp(),
        shouldUseEmulatorForService('firestore')
      );
      this.initialized = true;
    } catch (error) {
      console.error('[df-firestore-demo] Failed to initialise Firestore demo:', error);
      this.initError =
        'Unable to initialise Firestore demo. Ensure the emulators are running and reload the page.';
    }
  }

  private shouldUseDemoState(): boolean {
    const mode = (import.meta as ImportMeta & {env?: Record<string, string | undefined>}).env?.MODE;
    return mode === 'test' || this.useDemoData;
  }

  private applyDemoState(): void {
    const filters: TodoFilterState = {
      showCompleted: true,
      priority: 'all',
      tag: 'all',
      search: '',
    };

    const todos: TodoDocument[] = [
      {
        id: 'demo-todo-1',
        title: 'Plan Firestore walkthrough',
        description: 'Outline create, read, update, delete flows for the workshop.',
        completed: false,
        priority: 'high',
        tags: ['teaching', 'planning'],
        createdAt: new Date('2025-09-18T14:30:00Z'),
        updatedAt: new Date('2025-09-18T14:30:00Z'),
        dueDate: new Date('2025-09-20T17:00:00Z'),
      },
      {
        id: 'demo-todo-2',
        title: 'Draft CRUD copy',
        description: 'Write helpful placeholder text for the todo form.',
        completed: true,
        priority: 'medium',
        tags: ['content', 'ux'],
        createdAt: new Date('2025-09-15T09:00:00Z'),
        updatedAt: new Date('2025-09-19T10:15:00Z'),
        dueDate: null,
      },
      {
        id: 'demo-todo-3',
        title: 'Record real-time GIF',
        description: 'Capture a short clip demonstrating Firestore listener updates.',
        completed: false,
        priority: 'medium',
        tags: ['media', 'realtime'],
        createdAt: new Date('2025-09-21T11:45:00Z'),
        updatedAt: new Date('2025-09-21T11:45:00Z'),
        dueDate: new Date('2025-09-25T22:00:00Z'),
      },
    ];

    const state: FirestoreCollectionState<TodoDocument> = {
      status: 'ready',
      documents: todos,
      error: null,
      isListening: false,
      lastUpdated: Date.now(),
      currentPage: 1,
      pageSize: 5,
      hasNextPage: false,
      hasPreviousPage: false,
      queryDescription: this.useDemoData ? 'Storybook demo data' : 'Demo data (tests)',
    };

    __setTodoDemoFilters(filters);
    __setTodoDemoState(state);
    this.initialized = true;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-firestore-demo': DfFirestoreDemo;
  }
}
