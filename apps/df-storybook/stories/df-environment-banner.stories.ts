import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';
import '@df/ui-lit/df-environment-banner';
import type {FirebaseEnvironment} from '@df/firebase';

interface BannerStoryArgs {
  environment: FirebaseEnvironment;
}

const meta: Meta<BannerStoryArgs> = {
  title: 'Foundations/df Environment Banner',
  component: 'df-environment-banner',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Visual indicator for which Firebase backend the app is currently connected to.

- Yellow highlights emulator mode (safe for local iteration)
- Red highlights cloud mode (caution when touching live data)

Set the \`VITE_FIREBASE_ENV\` variable per-app to toggle at runtime. Use a local \`.env.local\` file to switch to cloud testing and delete it to revert to emulator mode.
        `,
      },
    },
  },
  argTypes: {
    environment: {
      control: 'radio',
      options: ['fb-emulator', 'fb-cloud'],
      description: 'Force a specific environment (storybook only)',
    },
  },
  args: {
    environment: 'fb-emulator',
  },
};

export default meta;

type Story = StoryObj<BannerStoryArgs>;

export const EmulatorMode: Story = {
  name: 'Emulator Mode',
  render: (args) => html`
    <df-environment-banner environment=${args.environment}></df-environment-banner>
  `,
};

export const CloudMode: Story = {
  args: {
    environment: 'fb-cloud',
  },
  render: (args) => html`
    <df-environment-banner environment=${args.environment}></df-environment-banner>
  `,
};
