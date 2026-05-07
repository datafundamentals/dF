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

import {signal, SignalWatcher} from '@lit-labs/signals';
import {css, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import '@material/web/switch/switch.js';
import {
  createOpenclawConversation,
  deleteFile,
  deleteOpenclawConversation,
  firebaseAuthState,
  openclawActiveConversationState,
  openclawChatDeleteState,
  openclawChatMessagesState,
  openclawChatSendState,
  openclawConversationsState,
  renameOpenclawConversation,
  sendOpenclawMessage,
  startOpenclawRealtime,
  stopOpenclawRealtime,
  switchOpenclawConversation,
} from '@df/state';
import type {FirestoreRequestState} from '@df/types/firebase-firestore.types';
import type {OpenclawSendStatus} from '@df/types';
import type {StorageFileMetadata} from '@df/types/firebase-storage.types';
import './df-upload-link.js';
import './firebase/df-file-list.js';

const ENTER_KEY = 'Enter';
const SPACE_KEY = ' ';
const STATUS_BASE_URL = 'https://hbb-a1.web.app/WR_Status/';

interface OpenclawConversation {
  id: string;
  userId: string;
  agentId: string;
  title: string | null;
  status: 'active' | 'accepted';
  createdAt: Date | null;
  lastMessageAt: Date | null;
}

interface OpenclawMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date | null;
  sessionId: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
}

@customElement('df-openclaw-chat-widget')
export class DfOpenclawChatWidget extends SignalWatcher(LitElement) {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
      color: var(--md-sys-color-on-surface, #1f1f1f);
      font-family: var(--df-font-family, 'Roboto', system-ui, sans-serif);
    }

    .layout {
      display: grid;
      grid-template-columns: var(--sidebar-width, 272px) minmax(0, 1fr);
      gap: 20px;
      min-height: var(--df-chat-height, 720px);
      padding: 20px;
      border-radius: 28px;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(247, 250, 252, 0.98)),
        var(--md-sys-color-surface, #ffffff);
      border: 1px solid rgba(15, 23, 42, 0.08);
      box-shadow: 0 28px 60px rgba(15, 23, 42, 0.14);
      box-sizing: border-box;
    }

    .layout--collapsed {
      --sidebar-width: 88px;
    }

    .sidebar {
      display: grid;
      grid-template-rows: auto 1fr;
      gap: 16px;
      min-height: 0;
      padding: 16px;
      border-radius: 22px;
      background:
        radial-gradient(circle at top, rgba(99, 102, 241, 0.12), transparent 55%),
        var(--md-sys-color-surface-container-low, #f8fafc);
      border: 1px solid rgba(99, 102, 241, 0.1);
    }

    .sidebar-controls {
      display: grid;
      gap: 10px;
    }

    .sidebar-title {
      margin: 0;
      font-size: 0.8rem;
      line-height: 1.2;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(15, 23, 42, 0.56);
    }

    .sidebar-actions {
      display: grid;
      gap: 10px;
    }

    .conversation-list {
      display: grid;
      align-content: start;
      gap: 10px;
      overflow-y: auto;
      padding-right: 4px;
    }

    .conversation-item {
      display: grid;
      gap: 6px;
      padding: 14px 12px;
      border-radius: 18px;
      cursor: pointer;
      outline: none;
      background: rgba(255, 255, 255, 0.75);
      border: 1px solid rgba(148, 163, 184, 0.2);
      transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
    }

    .conversation-item:hover,
    .conversation-item:focus-visible {
      background: rgba(255, 255, 255, 0.96);
      border-color: rgba(99, 102, 241, 0.45);
      transform: translateY(-1px);
    }

    .conversation-item[data-active='true'] {
      background: rgba(99, 102, 241, 0.14);
      border-color: rgba(99, 102, 241, 0.55);
      box-shadow: inset 0 0 0 1px rgba(99, 102, 241, 0.08);
    }

    .conversation-item-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
    }

    .conversation-title {
      font-size: 0.94rem;
      line-height: 1.35;
      font-weight: 600;
      color: var(--md-sys-color-on-surface, #0f172a);
      word-break: break-word;
    }

    .conversation-timestamp {
      flex-shrink: 0;
      font-size: 0.72rem;
      color: rgba(71, 85, 105, 0.82);
    }

    .conversation-status {
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: rgba(79, 70, 229, 0.9);
    }

    .conversation-meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px 10px;
    }

    .conversation-aux {
      display: grid;
      gap: 6px;
    }

    .layout--collapsed .sidebar-title,
    .layout--collapsed .conversation-title,
    .layout--collapsed .conversation-status,
    .layout--collapsed .conversation-meta,
    .layout--collapsed .conversation-aux {
      display: none;
    }

    .layout--collapsed .conversation-item {
      justify-items: center;
      padding-inline: 10px;
    }

    .layout--collapsed .conversation-item-header {
      width: 100%;
      justify-content: center;
    }

    .layout--collapsed .conversation-timestamp {
      font-size: 0.68rem;
      text-align: center;
    }

    .chat-panel {
      display: grid;
      grid-template-rows: auto 1fr auto;
      gap: 16px;
      min-height: 0;
    }

    .chat-header {
      display: flex;
      align-items: center;
      gap: 16px;
      min-height: 72px;
    }

    .header-img {
      height: 4.5rem;
      width: auto;
      flex-shrink: 0;
      object-fit: contain;
    }

    .header-img--clickable {
      cursor: pointer;
      user-select: none;
    }

    .superuser-panel {
      display: grid;
      gap: 12px;
      padding: 16px;
      border-radius: 12px;
      background: var(--md-sys-color-tertiary-container, rgba(99, 102, 241, 0.1));
      border: 2px solid var(--md-sys-color-tertiary, rgba(99, 102, 241, 0.5));
    }

    .superuser-title {
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--md-sys-color-tertiary, rgba(99, 102, 241, 0.9));
    }

    .superuser-controls {
      display: flex;
      gap: 12px;
      align-items: flex-end;
      flex-wrap: wrap;
    }

    .superuser-controls md-outlined-button {
      min-width: 80px;
    }

    .superuser-active-agent {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--md-sys-color-error, #dc2626);
      text-align: center;
      letter-spacing: 0.02em;
    }

    .header-copy {
      display: grid;
      gap: 6px;
      min-width: 0;
      flex: 1;
    }

    .header-kicker {
      margin: 0;
      font-size: 0.76rem;
      line-height: 1.2;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(79, 70, 229, 0.84);
    }

    .header-title {
      margin: 0;
      font-size: clamp(1.2rem, 2vw, 1.55rem);
      line-height: 1.2;
      font-weight: 700;
      color: var(--md-sys-color-on-surface, #0f172a);
      word-break: break-word;
      cursor: pointer;
    }

    .header-subtitle {
      font-size: 0.88rem;
      color: rgba(51, 65, 85, 0.78);
    }

    .panel-meta {
      display: grid;
      gap: 14px;
      padding: 16px 18px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.72);
      border: 1px solid rgba(148, 163, 184, 0.2);
    }

    .panel-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px 12px;
    }

    .meta-chip {
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: rgba(79, 70, 229, 0.9);
      text-decoration: none;
    }

    .meta-chip[role='button'] {
      cursor: pointer;
      user-select: none;
    }

    .meta-chip--danger {
      color: rgba(185, 28, 28, 0.92);
    }

    .meta-chip--muted {
      color: rgba(71, 85, 105, 0.88);
    }

    .meta-chip:focus-visible {
      outline: 2px solid rgba(99, 102, 241, 0.45);
      outline-offset: 2px;
      border-radius: 8px;
    }

    .delete-confirmation {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px 12px;
      font-size: 0.78rem;
      color: rgba(71, 85, 105, 0.92);
    }

    .delete-confirmation strong {
      color: rgba(185, 28, 28, 0.92);
      font-weight: 700;
    }

    .panel-recurring {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
    }

    .panel-recurring-label,
    .panel-recurring-copy {
      font-size: 0.76rem;
      line-height: 1.2;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(79, 70, 229, 0.84);
    }

    .panel-supporting-copy {
      font-size: 0.88rem;
      color: rgba(51, 65, 85, 0.78);
    }

    .panel-upload-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }

    .panel-card {
      display: grid;
      gap: 12px;
      padding: 14px;
      border-radius: 16px;
      background: rgba(248, 250, 252, 0.92);
      border: 1px solid rgba(148, 163, 184, 0.22);
      min-width: 0;
    }

    .panel-card-title {
      margin: 0;
      font-size: 0.8rem;
      line-height: 1.2;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(15, 23, 42, 0.56);
    }

    .uploaded-file-list {
      display: grid;
      gap: 10px;
    }

    .uploaded-file-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      min-width: 0;
    }

    .uploaded-file-name {
      min-width: 0;
      font-size: 0.92rem;
      color: rgba(15, 23, 42, 0.88);
      overflow-wrap: anywhere;
    }

    .rename-form {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto auto;
      gap: 10px;
      align-items: center;
    }

    .rename-form md-outlined-text-field {
      width: 100%;
    }

    .messages {
      overflow-y: auto;
      padding: 14px;
      border-radius: 22px;
      background:
        linear-gradient(180deg, rgba(241, 245, 249, 0.82), rgba(255, 255, 255, 0.92)),
        var(--md-sys-color-surface-container-lowest, #ffffff);
      border: 1px solid rgba(148, 163, 184, 0.18);
      display: grid;
      gap: 12px;
      align-content: start;
    }

    .message {
      display: grid;
      gap: 8px;
      padding: 13px 15px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid rgba(148, 163, 184, 0.2);
      box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
    }

    .message[data-role='user'] {
      background: rgba(99, 102, 241, 0.1);
      border-color: rgba(99, 102, 241, 0.26);
    }

    .message-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
    }

    .message-role {
      font-size: 0.76rem;
      letter-spacing: 0.01em;
      font-weight: 700;
      color: rgba(71, 85, 105, 0.82);
    }

    .message[data-role='user'] .message-role {
      color: rgba(79, 70, 229, 0.92);
    }

    .message-time {
      font-size: 0.74rem;
      color: rgba(100, 116, 139, 0.9);
    }

    .message-body {
      margin: 0;
      font-size: 0.95rem;
      line-height: 1.6;
      color: rgba(15, 23, 42, 0.88);
      white-space: pre-wrap;
      word-break: break-word;
    }

    .status-badge {
      font-size: 0.72rem;
      color: rgba(71, 85, 105, 0.88);
      font-style: italic;
    }

    .composer {
      display: grid;
      gap: 12px;
    }

    .composer md-outlined-text-field {
      width: 100%;
    }

    .composer-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .composer-status {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.79rem;
      color: rgba(71, 85, 105, 0.92);
    }

    .composer-status[hidden] {
      display: none;
    }

    .composer-status--error {
      color: rgba(220, 38, 38, 0.88);
    }

    md-circular-progress {
      --md-circular-progress-size: 18px;
    }

    .empty-state {
      padding: 28px 18px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.72);
      color: rgba(71, 85, 105, 0.86);
      font-size: 0.92rem;
      text-align: center;
    }

    @media (max-width: 980px) {
      .layout {
        grid-template-columns: 1fr;
      }

      .panel-upload-grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  @property({type: String}) declare heading: string;
  @property({type: String, attribute: 'header-img-left'}) declare headerImgLeft: string;
  @property({type: String, attribute: 'header-img-right'}) declare headerImgRight: string;
  @property({type: Boolean, attribute: 'submit-on-enter'}) declare submitOnEnter: boolean;

  /** Email of the privileged account. Triple-clicking the right header image activates super user mode. */
  @property({type: String, attribute: 'superuser-email'}) declare superuserEmail: string;

  /** Comma-separated list of agent names shown in the super user agent selector. */
  @property({type: String, attribute: 'openclaw-agents'}) declare openclawAgents: string;

  private readonly isSuperUser = signal(false);

  @state() private messageText = '';
  @state() private isSidebarCollapsed = false;
  @state() private isRenamingTitle = false;
  @state() private titleDraft = '';
  @state() private activeAgentName = '';
  @state() private recurringVisualState: Record<string, boolean> = {};
  @state() private deleteConfirmationConversationId: string | null = null;
  @state() private fileDeleteConfirmationPath: string | null = null;
  @state() private isDeletingFile = false;
  private pendingDeleteFile: StorageFileMetadata | null = null;

  private previousMessageCount = 0;
  private previousConversationId: string | null = null;
  private previousConversationStatus: 'active' | 'accepted' | null = null;
  private isCreatingAcceptedFollowup = false;
  private _clickCount = 0;
  private _clickTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    super();
    this.heading = 'Chatty Cathy Work Request System';
    this.headerImgLeft = '';
    this.headerImgRight = '';
    this.submitOnEnter = true;
    this.superuserEmail = '';
    this.openclawAgents = '';
  }

  override connectedCallback(): void {
    super.connectedCallback();
    try {
      startOpenclawRealtime();
    } catch {
      /* noop */
    }
  }

  override disconnectedCallback(): void {
    stopOpenclawRealtime();
    super.disconnectedCallback();
  }

  override render() {
    const conversationsState = openclawConversationsState.get();
    const activeState = openclawActiveConversationState.get();
    const chatState = openclawChatMessagesState.get();
    const sendState = openclawChatSendState.get();
    const deleteState = openclawChatDeleteState.get();
    const activeConversationId = activeState.activeConversationId;
    const activeConversation = activeState.conversation;
    const disabled = sendState.status === 'sending' || deleteState.status === 'deleting';
    const statusLabel = this.resolveStatusLabel(chatState.status, sendState.status, sendState.error);

    return html`
      <div class=${this.isSidebarCollapsed ? 'layout layout--collapsed' : 'layout'} role="region" aria-live="polite">
        <aside class="sidebar" aria-label="Conversations">
          <div class="sidebar-controls">
            <h2 class="sidebar-title">Work Requests</h2>
            <div class="sidebar-actions">
              <md-filled-button @click=${this.handleCreateConversation}>
                ${this.isSidebarCollapsed ? '+' : 'New conversation'}
              </md-filled-button>
              <md-outlined-button @click=${this.toggleSidebar}>
                ${this.isSidebarCollapsed ? 'Expand' : 'Collapse'}
              </md-outlined-button>
            </div>
          </div>

          <div class="conversation-list">
            ${this.renderConversationList(conversationsState, activeState.activeConversationId)}
          </div>
        </aside>

        <section class="chat-panel">
          <header class="chat-header">
            ${this.headerImgLeft ? html`<img class="header-img" src=${this.headerImgLeft} alt="" aria-hidden="true" />` : nothing}

            <div class="header-copy">
              <p class="header-kicker">${this.heading}</p>
              ${this.isRenamingTitle && activeConversation
                ? this.renderRenameForm(activeConversation)
                : html`
                    <h1 class="header-title" @click=${this.startRename}>
                      ${this.resolveConversationTitle(activeConversation)}
                    </h1>
                  `}
              <div class="header-subtitle">
                ${this.resolveConversationSubtitle(activeConversation)}
              </div>
            </div>

            ${this.headerImgRight ? html`<img
              class="header-img header-img--clickable"
              src=${this.headerImgRight}
              alt=""
              aria-hidden="true"
              @click=${this.handleLobsterClick}
            />` : nothing}
          </header>
          ${this.isSuperUser.get() ? this.renderSuperUserPanel() : nothing}
          ${activeConversation ? this.renderPanelMeta(activeConversation) : nothing}

          <section class="messages" aria-label="Chat messages">
            ${this.renderMessages(chatState, activeConversation)}
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

            <div class="composer-actions">
              <span class="composer-status" ?hidden=${!statusLabel} role="status">
                ${sendState.status === 'sending'
                  ? html`<md-circular-progress indeterminate></md-circular-progress>`
                  : nothing}
                <span class=${sendState.status === 'error' ? 'composer-status--error' : ''}>${statusLabel}</span>
              </span>

              <md-filled-button ?disabled=${!this.canSubmit(disabled, activeConversationId)} @click=${this.submitMessage}>
                Send
              </md-filled-button>
            </div>
            ${deleteState.status === 'error' && deleteState.error
              ? html`<span class="composer-status composer-status--error" role="status">${deleteState.error}</span>`
              : nothing}
          </section>
        </section>
      </div>
    `;
  }

  override updated(): void {
    const chatState = openclawChatMessagesState.get();
    const activeState = openclawActiveConversationState.get();
    const activeConversation = activeState.conversation;
    const messageCount = chatState.documents.length;
    const activeConversationId = activeState.activeConversationId;
    const activeConversationStatus = activeConversation?.status ?? null;

    if (activeConversationId !== this.previousConversationId) {
      this.previousConversationId = activeConversationId;
      this.isRenamingTitle = false;
      this.titleDraft = this.resolveConversationTitle(activeConversation);
      this.previousConversationStatus = activeConversationStatus;
    } else if (
      activeConversationId &&
      this.previousConversationStatus === 'active' &&
      activeConversationStatus === 'accepted' &&
      !this.isCreatingAcceptedFollowup
    ) {
      this.isCreatingAcceptedFollowup = true;
      void this.createFollowupConversationAfterAcceptance();
    }

    if (messageCount > this.previousMessageCount) {
      this.scrollToLatest();
    }
    this.previousMessageCount = messageCount;
    this.previousConversationStatus = activeConversationStatus;
  }

  private renderConversationList(
    conversationsState: ReturnType<typeof openclawConversationsState.get>,
    activeConversationId: string | null
  ) {
    if (conversationsState.status === 'loading' && !conversationsState.documents.length) {
      return html`<div class="empty-state">Loading conversations…</div>`;
    }

    if (conversationsState.status === 'error') {
      return html`<div class="empty-state">Failed to load conversations.</div>`;
    }

    if (!conversationsState.documents.length) {
      return html`<div class="empty-state">No conversations yet.</div>`;
    }

    return conversationsState.documents.map((conversation: OpenclawConversation) => html`
      <article
        class="conversation-item"
        data-active=${String(conversation.id === activeConversationId)}
        role="button"
        tabindex="0"
        @click=${() => this.handleConversationSelect(conversation.id)}
        @keydown=${(event: KeyboardEvent) => this.handleConversationKeydown(event, conversation.id)}
      >
        <div class="conversation-item-header">
          <div class="conversation-title">${this.resolveConversationTitle(conversation)}</div>
          <time class="conversation-timestamp" datetime=${this.formatIso(conversation.lastMessageAt)}>
            ${this.formatRelativeTimestamp(conversation.lastMessageAt)}
          </time>
        </div>
        <div class="conversation-aux">
          <div class="conversation-status">${this.resolveConversationStatusText(conversation)}</div>
          <div class="conversation-meta">
            <a
              class="meta-chip"
              href=${this.resolveStatusUrl(conversation.id)}
              target="_blank"
              rel="noreferrer"
              @click=${this.handleMetaActionClick}
            >
              Status
            </a>
            <span
              class="meta-chip meta-chip--danger"
              role="button"
              tabindex="0"
              @click=${(event: Event) => this.openDeleteConfirmation(event, conversation.id)}
              @keydown=${(event: KeyboardEvent) => this.handleActionKeydown(event, () => this.openDeleteConfirmation(event, conversation.id))}
            >
              Delete
            </span>
          </div>
          ${this.deleteConfirmationConversationId === conversation.id
            ? this.renderDeleteConfirmation(conversation.id)
            : nothing}
        </div>
      </article>
    `);
  }

  private renderRenameForm(conversation: OpenclawConversation) {
    return html`
      <div class="rename-form">
        <md-outlined-text-field
          label="Conversation title"
          .value=${this.titleDraft}
          @input=${this.handleRenameInput}
          @keydown=${this.handleRenameKeydown}
        >
        </md-outlined-text-field>
        <md-filled-button @click=${() => this.saveRename(conversation.id)}>Save</md-filled-button>
        <md-text-button @click=${this.cancelRename}>Cancel</md-text-button>
      </div>
    `;
  }

  private renderSuperUserPanel() {
    const agents = this.openclawAgents
      ? this.openclawAgents.split(',').map((a) => a.trim()).filter(Boolean)
      : [];

    return html`
      <div class="superuser-panel">
        <div class="superuser-title">Super User — Agent Selection</div>
        ${this.activeAgentName ? html`
          <div class="superuser-active-agent">
            Active: ${this.activeAgentName}
          </div>
        ` : nothing}
        <div class="superuser-controls">
          ${agents.map((agent) => html`
            <md-outlined-button @click=${() => this.handleAgentClick(agent)}>
              ${agent}
            </md-outlined-button>
          `)}
        </div>
      </div>
    `;
  }

  private renderPanelMeta(conversation: OpenclawConversation) {
    const recurring = this.isRecurringVisual(conversation.id);

    return html`
      <section class="panel-meta" aria-label="Work request details">
        <div class="panel-actions">
          <div class="conversation-status">${this.resolveConversationStatusText(conversation)}</div>
          <a
            class="meta-chip"
            href=${this.resolveStatusUrl(conversation.id)}
            target="_blank"
            rel="noreferrer"
            @click=${this.handleMetaActionClick}
          >
            Status
          </a>
          <span
            class="meta-chip meta-chip--danger"
            role="button"
            tabindex="0"
            @click=${(event: Event) => this.openDeleteConfirmation(event, conversation.id)}
            @keydown=${(event: KeyboardEvent) => this.handleActionKeydown(event, () => this.openDeleteConfirmation(event, conversation.id))}
          >
            Delete
          </span>
        </div>

        ${this.deleteConfirmationConversationId === conversation.id
          ? this.renderDeleteConfirmation(conversation.id)
          : nothing}

        <div class="panel-recurring">
          <span class="panel-recurring-label">Recurring?</span>
          <md-switch
            ?selected=${recurring}
            aria-label="Recurring work request"
            @change=${(event: Event) => this.handleRecurringVisualToggle(event, conversation.id)}
          ></md-switch>
          <span class="panel-recurring-copy">${recurring ? 'Daily' : 'One Time'}</span>
        </div>

        <div class="panel-supporting-copy">
          ${recurring ? 'Recurring summary is visual only in this ticket.' : 'Actual scheduling remains agent-controlled.'}
        </div>

        <div class="panel-upload-grid">
          <section class="panel-card" aria-label="Upload files">
            <p class="panel-card-title">Upload Files</p>
            <df-upload-link
              id="openclaw-upload-link"
              resourcePageType="openclaw"
              resourceLinkType="file"
              .uploadSubpath=${'openclaw/' + conversation.id}
              label="Upload Files"
              @upload-link-gather-url=${this.handleFileUploaded}
            ></df-upload-link>
          </section>

          <section class="panel-card" aria-label="Uploaded files">
            <p class="panel-card-title">Uploaded Files</p>
            ${this.fileDeleteConfirmationPath !== null
              ? this.renderFileDeleteConfirmation()
              : nothing}
            <df-file-list
              id="openclaw-file-list"
              .directory=${'uploads/openclaw/' + conversation.id}
              showDelete
              @file-delete=${this.handleFileDeleteRequest}
            ></df-file-list>
          </section>
        </div>
      </section>
    `;
  }

  private renderDeleteConfirmation(conversationId: string) {
    const deleteState = openclawChatDeleteState.get();
    const deleting = deleteState.status === 'deleting' && deleteState.deletingConversationId === conversationId;

    return html`
      <div class="delete-confirmation">
        <strong>Are you sure?</strong>
        <span>This is not undoable.</span>
        <span
          class="meta-chip meta-chip--danger"
          role="button"
          tabindex="0"
          aria-disabled=${String(deleting)}
          @click=${(event: Event) => this.confirmDelete(event, conversationId)}
          @keydown=${(event: KeyboardEvent) => this.handleActionKeydown(event, () => void this.confirmDelete(event, conversationId))}
        >
          ${deleting ? 'Deleting…' : 'Confirm Delete'}
        </span>
        <span
          class="meta-chip meta-chip--muted"
          role="button"
          tabindex="0"
          aria-disabled=${String(deleting)}
          @click=${this.closeDeleteConfirmation}
          @keydown=${(event: KeyboardEvent) => this.handleActionKeydown(event, this.closeDeleteConfirmation)}
        >
          Cancel
        </span>
      </div>
    `;
  }

  private handleLobsterClick(): void {
    this._clickCount++;

    if (this._clickTimer) {
      clearTimeout(this._clickTimer);
    }

    if (this._clickCount >= 3) {
      this._clickCount = 0;
      this._clickTimer = null;
      this.checkAndActivateSuperUser();
      return;
    }

    this._clickTimer = setTimeout(() => {
      this._clickCount = 0;
      this._clickTimer = null;
    }, 500);
  }

  private checkAndActivateSuperUser(): void {
    const {authUser} = firebaseAuthState.get();
    if (authUser?.email && this.superuserEmail && authUser.email === this.superuserEmail) {
      this.isSuperUser.set(true);
    }
  }

  private async handleAgentClick(agent: string): Promise<void> {
    try {
      await createOpenclawConversation(agent);
      this.activeAgentName = agent;
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

  private renderMessages(
    chatState: ReturnType<typeof openclawChatMessagesState.get>,
    activeConversation: OpenclawConversation | null
  ) {
    if (!activeConversation) {
      return html`<div class="empty-state">Preparing your first conversation…</div>`;
    }

    if (chatState.status === 'loading' && !chatState.documents.length) {
      return html`<div class="empty-state">Loading conversation…</div>`;
    }

    if (chatState.status === 'error') {
      return html`<div class="empty-state">Failed to load messages.</div>`;
    }

    if (!chatState.documents.length) {
      return html`<div class="empty-state">Send your first message to start composing a work request.</div>`;
    }

    return chatState.documents.map((message) => this.renderMessage(message));
  }

  private renderMessage(message: OpenclawMessage) {
    const isPending = message.role === 'user' && (message.status === 'pending' || message.status === 'processing');
    const activeConversation = openclawActiveConversationState.get().conversation;

    return html`
      <article class="message" data-role=${message.role}>
        <div class="message-header">
          <span class="message-role">${this.resolveMessageAuthorLabel(message, activeConversation)}</span>
          <time class="message-time" datetime=${this.formatIso(message.createdAt)}>
            ${this.formatMessageTimestamp(message.createdAt)}
          </time>
        </div>
        <p class="message-body">${message.content}</p>
        ${isPending ? html`<span class="status-badge">Sending to ${this.resolveAssistantName(activeConversation)}…</span>` : nothing}
      </article>
    `;
  }

  private async handleCreateConversation(): Promise<void> {
    try {
      await createOpenclawConversation();
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

  private async createFollowupConversationAfterAcceptance(): Promise<void> {
    try {
      await createOpenclawConversation();
    } catch (error) {
      this.dispatchEvent(
        new CustomEvent('df-openclaw-chat-widget-error', {
          detail: {error},
          bubbles: true,
          composed: true,
        })
      );
    } finally {
      this.isCreatingAcceptedFollowup = false;
    }
  }

  private toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  private handleMetaActionClick(event: Event): void {
    event.stopPropagation();
  }

  private handleActionKeydown(event: KeyboardEvent, action: () => void): void {
    if (event.key === ENTER_KEY || event.key === SPACE_KEY) {
      event.preventDefault();
      event.stopPropagation();
      action();
    }
  }

  private openDeleteConfirmation(event: Event, conversationId: string): void {
    event.stopPropagation();
    this.deleteConfirmationConversationId = conversationId;
  }

  private closeDeleteConfirmation = (event?: Event): void => {
    event?.stopPropagation();
    this.deleteConfirmationConversationId = null;
  };

  private handleFileDeleteRequest(event: CustomEvent): void {
    event.stopPropagation();
    const file = event.detail?.file as StorageFileMetadata | undefined;
    if (!file) return;
    this.pendingDeleteFile = file;
    this.fileDeleteConfirmationPath = file.path;
  }

  private closeFileDeleteConfirmation(event?: Event): void {
    event?.stopPropagation();
    this.fileDeleteConfirmationPath = null;
    this.pendingDeleteFile = null;
  }

  private async confirmFileDelete(event: Event): Promise<void> {
    event.stopPropagation();
    if (this.isDeletingFile || !this.pendingDeleteFile) return;

    this.isDeletingFile = true;
    try {
      await deleteFile(this.pendingDeleteFile.path);
      this.fileDeleteConfirmationPath = null;
      this.pendingDeleteFile = null;
      await this.refreshFileList();
    } catch (error) {
      this.dispatchEvent(
        new CustomEvent('df-openclaw-chat-widget-error', {
          detail: {error},
          bubbles: true,
          composed: true,
        })
      );
    } finally {
      this.isDeletingFile = false;
    }
  }

  private async refreshFileList(): Promise<void> {
    const fileList = this.shadowRoot?.querySelector('#openclaw-file-list') as HTMLElement & {
      refresh?: () => Promise<void>;
    };
    if (fileList && typeof fileList.refresh === 'function') {
      await fileList.refresh();
    }
  }

  private async handleFileUploaded(_event: CustomEvent): Promise<void> {
    try {
      await this.refreshFileList();
    } catch (error) {
      console.error('[df-openclaw-chat-widget] refreshFileList failed after upload:', error);
    }
    const uploadLink = this.shadowRoot?.querySelector('#openclaw-upload-link') as HTMLElement & {
      reset?: () => void;
    };
    if (uploadLink && typeof uploadLink.reset === 'function') {
      uploadLink.reset();
    }
  }

  private renderFileDeleteConfirmation() {
    return html`
      <div class="delete-confirmation">
        <strong>Are you sure?</strong>
        <span>This is not undoable.</span>
        <span
          class="meta-chip meta-chip--danger"
          role="button"
          tabindex="0"
          aria-disabled=${String(this.isDeletingFile)}
          @click=${(event: Event) => void this.confirmFileDelete(event)}
          @keydown=${(event: KeyboardEvent) => this.handleActionKeydown(event, () => void this.confirmFileDelete(event))}
        >
          ${this.isDeletingFile ? 'Deleting…' : 'Confirm Delete'}
        </span>
        <span
          class="meta-chip meta-chip--muted"
          role="button"
          tabindex="0"
          aria-disabled=${String(this.isDeletingFile)}
          @click=${(event: Event) => this.closeFileDeleteConfirmation(event)}
          @keydown=${(event: KeyboardEvent) => this.handleActionKeydown(event, () => this.closeFileDeleteConfirmation())}
        >
          Cancel
        </span>
      </div>
    `;
  }

  private async confirmDelete(event: Event, conversationId: string): Promise<void> {
    event.stopPropagation();
    const deleteState = openclawChatDeleteState.get();
    if (deleteState.status === 'deleting') {
      return;
    }

    try {
      await deleteOpenclawConversation(conversationId);
      this.deleteConfirmationConversationId = null;
      this.isRenamingTitle = false;
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

  private handleRecurringVisualToggle(event: Event, conversationId: string): void {
    const target = event.target as HTMLElement & {selected?: boolean};
    const nextValue = typeof target.selected === 'boolean'
      ? target.selected
      : !this.isRecurringVisual(conversationId);
    this.recurringVisualState = {
      ...this.recurringVisualState,
      [conversationId]: nextValue,
    };
  }

  private handleConversationSelect(requestId: string): void {
    switchOpenclawConversation(requestId);
  }

  private handleConversationKeydown(event: KeyboardEvent, requestId: string): void {
    if (event.key === ENTER_KEY || event.key === ' ') {
      event.preventDefault();
      this.handleConversationSelect(requestId);
    }
  }

  private startRename(): void {
    const activeConversation = openclawActiveConversationState.get().conversation;
    if (!activeConversation) {
      return;
    }

    this.titleDraft = this.resolveConversationTitle(activeConversation);
    this.isRenamingTitle = true;
  }

  private cancelRename(): void {
    this.isRenamingTitle = false;
  }

  private handleRenameInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.titleDraft = target.value;
  }

  private handleRenameKeydown(event: KeyboardEvent): void {
    if (event.key === ENTER_KEY && !event.shiftKey) {
      event.preventDefault();
      const activeConversation = openclawActiveConversationState.get().conversation;
      if (activeConversation) {
        void this.saveRename(activeConversation.id);
      }
    }
  }

  private async saveRename(requestId: string): Promise<void> {
    try {
      await renameOpenclawConversation(requestId, this.titleDraft);
      this.isRenamingTitle = false;
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
    const activeConversationId = openclawActiveConversationState.get().activeConversationId;

    if (!trimmed || sending || !activeConversationId) {
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

  private canSubmit(disabled: boolean, activeConversationId: string | null): boolean {
    if (disabled || !activeConversationId) {
      return false;
    }

    return Boolean(this.messageText.trim().length);
  }

  private resolveConversationTitle(conversation: OpenclawConversation | null): string {
    return conversation?.title?.trim() || 'Untitled';
  }

  private resolveConversationSubtitle(conversation: OpenclawConversation | null): string {
    if (!conversation) {
      return 'I am here to help you compose an OpenClaw system request.';
    }

    const prefix = conversation.status === 'accepted'
      ? 'Accepted work request.'
      : this.isSuperUser.get()
        ? `${this.resolveAssistantName(conversation)} is helping you compose a work request.`
        : 'An agent is helping you compose a work request.';

    return `${prefix} Click the title to rename this conversation.`;
  }

  private resolveStatusLabel(
    collectionStatus: FirestoreRequestState,
    sendStatus: OpenclawSendStatus,
    error: string | null
  ): string | null {
    if (sendStatus === 'sending') {
      return `Waiting for ${this.resolveAssistantName(openclawActiveConversationState.get().conversation)}…`;
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

  private formatRelativeTimestamp(value: Date | null): string {
    if (!value) {
      return '';
    }

    const deltaMs = value.getTime() - Date.now();
    const deltaMinutes = Math.round(deltaMs / 60000);

    if (Math.abs(deltaMinutes) < 1) {
      return 'now';
    }

    if (Math.abs(deltaMinutes) < 60) {
      return new Intl.RelativeTimeFormat(undefined, {numeric: 'auto'}).format(deltaMinutes, 'minute');
    }

    const deltaHours = Math.round(deltaMinutes / 60);
    if (Math.abs(deltaHours) < 24) {
      return new Intl.RelativeTimeFormat(undefined, {numeric: 'auto'}).format(deltaHours, 'hour');
    }

    const deltaDays = Math.round(deltaHours / 24);
    return new Intl.RelativeTimeFormat(undefined, {numeric: 'auto'}).format(deltaDays, 'day');
  }

  private formatMessageTimestamp(value: Date | null): string {
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

  private resolveMessageAuthorLabel(
    message: OpenclawMessage,
    activeConversation: OpenclawConversation | null
  ): string {
    if (message.role === 'user') {
      return this.resolveUserDisplayName();
    }

    return this.resolveAssistantName(activeConversation);
  }

  private resolveUserDisplayName(): string {
    const {authUser} = firebaseAuthState.get();
    const displayName = authUser?.displayName?.trim();
    if (displayName) {
      return displayName;
    }

    const email = authUser?.email?.trim();
    if (email) {
      return email;
    }

    return 'User';
  }

  private resolveAssistantName(conversation: OpenclawConversation | null): string {
    const preferredAgent = this.activeAgentName.trim() || conversation?.agentId?.trim() || 'cathy';
    const normalized = preferredAgent
      .replace(/[-_]+/g, ' ')
      .trim();
    const [firstWord] = normalized.split(/\s+/);
    const token = firstWord || 'Cathy';
    return token.charAt(0).toUpperCase() + token.slice(1);
  }

  private resolveConversationStatusText(conversation: OpenclawConversation): string {
    const status = conversation.status === 'accepted' ? 'Accepted' : 'Active';
    if (!this.isSuperuserAccount()) {
      return status;
    }

    return `${this.resolveAssistantName(conversation)} - ${status}`;
  }

  private resolveStatusUrl(conversationId: string): string {
    return `${STATUS_BASE_URL}${conversationId}/`;
  }

  private isRecurringVisual(conversationId: string): boolean {
    return this.recurringVisualState[conversationId] ?? false;
  }

  private isSuperuserAccount(): boolean {
    const {authUser} = firebaseAuthState.get();
    return Boolean(authUser?.email && this.superuserEmail && authUser.email === this.superuserEmail);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-openclaw-chat-widget': DfOpenclawChatWidget;
  }
}
