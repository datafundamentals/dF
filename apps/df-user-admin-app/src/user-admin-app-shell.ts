import {css, html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import {
  firebaseAuthState,
  userAdminState,
  loadUsers,
  updateUserRole,
  clearUserAdminError,
} from '@df/state';
import type {Role, UserAdminListItem} from '@df/types';

type SelectedUser = Pick<UserAdminListItem, 'uid' | 'email' | 'role'>;

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

  @state() private declare selectedUser: SelectedUser | null;

  @state() private declare isRolePickerOpen: boolean;

  private hasRequestedUsers = false;

  constructor() {
    super();
    this.selectedUser = null;
    this.isRolePickerOpen = false;
  }

  protected override updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);

    const {authState, authUser} = firebaseAuthState.get();

    if (authState === 'authenticated' && authUser && !this.hasRequestedUsers) {
      this.hasRequestedUsers = true;
      loadUsers().catch((error) => {
        console.error('Failed to load users:', error);
      });
    } else if ((!authUser || authState !== 'authenticated') && this.hasRequestedUsers) {
      this.hasRequestedUsers = false;
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
      await updateUserRole(this.selectedUser.uid, event.detail.newRole);
      this.isRolePickerOpen = false;
      this.selectedUser = null;
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  }

  private handleCancel(): void {
    this.isRolePickerOpen = false;
    this.selectedUser = null;
  }

  override render() {
    // Make component reactive to auth changes
    firebaseAuthState.get();
    const {users, loading, error} = userAdminState.get();

    return html`
      <div class="container">
        <div class="header">
          <h1 class="title">User Administration</h1>
          <p class="subtitle">Manage user roles and permissions</p>
        </div>

        ${error
          ? html`
              <div class="error">
                <span>${error}</span>
                <button class="error-close" @click=${() => clearUserAdminError()}>
                  ×
                </button>
              </div>
            `
          : ''}

        ${loading
          ? html` <div class="loading">Loading users...</div> `
          : html`
              <df-user-admin-list
                .users=${users}
                .loading=${loading}
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
