import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';
import '@df/ui-lit/firebase';

interface DfFileListStoryArgs {
  directory: string;
  showDelete: boolean;
  showPreviews: boolean;
  onFileSelect?: (event: CustomEvent) => void;
  onFileDelete?: (event: CustomEvent) => void;
}

const meta: Meta<DfFileListStoryArgs> = {
  title: 'Firebase/Storage/df-file-list',
  component: 'df-file-list',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Firebase Storage File List Component

Displays a list of files from a Firebase Storage directory with metadata and actions.

## Features
- **File listing** with automatic metadata fetching
- **Thumbnail previews** for images
- **File metadata** display (name, size, upload date)
- **Delete functionality** with optional buttons
- **Selectable files** for preview or other actions
- **Material Design 3** styling
- **Loading states** with spinner
- **Empty state** messaging

## Usage

\`\`\`typescript
import '@df/ui-lit/firebase';
import {initializeStorage} from '@df/state';

// Initialize storage first
const app = getFirebaseApp(config);
initializeStorage(app, true); // true = use emulator

// Then use the component
<df-file-list
  directory="uploads/images"
  showDelete
  showPreviews
  @file-select=\${handleFileSelect}
  @file-delete=\${handleFileDelete}
></df-file-list>
\`\`\`

## Events
- \`file-select\`: Fired when a file is clicked (detail: {file})
- \`file-delete\`: Fired when delete button is clicked (detail: {file})

## Props
- \`directory\`: Storage directory to list files from
- \`showDelete\`: Show delete buttons (default: true)
- \`showPreviews\`: Show image thumbnails (default: true)

## Public Methods
- \`refresh()\`: Manually refresh the file list
        `,
      },
    },
  },
  args: {
    directory: 'uploads/images',
    showDelete: true,
    showPreviews: true,
  },
  argTypes: {
    directory: {
      control: 'text',
      description: 'Storage directory to list files from',
    },
    showDelete: {
      control: 'boolean',
      description: 'Show delete buttons for each file',
    },
    showPreviews: {
      control: 'boolean',
      description: 'Show thumbnail previews for images',
    },
    onFileSelect: {action: 'file-select'},
    onFileDelete: {action: 'file-delete'},
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<DfFileListStoryArgs>;

export const Default: Story = {
  render: (args) => html`
    <div style="width: 500px;">
      <df-file-list
        .directory=${args.directory}
        .showDelete=${args.showDelete}
        .showPreviews=${args.showPreviews}
        @file-select=${(event: CustomEvent) => args.onFileSelect?.(event)}
        @file-delete=${(event: CustomEvent) => args.onFileDelete?.(event)}
      ></df-file-list>
    </div>
  `,
};

export const WithoutDelete: Story = {
  args: {
    showDelete: false,
  },
  render: (args) => html`
    <div style="width: 500px;">
      <h3 style="margin: 0 0 16px 0;">Read-Only File List</h3>
      <df-file-list
        .directory=${args.directory}
        .showDelete=${args.showDelete}
        .showPreviews=${args.showPreviews}
        @file-select=${(event: CustomEvent) => args.onFileSelect?.(event)}
        @file-delete=${(event: CustomEvent) => args.onFileDelete?.(event)}
      ></df-file-list>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'File list without delete buttons, suitable for read-only views.',
      },
    },
  },
};

export const WithoutPreviews: Story = {
  args: {
    showPreviews: false,
  },
  render: (args) => html`
    <div style="width: 500px;">
      <h3 style="margin: 0 0 16px 0;">File List with Icons Only</h3>
      <df-file-list
        .directory=${args.directory}
        .showDelete=${args.showDelete}
        .showPreviews=${args.showPreviews}
        @file-select=${(event: CustomEvent) => args.onFileSelect?.(event)}
        @file-delete=${(event: CustomEvent) => args.onFileDelete?.(event)}
      ></df-file-list>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'File list showing file type icons instead of image thumbnails.',
      },
    },
  },
};

export const DocumentsDirectory: Story = {
  args: {
    directory: 'uploads/documents',
    showPreviews: false,
  },
  render: (args) => html`
    <div style="width: 500px;">
      <h3 style="margin: 0 0 16px 0;">Documents Directory</h3>
      <df-file-list
        .directory=${args.directory}
        .showDelete=${args.showDelete}
        .showPreviews=${args.showPreviews}
        @file-select=${(event: CustomEvent) => args.onFileSelect?.(event)}
        @file-delete=${(event: CustomEvent) => args.onFileDelete?.(event)}
      ></df-file-list>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'File list for a documents directory, showing file type icons.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  render: (args) => html`
    <div style="display: flex; flex-direction: column; gap: 20px; max-width: 600px;">
      <div style="padding: 16px; background: #f5f5f5; border-radius: 8px;">
        <h3 style="margin: 0 0 12px 0;">Interactive File List Demo</h3>
        <p style="margin: 0; font-size: 14px; color: #666;">
          Click on a file to select it. Click delete to trigger the delete event.
        </p>
      </div>

      <df-file-list
        .directory=${args.directory}
        .showDelete=${args.showDelete}
        .showPreviews=${args.showPreviews}
        @file-select=${(event: CustomEvent) => {
          args.onFileSelect?.(event);
          const infoEl = document.querySelector('#file-info');
          if (infoEl) {
            const file = event.detail.file;
            infoEl.innerHTML = `
              <strong>File Selected:</strong><br>
              Name: ${file.name}<br>
              Size: ${(file.size / 1024).toFixed(2)} KB<br>
              Type: ${file.contentType}<br>
              Path: ${file.path}
            `;
          }
        }}
        @file-delete=${(event: CustomEvent) => {
          args.onFileDelete?.(event);
          const infoEl = document.querySelector('#file-info');
          if (infoEl) {
            const file = event.detail.file;
            infoEl.innerHTML = `
              <strong style="color: #b00020;">Delete Requested:</strong><br>
              File: ${file.name}<br>
              <em>In a real app, show confirmation dialog here</em>
            `;
          }
        }}
      ></df-file-list>

      <div
        id="file-info"
        style="padding: 12px; border: 1px solid #ccc; border-radius: 8px; background: #fff; font-family: monospace; font-size: 12px; min-height: 60px;"
      >
        <em>Select a file to see details...</em>
      </div>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo showing file selection and delete event handling.',
      },
    },
  },
};
