import type {Meta, StoryObj} from '@storybook/web-components';
import {css, html, LitElement} from 'lit';
import {SignalWatcher} from '@lit-labs/signals';
import '@df/ui-lit/df-npm-info-widget';
import {npmInfoWidgetState, resetNpmInfoWidget, loadNpmPackageInfo} from '@df/state';
import type {NpmInfoWidgetState} from '@df/types';

const STATE_PANEL_TAG = 'df-npm-info-state-panel';

if (!customElements.get(STATE_PANEL_TAG)) {
  class NpmInfoStatePanel extends SignalWatcher(LitElement) {
    static override styles = css`
      :host {
        display: block;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.45);
        background: rgba(15, 23, 42, 0.9);
        color: #f8fafc;
        padding: 16px;
        font-family: 'Roboto Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
        white-space: pre-wrap;
        max-width: 520px;
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.25);
      }

      h3 {
        margin: 0 0 12px;
        font-size: 0.95rem;
        font-weight: 600;
        letter-spacing: 0.02em;
      }

      pre {
        margin: 0;
        font-size: 0.75rem;
        line-height: 1.4;
        max-height: 320px;
        overflow: auto;
      }
    `;

    override render() {
      const snapshot: NpmInfoWidgetState = npmInfoWidgetState.get();
      return html`
        <h3>NPM Info Store State</h3>
        <pre>${JSON.stringify(snapshot, null, 2)}</pre>
      `;
    }
  }

  customElements.define(STATE_PANEL_TAG, NpmInfoStatePanel);
}

type NpmInfoArgs = {
  defaultPackage: string;
  packageName?: string;
  onSearch?: (packageName: string) => void;
  onReset?: () => void;
};

const meta: Meta<NpmInfoArgs> = {
  title: 'Components/NPM Info Widget',
  component: 'df-npm-info-widget',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The NPM Info Widget is a presentation-only component that demonstrates the **critical async pattern** used throughout the monorepo. It showcases:

- **Signal-driven state management** with \`idle | loading | ready | error\` states
- **Race condition handling** for concurrent requests  
- **Pure presentation** with no business logic
- **Event-driven communication** with parent components

## Key Features

- Real-time NPM package information from the registry
- Responsive design with CSS custom properties for theming
- Comprehensive error handling and loading states
- Accessible with proper ARIA labels and roles

## Events

- \`df-npm-info-search\`: Fired when a package search is initiated
- \`df-npm-info-reset\`: Fired when the widget state is reset

## CSS Custom Properties

- \`--df-npm-info-primary\`: Primary color (default: #2563eb)
- \`--df-npm-info-surface\`: Surface background (default: #ffffff)
- \`--df-npm-info-outline-color\`: Border color (default: rgba(31, 41, 55, 0.15))

## Accessibility

- Full keyboard navigation support
- Screen reader compatible with ARIA labels
- High contrast mode support
        `,
      },
    },
  },
  args: {
    defaultPackage: '',
    packageName: '',
  },
  argTypes: {
    defaultPackage: {
      control: 'text',
      description: 'Package to load automatically on mount',
    },
    packageName: {
      control: 'text', 
      description: 'Current package name (controlled)',
    },
    onSearch: (packageName: string) => {
      void loadNpmPackageInfo(packageName);
    },
    onReset: () => {
      resetNpmInfoWidget();
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<NpmInfoArgs>;

const renderWidget = (args: NpmInfoArgs) => {
  resetNpmInfoWidget();
  return html`
    <df-npm-info-widget
      .defaultPackage=${args.defaultPackage}
      .packageName=${args.packageName || ''}
      @df-npm-info-search=${(event: CustomEvent<{packageName: string}>) =>
        args.onSearch?.(event.detail.packageName)}
      @df-npm-info-reset=${() => args.onReset?.()}
    ></df-npm-info-widget>
  `;
};

export const Default: Story = {
  args: {
    onSearch: (packageName: string) => {
      void loadNpmPackageInfo(packageName);
    },
    onReset: () => {
      resetNpmInfoWidget();
    },
  },
  render: renderWidget,
};

export const WithDefaultPackage: Story = {
  args: {
    defaultPackage: 'lit',
    onSearch: (packageName: string) => {
      void loadNpmPackageInfo(packageName);
    },
    onReset: () => {
      resetNpmInfoWidget();
    },
  },
  render: renderWidget,
};

export const PopularPackages: Story = {
  render: (args) => {
    resetNpmInfoWidget();
    return html`
      <div style="display: grid; gap: 16px; max-width: 600px;">
        <p style="margin: 0; color: #64748b; text-align: center;">
          Click any button to load package information
        </p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-bottom: 16px;">
          <button 
            @click=${() => void loadNpmPackageInfo('react')}
            style="padding: 6px 12px; border: none; border-radius: 6px; background: #0ea5e9; color: white; cursor: pointer;">
            React
          </button>
          <button 
            @click=${() => void loadNpmPackageInfo('vue')}
            style="padding: 6px 12px; border: none; border-radius: 6px; background: #10b981; color: white; cursor: pointer;">
            Vue
          </button>
          <button 
            @click=${() => void loadNpmPackageInfo('svelte')}
            style="padding: 6px 12px; border: none; border-radius: 6px; background: #f59e0b; color: white; cursor: pointer;">
            Svelte
          </button>
          <button 
            @click=${() => void loadNpmPackageInfo('@lit-labs/signals')}
            style="padding: 6px 12px; border: none; border-radius: 6px; background: #8b5cf6; color: white; cursor: pointer;">
            @lit-labs/signals
          </button>
        </div>
        <df-npm-info-widget
          @df-npm-info-search=${(event: CustomEvent<{packageName: string}>) =>
            args.onSearch?.(event.detail.packageName)}
          @df-npm-info-reset=${() => args.onReset?.()}
        ></df-npm-info-widget>
      </div>
    `;
  },
};

export const StateInspector: Story = {
  args: {
    defaultPackage: 'lit',
  },
  render: (args) => {
    resetNpmInfoWidget();
    return html`
      <div style="display: grid; gap: 24px; align-items: start; max-width: 960px; grid-template-columns: 1fr 1fr;">
        <df-npm-info-widget
          .defaultPackage=${args.defaultPackage}
          @df-npm-info-search=${(event: CustomEvent<{packageName: string}>) =>
            args.onSearch?.(event.detail.packageName)}
          @df-npm-info-reset=${() => args.onReset?.()}
        ></df-npm-info-widget>
        <df-npm-info-state-panel></df-npm-info-state-panel>
      </div>
    `;
  },
};

export const ErrorDemo: Story = {
  render: (args) => {
    resetNpmInfoWidget();
    return html`
      <div style="display: grid; gap: 16px; max-width: 600px;">
        <p style="margin: 0; color: #64748b; text-align: center;">
          Try searching for a non-existent package to see error handling
        </p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-bottom: 16px;">
          <button 
            @click=${() => void loadNpmPackageInfo('this-package-definitely-does-not-exist-12345')}
            style="padding: 6px 12px; border: none; border-radius: 6px; background: #ef4444; color: white; cursor: pointer;">
            Non-existent Package
          </button>
          <button 
            @click=${() => void loadNpmPackageInfo('')}
            style="padding: 6px 12px; border: none; border-radius: 6px; background: #f59e0b; color: white; cursor: pointer;">
            Empty Name
          </button>
          <button 
            @click=${() => void loadNpmPackageInfo('lit')}
            style="padding: 6px 12px; border: none; border-radius: 6px; background: #10b981; color: white; cursor: pointer;">
            Valid Package (Recovery)
          </button>
        </div>
        <df-npm-info-widget
          @df-npm-info-search=${(event: CustomEvent<{packageName: string}>) =>
            args.onSearch?.(event.detail.packageName)}
          @df-npm-info-reset=${() => args.onReset?.()}
        ></df-npm-info-widget>
      </div>
    `;
  },
};

export const AsyncPatternShowcase: Story = {
  name: 'Async Pattern (Monorepo Standard)',
  render: (args) => {
    resetNpmInfoWidget();
    return html`
      <div style="display: grid; gap: 24px; max-width: 960px;">
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px;">
          <h3 style="margin: 0 0 8px; color: #92400e;">🎯 Critical Architecture Pattern</h3>
          <p style="margin: 0; color: #92400e; font-size: 0.9rem;">
            This demonstrates the <strong>monorepo-wide async state pattern</strong>: 
            <code>idle → loading → ready|error</code> with race condition handling.
          </p>
        </div>
        <div style="display: grid; gap: 24px; grid-template-columns: 1fr 1fr; align-items: start;">
          <df-npm-info-widget
            .defaultPackage=${args.defaultPackage}
            @df-npm-info-search=${(event: CustomEvent<{packageName: string}>) =>
              args.onSearch?.(event.detail.packageName)}
            @df-npm-info-reset=${() => args.onReset?.()}
          ></df-npm-info-widget>
          <df-npm-info-state-panel></df-npm-info-state-panel>
        </div>
      </div>
    `;
  },
};