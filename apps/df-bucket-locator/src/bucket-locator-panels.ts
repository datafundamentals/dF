import {SignalWatcher} from '@lit-labs/signals';
import {css, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import type {InventoryPart} from '@df/types';
import {
  bucketLocatorState,
  refreshParts,
  setActiveBucketId,
  setOnlyMyBuckets,
  setSearchText,
  setSelectedBucketId,
  setSelectedLocationId,
  toggleSelectedTag,
} from '@df/state';

interface IntakeDetail {
  file: Blob;
  bucketId: string;
  name: string;
  description: string;
  quantity: number;
  tags: string[];
}

const panelStyles = css`
  :host { display: block; min-width: 0; color: #202824; }
  .section { padding: 0 0 26px; margin-bottom: 26px; border-bottom: 1px solid #c9d0c8; }
  h2 { margin: 0 0 14px; color: #1e3029; font: 500 1.45rem Georgia, serif; }
  .form-grid { display: grid; gap: 12px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 10px; }
  md-outlined-text-field, md-filled-select { width: 100%; }
  .actions, .chips, .tags { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 10px; }
  .capture { display: flex; align-items: center; gap: 14px; min-height: 112px; padding: 12px; border: 1px dashed #8b9d91; background: #f0f3ec; transition: background-color 120ms ease, border-color 120ms ease; }
  .capture--active { border-color: #174c3d; background: #dcebe1; }
  .preview { width: 104px; height: 88px; object-fit: cover; }
  .hidden-file { display: none; }
  .error { padding: 10px; background: #f8e9e5; color: #812f22; }
  .result-toolbar { display: grid; grid-template-columns: minmax(180px, 1fr) minmax(150px, .55fr) minmax(150px, .55fr); gap: 10px; margin-top: 10px; }
  .my-buckets-filter { display: flex; align-items: center; gap: 8px; margin-top: 10px; color: #35453b; font-size: .9rem; }
  .results { display: grid; grid-template-columns: repeat(auto-fill, minmax(245px, 1fr)); gap: 12px; margin-top: 16px; }
  .part { overflow: hidden; border: 1px solid #d1d8d0; border-radius: 6px; background: #fff; }
  .part-photo { display: block; width: 100%; height: 148px; object-fit: cover; background: #e7ebe5; }
  .part-content { padding: 14px; }
  .part-top { display: flex; justify-content: space-between; gap: 10px; }
  h3 { margin: 0 0 7px; color: #26342d; font-size: 1.05rem; }
  .quantity { flex: none; padding: 4px 7px; background: #e7efea; color: #174c3d; font-size: .8rem; font-weight: 700; }
  .description { min-height: 40px; margin: 0 0 12px; color: #58645d; font-size: .9rem; line-height: 1.4; }
  .badges { display: flex; flex-wrap: wrap; gap: 7px; margin: 12px 0; font-size: .8rem; }
  .bucket { padding: 4px 7px; background: #174c3d; color: #fff; font: 700 .8rem ui-monospace, monospace; }
  .location, .tag { padding: 4px 7px; background: #f2e7cf; color: #664c1f; }
  .empty { padding: 14px; border-left: 3px solid #d39a35; background: #f4f0e4; color: #59645c; }
  .view-switch { display: flex; justify-content: flex-end; gap: 6px; margin-top: 12px; }
  .view-switch [aria-pressed="true"] { --md-outlined-button-outline-color: #174c3d; color: #174c3d; }
  .table-scroll { max-height: min(68vh, 720px); overflow: auto; margin-top: 12px; border: 1px solid #cbd4cc; background: #fff; }
  table { width: 100%; min-width: 940px; border-collapse: collapse; text-align: left; }
  caption { padding: 10px 12px; color: #53635a; text-align: left; }
  th, td { padding: 10px 12px; border-bottom: 1px solid #e0e5df; vertical-align: middle; }
  th { position: sticky; top: 0; z-index: 1; background: #e9eee7; color: #26342d; font-size: .78rem; }
  tbody tr:hover { background: #f6f8f3; }
  .table-part { display: flex; align-items: center; gap: 10px; min-width: 210px; }
  .table-photo { width: 44px; height: 44px; flex: none; object-fit: cover; background: #e7ebe5; }
  .table-name { color: #174c3d; font-weight: 700; }
  .table-description { max-width: 300px; color: #58645d; font-size: .85rem; }
  .table-tags { display: flex; flex-wrap: wrap; gap: 4px; max-width: 180px; }
  .table-tags .tag { white-space: nowrap; }
  .table-actions { display: flex; gap: 4px; }
  @media (max-width: 560px) { .form-row, .result-toolbar { grid-template-columns: 1fr; } .results { grid-template-columns: 1fr; } }
`;

@customElement('bucket-intake-panel')
export class BucketIntakePanel extends SignalWatcher(LitElement) {
  @state() declare private name: string;
  @state() declare private description: string;
  @state() declare private quantity: string;
  @state() declare private tags: string[];
  @state() declare private newTag: string;
  @state() declare private imageBlob: Blob | null;
  @state() declare private imageUrl: string;
  @state() declare private errorMessage: string;
  @state() declare private photoDragActive: boolean;

  constructor() {
    super();
    this.name = ''; this.description = ''; this.quantity = '1'; this.tags = [];
    this.newTag = ''; this.imageBlob = null; this.imageUrl = ''; this.errorMessage = '';
    this.photoDragActive = false;
  }

  static override styles = panelStyles;

  override render() {
    const state = bucketLocatorState.get();
    const ready = Boolean(this.imageBlob && this.name.trim().length >= 2 &&
      this.description.trim().length >= 3 && Number.isSafeInteger(Number(this.quantity)) &&
      Number(this.quantity) >= 1 && state.activeBucketId);
    const activeBucket = state.buckets.find((bucket) => bucket.id === state.activeBucketId);
    return html`<section class="section" aria-labelledby="intake-title">
      <h2 id="intake-title">Add a part</h2>
      <div class="form-grid">
        <md-filled-select label="Active bucket" .value=${state.activeBucketId} @change=${this.activeBucketChanged}>
          <md-select-option value=""><div slot="headline">Choose a bucket</div></md-select-option>
          ${state.buckets.map((bucket) => html`<md-select-option value=${bucket.id}><div slot="headline">${bucket.id} · ${bucket.location_name}</div></md-select-option>`)}
        </md-filled-select>
        ${activeBucket ? html`<p>Location: <strong>${activeBucket.location_name}</strong></p>` : nothing}
        <div class="capture ${this.photoDragActive ? 'capture--active' : ''}"
          @dragover=${this.photoDragOver} @dragleave=${this.photoDragLeave} @drop=${this.photoDropped}>
          ${this.imageUrl ? html`<img class="preview" src=${this.imageUrl} alt="Part photo preview" />` : html`<span>Drop a photo here, or choose one</span>`}
          <div><md-outlined-button @click=${() => this.renderRoot.querySelector<HTMLInputElement>('#part-camera')?.click()}>${this.imageUrl ? 'Replace photo' : 'Choose photo / camera'}</md-outlined-button><input class="hidden-file" id="part-camera" type="file" accept="image/*" capture="environment" @change=${this.photoSelected} /></div>
        </div>
        <md-outlined-text-field label="Part name" required minlength="2" maxlength="120" .value=${this.name} @input=${(event: InputEvent) => { this.name = (event.target as HTMLInputElement).value; }}></md-outlined-text-field>
        <md-outlined-text-field label="Description" type="textarea" required minlength="3" maxlength="2000" .value=${this.description} @input=${(event: InputEvent) => { this.description = (event.target as HTMLInputElement).value; }}></md-outlined-text-field>
        <md-outlined-text-field label="Quantity" type="number" min="1" step="1" required .value=${this.quantity} @input=${(event: InputEvent) => { this.quantity = (event.target as HTMLInputElement).value; }}></md-outlined-text-field>
        <div class="form-row"><md-outlined-text-field label="Add a tag" maxlength="40" .value=${this.newTag} @input=${(event: InputEvent) => { this.newTag = (event.target as HTMLInputElement).value; }} @keydown=${this.tagKeydown}></md-outlined-text-field><md-outlined-button @click=${this.addTag}>Add tag</md-outlined-button></div>
        ${state.tags.slice(0, 8).length ? html`<div class="chips" aria-label="Recently used tags">${state.tags.slice(0, 8).map((tag) => html`<md-outlined-button @click=${() => this.addExistingTag(tag.label)}>${tag.label}</md-outlined-button>`)}</div>` : nothing}
        <div class="chips" aria-label="Tags for this part">${this.tags.map((tag) => html`<md-outlined-button @click=${() => this.removeTag(tag)}>${tag} ×</md-outlined-button>`)}</div>
        ${this.errorMessage ? html`<p class="error" role="alert">${this.errorMessage}</p>` : nothing}
        <div class="actions"><md-filled-button ?disabled=${!ready || state.saving} @click=${this.submit}>Save part</md-filled-button>${state.saving ? html`<md-circular-progress indeterminate></md-circular-progress>` : nothing}</div>
      </div>
    </section>`;
  }

  resetIntake(): void {
    this.name = ''; this.description = ''; this.quantity = '1'; this.tags = [];
    this.imageBlob = null; this.errorMessage = '';
    if (this.imageUrl) URL.revokeObjectURL(this.imageUrl);
    this.imageUrl = '';
  }

  private activeBucketChanged = (event: Event): void => {
    setActiveBucketId((event.target as HTMLSelectElement).value);
  };
  private photoSelected = async (event: Event): Promise<void> => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) await this.usePhoto(file);
  };
  private photoDragOver = (event: DragEvent): void => {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    this.photoDragActive = true;
  };
  private photoDragLeave = (event: DragEvent): void => {
    if (event.currentTarget === event.target) this.photoDragActive = false;
  };
  private photoDropped = (event: DragEvent): void => {
    event.preventDefault();
    this.photoDragActive = false;
    const file = [...(event.dataTransfer?.files ?? [])].find((item) => item.type.startsWith('image/'));
    if (file) void this.usePhoto(file);
    else this.errorMessage = 'Drop an image file to add a part photo.';
  };
  private async usePhoto(file: File): Promise<void> {
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Choose an image file to add a part photo.';
      return;
    }
    try {
      const blob = await compressPhoto(file);
      if (this.imageUrl) URL.revokeObjectURL(this.imageUrl);
      this.imageBlob = blob; this.imageUrl = URL.createObjectURL(blob); this.errorMessage = '';
    } catch {
      this.errorMessage = 'This photo could not be prepared. Try another image.';
    }
  }
  private addTag = (): void => {
    const tag = this.newTag.trim();
    if (tag && !this.tags.some((value) => value.toLowerCase() === tag.toLowerCase())) this.tags = [...this.tags, tag];
    this.newTag = '';
  };
  private tagKeydown = (event: KeyboardEvent): void => { if (event.key === 'Enter') { event.preventDefault(); this.addTag(); } };
  private addExistingTag(tag: string): void { if (!this.tags.includes(tag)) this.tags = [...this.tags, tag]; }
  private removeTag(tag: string): void { this.tags = this.tags.filter((value) => value !== tag); }
  private submit = (): void => {
    const activeBucketId = bucketLocatorState.get().activeBucketId;
    if (!this.imageBlob || !activeBucketId) return;
    this.dispatchEvent(new CustomEvent<IntakeDetail>('df-bucket-locator-intake', {
      detail: {file: this.imageBlob, bucketId: activeBucketId, name: this.name, description: this.description, quantity: Number(this.quantity), tags: this.tags},
      bubbles: true, composed: true,
    }));
  };
}

@customElement('bucket-storage-panel')
export class BucketStoragePanel extends SignalWatcher(LitElement) {
  @property({type: String}) declare assignedBucket: string;
  @state() declare private locationName: string;
  @state() declare private locationDescription: string;
  @state() declare private bucketLocationId: string;
  @state() declare private bucketDescription: string;
  @state() declare private moveBucketId: string;
  @state() declare private moveLocationId: string;

  constructor() {
    super(); this.assignedBucket = ''; this.locationName = ''; this.locationDescription = '';
    this.bucketLocationId = ''; this.bucketDescription = ''; this.moveBucketId = ''; this.moveLocationId = '';
  }

  static override styles = panelStyles;

  resetLocation(): void { this.locationName = ''; this.locationDescription = ''; }
  resetBucket(): void { this.bucketLocationId = ''; this.bucketDescription = ''; }
  resetMove(): void { this.moveBucketId = ''; this.moveLocationId = ''; }

  override render() {
    const state = bucketLocatorState.get();
    return html`<section class="section" aria-labelledby="locations-title">
      <h2 id="locations-title">Storage</h2>
      ${this.assignedBucket ? html`<p class="empty">Write this code on the new container and place it in the selected location.<br /><strong class="bucket">${this.assignedBucket}</strong></p>` : nothing}
      <div class="form-grid">
        <md-outlined-text-field label="New location" .value=${this.locationName} @input=${(event: InputEvent) => { this.locationName = (event.target as HTMLInputElement).value; }}></md-outlined-text-field>
        <md-outlined-text-field label="Location note (optional)" .value=${this.locationDescription} @input=${(event: InputEvent) => { this.locationDescription = (event.target as HTMLInputElement).value; }}></md-outlined-text-field>
        <div class="actions"><md-outlined-button ?disabled=${this.locationName.trim().length < 2 || state.saving} @click=${this.createLocation}>Add location</md-outlined-button></div>
        <div class="form-row">
          <md-filled-select label="New bucket location" .value=${this.bucketLocationId} @change=${(event: Event) => { this.bucketLocationId = (event.target as HTMLSelectElement).value; }}>
            <md-select-option value=""><div slot="headline">Choose location</div></md-select-option>
            ${state.locations.map((location) => html`<md-select-option value=${location.id}><div slot="headline">${location.name}</div></md-select-option>`)}
          </md-filled-select>
          <md-outlined-text-field label="Bucket note (optional)" .value=${this.bucketDescription} @input=${(event: InputEvent) => { this.bucketDescription = (event.target as HTMLInputElement).value; }}></md-outlined-text-field>
        </div>
        <div class="actions"><md-outlined-button ?disabled=${!this.bucketLocationId || state.saving} @click=${this.createBucket}>Create bucket</md-outlined-button></div>
        <div class="form-row">
          <md-filled-select label="Move bucket" .value=${this.moveBucketId} @change=${(event: Event) => { this.moveBucketId = (event.target as HTMLSelectElement).value; }}>
            <md-select-option value=""><div slot="headline">Choose bucket</div></md-select-option>
            ${state.buckets.map((bucket) => html`<md-select-option value=${bucket.id}><div slot="headline">${bucket.id} · ${bucket.location_name}</div></md-select-option>`)}
          </md-filled-select>
          <md-filled-select label="Destination" .value=${this.moveLocationId} @change=${(event: Event) => { this.moveLocationId = (event.target as HTMLSelectElement).value; }}>
            <md-select-option value=""><div slot="headline">Choose location</div></md-select-option>
            ${state.locations.map((location) => html`<md-select-option value=${location.id}><div slot="headline">${location.name}</div></md-select-option>`)}
          </md-filled-select>
        </div>
        <div class="actions"><md-outlined-button ?disabled=${!this.moveBucketId || !this.moveLocationId || state.saving} @click=${this.moveBucket}>Move bucket</md-outlined-button></div>
      </div>
    </section>`;
  }

  private createLocation = (): void => this.emit('df-bucket-locator-location-create', {name: this.locationName, description: this.locationDescription});
  private createBucket = (): void => this.emit('df-bucket-locator-bucket-create', {locationId: this.bucketLocationId, description: this.bucketDescription});
  private moveBucket = (): void => this.emit('df-bucket-locator-bucket-move', {bucketId: this.moveBucketId, locationId: this.moveLocationId});
  private emit(name: string, detail: unknown): void { this.dispatchEvent(new CustomEvent(name, {detail, bubbles: true, composed: true})); }
}

@customElement('bucket-search-panel')
export class BucketSearchPanel extends SignalWatcher(LitElement) {
  @state() declare private viewMode: 'table' | 'cards';
  private searchTimer: number | undefined;

  constructor() {
    super();
    this.viewMode = 'table';
  }

  static override styles = panelStyles;

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.searchTimer) window.clearTimeout(this.searchTimer);
  }

  override render() {
    const state = bucketLocatorState.get();
    const buckets = state.selectedLocationId
      ? state.buckets.filter((bucket) => bucket.location_id === state.selectedLocationId)
      : state.buckets;
    return html`<section class="section" aria-labelledby="search-title">
      <div class="section-heading"><h2 id="search-title">Find a part</h2><md-text-button @click=${() => void refreshParts()}>Refresh</md-text-button></div>
      <md-outlined-text-field label="Search name or description" type="search" .value=${state.searchText} @input=${this.searchChanged}></md-outlined-text-field>
      <div class="result-toolbar">
        <md-filled-select label="Location filter" .value=${state.selectedLocationId} @change=${(event: Event) => this.locationChanged(event)}>
          <md-select-option value=""><div slot="headline">All locations</div></md-select-option>
          ${state.locations.map((location) => html`<md-select-option value=${location.id}><div slot="headline">${location.name}</div></md-select-option>`)}
        </md-filled-select>
        <md-filled-select label="Bucket filter" .value=${state.selectedBucketId} @change=${(event: Event) => this.bucketChanged(event)}>
          <md-select-option value=""><div slot="headline">All buckets</div></md-select-option>
          ${buckets.map((bucket) => html`<md-select-option value=${bucket.id}><div slot="headline">${bucket.id} · ${bucket.location_name}</div></md-select-option>`)}
        </md-filled-select>
        <md-outlined-button @click=${this.clearFilters}>Clear filters</md-outlined-button>
      </div>
      <div class="my-buckets-filter">
        <md-switch aria-label="Show only buckets I created" ?selected=${state.onlyMyBuckets} @change=${this.myBucketsChanged}></md-switch>
        <span>My buckets only</span>
      </div>
      ${state.tags.length ? html`<div class="chips" aria-label="Filter by tags">${state.tags.map((tag) => html`<md-outlined-button aria-pressed=${state.selectedTags.includes(tag.id)} @click=${() => this.toggleTag(tag.id)}>${state.selectedTags.includes(tag.id) ? '✓ ' : ''}${tag.label}</md-outlined-button>`)}</div>` : nothing}
      ${state.loading ? html`<md-linear-progress indeterminate></md-linear-progress>` : nothing}
      <div class="view-switch" role="group" aria-label="Results view">
        <md-outlined-button aria-pressed=${this.viewMode === 'table'} @click=${() => { this.viewMode = 'table'; }}>Table</md-outlined-button>
        <md-outlined-button aria-pressed=${this.viewMode === 'cards'} @click=${() => { this.viewMode = 'cards'; }}>Cards</md-outlined-button>
      </div>
      ${state.parts.length
        ? this.viewMode === 'table'
          ? this.renderTable(state.parts)
          : html`<div class="results">${state.parts.map((part) => this.renderPart(part))}</div>`
        : html`<p class="empty">No parts match these filters.</p>`}
    </section>`;
  }

  private renderTable(parts: InventoryPart[]) {
    return html`<div class="table-scroll" role="region" aria-label="All matching parts" tabindex="0">
      <table>
        <caption>${parts.length} matching parts. Sorted by user, location, bucket, and part name.</caption>
        <thead><tr><th scope="col">User</th><th scope="col">Location</th><th scope="col">Bucket</th><th scope="col">Part</th><th scope="col">Quantity</th><th scope="col">Tags</th><th scope="col">Actions</th></tr></thead>
        <tbody>${parts.map((part) => html`<tr>
          <td>${part.created_by}</td>
          <td>${part.location_name}</td>
          <td><span class="bucket">${part.bucket_id}</span></td>
          <td><div class="table-part"><img class="table-photo" src=${part.photo_url} alt="" loading="lazy" /><div><div class="table-name">${part.name}</div><div class="table-description">${part.description}</div></div></div></td>
          <td>${part.quantity}</td>
          <td><div class="table-tags">${part.tags.map((tag) => html`<span class="tag">${tag}</span>`)}</div></td>
          <td><div class="table-actions"><md-filled-tonal-button aria-label=${`Take one ${part.name}`} @click=${() => this.emit('df-bucket-locator-part-take', part)}>Take 1</md-filled-tonal-button><md-outlined-button aria-label=${`Edit ${part.name}`} @click=${() => this.emit('df-bucket-locator-part-edit-open', part)}>Edit</md-outlined-button><md-text-button aria-label=${`Delete ${part.name}`} @click=${() => this.emit('df-bucket-locator-part-delete', part)}>Delete</md-text-button></div></td>
        </tr>`)}</tbody>
      </table>
    </div>`;
  }

  private renderPart(part: InventoryPart) {
    return html`<article class="part"><img class="part-photo" src=${part.photo_url} alt=${part.name} loading="lazy" />
      <div class="part-content"><div class="part-top"><h3>${part.name}</h3><span class="quantity">Qty ${part.quantity}</span></div>
        <p class="description">${part.description}</p><div class="badges"><span class="bucket">${part.bucket_id}</span><span class="location">${part.location_name}</span></div>
        <div class="tags">${part.tags.map((tag) => html`<span class="tag">${tag}</span>`)}</div>
        <div class="actions"><md-filled-tonal-button @click=${() => this.emit('df-bucket-locator-part-take', part)}>Take 1</md-filled-tonal-button><md-outlined-button @click=${() => this.emit('df-bucket-locator-part-edit-open', part)}>Edit</md-outlined-button><md-text-button @click=${() => this.emit('df-bucket-locator-part-delete', part)}>Delete</md-text-button></div>
      </div>
    </article>`;
  }

  private searchChanged = (event: Event): void => {
    setSearchText((event.target as HTMLInputElement).value);
    if (this.searchTimer) window.clearTimeout(this.searchTimer);
    this.searchTimer = window.setTimeout(() => void refreshParts(), 250);
  };
  private locationChanged(event: Event): void { setSelectedLocationId((event.target as HTMLSelectElement).value); void refreshParts(); }
  private bucketChanged(event: Event): void { setSelectedBucketId((event.target as HTMLSelectElement).value); void refreshParts(); }
  private myBucketsChanged = (event: Event): void => {
    setOnlyMyBuckets((event.target as HTMLElement & {selected: boolean}).selected);
    void refreshParts();
  };
  private toggleTag(tag: string): void { toggleSelectedTag(tag); void refreshParts(); }
  private clearFilters = (): void => {
    setSearchText(''); setSelectedLocationId(''); setSelectedBucketId(''); setOnlyMyBuckets(false);
    for (const tag of bucketLocatorState.get().selectedTags) toggleSelectedTag(tag);
    void refreshParts();
  };
  private emit(name: string, detail: unknown): void { this.dispatchEvent(new CustomEvent(name, {detail, bubbles: true, composed: true})); }
}

async function compressPhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  if (!context) { bitmap.close(); throw new Error('Canvas unavailable'); }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
  for (const quality of [0.72, 0.58, 0.44, 0.32]) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob) throw new Error('Image compression failed');
    if (blob.size <= 600 * 1024 || quality === 0.32) return blob;
  }
  throw new Error('Image compression failed');
}

declare global {
  interface HTMLElementTagNameMap {
    'bucket-intake-panel': BucketIntakePanel;
    'bucket-storage-panel': BucketStoragePanel;
    'bucket-search-panel': BucketSearchPanel;
  }
}