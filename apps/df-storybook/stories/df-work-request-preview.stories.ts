import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';
import '@df/ui-lit/df-work-request-preview';

type WorkRequestPreviewArgs = {
  markdownContent: string;
};

const meta: Meta<WorkRequestPreviewArgs> = {
  title: 'Components/df Work Request Preview',
  component: 'df-work-request-preview',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Work Request Preview component displays a read-only markdown document with token counting.
It is designed to show the committed state of a work request file.

## Key Features

- **Markdown preview** is the primary view with a white background
- **Token count** is always visible below the preview
- **Read-only editor** can be toggled via button — shown below the preview
- Content always reflects what was passed in via the \`markdownContent\` property (sourced from git)

## Usage

\`\`\`html
<df-work-request-preview .markdownContent=\${content}></df-work-request-preview>
\`\`\`
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
      description: 'Markdown content to display (sourced from committed file)',
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<WorkRequestPreviewArgs>;

const renderPreview = (args: WorkRequestPreviewArgs) => html`
  <df-work-request-preview
    style="display: block; max-width: 800px; width: 100%;"
    .markdownContent=${args.markdownContent}
  ></df-work-request-preview>
`;

export const Default: Story = {
  render: renderPreview,
};

export const WithWorkRequest: Story = {
  args: {
    markdownContent: `# Work Request: Add Login Feature

## Executive Summary

Implement email/password login using Firebase Auth.

---

## Functional Requirements

- Users can sign in with email and password
- Show error message on invalid credentials
- Redirect to dashboard on success

## Acceptance Criteria

- [ ] Login form renders correctly
- [ ] Errors display on bad credentials
- [ ] Successful login redirects user

## Notes

This is a **read-only preview** of the committed work request document.
The editor can be toggled below to inspect the raw markdown.`,
  },
  render: renderPreview,
};

export const LongContent: Story = {
  args: {
    markdownContent: `# Long Work Request Document

## Background

This document demonstrates how the token counter responds to longer content.
As the document grows, the token count indicator changes color to signal limits.

## Section 1

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

## Section 2

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

\`\`\`typescript
function example(): string {
  return 'token counting demo';
}
\`\`\`

## Section 3

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

> Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## Section 4

- Item one with details
- Item two with details
- Item three with details
- Item four with details

## Conclusion

This demonstrates the token count display across varying document lengths.`,
  },
  render: renderPreview,
};

export const EmptyContent: Story = {
  args: {
    markdownContent: '',
  },
  render: renderPreview,
};
