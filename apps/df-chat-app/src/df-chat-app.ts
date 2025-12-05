import {css, html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import {
  firebaseAuthState,
  initializeChatStore,
  getInitializedFirebaseApp,
  shouldUseEmulatorForService,
} from '@df/state';
import '@df/ui-lit/df-chat-widget';

@customElement('df-chat-app')
export class DfChatApp extends SignalWatcher(LitElement) {
  static override styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: clamp(1.5rem, 4vw, 3rem);
      background: radial-gradient(circle at top, rgba(59, 130, 246, 0.12), transparent 55%),
        var(--md-sys-color-surface, #f8fafc);
      box-sizing: border-box;
    }

    .shell {
      width: min(440px, 100%);
      display: flex;
      justify-content: center;
    }
  `;

  @state() private isStoreInitialized = false;

  override render() {
    const {authUser} = firebaseAuthState.get();

    // Initialize store once user is authenticated
    if (authUser && !this.isStoreInitialized) {
      void this.initializeStore();
    }

    return html`
      <div class="shell">
        <df-chat-widget heading="coder FOMO chat"></df-chat-widget>
      </div>
    `;
  }

  private async initializeStore(): Promise<void> {
    try {
      await initializeChatStore(
        getInitializedFirebaseApp(),
        shouldUseEmulatorForService('firestore')
      );
      this.isStoreInitialized = true;
    } catch (error) {
      console.error('[df-chat-app] Failed to initialize chat store', error);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-chat-app': DfChatApp;
  }
}
