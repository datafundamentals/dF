/**
 * ⚠️ CRITICAL STANDARDS COMPLIANCE ⚠️
 *
 * This component MUST use Material Design 3 web components from @material/web.
 *
 * ✅ ALLOWED:
 * - <md-filled-button>, <md-outlined-button>, <md-text-button>
 * - <md-outlined-text-field>, <md-filled-text-field>
 * - <md-filled-select>, <md-outlined-select> with <md-select-option>
 * - <md-checkbox>, <md-radio>
 *
 * ❌ FORBIDDEN:
 * - Native <button>, <input>, <select>, <textarea>
 *
 * See:
 * - /guides/STANDARDS_STYLES.md#material-design-3
 * - /packages/ui-lit/README.md
 * - /packages/ui-lit/src/df-upload-link.ts (compliant example)
 *
 * Build will FAIL if native HTML elements are detected.
 */

import {SignalWatcher} from '@lit-labs/signals';
import {css, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {
  chatMessagesState,
  chatSendState,
  sendChatMessage,
  startChatRealtime,
  stopChatRealtime,
  firebaseAuthState,
} from '@df/state';
import type {ChatMessage, ChatSendStatus, FirestoreRequestState} from '@df/types';

import '@material/web/button/filled-button.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/progress/circular-progress.js';
import type {MdOutlinedTextField} from '@material/web/textfield/outlined-text-field.js';

const ENTER_KEY = 'Enter';

@customElement('df-chat-widget')
export class DfChatWidget extends SignalWatcher(LitElement) {
  static override styles = css`
    :host {
      display: block;
      width: min(420px, 100%);
      font-family: var(--df-font-family, 'Roboto', system-ui, sans-serif);
      color: var(--md-sys-color-on-surface, #1f1f1f);
    }

    .container {
      display: grid;
      grid-template-rows: auto 1fr auto;
      gap: 16px;
      border-radius: 20px;
      padding: 20px;
      background: var(--md-sys-color-surface, rgba(255, 255, 255, 0.98));
      box-shadow: 0 24px 45px rgba(15, 23, 42, 0.18);
      border: 1px solid rgba(15, 23, 42, 0.08);
      height: var(--df-chat-height, 580px);
    }

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .title {
      display: grid;
      gap: 4px;
    }

    h2 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--md-sys-color-on-surface, #0f172a);
    }

    .subtitle {
      font-size: 0.85rem;
      color: rgba(15, 23, 42, 0.65);
    }

    .messages {
      position: relative;
      overflow-y: auto;
      padding: 12px;
      border-radius: 16px;
      background: rgba(241, 245, 249, 0.65);
      display: grid;
      gap: 12px;
    }

    .message {
      display: grid;
      gap: 6px;
      padding: 12px 14px;
      border-radius: 14px;
      background: var(--md-sys-color-surface-container-low, #ffffff);
      border: 1px solid rgba(148, 163, 184, 0.24);
      box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
    }

    .message[data-self='true'] {
      background: var(--md-sys-color-primary-container, rgba(99, 102, 241, 0.16));
      border-color: rgba(99, 102, 241, 0.32);
    }

    .message-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
    }

    .author {
      font-weight: 600;
      color: rgba(15, 23, 42, 0.9);
    }

    .timestamp {
      font-size: 0.75rem;
      color: rgba(99, 102, 241, 0.9);
    }

    .body {
      font-size: 0.95rem;
      line-height: 1.45;
      color: rgba(15, 23, 42, 0.85);
      white-space: pre-wrap;
      word-break: break-word;
    }

    .composer {
      display: grid;
      gap: 12px;
    }

    md-outlined-text-field {
      width: 100%;
    }

    .actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .status {
      font-size: 0.78rem;
      color: rgba(100, 116, 139, 0.92);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status[hidden] {
      display: none;
    }

    .status--error {
      color: rgba(220, 38, 38, 0.85);
    }

    md-circular-progress {
      --md-circular-progress-size: 18px;
    }

    .empty-state {
      text-align: center;
      color: rgba(100, 116, 139, 0.92);
      font-size: 0.9rem;
      padding: 24px 0;
    }
  `;

  /** Optional label shown in the widget header. */
  @property({type: String}) declare heading: string;

  /** When true, pressing Enter submits the message (Shift+Enter adds line breaks). */
  @property({type: Boolean, attribute: 'submit-on-enter'}) declare submitOnEnter: boolean;

  /** Autofocuses the composer when the widget becomes interactive. */
  @property({type: Boolean, attribute: 'auto-focus'}) declare autoFocus: boolean;

  @state() private messageText = '';
  private previousMessageCount = 0;

  constructor() {
    super();
    this.heading = 'Mon Wed Chat';
    this.submitOnEnter = true;
    this.autoFocus = false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    // Attempt to enable realtime updates; ignore if store not ready yet.
    try {
      startChatRealtime();
    } catch {
      /* noop - store not initialized yet */
    }
  }

  override disconnectedCallback(): void {
    try {
      stopChatRealtime();
    } catch {
      /* noop */
    }
    super.disconnectedCallback();
  }

  override firstUpdated(): void {
    if (this.autoFocus) {
      const composer = this.renderRoot.querySelector<MdOutlinedTextField>('md-outlined-text-field');
      composer?.focus();
    }
  }

  override render() {
    const chatState = chatMessagesState.get();
    const sendState = chatSendState.get();
    const {authUser} = firebaseAuthState.get();
    const disabled = sendState.status === 'sending';

    const statusLabel = this.resolveStatusLabel(chatState.status, sendState.status, sendState.error);

    const messages = chatState.documents;
    const isEmpty = !messages.length && chatState.status !== 'loading';

    return html`
      <div class="container" role="region" aria-live="polite">
        <header>
          <div class="title">
            <h2>${this.heading}</h2>
            <span class="subtitle">
              ${authUser
                ? html`Signed in as <strong>${authUser.displayName ?? authUser.email ?? 'Anonymous'}</strong>`
                : 'Sign in to send messages'}
            </span>
          </div>
        </header>

        <section class="messages" aria-label="Chat messages">
          ${chatState.status === 'loading' && !messages.length
            ? html`<div class="empty-state">Loading conversation…</div>`
            : nothing}

          ${isEmpty ? html`<div class="empty-state">Start the conversation by sending the first message.</div>` : nothing}

          ${messages.map((message) => this.renderMessage(message, authUser?.uid ?? null))}
        </section>

        <section class="composer" aria-label="Send a message">
          <md-outlined-text-field
            label="Message"
            type="text"
            .value=${this.messageText}
            @input=${this.handleInput}
            @keydown=${this.handleKeydown}
            ?disabled=${!authUser || disabled}
            .supportingText=${authUser ? 'Shift+Enter for a new line' : 'Sign in to participate'}
            .maxLength=${1000}
            .charCounter=${true}>
          </md-outlined-text-field>

          <div class="actions">
            <span class="status" ?hidden=${!statusLabel} role="status">
              ${sendState.status === 'sending'
                ? html`<md-circular-progress indeterminate></md-circular-progress>`
                : nothing}
              <span class=${sendState.status === 'error' ? 'status--error' : ''}>${statusLabel}</span>
            </span>

            <md-filled-button
              ?disabled=${!this.canSubmit(authUser !== null, disabled)}
              @click=${this.submitMessage}
            >
              Send
            </md-filled-button>
          </div>
        </section>
      </div>
    `;
  }

  override updated(): void {
    const chatState = chatMessagesState.get();
    const messageCount = chatState.documents.length;
    if (messageCount > this.previousMessageCount) {
      this.scrollToLatest();
    }
    this.previousMessageCount = messageCount;
  }

  private renderMessage(message: ChatMessage, currentUserId: string | null) {
    const isSelf = currentUserId !== null && message.userId === currentUserId;
    return html`
      <article class="message" data-self=${String(isSelf)}>
        <div class="message-header">
          <span class="author">${message.userDisplayName}</span>
          <time class="timestamp" datetime=${this.formatIso(message.createdAt)}>
            ${this.formatTimestamp(message.createdAt)}
          </time>
        </div>
        <p class="body">${message.text}</p>
      </article>
    `;
  }

  private handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.messageText = target.value;
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (!this.submitOnEnter) {
      return;
    }

    if (event.key === ENTER_KEY && !event.shiftKey) {
      event.preventDefault();
      void this.submitMessage();
    }
  }

  private async submitMessage(): Promise<void> {
    const {authUser} = firebaseAuthState.get();
    const trimmed = this.messageText.trim();
    const sending = chatSendState.get().status === 'sending';

    if (!authUser || !trimmed || sending) {
      return;
    }

    try {
      await sendChatMessage({text: trimmed});
      this.messageText = '';
      this.dispatchEvent(
        new CustomEvent('df-chat-widget-message-sent', {
          detail: {text: trimmed},
          bubbles: true,
          composed: true,
        })
      );
    } catch (error) {
      this.dispatchEvent(
        new CustomEvent('df-chat-widget-error', {
          detail: {error},
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  private canSubmit(isAuthenticated: boolean, disabled: boolean): boolean {
    if (!isAuthenticated || disabled) {
      return false;
    }

    return Boolean(this.messageText.trim().length);
  }

  private resolveStatusLabel(
    collectionStatus: FirestoreRequestState,
    sendStatus: ChatSendStatus,
    error: string | null
  ): string | null {
    if (sendStatus === 'sending') {
      return 'Sending…';
    }

    if (sendStatus === 'error') {
      return error ?? 'Unable to send message';
    }

    if (collectionStatus === 'loading') {
      return 'Loading messages…';
    }

    if (collectionStatus === 'error') {
      return 'Failed to load messages';
    }

    return null;
  }

  private scrollToLatest(): void {
    const container = this.renderRoot.querySelector('.messages');
    if (container instanceof HTMLElement) {
      container.scrollTop = container.scrollHeight;
    }
  }

  private formatTimestamp(value: Date | null): string {
    if (!value) {
      return 'Unknown';
    }

    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(value);
  }

  private formatIso(value: Date | null): string {
    return value ? value.toISOString() : '';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-chat-widget': DfChatWidget;
  }
}
