import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';
import '@df/ui-lit/role-picker';

const meta: Meta = {
  title: 'User Admin/Role Picker',
  component: 'df-role-picker',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A dialog for selecting and assigning user roles.

Features:
- Modal dialog with overlay
- Radio button selection for roles
- Role descriptions
- Prevent selecting same role
- Cancel and confirm buttons

Events:
- \`role-selected\`: Fired when user confirms role change
- \`cancel\`: Fired when user cancels the dialog

Props:
- \`open\`: Boolean - whether the dialog is open
- \`userEmail\`: String - email of the user whose role is being changed
- \`currentRole\`: Role - the user's current role
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <df-role-picker
      ?open=${true}
      userEmail="user@example.com"
      currentRole="viewer"
      @role-selected=${(e: CustomEvent) => console.log('Role selected:', e.detail)}
      @cancel=${() => console.log('Cancelled')}
    ></df-role-picker>
  `,
  parameters: {
    docs: {
      story: {
        height: '400px',
      },
    },
  },
};

export const Closed: Story = {
  render: () => html`
    <df-role-picker
      ?open=${false}
      userEmail="user@example.com"
      currentRole="viewer"
    ></df-role-picker>
    <p style="margin-top: 2rem; color: #6b7280;">Dialog is closed (open=false)</p>
  `,
};

export const AdminRole: Story = {
  render: () => html`
    <df-role-picker
      ?open=${true}
      userEmail="admin@example.com"
      currentRole="admin"
      @role-selected=${(e: CustomEvent) => console.log('Role selected:', e.detail)}
      @cancel=${() => console.log('Cancelled')}
    ></df-role-picker>
  `,
  parameters: {
    docs: {
      story: {
        height: '400px',
      },
    },
  },
};

export const PlayerRole: Story = {
  render: () => html`
    <df-role-picker
      ?open=${true}
      userEmail="player@example.com"
      currentRole="player"
      @role-selected=${(e: CustomEvent) => console.log('Role selected:', e.detail)}
      @cancel=${() => console.log('Cancelled')}
    ></df-role-picker>
  `,
  parameters: {
    docs: {
      story: {
        height: '400px',
      },
    },
  },
};

export const CoderFomoRole: Story = {
  render: () => html`
    <df-role-picker
      ?open=${true}
      userEmail="coder@example.com"
      currentRole="coderFomo"
      @role-selected=${(e: CustomEvent) => console.log('Role selected:', e.detail)}
      @cancel=${() => console.log('Cancelled')}
    ></df-role-picker>
  `,
  parameters: {
    docs: {
      story: {
        height: '400px',
      },
    },
  },
};
