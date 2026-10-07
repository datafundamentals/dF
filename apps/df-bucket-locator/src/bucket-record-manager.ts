import {SignalWatcher} from '@lit-labs/signals';
import {css, html, LitElement, nothing} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {bucketLocatorState} from '@df/state';

const styles = css`
  :host { display: block; }
  section { padding: 0 0 24px; margin-bottom: 24px; border-bottom: 1px solid #c9d0c8; }
  h2 { margin: 0 0 12px; color: #1e3029; font: 500 1.4rem Georgia, serif; }
  h3 { margin: 18px 0 8px; color: #35453b; font-size: .95rem; }
  .record-list { display: grid; gap: 8px; }
  .record { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; align-items: center; gap: 6px; padding: 8px 0; border-bottom: 1px solid #e0e5df; }
  .record-name { min-width: 0; overflow-wrap: anywhere; color: #26342d; font-weight: 600; }
  .record-meta, .hint { color: #5b695f; font-size: .82rem; }
  .edit { grid-column: 1 / -1; display: grid; gap: 8px; padding: 8px; background: #eef2eb; }
  .edit-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .actions { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
  md-outlined-text-field, md-filled-select { width: 100%; }
  .hint { margin: 5px 0 0; }
  @media (max-width: 560px) { .edit-row { grid-template-columns: 1fr; } }
`;

@customElement('bucket-record-manager')
export class BucketRecordManager extends SignalWatcher(LitElement) {
  @state() declare private editingLocationId: string;
  @state() declare private locationName: string;
  @state() declare private locationDescription: string;
  @state() declare private editingBucketId: string;
  @state() declare private bucketLocationId: string;
  @state() declare private bucketDescription: string;
  @state() declare private creatingTag: boolean;
  @state() declare private editingTagId: string;
  @state() declare private tagLabel: string;

  constructor() {
    super();
    this.editingLocationId = ''; this.locationName = ''; this.locationDescription = '';
    this.editingBucketId = ''; this.bucketLocationId = ''; this.bucketDescription = '';
    this.creatingTag = false; this.editingTagId = ''; this.tagLabel = '';
  }

  static override styles = styles;

  override render() {
    const state = bucketLocatorState.get();
    return html`<section aria-labelledby="manage-records-title">
      <h2 id="manage-records-title">Manage records</h2>
      <h3>Locations</h3>
      <div class="record-list">
        ${state.locations.map((location) => html`
          <div class="record">
            <div><div class="record-name">${location.name}</div><div class="record-meta">${location.bucket_count} buckets</div></div>
            <md-text-button @click=${() => this.startLocationEdit(location)}>${this.editingLocationId === location.id ? 'Editing' : 'Edit'}</md-text-button>
            <md-text-button ?disabled=${location.bucket_count > 0} @click=${() => this.emit('df-bucket-locator-location-delete', {id: location.id, name: location.name})}>Delete</md-text-button>
            ${this.editingLocationId === location.id ? html`
              <div class="edit">
                <md-outlined-text-field label="Location name" .value=${this.locationName} @input=${(event: Event) => { this.locationName = fieldValue(event); }}></md-outlined-text-field>
                <md-outlined-text-field label="Description" .value=${this.locationDescription} @input=${(event: Event) => { this.locationDescription = fieldValue(event); }}></md-outlined-text-field>
                <div class="actions"><md-filled-button ?disabled=${this.locationName.trim().length < 2} @click=${this.saveLocation}>Save location</md-filled-button><md-text-button @click=${this.cancelLocation}>Cancel</md-text-button></div>
                ${location.bucket_count ? html`<p class="hint">This location can be edited, but cannot be deleted while it contains buckets.</p>` : nothing}
              </div>` : nothing}
          </div>`)}
      </div>

      <h3>Buckets</h3>
      <div class="record-list">
        ${state.buckets.map((bucket) => html`
          <div class="record">
            <div><div class="record-name">${bucket.id} · ${bucket.location_name}</div><div class="record-meta">${bucket.part_count} parts${bucket.description ? ` · ${bucket.description}` : ''}</div></div>
            <md-text-button @click=${() => this.startBucketEdit(bucket)}>${this.editingBucketId === bucket.id ? 'Editing' : 'Edit'}</md-text-button>
            <md-text-button ?disabled=${bucket.part_count > 0} @click=${() => this.emit('df-bucket-locator-bucket-delete', {id: bucket.id})}>Delete</md-text-button>
            ${this.editingBucketId === bucket.id ? html`
              <div class="edit">
                <div class="edit-row"><md-filled-select label="Location" .value=${this.bucketLocationId} @change=${(event: Event) => { this.bucketLocationId = selectValue(event); }}>${state.locations.map((location) => html`<md-select-option value=${location.id}><div slot="headline">${location.name}</div></md-select-option>`)}</md-filled-select><md-outlined-text-field label="Bucket description" .value=${this.bucketDescription} @input=${(event: Event) => { this.bucketDescription = fieldValue(event); }}></md-outlined-text-field></div>
                <div class="actions"><md-filled-button @click=${this.saveBucket}>Save bucket</md-filled-button><md-text-button @click=${this.cancelBucket}>Cancel</md-text-button></div>
                ${bucket.part_count ? html`<p class="hint">This bucket can be edited, but cannot be deleted while it contains parts.</p>` : nothing}
              </div>` : nothing}
          </div>`)}
      </div>

      <h3>Tags</h3>
      ${this.creatingTag ? html`<div class="edit"><md-outlined-text-field label="Tag label" .value=${this.tagLabel} @input=${(event: Event) => { this.tagLabel = fieldValue(event); }}></md-outlined-text-field><div class="actions"><md-filled-button ?disabled=${!this.tagLabel.trim()} @click=${this.saveNewTag}>Create tag</md-filled-button><md-text-button @click=${() => { this.creatingTag = false; this.tagLabel = ''; }}>Cancel</md-text-button></div></div>` : html`<md-outlined-button @click=${() => { this.creatingTag = true; }}>New tag</md-outlined-button>`}
      <div class="record-list">
        ${state.tags.map((tag) => html`
          <div class="record">
            ${this.editingTagId === tag.id
              ? html`<div class="edit"><md-outlined-text-field label="Tag label" .value=${this.tagLabel} @input=${(event: Event) => { this.tagLabel = fieldValue(event); }}></md-outlined-text-field><div class="actions"><md-filled-button ?disabled=${!this.tagLabel.trim()} @click=${this.saveTag}>Save tag</md-filled-button><md-text-button @click=${this.cancelTag}>Cancel</md-text-button></div></div>`
              : html`<div><div class="record-name">${tag.label}</div><div class="record-meta">${tag.count} parts</div></div><md-text-button @click=${() => this.startTagEdit(tag.id, tag.label)}>Edit</md-text-button><md-text-button @click=${() => this.emit('df-bucket-locator-tag-delete', {id: tag.id, label: tag.label, count: tag.count})}>Delete</md-text-button>`}
          </div>`)}
      </div>
    </section>`;
  }

  resetLocationEdit(): void { this.editingLocationId = ''; this.locationName = ''; this.locationDescription = ''; }
  resetBucketEdit(): void { this.editingBucketId = ''; this.bucketLocationId = ''; this.bucketDescription = ''; }
  resetTagEdit(): void { this.editingTagId = ''; this.tagLabel = ''; this.creatingTag = false; }

  private startLocationEdit(location: {id: string; name: string; description: string | null}): void {
    this.editingLocationId = location.id; this.locationName = location.name; this.locationDescription = location.description ?? '';
  }
  private saveLocation = (): void => this.emit('df-bucket-locator-location-update', {id: this.editingLocationId, name: this.locationName, description: this.locationDescription});
  private cancelLocation = (): void => this.resetLocationEdit();
  private startBucketEdit(bucket: {id: string; location_id: string; description?: string | null}): void {
    this.editingBucketId = bucket.id; this.bucketLocationId = bucket.location_id; this.bucketDescription = bucket.description ?? '';
  }
  private saveBucket = (): void => this.emit('df-bucket-locator-bucket-update', {id: this.editingBucketId, locationId: this.bucketLocationId, description: this.bucketDescription});
  private cancelBucket = (): void => this.resetBucketEdit();
  private startTagEdit(id: string, label: string): void { this.editingTagId = id; this.tagLabel = label; }
  private saveTag = (): void => this.emit('df-bucket-locator-tag-update', {id: this.editingTagId, label: this.tagLabel});
  private cancelTag = (): void => this.resetTagEdit();
  private saveNewTag = (): void => this.emit('df-bucket-locator-tag-create', {label: this.tagLabel});
  private emit(name: string, detail: unknown): void { this.dispatchEvent(new CustomEvent(name, {detail, bubbles: true, composed: true})); }
}

function fieldValue(event: Event): string { return (event.target as HTMLInputElement).value; }
function selectValue(event: Event): string { return (event.target as HTMLSelectElement).value; }

declare global {
  interface HTMLElementTagNameMap {
    'bucket-record-manager': BucketRecordManager;
  }
}
