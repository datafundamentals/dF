import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';
import '@df/ui-lit/remove-replace-me';

const meta: Meta = {
  title: 'Components/Remove Replace Me',
  component: 'remove-replace-me',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A placeholder component for the starter template.

This is a simple example of how to structure a web component for the monorepo.
Replace this component with your shared web components as you build out the starter template.
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => html`<remove-replace-me></remove-replace-me>`,
};
