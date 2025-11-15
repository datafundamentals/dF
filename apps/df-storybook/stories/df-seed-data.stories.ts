import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';
import '@df/ui-lit/df-seed-data';

const meta: Meta = {
  title: 'Development/df Seed Data',
  component: 'df-seed-data',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Development-only component for seeding Firestore with reference data.

**Important:** This component is ONLY displayed when accessing from localhost or 127.0.0.1.
This safety check prevents accidental usage in production environments.

The component provides a button to populate Firestore with seed data for:
- Flowers (botanical reference data)
- Continents (geographical reference data)
- Chemical Elements (periodic table)
- Musical Instruments (music reference data)
- Todos (task items for testing)

This is a dev-only utility and will never be visible in production.
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  name: 'Seed Data Panel',
  render: () => html`
    <df-seed-data></df-seed-data>
  `,
};

export const WithDescription: Story = {
  name: 'With Usage Context',
  render: () => html`
    <div style="max-width: 600px;">
      <p style="margin-bottom: 20px; font-size: 14px; color: #666;">
        This component is only visible in development mode on localhost.
        It allows you to populate the Firestore emulator with reference data
        for testing and development purposes.
      </p>
      <df-seed-data></df-seed-data>
    </div>
  `,
};
