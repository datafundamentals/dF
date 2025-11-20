import {css, html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {getInitializedFirebaseApp, shouldUseEmulatorForService, firebaseAuthState} from '@df/state';
import {getFirebaseFunctions, connectFunctionsToEmulator, callable} from '@df/firebase/functions';
import {SignalWatcher} from '@lit-labs/signals';
import type {Role} from '@df/types';

interface UserItem {
  uid: string;
  email: string;
  displayName?: string;
  role: Role;
  createdAt: string;
}

@customElement('user-admin-app-shell')
export class UserAdminAppShell extends SignalWatcher(LitElement) {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .header {
      margin-bottom: 2rem;
    }

    .title {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 0.5rem 0;
    }

    .subtitle {
      font-size: 1rem;
      color: #6b7280;
      margin: 0;
    }

    .error {
      padding: 1rem;
      background-color: #fee2e2;
      border: 1px solid #fca5a5;
      border-radius: 6px;
      color: #991b1b;
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .error-close {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.25rem;
      color: #991b1b;
    }

    .loading {
      text-align: center;
      padding: 4rem 2rem;
      color: #9ca3af;
      font-size: 1.125rem;
    }
  `;

  @state() private declare users: UserItem[];

  @state() private declare loading: boolean;

  @state() private declare error: string;

  @state() private declare selectedUser: {uid: string; email: string; role: Role} | null;

  @state() private declare isRolePickerOpen: boolean;

  private usersLoaded = false;

  constructor() {
    super();
    this.users = [];
    this.loading = true;
    this.error = '';
    this.selectedUser = null;
    this.isRolePickerOpen = false;
  }

  protected override updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);

    // Check auth state after any update
    // SignalWatcher will re-render when firebaseAuthState signal changes
    // so this method will be called whenever auth state changes
    const {authState, authUser} = firebaseAuthState.get();

    if (authState === 'authenticated' && authUser && !this.usersLoaded) {
      this.usersLoaded = true;
      this.loadUsers();
    }
  }

  private async loadUsers(): Promise<void> {
    try {
      this.loading = true;
      this.error = '';

      // Initialize Firebase app and get Functions instance with emulator support
      const app = getInitializedFirebaseApp();
      const functions = getFirebaseFunctions(app, 'us-central1');

      // Connect to emulator if configured
      if (shouldUseEmulatorForService('functions')) {
        connectFunctionsToEmulator(functions, {
          host: '127.0.0.1',
          port: 5001,
        });
      }

      const getUserList = callable<{searchQuery?: string}, {users: UserItem[]; nextPageToken?: string}>(
        functions,
        'getUserList'
      );

      const result = await getUserList({searchQuery: ''});
      this.users = result.data.users;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load users';
      this.error = message;
      console.error('Failed to load users:', error);
    } finally {
      this.loading = false;
    }
  }

  private handleUserSelected(event: CustomEvent<{uid: string; email: string; currentRole: Role}>): void {
    this.selectedUser = {
      uid: event.detail.uid,
      email: event.detail.email,
      role: event.detail.currentRole,
    };
    this.isRolePickerOpen = true;
  }

  private async handleRoleSelected(event: CustomEvent<{newRole: Role}>): Promise<void> {
    if (!this.selectedUser) return;

    try {
      this.loading = true;

      // Initialize Firebase app and get Functions instance with emulator support
      const app = getInitializedFirebaseApp();
      let functions = getFirebaseFunctions(app, 'us-central1');

      // Connect to emulator if configured
      if (shouldUseEmulatorForService('functions')) {
        connectFunctionsToEmulator(functions, {
          host: '127.0.0.1',
          port: 5001,
        });
      }

      const updateUserRole = callable<{targetUserId: string; newRole: Role}, {success: boolean}>(
        functions,
        'updateUserRole'
      );

      await updateUserRole({
        targetUserId: this.selectedUser.uid,
        newRole: event.detail.newRole,
      });

      // Reload users to show updated role
      await this.loadUsers();
      this.isRolePickerOpen = false;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update user role';
      this.error = message;
      console.error('Failed to update user role:', error);
    } finally {
      this.loading = false;
    }
  }

  private handleCancel(): void {
    this.isRolePickerOpen = false;
    this.selectedUser = null;
  }

  override render() {
    // Access the auth state signal to make SignalWatcher reactive
    // This will cause the component to re-render whenever auth state changes
    firebaseAuthState.get();

    return html`
      <div class="container">
        <div class="header">
          <h1 class="title">User Administration</h1>
          <p class="subtitle">Manage user roles and permissions</p>
        </div>

        ${this.error
          ? html`
              <div class="error">
                <span>${this.error}</span>
                <button class="error-close" @click=${() => (this.error = '')}>
                  ×
                </button>
              </div>
            `
          : ''}

        ${this.loading
          ? html` <div class="loading">Loading users...</div> `
          : html`
              <df-user-admin-list
                .users=${this.users}
                .loading=${this.loading}
                @user-selected=${(e: CustomEvent) => this.handleUserSelected(e)}
              ></df-user-admin-list>
            `}

        <df-role-picker
          ?open=${this.isRolePickerOpen}
          .userEmail=${this.selectedUser?.email || ''}
          .currentRole=${this.selectedUser?.role || 'viewer'}
          @role-selected=${(e: CustomEvent) => this.handleRoleSelected(e)}
          @cancel=${() => this.handleCancel()}
        ></df-role-picker>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'user-admin-app-shell': UserAdminAppShell;
  }
}
