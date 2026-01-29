import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';
import '@df/ui-lit/df-pub-control-panel';
import {
  resetPubControlPanelState,
  setPubControlPanelError,
  setPubControlPanelLoading,
  setPubControlPanelSites,
} from '@df/state';
import type {PubSiteEntry} from '@df/types';

const sampleSites: PubSiteEntry[] = [
  {
    id: 'appwriter',
    url: 'appwriter.com',
    host: 'netlify',
    theme: 'not-npr',
    status: ['latest not deployed', 'extra menus broken'],
  },
  {
    id: 'aspie',
    url: 'https://aspieautomator.com/',
    host: 'firebase',
    theme: 'not-alphabet',
    status: ['favicon missing', 'mobile layout issues'],
  },
  {
    id: 'betterologist',
    url: 'https://betterologist.net/',
    host: 'dreamhost',
    theme: 'not-fuelcell',
    status: ['header bump', 'margin issue'],
  },
];

const meta: Meta = {
  title: 'Components/df Pub Control Panel',
  component: 'df-pub-control-panel',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `Pub Control Panel summary for sites stored in SITES.yaml.

## Events
- \`df-pub-control-panel-refresh\`: Fired when the user requests a refresh.

## Accessibility
- Uses MD3 buttons and semantic structure for readable site cards.`,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => {
    resetPubControlPanelState();
    setPubControlPanelSites(sampleSites, Date.now());
    return html`<df-pub-control-panel></df-pub-control-panel>`;
  },
};

export const Loading: Story = {
  parameters: {
    docs: {disable: true},
  },
  render: () => {
    resetPubControlPanelState();
    setPubControlPanelLoading();
    return html`<df-pub-control-panel></df-pub-control-panel>`;
  },
};

export const Error: Story = {
  parameters: {
    docs: {disable: true},
  },
  render: () => {
    resetPubControlPanelState();
    setPubControlPanelError('Unable to read SITES.yaml');
    return html`<df-pub-control-panel></df-pub-control-panel>`;
  },
};
