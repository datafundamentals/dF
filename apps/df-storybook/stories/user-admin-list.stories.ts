import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';
import '@df/ui-lit/user-admin-list';

const mockUsers = [
  {
    uid: 'user1',
    email: 'admin@example.com',
    displayName: 'Admin User',
    role: 'admin' as const,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    uid: 'user2',
    email: 'player@example.com',
    displayName: 'Player User',
    role: 'player' as const,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    uid: 'user3',
    email: 'coder.fomo@example.com',
    role: 'coderFomo' as const,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    uid: 'user4',
    email: 'viewer@example.com',
    displayName: 'Viewer User',
    role: 'viewer' as const,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const meta: Meta = {
  title: 'User Admin/User List',
  component: 'df-user-admin-list',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A searchable, paginated list of users with their roles and creation dates.

Features:
- Search by email or display name
- Role badges with color coding
- Relative date formatting
- Click to select users for role changes
- Loading state support

Events:
- \`user-selected\`: Fired when user clicks on a user item
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <df-user-admin-list
      .users=${mockUsers}
      @user-selected=${(e: CustomEvent) => console.log('User selected:', e.detail)}
    ></df-user-admin-list>
  `,
};

export const Loading: Story = {
  render: () => html`
    <df-user-admin-list
      .users=${[]}
      ?loading=${true}
    ></df-user-admin-list>
  `,
};

export const Empty: Story = {
  render: () => html`
    <df-user-admin-list
      .users=${[]}
      ?loading=${false}
    ></df-user-admin-list>
  `,
};

export const SingleUser: Story = {
  render: () => html`
    <df-user-admin-list
      .users=${[mockUsers[0]]}
      @user-selected=${(e: CustomEvent) => console.log('User selected:', e.detail)}
    ></df-user-admin-list>
  `,
};

export const ManyUsers: Story = {
  render: () => {
    const manyUsers = Array.from({length: 50}, (_, i) => ({
      uid: `user${i}`,
      email: `user${i}@example.com`,
      displayName: i % 3 === 0 ? `User ${i}` : undefined,
      role: ['admin', 'player', 'coderFomo', 'viewer'][i % 4] as const,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    }));
    return html`
      <df-user-admin-list
        .users=${manyUsers}
        @user-selected=${(e: CustomEvent) => console.log('User selected:', e.detail)}
      ></df-user-admin-list>
    `;
  },
};
