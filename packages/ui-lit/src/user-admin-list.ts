/**
 * Component: df-user-admin-list
 *
 * Displays a searchable, paginated list of users with their roles.
 * Emits events when users are selected for role changes.
 *
 * Usage:
 * ```html
 * <df-user-admin-list
 *   .users=${users}
 *   ?loading=${isLoading}
 *   @user-selected=${handleUserSelected}
 * ></df-user-admin-list>
 * ```
 *
 * Events:
 * - user-selected: Fired when user clicks on a user item (detail: { uid, email, currentRole })
 */

import {css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import type {Role, UserAdminListItem} from '@df/types';

type UserItem = UserAdminListItem;

@customElement('df-user-admin-list')
export class DfUserAdminList extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: inherit;
    }

    .container {
      padding: 1rem;
    }

    .search-bar {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    md-outlined-text-field {
      flex: 1;
    }

    .list {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }

    .list-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .list-item:hover {
      background-color: #f9fafb;
    }

    .list-item:last-child {
      border-bottom: none;
    }

    .user-info {
      flex: 1;
      min-width: 0;
    }

    .user-email {
      font-weight: 500;
      color: #1f2937;
      word-break: break-word;
    }

    .user-display-name {
      font-size: 0.875rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }

    .user-meta {
      font-size: 0.75rem;
      color: #9ca3af;
      margin-top: 0.25rem;
    }

    .role-badge {
      padding: 0.375rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
      margin-left: 1rem;
      white-space: nowrap;
    }

    .role-admin {
      background-color: #fecaca;
      color: #991b1b;
    }

    .role-player {
      background-color: #bfdbfe;
      color: #1e40af;
    }

    .role-coder-fomo {
      background-color: #dbeafe;
      color: #0c4a6e;
    }

    .role-viewer {
      background-color: #e5e7eb;
      color: #374151;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: #6b7280;
    }

    .loading {
      text-align: center;
      padding: 2rem;
      color: #9ca3af;
    }

    .pagination {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem;
      border-top: 1px solid #e5e7eb;
    }
  `;

  @property()
  users: UserItem[] = [];

  @property({type: Boolean})
  loading = false;

  @state()
  private searchQuery = '';

  override render() {
    return html`
      <div class="container">
        <div class="search-bar">
          <md-outlined-text-field
            label="Search by email or name..."
            .value=${this.searchQuery}
            @input=${(e: InputEvent) => {
              this.searchQuery = (e.target as HTMLInputElement).value;
            }}
          ></md-outlined-text-field>
        </div>

        ${this.loading
          ? html`<div class="loading">Loading users...</div>`
          : this.filteredUsers.length === 0
            ? html`<div class="empty-state">No users found</div>`
            : html`
                <div class="list">
                  ${this.filteredUsers.map(
                    (user) => html`
                      <div
                        class="list-item"
                        @click=${() => this.selectUser(user)}
                      >
                        <div class="user-info">
                          <div class="user-email">${user.email}</div>
                          ${user.displayName
                            ? html`<div class="user-display-name">
                                ${user.displayName}
                              </div>`
                            : ''}
                          <div class="user-meta">
                            Created ${this.formatDate(user.createdAt)}
                          </div>
                        </div>
                        <div class="role-badge ${this.getRoleBadgeClass(user.role)}">
                          ${this.formatRole(user.role)}
                        </div>
                      </div>
                    `
                  )}
                </div>
              `}
      </div>
    `;
  }

  private get filteredUsers(): UserItem[] {
    if (!this.searchQuery) return this.users;

    const query = this.searchQuery.toLowerCase();
    return this.users.filter(
      (user) =>
        user.email.toLowerCase().includes(query) ||
        (user.displayName?.toLowerCase().includes(query) ?? false)
    );
  }

  private selectUser(user: UserItem): void {
    this.dispatchEvent(
      new CustomEvent('user-selected', {
        detail: {
          uid: user.uid,
          email: user.email,
          currentRole: user.role,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private formatRole(role: Role): string {
    const roleNames: Record<Role, string> = {
      admin: 'Admin',
      player: 'Player',
      coderFomo: 'Coder Fomo',
      viewer: 'Viewer',
    };
    return roleNames[role] || role;
  }

  private getRoleBadgeClass(role: Role): string {
    const classMap: Record<Role, string> = {
      admin: 'role-admin',
      player: 'role-player',
      coderFomo: 'role-coder-fomo',
      viewer: 'role-viewer',
    };
    return classMap[role] || '';
  }

  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'today';
      if (diffDays === 1) return 'yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-user-admin-list': DfUserAdminList;
  }
}
