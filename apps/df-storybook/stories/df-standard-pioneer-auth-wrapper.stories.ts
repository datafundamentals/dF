import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import '@df/ui-lit/df-standard-pioneer-auth-wrapper';

interface StoryArgs {
  headless: boolean;
  showHideUser: boolean;
  usePopup: boolean;
  bkgrd?: string;
  sessionUrl: string;
  loginUrl: string;
  logoutUrl: string;
}

const meta: Meta<StoryArgs> = {
  title: 'Cloudflare/Auth/df-standard-pioneer-auth-wrapper',
  component: 'df-standard-pioneer-auth-wrapper',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Cloudflare Access authentication wrapper

Protects slotted content with a Cloudflare Access session while preserving the
Lit, signals, and Material Design architecture used by the Firebase wrapper.

The session and login endpoints must be covered by a path-scoped Cloudflare
Access application. Storybook normally displays the unauthenticated state unless
it is served behind that configured Access route.
        `,
      },
    },
  },
  args: {
    headless: false,
    showHideUser: false,
    usePopup: false,
    sessionUrl: '/cf-auth/_protected/whoami',
    loginUrl: '/cf-auth/_protected/login',
    logoutUrl: '/cdn-cgi/access/logout',
  },
  argTypes: {
    headless: {control: 'boolean'},
    showHideUser: {control: 'boolean'},
    usePopup: {control: 'boolean'},
    bkgrd: {control: 'text'},
    sessionUrl: {control: 'text'},
    loginUrl: {control: 'text'},
    logoutUrl: {control: 'text'},
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<StoryArgs>;

const render = (args: StoryArgs) => html`
  <df-standard-pioneer-auth-wrapper
    ?headless=${args.headless}
    ?show-hide-user=${args.showHideUser}
    ?use-popup=${args.usePopup}
    bkgrd=${ifDefined(args.bkgrd)}
    session-url=${args.sessionUrl}
    login-url=${args.loginUrl}
    logout-url=${args.logoutUrl}
  >
    <main style="max-width: 720px; margin: 0 auto; padding: 40px;">
      <h1>Protected content</h1>
      <p>
        This content is visible only after Cloudflare Access authentication.
      </p>
    </main>
  </df-standard-pioneer-auth-wrapper>
`;

export const Default: Story = {render};

export const Headless: Story = {
  args: {headless: true},
  render,
};

export const Popup: Story = {
  args: {usePopup: true},
  render,
};

export const LoginBackground: Story = {
  args: {
    bkgrd: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa',
  },
  render,
};
