import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';
import '@df/ui-lit/df-upload-link';
import type {ResourcePageType, UrlMediaType} from '@df/ui-lit/src/df-upload-link-types';

interface DfUploadLinkStoryArgs {
  resourceLinkType: UrlMediaType;
  resourcePageType: ResourcePageType;
  linkUrl: string;
  imageValid: boolean;
  onGatherUrl?: (event: CustomEvent) => void;
  onAllocate?: (event: CustomEvent) => void;
}

const meta: Meta<DfUploadLinkStoryArgs> = {
  title: 'Components/df Upload Link',
  component: 'df-upload-link',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Df Upload Link component - a fully functional upload and URL link component for handling various media types.
This is the main upload-link component that replaces the previous implementation.

## Features
- Resource-specific upload handling
- Segmented button interface (Close, Upload, Site, Add)
- Image validation and thumbnail preview
- Mock upload functionality with progress indication
- URL input with validation
- Material Design 3 styling

## Events
- \`upload-link-gather-url\`: Fired when a valid URL is detected or file is uploaded
- \`upload-link-allocate\`: Fired when user clicks the Add button

## Resource Types
- resourceLinkType: 'void' | 'image' | 'video' | 'document' | 'link'
- resourcePageType: 'void' | 'practice' | 'project' | 'resource' | 'blog'

## Note
This component uses mock stores for authentication and upload functionality.
In a real implementation, these would connect to actual backend services.
        `,
      },
    },
  },
  args: {
    resourceLinkType: 'image',
    resourcePageType: 'practice',
    linkUrl: '',
    imageValid: false,
  },
  argTypes: {
    resourceLinkType: {
      control: 'select',
      options: ['void', 'image', 'video', 'document', 'link'],
      description: 'Type of resource being uploaded/linked',
    },
    resourcePageType: {
      control: 'select',
      options: ['void', 'practice', 'project', 'resource', 'blog'],
      description: 'Page context where the component is used',
    },
    linkUrl: {
      control: 'text',
      description: 'Initial URL value',
    },
    imageValid: {
      control: 'boolean',
      description: 'Whether the current URL points to a valid image',
    },
    onGatherUrl: {action: 'upload-link-gather-url'},
    onAllocate: {action: 'upload-link-allocate'},
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<DfUploadLinkStoryArgs>;

export const Default: Story = {
  render: (args) => html`
    <df-upload-link
      .resourceLinkType=${args.resourceLinkType}
      .resourcePageType=${args.resourcePageType}
      .linkUrl=${args.linkUrl}
      .imageValid=${args.imageValid}
      @upload-link-gather-url=${(event: CustomEvent) => args.onGatherUrl?.(event)}
      @upload-link-allocate=${(event: CustomEvent) => args.onAllocate?.(event)}
    ></df-upload-link>
  `,
};

export const ImageUpload: Story = {
  args: {
    resourceLinkType: 'image',
    resourcePageType: 'practice',
  },
  render: (args) => html`
    <df-upload-link
      .resourceLinkType=${args.resourceLinkType}
      .resourcePageType=${args.resourcePageType}
      .linkUrl=${args.linkUrl}
      .imageValid=${args.imageValid}
      @upload-link-gather-url=${(event: CustomEvent) => args.onGatherUrl?.(event)}
      @upload-link-allocate=${(event: CustomEvent) => args.onAllocate?.(event)}
    ></df-upload-link>
    <script>
      // Directly set the component to show Upload mode
      setTimeout(() => {
        const component = document.querySelector('df-upload-link');
        if (component) {
          // Set upload mode state directly
          component.showContent = true;
          component.showUploader = true;
          component.showUrlContainer = false;
          component.showLinkInput = false;
          component.requestUpdate();
        }
      }, 100);
    </script>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Configuration for uploading images to a practice page. Shows the file upload interface.',
      },
    },
  },
};

export const VideoUpload: Story = {
  args: {
    resourceLinkType: 'video',
    resourcePageType: 'project',
  },
  render: (args) => html`
    <df-upload-link
      .resourceLinkType=${args.resourceLinkType}
      .resourcePageType=${args.resourcePageType}
      .linkUrl=${args.linkUrl}
      .imageValid=${args.imageValid}
      @upload-link-gather-url=${(event: CustomEvent) => args.onGatherUrl?.(event)}
      @upload-link-allocate=${(event: CustomEvent) => args.onAllocate?.(event)}
    ></df-upload-link>
    <script>
      // Directly set the component to show URL input mode (like triggerLink)
      setTimeout(() => {
        const component = document.querySelector('df-upload-link');
        if (component) {
          // Set URL input mode state directly
          component.showUrlContainer = true;
          component.showUploader = false;
          component.showContent = true;
          component.showLinkInput = true;
          component.requestUpdate();
        }
      }, 100);
    </script>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Configuration for uploading videos to a project page. Shows the URL input interface.',
      },
    },
  },
};

export const DocumentUpload: Story = {
  args: {
    resourceLinkType: 'document',
    resourcePageType: 'resource',
  },
  render: (args) => html`
    <df-upload-link
      .resourceLinkType=${args.resourceLinkType}
      .resourcePageType=${args.resourcePageType}
      .linkUrl=${args.linkUrl}
      .imageValid=${args.imageValid}
      @upload-link-gather-url=${(event: CustomEvent) => args.onGatherUrl?.(event)}
      @upload-link-allocate=${(event: CustomEvent) => args.onAllocate?.(event)}
    ></df-upload-link>
    <script>
      // Directly set the component to show Upload mode (like triggerUpload)
      setTimeout(() => {
        const component = document.querySelector('df-upload-link');
        if (component) {
          // Set upload mode state directly
          component.showContent = true;
          component.showUploader = true;
          component.showUrlContainer = false;
          component.showLinkInput = false;
          component.requestUpdate();
        }
      }, 100);
    </script>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Configuration for uploading documents to a resource page. Shows the file upload interface.',
      },
    },
  },
};

export const WithPresetUrl: Story = {
  args: {
    resourceLinkType: 'image',
    resourcePageType: 'blog',
    linkUrl: 'https://picsum.photos/400/300',
    imageValid: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Component with a preset valid image URL for testing validation.',
      },
    },
  },
};

export const Interactive: Story = {
  render: (args) => {
    return html`
      <div style="display: flex; flex-direction: column; gap: 20px; max-width: 600px;">
        <df-upload-link
          .resourceLinkType=${args.resourceLinkType}
          .resourcePageType=${args.resourcePageType}
          .linkUrl=${args.linkUrl}
          .imageValid=${args.imageValid}
          @upload-link-gather-url=${(event: CustomEvent) => {
            args.onGatherUrl?.(event);

            // Update the info display
            const infoEl = document.querySelector('#gather-info');
            if (infoEl) {
              infoEl.innerHTML = `
                <strong>URL Gathered:</strong><br>
                URL: ${event.detail.linkUrl}<br>
                Type: ${args.resourceLinkType}<br>
                Page: ${args.resourcePageType}
              `;
            }
          }}
          @upload-link-allocate=${(event: CustomEvent) => {
            args.onAllocate?.(event);

            // Update the allocate display
            const allocateEl = document.querySelector('#allocate-info');
            if (allocateEl) {
              allocateEl.innerHTML = `
                <strong>Link Allocated:</strong><br>
                URL: ${event.detail.linkUrl}<br>
                Ready for use in ${args.resourcePageType} page
              `;
            }
          }}
        ></df-upload-link>

        <div style="padding: 12px; border: 1px solid #ccc; border-radius: 8px; background: #f9f9f9;">
          <div id="gather-info" style="font-family: monospace; font-size: 12px;">
            <em>No URL gathered yet - try uploading a file or entering a URL</em>
          </div>
        </div>

        <div style="padding: 12px; border: 1px solid #ccc; border-radius: 8px; background: #f0f9ff;">
          <div id="allocate-info" style="font-family: monospace; font-size: 12px;">
            <em>No link allocated yet - click the Add button after gathering a URL</em>
          </div>
        </div>

        <div style="padding: 12px; border: 1px solid #fffbf0; border-radius: 8px; background: #fffbf0;">
          <h4 style="margin: 0 0 8px 0; color: #b45309;">How to test:</h4>
          <ol style="margin: 0; padding-left: 20px; font-size: 12px; color: #92400e;">
            <li>Select "Upload" to choose a file (mock upload will generate a URL)</li>
            <li>Select "Site" to enter a URL manually (try: https://picsum.photos/400/300)</li>
            <li>Once a valid URL is detected, click "Add" to allocate the link</li>
            <li>Watch the event information update below</li>
          </ol>
        </div>
      </div>
    `;
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive example showing the complete workflow and event handling.',
      },
    },
  },
};

export const AllResourceTypes: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; max-width: 1200px;">
      ${['image', 'video', 'document', 'link'].map(type => html`
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
          <h3 style="margin: 0 0 12px 0; color: #374151; font-size: 14px; text-transform: capitalize;">
            ${type} Upload
          </h3>
          <df-upload-link
            .resourceLinkType=${type as UrlMediaType}
            resourcePageType="practice"
          ></df-upload-link>
        </div>
      `)}
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Shows all resource types side by side for comparison.',
      },
    },
  },
};