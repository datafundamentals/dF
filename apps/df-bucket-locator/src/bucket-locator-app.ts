import {SignalWatcher} from '@lit-labs/signals';
import {css, html, LitElement, nothing} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import type {InventoryPart} from '@df/types';
import {
  bucketLocatorState,
  createBucket,
  createLocation,
  createTag,
  deleteBucket,
  deleteLocation,
  deletePart,
  deleteTag,
  decrementPart,
  intakePart,
  loadBucketLocator,
  moveBucket,
  updatePart,
  updateBucket,
  updateLocation,
  updateTag,
} from '@df/state';
import './bucket-locator-panels.js';
import './bucket-record-manager.js';
import './part-edit-dialog.js';

@customElement('bucket-locator-app')
export class BucketLocatorApp extends SignalWatcher(LitElement) {
  @state() declare private assignedBucket: string;
  @state() declare private editingPart: InventoryPart | null;

  constructor() {
    super(); this.assignedBucket = ''; this.editingPart = null;
  }

  static override styles = css`
    :host { display: block; color: var(--md-sys-color-on-surface, #202824); }
    .page { max-width: 1440px; margin: 0 auto; padding: 24px clamp(16px, 3vw, 44px) 56px; }
    .masthead { display: flex; align-items: end; justify-content: space-between; gap: 18px; padding: 10px 0 24px; border-bottom: 1px solid #c9d0c8; }
    h1, p { margin-top: 0; }
    h1 { margin-bottom: 0; color: #174c3d; font: 500 clamp(2rem, 5vw, 3.4rem) Georgia, serif; }
    .eyebrow { margin-bottom: 8px; color: #9d442f; font-size: .75rem; font-weight: 700; text-transform: uppercase; }
    .identity { color: #4d5d54; font-size: .9rem; text-align: right; }
    .workspace { display: grid; grid-template-columns: minmax(300px, .8fr) minmax(0, 1.5fr); gap: clamp(22px, 4vw, 54px); padding-top: 26px; }
    .column { min-width: 0; }
    .error { margin: 12px 0; padding: 14px; border-left: 3px solid #a33e2b; background: #f8e9e5; color: #812f22; }
    @media (max-width: 820px) { .workspace { grid-template-columns: 1fr; } .masthead { align-items: start; flex-direction: column; } .identity { text-align: left; } }
    @media (max-width: 560px) { .page { padding-top: 14px; } }
  `;

  private readonly authChanged = (event: Event): void => {
    const detail = (event as CustomEvent<{newValue: unknown}>).detail;
    if (detail?.newValue) void loadBucketLocator();
  };

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('df-standard-pioneer-auth-wrapper-user-changed', this.authChanged);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('df-standard-pioneer-auth-wrapper-user-changed', this.authChanged);
  }

  override render() {
    const state = bucketLocatorState.get();
    return html`<main class="page">
      <header class="masthead">
        <div><p class="eyebrow">Storage index · ${state.buckets.length} buckets</p><h1>Bucket Locator</h1></div>
        <p class="identity">${state.loading ? 'Connecting to your store…' : `${state.locations.length} locations · ${state.parts.length} matches`}</p>
      </header>
      ${state.error ? html`<p class="error" role="alert">${state.error}</p>` : nothing}
      <div class="workspace">
        <div class="column">
          <bucket-intake-panel @df-bucket-locator-intake=${this.saveIntake}></bucket-intake-panel>
          <bucket-storage-panel .assignedBucket=${this.assignedBucket}
            @df-bucket-locator-location-create=${this.addLocation}
            @df-bucket-locator-bucket-create=${this.addBucket}
            @df-bucket-locator-bucket-move=${this.relocateBucket}></bucket-storage-panel>
          <bucket-record-manager
            @df-bucket-locator-location-update=${this.editLocation}
            @df-bucket-locator-location-delete=${this.removeLocation}
            @df-bucket-locator-bucket-update=${this.editBucket}
            @df-bucket-locator-bucket-delete=${this.removeBucket}
            @df-bucket-locator-tag-create=${this.addTag}
            @df-bucket-locator-tag-update=${this.editTag}
            @df-bucket-locator-tag-delete=${this.removeTag}></bucket-record-manager>
        </div>
        <bucket-search-panel @df-bucket-locator-part-take=${this.takeOne}
          @df-bucket-locator-part-edit-open=${this.openEdit}
          @df-bucket-locator-part-delete=${this.removePart}></bucket-search-panel>
      </div>
      <part-edit-dialog .currentPart=${this.editingPart}
        @df-bucket-locator-part-edit=${this.savePartEdit}
        @df-bucket-locator-edit-close=${() => { this.editingPart = null; }}></part-edit-dialog>
    </main>`;
  }

  private saveIntake = async (event: CustomEvent): Promise<void> => {
    try {
      await intakePart(event.detail as Parameters<typeof intakePart>[0]);
      this.renderRoot.querySelector('bucket-intake-panel')?.resetIntake();
    } catch { /* The store publishes the request error. */ }
  };

  private addLocation = async (event: CustomEvent): Promise<void> => {
    const detail = event.detail as {name: string; description: string};
    try {
      await createLocation(detail.name, detail.description);
      this.renderRoot.querySelector('bucket-storage-panel')?.resetLocation();
    }
    catch { /* The store publishes the request error. */ }
  };

  private addBucket = async (event: CustomEvent): Promise<void> => {
    const detail = event.detail as {locationId: string; description: string};
    try {
      this.assignedBucket = (await createBucket(detail.locationId, detail.description)).bucket_id;
      this.renderRoot.querySelector('bucket-storage-panel')?.resetBucket();
    }
    catch { /* The store publishes the request error. */ }
  };

  private relocateBucket = async (event: CustomEvent): Promise<void> => {
    const detail = event.detail as {bucketId: string; locationId: string};
    try {
      await moveBucket(detail.bucketId, detail.locationId);
      this.renderRoot.querySelector('bucket-storage-panel')?.resetMove();
    }
    catch { /* The store publishes the request error. */ }
  };

  private editLocation = async (event: CustomEvent): Promise<void> => {
    const detail = event.detail as {id: string; name: string; description: string};
    try {
      await updateLocation(detail);
      this.renderRoot.querySelector('bucket-record-manager')?.resetLocationEdit();
    } catch { /* The store publishes the request error. */ }
  };

  private removeLocation = async (event: CustomEvent): Promise<void> => {
    const detail = event.detail as {id: string; name: string};
    if (!window.confirm(`Delete location "${detail.name}"?`)) return;
    try { await deleteLocation(detail.id); }
    catch { /* The store publishes the request error. */ }
  };

  private editBucket = async (event: CustomEvent): Promise<void> => {
    const detail = event.detail as {id: string; locationId: string; description: string};
    try {
      await updateBucket(detail);
      this.renderRoot.querySelector('bucket-record-manager')?.resetBucketEdit();
    } catch { /* The store publishes the request error. */ }
  };

  private removeBucket = async (event: CustomEvent): Promise<void> => {
    const detail = event.detail as {id: string};
    if (!window.confirm(`Delete empty bucket ${detail.id}?`)) return;
    try { await deleteBucket(detail.id); }
    catch { /* The store publishes the request error. */ }
  };

  private addTag = async (event: CustomEvent): Promise<void> => {
    const detail = event.detail as {label: string};
    try {
      await createTag(detail.label);
      this.renderRoot.querySelector('bucket-record-manager')?.resetTagEdit();
    } catch { /* The store publishes the request error. */ }
  };

  private editTag = async (event: CustomEvent): Promise<void> => {
    const detail = event.detail as {id: string; label: string};
    try {
      await updateTag(detail.id, detail.label);
      this.renderRoot.querySelector('bucket-record-manager')?.resetTagEdit();
    } catch { /* The store publishes the request error. */ }
  };

  private removeTag = async (event: CustomEvent): Promise<void> => {
    const detail = event.detail as {id: string; label: string; count: number};
    const effect = detail.count ? ` This also removes the tag from ${detail.count} part(s).` : '';
    if (!window.confirm(`Delete tag "${detail.label}"?${effect}`)) return;
    try { await deleteTag(detail.id); }
    catch { /* The store publishes the request error. */ }
  };

  private takeOne = async (event: CustomEvent<InventoryPart>): Promise<void> => {
    try { await decrementPart(event.detail.id); }
    catch { /* The store publishes the request error. */ }
  };

  private removePart = async (event: CustomEvent<InventoryPart>): Promise<void> => {
    const part = event.detail;
    if (!window.confirm(`Permanently delete "${part.name}" and its photo?`)) return;
    try { await deletePart(part.id); }
    catch { /* The store publishes the request error. */ }
  };

  private openEdit = (event: CustomEvent<InventoryPart>): void => {
    this.editingPart = event.detail;
    void this.updateComplete.then(() => this.renderRoot.querySelector('part-edit-dialog')?.show());
  };

  private savePartEdit = async (event: CustomEvent): Promise<void> => {
    const detail = event.detail as {id: string; name: string; description: string; quantity: number; bucketId: string; tags: string[]};
    try {
      await updatePart(detail);
      this.renderRoot.querySelector('part-edit-dialog')?.closeDialog();
      this.editingPart = null;
    } catch { /* The store publishes the request error. */ }
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'bucket-locator-app': BucketLocatorApp;
  }
}