import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';
import '@df/ui-lit/df-dashboard-app-card';
import type {AppEntry} from '@df/types';

const app: AppEntry = {
  name: 'df-chat',
  version: '0.0.1-260204',
  releaseDate: '2026-02-04',
  appChanges: {
    hasChanges: true,
    changedFileCount: 3,
  },
};

const meta: Meta = {
  title: 'Components/df Dashboard App Card',
  component: 'df-dashboard-app-card',
  parameters: {
    docs: {
      description: {
        component: `Renders one app card with deploy target controls.

## Events
- \`df-dashboard-app-card-add-site\`: Request to add app deploy target to a site.
- \`df-dashboard-app-card-remove-site\`: Request to remove app deploy target from a site.`,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <df-dashboard-app-card
      .app=${app}
      .assignedSites=${['appwriter.com']}
      .allSites=${['appwriter.com', 'aspieautomator', 'betterologist']}
    ></df-dashboard-app-card>
  `,
};

export const NoTargets: Story = {
  render: () => html`
    <df-dashboard-app-card
      .app=${app}
      .assignedSites=${[]}
      .allSites=${['appwriter.com', 'aspieautomator', 'betterologist']}
    ></df-dashboard-app-card>
  `,
};
