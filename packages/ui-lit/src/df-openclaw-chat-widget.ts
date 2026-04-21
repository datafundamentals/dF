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
 *
 * Build will FAIL if native HTML elements are detected.
 */

import {SignalWatcher} from '@lit-labs/signals';
import {css, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {
  openclawChatMessagesState,
  openclawChatSendState,
  sendOpenclawMessage,
  startOpenclawRealtime,
  stopOpenclawRealtime,
} from '@df/state';
import type {OpenclawMessage, OpenclawSendStatus, FirestoreRequestState} from '@df/types';

const ENTER_KEY = 'Enter';

@customElement('df-openclaw-chat-widget')
export class DfOpenclawChatWidget extends SignalWatcher(LitElement) {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
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
      height: var(--df-chat-height, 600px);
    }

    header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-img {
      height: 4.5rem;
      width: auto;
      flex-shrink: 0;
      object-fit: contain;
    }

    .header-text {
      display: grid;
      gap: 4px;
      flex: 1;
      text-align: center;
      align-items: center;
      justify-items: center;
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
      align-content: start;
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

    .message[data-role='user'] {
      background: var(--md-sys-color-primary-container, rgba(99, 102, 241, 0.16));
      border-color: rgba(99, 102, 241, 0.32);
    }

    .message-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
    }

    .role {
      font-weight: 600;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: rgba(15, 23, 42, 0.6);
    }

    .message[data-role='user'] .role {
      color: rgba(99, 102, 241, 0.9);
    }

    .timestamp {
      font-size: 0.75rem;
      color: rgba(100, 116, 139, 0.8);
    }

    .body {
      font-size: 0.95rem;
      line-height: 1.55;
      color: rgba(15, 23, 42, 0.85);
      white-space: pre-wrap;
      word-break: break-word;
    }

    .status-badge {
      font-size: 0.7rem;
      color: rgba(100, 116, 139, 0.7);
      font-style: italic;
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

  /** Label shown in the widget header. */
  @property({type: String}) declare heading: string;

  /** URL for the image shown on the left side of the header. */
  @property({type: String, attribute: 'header-img-left'}) declare headerImgLeft: string;

  /** URL for the image shown on the right side of the header. */
  @property({type: String, attribute: 'header-img-right'}) declare headerImgRight: string;

  /** When true, pressing Enter submits the message (Shift+Enter adds line breaks). */
  @property({type: Boolean, attribute: 'submit-on-enter'}) declare submitOnEnter: boolean;

  @state() private messageText = '';
  private previousMessageCount = 0;

  constructor() {
    super();
    this.heading = 'Chatty Cathy Work Request System';
    this.headerImgLeft = '';
    this.headerImgRight = '';
    this.submitOnEnter = true;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    try {
      startOpenclawRealtime();
    } catch {
      /* noop — store not initialized yet */
    }
  }

  override disconnectedCallback(): void {
    stopOpenclawRealtime();
    super.disconnectedCallback();
  }

  override render() {
    const chatState = openclawChatMessagesState.get();
    const sendState = openclawChatSendState.get();
    const disabled = sendState.status === 'sending';

    const statusLabel = this.resolveStatusLabel(chatState.status, sendState.status, sendState.error);
    const messages = chatState.documents;
    const isEmpty = !messages.length && chatState.status !== 'loading';

    return html`
      <div class="container" role="region" aria-live="polite">
        <header>
          ${this.headerImgLeft ? html`<img class="header-img" src=${this.headerImgLeft} alt="" aria-hidden="true" />` : nothing}
          <div class="header-text">
            <h2>${this.heading}</h2>
            <span class="subtitle">I am here to help you compose an Openclaw system request!</span>
          </div>
          ${this.headerImgRight ? html`<img class="header-img" src=${this.headerImgRight} alt="" aria-hidden="true" />` : nothing}
        </header>

        <section class="messages" aria-label="Chat messages">
          ${chatState.status === 'loading' && !messages.length
            ? html`<div class="empty-state">Loading conversation…</div>`
            : nothing}

          ${isEmpty ? html`<div class="empty-state">Send your first message to start composing a work request.</div>` : nothing}

          ${messages.map((message) => this.renderMessage(message))}
        </section>

        <section class="composer" aria-label="Send a message">
          <md-outlined-text-field
            label="Message"
            type="textarea"
            .value=${this.messageText}
            @input=${this.handleInput}
            @keydown=${this.handleKeydown}
            ?disabled=${disabled}
            .maxLength=${2000}
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
              ?disabled=${!this.canSubmit(disabled)}
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
    const chatState = openclawChatMessagesState.get();
    const messageCount = chatState.documents.length;
    if (messageCount > this.previousMessageCount) {
      this.scrollToLatest();
    }
    this.previousMessageCount = messageCount;
  }

  private renderMessage(message: OpenclawMessage) {
    const isPending = message.status === 'pending' || message.status === 'processing';
    return html`
      <article class="message" data-role=${message.role}>
        <div class="message-header">
          <span class="role">${message.role}</span>
          <time class="timestamp" datetime=${this.formatIso(message.createdAt)}>
            ${this.formatTimestamp(message.createdAt)}
          </time>
        </div>
        <p class="body">${message.content}</p>
        ${isPending && message.role === 'user'
          ? html`<span class="status-badge">Sending to Cathy…</span>`
          : nothing}
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
    const trimmed = this.messageText.trim();
    const sending = openclawChatSendState.get().status === 'sending';

    if (!trimmed || sending) {
      return;
    }

    try {
      await sendOpenclawMessage(trimmed);
      this.messageText = '';
      this.dispatchEvent(
        new CustomEvent('df-openclaw-chat-widget-message-sent', {
          detail: {content: trimmed},
          bubbles: true,
          composed: true,
        })
      );
    } catch (error) {
      this.dispatchEvent(
        new CustomEvent('df-openclaw-chat-widget-error', {
          detail: {error},
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  private canSubmit(disabled: boolean): boolean {
    if (disabled) {
      return false;
    }

    return Boolean(this.messageText.trim().length);
  }

  private resolveStatusLabel(
    collectionStatus: FirestoreRequestState,
    sendStatus: OpenclawSendStatus,
    error: string | null
  ): string | null {
    if (sendStatus === 'sending') {
      return 'Waiting for Cathy…';
    }

    if (sendStatus === 'error') {
      return error ?? 'Unable to send message';
    }

    if (collectionStatus === 'loading') {
      return 'Loading conversation…';
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
      return '';
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
    'df-openclaw-chat-widget': DfOpenclawChatWidget;
  }
}
