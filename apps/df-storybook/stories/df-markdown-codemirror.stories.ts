import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';
import '@df/ui-lit/df-markdown-codemirror';

type MarkdownCodeMirrorArgs = {
  markdownContent: string;
  onMarkdownUpdate?: (markdown: string) => void;
  onTokenCalculated?: (tokenCount: number) => void;
  onTokenStatusChanged?: (stale: boolean) => void;
};

const meta: Meta<MarkdownCodeMirrorArgs> = {
  title: 'Components/df Markdown CodeMirror',
  component: 'df-markdown-codemirror',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Markdown CodeMirror component provides a rich markdown editor with live preview and token counting capabilities. It combines:

- **CodeMirror 6** editor with markdown syntax highlighting
- **Live markdown preview** with rendered HTML output
- **Token counting** to track content length
- **Visual feedback** for token count status with color-coded indicators

## Key Features

- Real-time markdown editing with syntax highlighting
- One-click preview rendering using marked.js
- Token counting with visual status indicators:
  - Green: Under 250 tokens (good)
  - Blue: 250-300 tokens (approaching limit)
  - Yellow: 300-500 tokens (over target)
  - Red: Over 500 tokens (way over limit)
  - Purple: Content changed since last count
- Material Design styled button and consistent theming
- Event-driven communication for integration

## Events

- \`markdown-updated\`: Fired continuously as content changes
- \`markdown-update\`: Fired on blur/focus loss
- \`token-calculated\`: Fired when token count is calculated
- \`token-status-changed\`: Fired when content staleness changes

## Usage

The component is presentation-only with placeholder functions for token counting.
Real token counting logic will be integrated from legacy codebase in future iterations.
        `,
      },
    },
  },
  args: {
    markdownContent: '',
  },
  argTypes: {
    markdownContent: {
      control: 'text',
      description: 'Initial markdown content to display in the editor',
    },
    onMarkdownUpdate: {
      action: 'markdown-update',
      description: 'Callback fired when markdown content is updated',
    },
    onTokenCalculated: {
      action: 'token-calculated',
      description: 'Callback fired when token count is calculated',
    },
    onTokenStatusChanged: {
      action: 'token-status-changed',
      description: 'Callback fired when token staleness changes',
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<MarkdownCodeMirrorArgs>;

const renderEditor = (args: MarkdownCodeMirrorArgs) => {
  return html`
    <df-markdown-codemirror
      .markdownContent=${args.markdownContent}
      @markdown-update=${(event: CustomEvent<{markdown: string}>) =>
        args.onMarkdownUpdate?.(event.detail.markdown)}
      @token-calculated=${(event: CustomEvent<{tokenCount: number}>) =>
        args.onTokenCalculated?.(event.detail.tokenCount)}
      @token-status-changed=${(event: CustomEvent<{stale: boolean}>) =>
        args.onTokenStatusChanged?.(event.detail.stale)}
    ></df-markdown-codemirror>
  `;
};

export const Default: Story = {
  render: renderEditor,
};

export const WithSampleContent: Story = {
  args: {
    markdownContent: `# Welcome to Markdown Editor

This is a **sample markdown document** to demonstrate the editor capabilities.

## Features

- Syntax highlighting
- Live preview
- Token counting
- Real-time updates

## Code Example

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

> This is a blockquote to show the styling capabilities.

Try editing this content and click "Preview & Count Tokens" to see the rendered output!`,
  },
  render: renderEditor,
};

export const TokenCountingDemo: Story = {
  args: {
    markdownContent: `# Token Counting Demo

This content is designed to demonstrate the token counting feature. As you edit this text, you'll notice the token count changes in real-time.

## Short Content (Under 250 tokens)
This should show a green token count indicator.

## Medium Content (250-300 tokens)
When you add more content and reach around 250-300 tokens, the indicator will turn blue to show you're approaching the target limit.

## Long Content (300-500 tokens)
If you continue adding content beyond 300 tokens, the indicator will turn yellow to warn that you're over the recommended target.

## Very Long Content (Over 500 tokens)
Content exceeding 500 tokens will show a red, pulsing indicator to alert that you're way over the limit.

Try editing this content to see how the token count and color indicators change! The counting uses a simple character-based estimation until the real token counting logic is integrated.`,
  },
  render: renderEditor,
};

export const EmptyEditor: Story = {
  args: {
    markdownContent: '',
  },
  render: (args) => html`
    <div style="display: grid; gap: 16px; max-width: 800px;">
      <p style="margin: 0; color: #64748b; text-align: center; font-size: 0.9rem;">
        Start typing in the editor below to see the markdown features in action
      </p>
      ${renderEditor(args)}
    </div>
  `,
};

export const EventLogging: Story = {
  args: {
    markdownContent: `# Event Demo

Edit this content to see events being logged in the Actions panel below.

The component fires several events:
- \`markdown-updated\`: On every keystroke
- \`token-calculated\`: When tokens are counted
- \`token-status-changed\`: When content becomes stale`,
  },
  render: (args) => html`
    <div style="display: grid; gap: 16px; max-width: 800px;">
      <div style="background: #eff6ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 12px;">
        <p style="margin: 0; color: #1d4ed8; font-size: 0.9rem;">
          📡 <strong>Event Monitoring:</strong> Check the Actions panel below to see real-time events as you edit.
        </p>
      </div>
      ${renderEditor(args)}
    </div>
  `,
};