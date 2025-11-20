/**
 * Component: df-role-picker
 *
 * Dialog/modal for selecting multiple user roles.
 * Displays available roles as checkboxes and handles confirmation.
 *
 * Usage:
 * ```html
 * <df-role-picker
 *   .userEmail=${email}
 *   .currentRoles=${['admin', 'moderator']}
 *   .open=${isOpen}
 *   @roles-selected=${handleRolesSelected}
 *   @cancel=${handleCancel}
 * ></df-role-picker>
 * ```
 *
 * Events:
 * - roles-selected: Fired when user confirms role changes (detail: { selectedRoles })
 * - cancel: Fired when user cancels the dialog
 */

import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import type {Role} from '@df/types';

@customElement('df-role-picker')
export class DfRolePicker extends LitElement {
  static override styles = css`
    :host {
      display: none;
    }

    :host([open]) {
      display: block;
    }

    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .dialog {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      width: 90%;
      padding: 2rem;
    }

    .dialog-header {
      margin-bottom: 1.5rem;
    }

    .dialog-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 0.5rem 0;
    }

    .dialog-description {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0;
    }

    .user-email {
      font-weight: 500;
      color: #374151;
      margin-top: 0.5rem;
    }

    .role-options {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 2rem;
    }

    .role-option {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .role-option:hover {
      border-color: #1f2937;
      background-color: #f9fafb;
    }

    .role-option[selected] {
      border-color: #1f2937;
      background-color: #f3f4f6;
    }

    .role-option md-checkbox {
      margin-top: 0.25rem;
      cursor: pointer;
    }

    .role-info {
      flex: 1;
    }

    .role-name {
      font-weight: 500;
      color: #1f2937;
      display: block;
    }

    .role-description {
      font-size: 0.875rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }

    .dialog-footer {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
    }

    .dialog-footer md-outlined-button,
    .dialog-footer md-filled-button {
      cursor: pointer;
    }
  `;

  @property({type: Boolean, reflect: true})
  open = false;

  @property()
  userEmail = '';

  @property()
  declare currentRoles: Role[];

  @property()
  declare selectedRoles: Role[];

  private readonly roleDescriptions: Record<Role, string> = {
    admin: 'Full access to all features and user management',
    player: 'Access to core features and gameplay',
    coderFomo: 'Access to coding challenges and competitions',
    viewer: 'Read-only access to content',
  };

  constructor() {
    super();
    this.currentRoles = [];
    this.selectedRoles = [];
  }

  override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has('currentRoles')) {
      this.selectedRoles = [...this.currentRoles];
    }
  }

  override render() {
    return html`
      <div class="overlay" @click=${this.handleOverlayClick}>
        <div class="dialog" @click=${(e: MouseEvent) => e.stopPropagation()}>
          <div class="dialog-header">
            <h2 class="dialog-title">Manage User Roles</h2>
            <p class="dialog-description">
              Select one or more roles for:
              <span class="user-email">${this.userEmail}</span>
            </p>
          </div>

          <div class="role-options">
            ${this.renderRoleOptions()}
          </div>

          <div class="dialog-footer">
            <md-outlined-button @click=${() => this.cancel()}>
              Cancel
            </md-outlined-button>
            <md-filled-button
              ?disabled=${this.rolesUnchanged()}
              @click=${() => this.confirm()}
            >
              Update Roles
            </md-filled-button>
          </div>
        </div>
      </div>
    `;
  }

  private renderRoleOptions() {
    const roles: Role[] = ['admin', 'player', 'coderFomo', 'viewer'];
    return roles.map(
      (role) => html`
        <div class="role-option" ?selected=${this.selectedRoles.includes(role)} @click=${() => {
          this.toggleRole(role);
        }}>
          <md-checkbox
            .checked=${this.selectedRoles.includes(role)}
            @change=${() => {
              this.toggleRole(role);
            }}
          ></md-checkbox>
          <div class="role-info">
            <span class="role-name">${this.formatRole(role)}</span>
            <div class="role-description">
              ${this.roleDescriptions[role]}
            </div>
          </div>
        </div>
      `
    );
  }

  private toggleRole(role: Role): void {
    const index = this.selectedRoles.indexOf(role);
    if (index === -1) {
      this.selectedRoles = [...this.selectedRoles, role];
    } else {
      this.selectedRoles = this.selectedRoles.filter((_, i) => i !== index);
    }
  }

  private rolesUnchanged(): boolean {
    if (this.selectedRoles.length !== this.currentRoles.length) {
      return false;
    }
    const selectedSet = new Set(this.selectedRoles);
    return this.currentRoles.every((role) => selectedSet.has(role));
  }

  private confirm(): void {
    this.dispatchEvent(
      new CustomEvent('roles-selected', {
        detail: {selectedRoles: this.selectedRoles},
        bubbles: true,
        composed: true,
      })
    );
    this.close();
  }

  private cancel(): void {
    this.dispatchEvent(
      new CustomEvent('cancel', {
        bubbles: true,
        composed: true,
      })
    );
    this.close();
  }

  private close(): void {
    this.open = false;
    this.selectedRoles = [...this.currentRoles];
  }

  private handleOverlayClick(): void {
    this.cancel();
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
}

declare global {
  interface HTMLElementTagNameMap {
    'df-role-picker': DfRolePicker;
  }
}
