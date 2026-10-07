import {css, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import type {InventoryBucket, InventoryPart, InventoryTag} from '@df/types';

interface PartEditDetail {
  id: string;
  name: string;
  description: string;
  quantity: number;
  bucketId: string;
  tags: string[];
}

@customElement('part-edit-dialog')
export class PartEditDialog extends LitElement {
  @property({attribute: false}) declare currentPart: InventoryPart | null;
  @property({attribute: false}) declare buckets: InventoryBucket[];
  @property({attribute: false}) declare tags: InventoryTag[];
  @state() declare private draftTags: string[];
  @state() declare private errorMessage: string;
  private loadedPartId: string;

  constructor() {
    super();
    this.currentPart = null;
    this.buckets = [];
    this.tags = [];
    this.draftTags = [];
    this.errorMessage = '';
    this.loadedPartId = '';
  }

  static override styles = css`
    md-dialog { --md-dialog-container-shape: 8px; }
    md-dialog [slot='content'] {
      display: grid;
      gap: 12px;
      min-width: min(440px, 76vw);
    }
    md-dialog [slot='headline'] {
      font-family: 'Manrope', 'Avenir Next', sans-serif;
      font-weight: 700;
    }
    md-dialog [slot='actions'] { display: flex; gap: 8px; }
    .edit-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: center;
      gap: 10px;
    }
    .tag-list { display: flex; flex-wrap: wrap; gap: 7px; }
    .error { color: #812f22; }
    @media (max-width: 560px) {
      md-dialog [slot='content'] { min-width: min(300px, 72vw); }
      .edit-row { grid-template-columns: 1fr; }
    }
  `;

  protected override updated(): void {
    if (this.currentPart && this.currentPart.id !== this.loadedPartId) {
      this.loadedPartId = this.currentPart.id;
      this.draftTags = [...this.currentPart.tags];
    }
  }

  override render() {
    if (!this.currentPart) return nothing;
    return html`
      <md-dialog aria-label="Edit part details">
        <div slot="headline">Edit part</div>
        <form slot="content" id="part-edit-form" @submit=${this.submit}>
          <md-outlined-text-field label="Part name" name="name" required minlength="2" maxlength="120" .value=${this.currentPart.name}></md-outlined-text-field>
          <md-outlined-text-field label="Description" name="description" type="textarea" required minlength="3" maxlength="2000" .value=${this.currentPart.description}></md-outlined-text-field>
          <div class="edit-row">
            <md-outlined-text-field label="Quantity" name="quantity" type="number" min="0" step="1" required .value=${String(this.currentPart.quantity)}></md-outlined-text-field>
            <md-filled-select label="Bucket" name="bucket_id" .value=${this.currentPart.bucket_id}>
              ${this.buckets.map((bucket) => html`<md-select-option value=${bucket.id}><div slot="headline">${bucket.id} · ${bucket.location_name}</div></md-select-option>`)}
            </md-filled-select>
          </div>
          <div class="tag-list" aria-label="Part tags">
            ${this.draftTags.map((tag) => html`<md-outlined-button @click=${() => this.removeTag(tag)}>${tag} ×</md-outlined-button>`)}
          </div>
          <div class="edit-row">
            <md-outlined-text-field id="new-tag" label="Add tag" maxlength="40"></md-outlined-text-field>
            <md-outlined-button type="button" @click=${this.addTag}>Add</md-outlined-button>
          </div>
          ${this.errorMessage ? html`<p class="error" role="alert">${this.errorMessage}</p>` : nothing}
        </form>
        <div slot="actions">
          <md-text-button @click=${this.close}>Cancel</md-text-button>
          <md-filled-button form="part-edit-form" type="submit">Save changes</md-filled-button>
        </div>
      </md-dialog>
    `;
  }

  show(): void {
    this.draftTags = [...(this.currentPart?.tags ?? [])];
    this.errorMessage = '';
    void this.updateComplete.then(() => this.renderRoot.querySelector('md-dialog')?.show());
  }

  closeDialog(): void {
    this.renderRoot.querySelector('md-dialog')?.close();
  }

  private addTag = (): void => {
    const field = this.renderRoot.querySelector('#new-tag') as HTMLElement & {value: string};
    const value = field.value.trim();
    if (value && !this.draftTags.some((tag) => tag.toLowerCase() === value.toLowerCase())) {
      this.draftTags = [...this.draftTags, value];
    }
    field.value = '';
  };

  private removeTag(tag: string): void {
    this.draftTags = this.draftTags.filter((value) => value !== tag);
  }

  private submit = (event: SubmitEvent): void => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const quantity = Number(data.get('quantity'));
    if (!Number.isSafeInteger(quantity) || quantity < 0) {
      this.errorMessage = 'Quantity must be zero or a positive whole number.';
      return;
    }
    const detail: PartEditDetail = {
      id: this.currentPart!.id,
      name: String(data.get('name') ?? ''),
      description: String(data.get('description') ?? ''),
      quantity,
      bucketId: String(data.get('bucket_id') ?? ''),
      tags: this.draftTags,
    };
    this.dispatchEvent(new CustomEvent<PartEditDetail>('df-bucket-locator-part-edit', {
      detail, bubbles: true, composed: true,
    }));
  };

  private close(): void {
    this.renderRoot.querySelector('md-dialog')?.close();
    this.dispatchEvent(new CustomEvent('df-bucket-locator-edit-close', {bubbles: true, composed: true}));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'part-edit-dialog': PartEditDialog;
  }
}