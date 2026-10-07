import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';
import '@df/ui-lit/df-standard-pioneer-auth-wrapper';
import '../../df-bucket-locator/src/bucket-locator-panels.js';
import '../../df-bucket-locator/src/bucket-record-manager.js';
import '../../df-bucket-locator/src/bucket-locator-app.js';
import '../../df-bucket-locator/src/part-edit-dialog.js';
import type {InventoryPart} from '@df/types';

const meta: Meta = {
  title: 'Apps/Bucket Locator',
  parameters: {layout: 'fullscreen'},
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const App: Story = {
  render: () => html`<bucket-locator-app></bucket-locator-app>`,
};

export const IntakePanel: Story = {
  render: () => html`<bucket-intake-panel></bucket-intake-panel>`,
};

export const StoragePanel: Story = {
  render: () => html`<bucket-storage-panel></bucket-storage-panel>`,
};

export const RecordManager: Story = {
  render: () => html`<bucket-record-manager></bucket-record-manager>`,
};

export const SearchPanel: Story = {
  render: () => html`<bucket-search-panel></bucket-search-panel>`,
};

const samplePart: InventoryPart = {
  id: 'part-1',
  created_by: 'owner@example.com',
  name: 'M4 stainless bolts',
  description: 'Short machine bolts from the workbench drawer.',
  quantity: 8,
  bucket_id: 'ABCD',
  location_name: 'Workshop',
  tags: ['hardware', 'keep'],
  photo_url: '',
};

export const PartEditor: Story = {
  render: () => html`<part-edit-dialog .currentPart=${samplePart}></part-edit-dialog>`,
  play: async ({canvasElement}) => {
    (canvasElement.querySelector('part-edit-dialog') as HTMLElement & {show(): void}).show();
  },
};