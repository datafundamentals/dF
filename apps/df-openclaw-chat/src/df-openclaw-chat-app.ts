import {css, html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import {
  firebaseAuthState,
  initializeOpenclawChatStore,
  getInitializedFirebaseApp,
  shouldUseEmulatorForService,
} from '@df/state';
import '@df/ui-lit/df-openclaw-chat-widget';

@customElement('df-openclaw-chat-app')
export class DfOpenclawChatApp extends SignalWatcher(LitElement) {
  static override styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: clamp(1.5rem, 4vw, 3rem);
      background: radial-gradient(circle at top, rgba(99, 102, 241, 0.12), transparent 55%),
        var(--md-sys-color-surface, #f8fafc);
      box-sizing: border-box;
    }

    .shell {
      width: min(520px, 100%);
      display: flex;
      justify-content: center;
    }
  `;

  @state() private isStoreReady = false;

  override render() {
    const {authUser} = firebaseAuthState.get();

    if (authUser && !this.isStoreReady) {
      void this.initializeStore(authUser.uid);
    }

    return html`
      <div class="shell">
        <df-openclaw-chat-widget></df-openclaw-chat-widget>
      </div>
    `;
  }

  private async initializeStore(userId: string): Promise<void> {
    try {
      await initializeOpenclawChatStore(
        getInitializedFirebaseApp(),
        shouldUseEmulatorForService('firestore'),
        userId
      );
      this.isStoreReady = true;
    } catch (error) {
      console.error('[df-openclaw-chat-app] Failed to initialize store', error);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-openclaw-chat-app': DfOpenclawChatApp;
  }
}
