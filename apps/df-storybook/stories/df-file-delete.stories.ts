import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';
import '@df/ui-lit/firebase';
import type {StorageFileMetadata} from '@df/types';

interface DfFileDeleteStoryArgs {
  file: StorageFileMetadata | null;
  showButton: boolean;
  buttonLabel: string;
  onDeleteConfirm?: (event: CustomEvent) => void;
  onDeleteCancel?: (event: CustomEvent) => void;
  onDeleteComplete?: (event: CustomEvent) => void;
  onDeleteError?: (event: CustomEvent) => void;
}

// Mock file metadata for stories
const mockImageFile: StorageFileMetadata = {
  name: 'vacation-photo.jpg',
  path: 'uploads/images/vacation-photo.jpg',
  downloadUrl: 'https://picsum.photos/200/200',
  size: 358400, // 350 KB
  contentType: 'image/jpeg',
  uploadedAt: new Date('2025-01-10T14:30:00'),
};

const mockDocumentFile: StorageFileMetadata = {
  name: 'important-contract.pdf',
  path: 'uploads/documents/important-contract.pdf',
  downloadUrl: '#',
  size: 524288, // 512 KB
  contentType: 'application/pdf',
  uploadedAt: new Date('2025-01-08T09:15:00'),
};

const mockVideoFile: StorageFileMetadata = {
  name: 'presentation-recording.mp4',
  path: 'uploads/videos/presentation-recording.mp4',
  downloadUrl: '#',
  size: 15728640, // 15 MB
  contentType: 'video/mp4',
  uploadedAt: new Date('2025-01-05T16:45:00'),
};

const meta: Meta<DfFileDeleteStoryArgs> = {
  title: 'Firebase/Storage/df-file-delete',
  component: 'df-file-delete',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Firebase Storage File Delete Component

Provides a confirmation dialog before deleting files from Firebase Storage.

## Features
- **Confirmation dialog** before deletion
- **File metadata display** (name, path, size, type)
- **Warning message** about permanent deletion
- **Material Design 3** styled dialog
- **Loading state** during deletion
- **Error handling** with user feedback
- **Inline button option** for triggering delete
- **Event-driven architecture** for flexible integration

## Usage

\`\`\`typescript
import '@df/ui-lit/firebase';

// With inline button
<df-file-delete
  .file=\${fileMetadata}
  @delete-complete=\${handleDeleteComplete}
  @delete-error=\${handleDeleteError}
></df-file-delete>

// Dialog-only (triggered programmatically)
<df-file-delete
  .file=\${fileMetadata}
  .showButton=\${false}
  @delete-confirm=\${handleDeleteConfirm}
  @delete-cancel=\${handleDeleteCancel}
></df-file-delete>

// Programmatic control
const deleteComponent = document.querySelector('df-file-delete');
deleteComponent.open();  // Show dialog
deleteComponent.close(); // Hide dialog
\`\`\`

## Events
- \`delete-confirm\`: Fired when user confirms deletion (before actual delete)
- \`delete-cancel\`: Fired when user cancels deletion
- \`delete-complete\`: Fired when deletion succeeds (detail: {file})
- \`delete-error\`: Fired when deletion fails (detail: {file, error})

## Props
- \`file\`: File metadata object to delete (required)
- \`showButton\`: Show inline delete button (default: true)
- \`buttonLabel\`: Button label text (default: 'Delete')

## Public Methods
- \`open()\`: Show the confirmation dialog
- \`close()\`: Hide the confirmation dialog
        `,
      },
    },
  },
  args: {
    file: mockImageFile,
    showButton: true,
    buttonLabel: 'Delete',
  },
  argTypes: {
    file: {
      control: 'object',
      description: 'File metadata to delete',
    },
    showButton: {
      control: 'boolean',
      description: 'Show inline delete button',
    },
    buttonLabel: {
      control: 'text',
      description: 'Button label text',
    },
    onDeleteConfirm: {action: 'delete-confirm'},
    onDeleteCancel: {action: 'delete-cancel'},
    onDeleteComplete: {action: 'delete-complete'},
    onDeleteError: {action: 'delete-error'},
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<DfFileDeleteStoryArgs>;

export const Default: Story = {
  render: (args) => html`
    <div style="width: 400px; padding: 20px;">
      <df-file-delete
        .file=${args.file}
        .showButton=${args.showButton}
        .buttonLabel=${args.buttonLabel}
        @delete-confirm=${(event: CustomEvent) => args.onDeleteConfirm?.(event)}
        @delete-cancel=${(event: CustomEvent) => args.onDeleteCancel?.(event)}
        @delete-complete=${(event: CustomEvent) => args.onDeleteComplete?.(event)}
        @delete-error=${(event: CustomEvent) => args.onDeleteError?.(event)}
      ></df-file-delete>
    </div>
  `,
};

export const InlineButton: Story = {
  args: {
    file: mockImageFile,
    showButton: true,
    buttonLabel: 'Remove File',
  },
  render: (args) => html`
    <div style="width: 400px; padding: 20px;">
      <h3 style="margin: 0 0 16px 0;">Delete Button Inline</h3>
      <p style="margin: 0 0 12px 0; color: #666; font-size: 14px;">
        Click the button to trigger the delete confirmation dialog.
      </p>
      <df-file-delete
        .file=${args.file}
        .showButton=${args.showButton}
        .buttonLabel=${args.buttonLabel}
        @delete-confirm=${(event: CustomEvent) => args.onDeleteConfirm?.(event)}
        @delete-cancel=${(event: CustomEvent) => args.onDeleteCancel?.(event)}
        @delete-complete=${(event: CustomEvent) => args.onDeleteComplete?.(event)}
        @delete-error=${(event: CustomEvent) => args.onDeleteError?.(event)}
      ></df-file-delete>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Component with visible inline button for triggering delete confirmation.',
      },
    },
  },
};

export const DocumentFile: Story = {
  args: {
    file: mockDocumentFile,
    buttonLabel: 'Delete Document',
  },
  render: (args) => html`
    <div style="width: 400px; padding: 20px;">
      <h3 style="margin: 0 0 16px 0;">Delete Document</h3>
      <div
        style="display: flex; align-items: center; gap: 12px; padding: 12px; background: #f5f5f5; border-radius: 8px; margin-bottom: 12px;"
      >
        <md-icon style="color: #b00020;">picture_as_pdf</md-icon>
        <div style="flex: 1;">
          <div style="font-weight: 500;">${args.file?.name}</div>
          <div style="font-size: 12px; color: #666;">
            ${args.file ? (args.file.size / 1024).toFixed(0) : 0} KB
          </div>
        </div>
      </div>
      <df-file-delete
        .file=${args.file}
        .showButton=${args.showButton}
        .buttonLabel=${args.buttonLabel}
        @delete-confirm=${(event: CustomEvent) => args.onDeleteConfirm?.(event)}
        @delete-cancel=${(event: CustomEvent) => args.onDeleteCancel?.(event)}
        @delete-complete=${(event: CustomEvent) => args.onDeleteComplete?.(event)}
        @delete-error=${(event: CustomEvent) => args.onDeleteError?.(event)}
      ></df-file-delete>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Delete confirmation for a PDF document file with custom button label.',
      },
    },
  },
};

export const VideoFile: Story = {
  args: {
    file: mockVideoFile,
    buttonLabel: 'Delete Video',
  },
  render: (args) => html`
    <div style="width: 400px; padding: 20px;">
      <h3 style="margin: 0 0 16px 0;">Delete Video File</h3>
      <div
        style="display: flex; align-items: center; gap: 12px; padding: 12px; background: #f5f5f5; border-radius: 8px; margin-bottom: 12px;"
      >
        <md-icon style="color: #b00020;">movie</md-icon>
        <div style="flex: 1;">
          <div style="font-weight: 500;">${args.file?.name}</div>
          <div style="font-size: 12px; color: #666;">
            ${args.file ? (args.file.size / (1024 * 1024)).toFixed(1) : 0} MB
          </div>
        </div>
      </div>
      <df-file-delete
        .file=${args.file}
        .showButton=${args.showButton}
        .buttonLabel=${args.buttonLabel}
        @delete-confirm=${(event: CustomEvent) => args.onDeleteConfirm?.(event)}
        @delete-cancel=${(event: CustomEvent) => args.onDeleteCancel?.(event)}
        @delete-complete=${(event: CustomEvent) => args.onDeleteComplete?.(event)}
        @delete-error=${(event: CustomEvent) => args.onDeleteError?.(event)}
      ></df-file-delete>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Delete confirmation for a large video file, showing appropriate size formatting.',
      },
    },
  },
};

export const DialogOnly: Story = {
  args: {
    file: mockImageFile,
    showButton: false,
  },
  render: (args) => html`
    <div style="width: 400px; padding: 20px;">
      <h3 style="margin: 0 0 16px 0;">Dialog-Only Mode</h3>
      <p style="margin: 0 0 12px 0; color: #666; font-size: 14px;">
        Component without inline button. Dialog must be triggered programmatically.
      </p>
      <md-filled-button
        @click=${() => {
          const deleteComponent = document.querySelector('df-file-delete');
          if (deleteComponent) {
            deleteComponent.open();
          }
        }}
      >
        <md-icon slot="icon">delete</md-icon>
        Trigger Delete Dialog
      </md-filled-button>
      <df-file-delete
        .file=${args.file}
        .showButton=${args.showButton}
        @delete-confirm=${(event: CustomEvent) => args.onDeleteConfirm?.(event)}
        @delete-cancel=${(event: CustomEvent) => args.onDeleteCancel?.(event)}
        @delete-complete=${(event: CustomEvent) => args.onDeleteComplete?.(event)}
        @delete-error=${(event: CustomEvent) => args.onDeleteError?.(event)}
      ></df-file-delete>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story:
          'Component in dialog-only mode (showButton=false). Use the public open() method to trigger the dialog programmatically.',
      },
    },
  },
};

export const EmptyState: Story = {
  args: {
    file: null,
  },
  render: (args) => html`
    <div style="width: 400px; padding: 20px;">
      <h3 style="margin: 0 0 16px 0;">Empty State (No File)</h3>
      <p style="margin: 0 0 12px 0; color: #666; font-size: 14px;">
        Component with no file provided. Dialog will show error message.
      </p>
      <df-file-delete
        .file=${args.file}
        .showButton=${args.showButton}
        .buttonLabel=${args.buttonLabel}
        @delete-confirm=${(event: CustomEvent) => args.onDeleteConfirm?.(event)}
        @delete-cancel=${(event: CustomEvent) => args.onDeleteCancel?.(event)}
        @delete-complete=${(event: CustomEvent) => args.onDeleteComplete?.(event)}
        @delete-error=${(event: CustomEvent) => args.onDeleteError?.(event)}
      ></df-file-delete>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Empty state shown when no file is provided to the delete component.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  render: (args) => html`
    <div style="display: flex; flex-direction: column; gap: 20px; max-width: 600px;">
      <div style="padding: 16px; background: #f5f5f5; border-radius: 8px;">
        <h3 style="margin: 0 0 12px 0;">Interactive File Delete Demo</h3>
        <p style="margin: 0; font-size: 14px; color: #666;">
          Click delete to open confirmation dialog. This demo simulates the delete workflow with event
          logging.
        </p>
      </div>

      <div
        style="display: flex; align-items: center; gap: 12px; padding: 16px; background: white; border: 1px solid #ccc; border-radius: 8px;"
      >
        <div
          style="width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; background: #f5f5f5; border-radius: 8px;"
        >
          <md-icon style="font-size: 32px; color: #5f9ea0;">image</md-icon>
        </div>
        <div style="flex: 1;">
          <div style="font-weight: 500; margin-bottom: 4px;">${mockImageFile.name}</div>
          <div style="font-size: 14px; color: #666;">
            ${(mockImageFile.size / 1024).toFixed(0)} KB •
            ${new Intl.DateTimeFormat('en-US', {month: 'short', day: 'numeric'}).format(
              mockImageFile.uploadedAt
            )}
          </div>
        </div>
        <df-file-delete
          .file=${mockImageFile}
          .showButton=${true}
          .buttonLabel=${'Delete'}
          @delete-confirm=${(event: CustomEvent) => {
            args.onDeleteConfirm?.(event);
            const infoEl = document.querySelector('#delete-info');
            if (infoEl) {
              infoEl.innerHTML = `
                <strong>Delete Confirmed</strong><br>
                File: ${event.detail.file.name}<br>
                <em>Now processing deletion...</em>
              `;
            }
          }}
          @delete-cancel=${(event: CustomEvent) => {
            args.onDeleteCancel?.(event);
            const infoEl = document.querySelector('#delete-info');
            if (infoEl) {
              infoEl.innerHTML = `
                <strong>Delete Cancelled</strong><br>
                <em>User cancelled the deletion</em>
              `;
            }
          }}
          @delete-complete=${(event: CustomEvent) => {
            args.onDeleteComplete?.(event);
            const infoEl = document.querySelector('#delete-info');
            if (infoEl) {
              infoEl.innerHTML = `
                <strong style="color: #2e7d32;">Delete Complete!</strong><br>
                File: ${event.detail.file.name}<br>
                <em>File has been successfully deleted from storage</em>
              `;
            }
          }}
          @delete-error=${(event: CustomEvent) => {
            args.onDeleteError?.(event);
            const infoEl = document.querySelector('#delete-info');
            if (infoEl) {
              infoEl.innerHTML = `
                <strong style="color: #b00020;">Delete Failed!</strong><br>
                File: ${event.detail.file.name}<br>
                Error: ${event.detail.error}<br>
                <em>Please try again or contact support</em>
              `;
            }
          }}
        ></df-file-delete>
      </div>

      <div
        id="delete-info"
        style="padding: 12px; border: 1px solid #ccc; border-radius: 8px; background: #fff; font-family: monospace; font-size: 12px; min-height: 80px;"
      >
        <em>Click delete button to start the workflow...</em>
      </div>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story:
          'Interactive demo showing the complete delete workflow with event handling and UI feedback.',
      },
    },
  },
};
