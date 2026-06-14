import {css, html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import {
  firebaseAuthState,
  initializeOpenclawChatStore,
  getInitializedFirebaseApp,
  shouldUseEmulatorForService,
} from '@df/state';
import '@df/ui-lit/df-agent-work-request-widget';
import statusMarkdownContent from './workRequestTemplate.md?raw';

// Images embedded as data URIs so they travel with the JS bundle when deployed
// as an iframe. Do not replace with path references — see guides/WC_APP_DEPLOYMENT.md.
const CHATTY_CATHY_IMG = '/images/chatty-cathy.jpg';
const LOBSTER_IMG = '/images/lobster.png';

@customElement('df-agent-work-request-app')
export class DfAgentWorkRequestApp extends SignalWatcher(LitElement) {
  static override styles = css`
    :host {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      min-height: 100vh;
      padding: clamp(1rem, 2vw, 2rem);
      background: radial-gradient(circle at top, rgba(99, 102, 241, 0.12), transparent 55%),
        var(--md-sys-color-surface, #f8fafc);
      box-sizing: border-box;
    }

    .shell {
      width: min(1400px, 100%);
      min-width: 900px;
      max-width: 100%;
      display: flex;
    }

    df-agent-work-request-widget {
      width: 100%;
    }
  `;

  @state() private isStoreReady = false;
  private isStoreInitializing = false;

  override render() {
    return html`
      <div class="shell">
        <df-agent-work-request-widget
          header-img-left=${CHATTY_CATHY_IMG}
          header-img-right=${LOBSTER_IMG}
          superuser-email=${import.meta.env.VITE_SUPERUSER_EMAIL ?? ''}
          openclaw-agents=${import.meta.env.VITE_OPENCLAW_AGENTS ?? ''}
          .statusMarkdownContent=${statusMarkdownContent}
          @df-agent-work-request-widget-error=${this.handleWidgetError}
        ></df-agent-work-request-widget>
      </div>
    `;
  }

  override updated(): void {
    const {authUser} = firebaseAuthState.get();
    if (authUser && !this.isStoreReady && !this.isStoreInitializing) {
      void this.initializeStore(authUser.uid);
    }
  }

  private async initializeStore(userId: string): Promise<void> {
    this.isStoreInitializing = true;
    try {
      await initializeOpenclawChatStore(
        getInitializedFirebaseApp(),
        shouldUseEmulatorForService('firestore'),
        userId,
        statusMarkdownContent
      );
      this.isStoreReady = true;
    } catch (error) {
      console.error('[df-agent-work-request-app] Failed to initialize store', error);
      this.isStoreInitializing = false;
    }
  }

  private handleWidgetError(event: CustomEvent<{error: unknown}>): void {
    console.error('[df-agent-work-request-app] Widget error', event.detail?.error);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-agent-work-request-app': DfAgentWorkRequestApp;
  }
}
