import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import {firebaseAuthState} from '@df/state';

/**
 * User profile display component
 *
 * A presentation component that displays the current user's profile information
 * including display name, email, and photo URL.
 *
 * @property {boolean} compact - If true, shows a compact version with just the display name
 */
@customElement('df-user-profile')
export class DfUserProfile extends SignalWatcher(LitElement) {
  @property({type: Boolean}) declare compact: boolean;

  constructor() {
    super();
    this.compact = false;
  }

  static override styles = css`
    :host {
      display: block;
      font-family: var(--df-font-family, system-ui, sans-serif);
    }

    .profile-container {
      display: flex;
      align-items: center;
      gap: var(--df-spacing-3, 1rem);
      padding: var(--df-spacing-3, 1rem);
      border: 1px solid var(--df-border-color, #e0e0e0);
      border-radius: var(--df-border-radius, 8px);
      background: var(--df-surface-color, #fff);
    }

    .profile-container.compact {
      padding: var(--df-spacing-2, 0.5rem);
      border: none;
    }

    .avatar {
      width: var(--df-avatar-size, 48px);
      height: var(--df-avatar-size, 48px);
      border-radius: 50%;
      background: var(--df-avatar-bg, #e0e0e0);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .avatar.compact {
      width: var(--df-avatar-size-compact, 32px);
      height: var(--df-avatar-size-compact, 32px);
    }

    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-fallback {
      font-size: var(--df-avatar-fallback-size, 1.5rem);
      font-weight: var(--df-avatar-fallback-weight, 600);
      color: var(--df-avatar-fallback-color, #666);
    }

    .avatar-fallback.compact {
      font-size: var(--df-avatar-fallback-size-compact, 1rem);
    }

    .profile-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--df-spacing-1, 0.25rem);
    }

    .display-name {
      font-size: var(--df-display-name-size, 1rem);
      font-weight: var(--df-display-name-weight, 600);
      color: var(--df-text-primary, #000);
    }

    .email {
      font-size: var(--df-email-size, 0.875rem);
      color: var(--df-text-secondary, #666);
    }

    .badge {
      display: inline-block;
      padding: var(--df-badge-padding, 0.125rem 0.5rem);
      border-radius: var(--df-badge-radius, 12px);
      background: var(--df-badge-bg, #e3f2fd);
      color: var(--df-badge-color, #1976d2);
      font-size: var(--df-badge-size, 0.75rem);
      font-weight: var(--df-badge-weight, 500);
    }

    .not-authenticated {
      padding: var(--df-spacing-3, 1rem);
      text-align: center;
      color: var(--df-text-secondary, #666);
      font-size: var(--df-not-auth-size, 0.875rem);
    }
  `;

  override render() {
    const authState = firebaseAuthState.get();
    const user = authState.authUser;
    const isAuthenticated = authState.authState === 'authenticated';

    if (!isAuthenticated || !user) {
      return html`<div class="not-authenticated">Not signed in</div>`;
    }

    const displayName = user.displayName || 'Anonymous';
    const email = user.email || '';
    const photoURL = user.photoURL;
    const emailVerified = user.emailVerified;

    // Get first letter for avatar fallback
    const initial = displayName.charAt(0).toUpperCase();

    const containerClass = this.compact ? 'profile-container compact' : 'profile-container';
    const avatarClass = this.compact ? 'avatar compact' : 'avatar';
    const fallbackClass = this.compact ? 'avatar-fallback compact' : 'avatar-fallback';

    return html`
      <div class=${containerClass}>
        <div class=${avatarClass}>
          ${photoURL
            ? html`<img src=${photoURL} alt=${displayName} />`
            : html`<span class=${fallbackClass}>${initial}</span>`
          }
        </div>

        ${!this.compact ? html`
          <div class="profile-info">
            <div class="display-name">
              ${displayName}
              ${emailVerified ? html`<span class="badge">Verified</span>` : ''}
            </div>
            <div class="email">${email}</div>
          </div>
        ` : html`
          <div class="profile-info">
            <div class="display-name">${displayName}</div>
          </div>
        `}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-user-profile': DfUserProfile;
  }
}
