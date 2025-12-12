import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@df/ui-lit/df-yaml-nav';

const meta: Meta = {
  title: 'Components/df-yaml-nav',
  component: 'df-yaml-nav',
  tags: ['autodocs'],
  argTypes: {
    currentFile: { control: 'text' },
    yamlFiles: { control: 'object' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    currentFile: 'file2.yaml',
    yamlFiles: ['file1.yaml', 'file2.yaml', 'file3.yaml', 'file4.yaml', 'file5.yaml'],
  },
  render: (args) => html`
    <df-yaml-nav
      .currentFile=${args.currentFile}
      .yamlFiles=${args.yamlFiles}
      @navigate=${(e: CustomEvent) => {
        console.log('Navigate event:', e.detail);
        alert(`Navigate to: ${e.detail.fileName} (${e.detail.direction})`);
      }}>
    </df-yaml-nav>
  `,
};

export const FirstFile: Story = {
  args: {
    currentFile: 'file1.yaml',
    yamlFiles: ['file1.yaml', 'file2.yaml', 'file3.yaml'],
  },
  render: (args) => html`
    <df-yaml-nav
      .currentFile=${args.currentFile}
      .yamlFiles=${args.yamlFiles}
      @navigate=${(e: CustomEvent) => console.log('Navigate:', e.detail)}>
    </df-yaml-nav>
    <p style="margin-top: 16px; color: #666;">Note: Up button is disabled (at first file)</p>
  `,
};

export const LastFile: Story = {
  args: {
    currentFile: 'file3.yaml',
    yamlFiles: ['file1.yaml', 'file2.yaml', 'file3.yaml'],
  },
  render: (args) => html`
    <df-yaml-nav
      .currentFile=${args.currentFile}
      .yamlFiles=${args.yamlFiles}
      @navigate=${(e: CustomEvent) => console.log('Navigate:', e.detail)}>
    </df-yaml-nav>
    <p style="margin-top: 16px; color: #666;">Note: Down button is disabled (at last file)</p>
  `,
};

export const SingleFile: Story = {
  args: {
    currentFile: 'only-file.yaml',
    yamlFiles: ['only-file.yaml'],
  },
  render: (args) => html`
    <df-yaml-nav
      .currentFile=${args.currentFile}
      .yamlFiles=${args.yamlFiles}
      @navigate=${(e: CustomEvent) => console.log('Navigate:', e.detail)}>
    </df-yaml-nav>
    <p style="margin-top: 16px; color: #666;">Note: Both buttons disabled (only one file)</p>
  `,
};

export const NoFiles: Story = {
  args: {
    currentFile: '',
    yamlFiles: [],
  },
  render: (args) => html`
    <df-yaml-nav
      .currentFile=${args.currentFile}
      .yamlFiles=${args.yamlFiles}
      @navigate=${(e: CustomEvent) => console.log('Navigate:', e.detail)}>
    </df-yaml-nav>
    <p style="margin-top: 16px; color: #666;">Note: Shows 0/0 when no files available</p>
  `,
};

export const VSCodeTheme: Story = {
  args: {
    currentFile: 'current.yaml',
    yamlFiles: ['first.yaml', 'current.yaml', 'last.yaml'],
  },
  render: (args) => html`
    <div style="
      background-color: #1e1e1e;
      padding: 20px;
      --md-sys-color-outline: rgba(255, 255, 255, 0.1);
      --md-sys-color-surface: rgba(255, 255, 255, 0.05);
      --md-sys-color-on-surface: #cccccc;
      --md-sys-color-surface-variant: rgba(255, 255, 255, 0.08);
      --md-sys-color-on-surface-variant: #999999;
    ">
      <df-yaml-nav
        .currentFile=${args.currentFile}
        .yamlFiles=${args.yamlFiles}
        @navigate=${(e: CustomEvent) => console.log('Navigate:', e.detail)}>
      </df-yaml-nav>
      <p style="margin-top: 16px; color: #999;">Styled for VSCode dark theme</p>
    </div>
  `,
};
