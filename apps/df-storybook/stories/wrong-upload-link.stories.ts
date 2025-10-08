import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';
import '@df/ui-lit/wrong-upload-link';
import type {UploadLinkChangeEvent} from '@df/types';

interface WrongUploadLinkStoryArgs {
  variant: 'compact' | 'full';
  label: string;
  onChange?: (event: UploadLinkChangeEvent) => void;
  onAdd?: (event: UploadLinkChangeEvent) => void;
}

const meta: Meta<WrongUploadLinkStoryArgs> = {
  title: 'Components/Wrong Upload Link',
  component: 'wrong-upload-link',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**DEPRECATED: This is the old upload link component that will be removed in the future.**

A presentation-only component for handling file uploads and URL links.
Built with Lit and signals following team standards for shareable web components.

## Features
- Upload files (images, videos, documents)
- Link to external URLs
- Real-time validation
- Progress indication
- Responsive design
- Material Design 3 styling

## Events
- \`wrong-upload-link-change\`: Fired when mode, URL, or validation state changes
- \`wrong-upload-link-add\`: Fired when user confirms adding a valid link

## Accessibility
- ARIA labels and roles for screen readers
- Keyboard navigation support
- Focus management
        `,
      },
    },
  },
  args: {
    variant: 'full',
    label: 'Wrong Upload Link',
  },
  argTypes: {
    variant: {
      control: 'radio',
      options: ['compact', 'full'],
      description: 'Visual variant of the component',
    },
    label: {
      control: 'text',
      description: 'Label text for the component',
    },
    onChange: {action: 'change'},
    onAdd: {action: 'add'},
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<WrongUploadLinkStoryArgs>;

export const Default: Story = {
  render: (args) => html`
    <wrong-upload-link
      .variant=${args.variant}
      .label=${args.label}
      @wrong-upload-link-change=${(event: CustomEvent<UploadLinkChangeEvent>) =>
        args.onChange?.(event.detail)}
      @wrong-upload-link-add=${(event: CustomEvent<UploadLinkChangeEvent>) =>
        args.onAdd?.(event.detail)}
    ></wrong-upload-link>
  `,
};

export const Compact: Story = {
  args: {
    variant: 'compact',
    label: 'Wrong Media',
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact variant suitable for forms and constrained spaces.',
      },
    },
  },
};

export const CustomLabel: Story = {
  args: {
    label: 'Wrong Upload Image or Video',
  },
  parameters: {
    docs: {
      description: {
        story: 'Component with custom label text.',
      },
    },
  },
};

export const WithInitialUrl: Story = {
  render: (args) => html`
    <wrong-upload-link
      .variant=${args.variant}
      .label=${args.label}
      @wrong-upload-link-change=${(event: CustomEvent<UploadLinkChangeEvent>) =>
        args.onChange?.(event.detail)}
      @wrong-upload-link-add=${(event: CustomEvent<UploadLinkChangeEvent>) =>
        args.onAdd?.(event.detail)}
    ></wrong-upload-link>
    <script>
      // Simulate initial URL state
      setTimeout(() => {
        const component = document.querySelector('wrong-upload-link');
        if (component) {
          // Trigger URL mode and set a sample URL
          component.dispatchEvent(new CustomEvent('wrong-upload-link-mode', {
            detail: { mode: 'url' }
          }));
        }
      }, 100);
    </script>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Component with pre-populated URL for testing validation.',
      },
    },
  },
};

export const InteractionExample: Story = {
  render: (args) => {
    let lastEvent: UploadLinkChangeEvent | null = null;

    return html`
      <div style="display: flex; flex-direction: column; gap: 20px; max-width: 500px;">
        <wrong-upload-link
          .variant=${args.variant}
          .label=${args.label}
          @wrong-upload-link-change=${(event: CustomEvent<UploadLinkChangeEvent>) => {
            lastEvent = event.detail;
            args.onChange?.(event.detail);

            // Update the info display
            const infoEl = document.querySelector('#event-info');
            if (infoEl) {
              infoEl.innerHTML = `
                <strong>Last Event:</strong><br>
                Mode: ${lastEvent.mode}<br>
                URL: ${lastEvent.linkUrl || '(empty)'}<br>
                Valid: ${lastEvent.isValid}
              `;
            }
          }}
          @wrong-upload-link-add=${(event: CustomEvent<UploadLinkChangeEvent>) => {
            args.onAdd?.(event.detail);

            // Update the add display
            const addEl = document.querySelector('#add-info');
            if (addEl) {
              addEl.innerHTML = `
                <strong>Added:</strong><br>
                Mode: ${event.detail.mode}<br>
                URL: ${event.detail.linkUrl}<br>
                Valid: ${event.detail.isValid}
              `;
            }
          }}
        ></wrong-upload-link>

        <div style="padding: 12px; border: 1px solid #ccc; border-radius: 8px; background: #f9f9f9;">
          <div id="event-info" style="font-family: monospace; font-size: 12px;">
            <em>No events yet</em>
          </div>
        </div>

        <div style="padding: 12px; border: 1px solid #ccc; border-radius: 8px; background: #f0f9ff;">
          <div id="add-info" style="font-family: monospace; font-size: 12px;">
            <em>Nothing added yet</em>
          </div>
        </div>
      </div>
    `;
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive example showing event handling and state changes.',
      },
    },
  },
};