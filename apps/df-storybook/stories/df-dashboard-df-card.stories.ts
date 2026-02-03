import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';
import '@df/ui-lit/df-dashboard-df-card';
import {setDashboardSites} from '@df/state';

const meta: Meta = {
  title: 'Components/df Dashboard Card',
  component: 'df-dashboard-df-card',
};

export default meta;
type Story = StoryObj;

export const Clean: Story = {
  render: () => {
    setDashboardSites([], Date.now(), {
      isInternal: true,
      hasUncommittedChanges: false,
      untrackedFiles: 0,
      modifiedFiles: 0,
    });
    return html`<df-dashboard-df-card></df-dashboard-df-card>`;
  },
};

export const Dirty: Story = {
  render: () => {
    setDashboardSites([], Date.now(), {
      isInternal: true,
      hasUncommittedChanges: true,
      untrackedFiles: 5,
      modifiedFiles: 2,
    });
    return html`<df-dashboard-df-card></df-dashboard-df-card>`;
  },
};
