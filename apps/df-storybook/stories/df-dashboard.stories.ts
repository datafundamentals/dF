import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';
import '@df/ui-lit/df-dashboard';
import {
  resetDashboardState,
  setDashboardError,
  setDashboardLoading,
  setDashboardSites,
} from '@df/state';
import type {PubSiteEntry} from '@df/types';

const sampleSites: PubSiteEntry[] = [
  {
    id: 'appwriter',
    url: 'appwriter.com',
    host: 'netlify',
    theme: 'not-npr',
    status: ['latest not deployed', 'extra menus broken'],
    gitStatus: {isInternal: true, hasUncommittedChanges: true, untrackedFiles: 2, modifiedFiles: 1},
    contentChanges: {hasChanges: true, changedFileCount: 3},
    contentGitStatus: {isInternal: true, hasUncommittedChanges: false, untrackedFiles: 0, modifiedFiles: 0},
    contentRootChanges: {hasChanges: true, changedFileCount: 9},
    apps: ['df-chat-app', 'df-activity-log'],
  },
  {
    id: 'aspie',
    url: 'https://aspieautomator.com/',
    host: 'firebase',
    theme: 'not-alphabet',
    status: ['favicon missing', 'mobile layout issues'],
    gitStatus: {isInternal: true, hasUncommittedChanges: false, untrackedFiles: 0, modifiedFiles: 0},
    contentChanges: {hasChanges: false, changedFileCount: 0},
    contentGitStatus: {isInternal: true, hasUncommittedChanges: true, untrackedFiles: 1, modifiedFiles: 2},
    contentRootChanges: {hasChanges: true, changedFileCount: 4},
    apps: ['df-chat-app'],
  },
  {
    id: 'betterologist',
    url: 'https://betterologist.net/',
    host: 'dreamhost',
    theme: 'not-fuelcell',
    status: ['header bump', 'margin issue'],
    gitStatus: {isInternal: false, hasUncommittedChanges: false, untrackedFiles: 0, modifiedFiles: 0},
  },
];

const meta: Meta = {
  title: 'Components/df Dashboard',
  component: 'df-dashboard',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `Dashboard summary for sites stored in SITES.yaml.

## Events
- \`df-dashboard-refresh\`: Fired when the user requests a refresh.

## Accessibility
- Uses MD3 buttons and semantic structure for readable site cards.`,
      },
    },
  },
  tags: ['autodocs'],
};

const sampleApps = [
  {
    name: 'df-chat-app',
    version: '0.0.1-260204',
    releaseDate: '2026-02-04',
    appChanges: {hasChanges: true, changedFileCount: 2},
  },
  {
    name: 'df-activity-log',
    version: '0.0.1-260201',
    releaseDate: '2026-02-01',
    appChanges: {hasChanges: false, changedFileCount: 0},
  },
];

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => {
    resetDashboardState();
    setDashboardSites(sampleSites, Date.now(), {
      isInternal: true,
      hasUncommittedChanges: true,
      untrackedFiles: 1,
      modifiedFiles: 1,
    }, sampleApps);
    return html`<df-dashboard></df-dashboard>`;
  },
};

export const Loading: Story = {
  parameters: {
    docs: {disable: true},
  },
  render: () => {
    resetDashboardState();
    setDashboardLoading();
    return html`<df-dashboard></df-dashboard>`;
  },
};

export const Error: Story = {
  parameters: {
    docs: {disable: true},
  },
  render: () => {
    resetDashboardState();
    setDashboardError('Unable to read SITES.yaml');
    return html`<df-dashboard></df-dashboard>`;
  },
};
