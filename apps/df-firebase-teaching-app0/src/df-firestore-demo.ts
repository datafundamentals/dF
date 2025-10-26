import {css, html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import {getInitializedFirebaseApp, shouldUseEmulatorForService} from '@df/state';
import {
  initializeTodosStore,
  todoCollectionState,
  __setTodoDemoState,
  __setTodoDemoFilters,
  firebaseAuthState,
  googleAuthUser,
} from '@df/state';
import type {FirestoreCollectionState, TodoDocument, TodoFilterState} from '@df/types';

// Ensure Firestore UI components are registered
import '@df/ui-lit/firebase';

@customElement('df-firestore-demo')
export class DfFirestoreDemo extends SignalWatcher(LitElement) {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--df-font-family, system-ui, sans-serif);
      width: min(1200px, 90vw);
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

    p {
      margin: 0;
      color: #475569;
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
      background: rgba(241, 245, 249, 0.92);
      border: 1px solid rgba(148, 163, 184, 0.28);
      color: #0f172a;
      font-weight: 600;
      text-align: center;
    }
  `;

  @state() private initialized = false;
  @state() private initError: string | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    void this.initializeStore();
  }

  override render() {
    const collection = todoCollectionState.get();
    const auth = firebaseAuthState.get();
    const googleUser = googleAuthUser.get();
    
    // Check BOTH auth systems - emulator auth OR Google auth
    // In emulator mode, we're more permissive since emulators don't enforce auth
    const isAuthenticated = auth.authUser !== null || googleUser !== null || shouldUseEmulatorForService('firestore');

    // Auto-initialize when user signs in OR when using emulator
    if (isAuthenticated && !this.initialized) {
      void this.initializeStore();
    }

    // Show authentication requirement message if not authenticated (and not using emulator)
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

          <div class="callout" style="background: rgba(59, 130, 246, 0.12); color: #1d4ed8;">
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
          ? html`<div class="callout" style="background: rgba(220, 38, 38, 0.16); color: #b91c1c;">
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
      if (import.meta.env.MODE === 'test') {
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
          queryDescription: 'Demo data (tests)',
        };

        __setTodoDemoFilters(filters);
        __setTodoDemoState(state);
        this.initialized = true;
        return;
      }

      // Wait for authentication before initializing Firestore
      // In emulator mode, we allow unauthenticated access
      const auth = firebaseAuthState.get();
      const googleUser = googleAuthUser.get();
      
      // Check BOTH auth systems, or allow if using emulator
      if (!auth.authUser && !googleUser && !shouldUseEmulatorForService('firestore')) {
        // Not authenticated yet - wait for user to sign in
        // The component will re-render when either auth state changes
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
}

declare global {
  interface HTMLElementTagNameMap {
    'df-firestore-demo': DfFirestoreDemo;
  }
}
