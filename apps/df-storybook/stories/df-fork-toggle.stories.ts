import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';
import '@df/ui-lit/df-fork-toggle';
import {resetFork} from '@df/state';
import type {ForkChangeDetail, ForkOption} from '@df/types';

const DOORS: ForkOption[] = [
  {id: 'dev', label: 'dev', sublabel: 'here to build'},
  {id: 'business', label: 'business', sublabel: 'here to hire'},
];

type ForkArgs = {
  options: ForkOption[];
  label: string;
  disabled: boolean;
};

const meta: Meta<ForkArgs> = {
  title: 'Components/Fork Toggle',
  component: 'df-fork-toggle',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
An exclusive choice between a small number of doors, each with a label and a supporting
line.

**Nothing is selected initially, on purpose.** A pre-selected door would nudge, and the
whole point of the fork is to let the visitor declare which one they are.

Option ids are opaque to the component and echoed back verbatim, so no consuming site's
vocabulary lands in \`@df/ui-lit\`.

Presentation only — the choice lives in \`@df/state\` and the component persists nothing.
Built on \`<md-radio>\`; no standards exemption is claimed.

## Events
- \`df-fork-toggle-change\`: a door was chosen. Detail: \`{id}\`

## Accessibility
- The group carries \`role="radiogroup"\` with an accessible name from \`label\`
- Each door is a real \`<md-radio>\` inside a \`<label>\`, so the whole card is a hit
  target and keyboard interaction comes from the platform
        `,
      },
    },
  },
  args: {
    options: DOORS,
    label: 'What brings you here?',
    disabled: false,
  },
  argTypes: {
    label: {control: 'text'},
    disabled: {control: 'boolean'},
  },
};

export default meta;

const renderFork = (args: ForkArgs) => html`
  <div style="width: 460px;">
    <df-fork-toggle
      .options=${args.options}
      .label=${args.label}
      ?disabled=${args.disabled}></df-fork-toggle>
  </div>
`;

export const Default: StoryObj<ForkArgs> = {
  render: (args) => {
    resetFork();
    return renderFork(args);
  },
};

export const Interactive: StoryObj<ForkArgs> = {
  render: (args) => {
    resetFork();
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<ForkChangeDetail>).detail;
      const log = document.querySelector('#fork-log');
      if (log) {
        log.textContent = `df-fork-toggle-change → id "${detail.id}"`;
      }
    };
    return html`
      <div style="width: 460px;" @df-fork-toggle-change=${onChange}>
        ${renderFork(args)}
        <p id="fork-log" style="font-family: 'Roboto Mono', monospace; font-size: 0.75rem;">
          Choose a door to emit an event
        </p>
      </div>
    `;
  },
};

export const Disabled: StoryObj<ForkArgs> = {
  args: {disabled: true},
  render: (args) => {
    resetFork();
    return renderFork(args);
  },
};

export const ThreeDoors: StoryObj<ForkArgs> = {
  name: 'Variant: three doors',
  args: {
    options: [
      ...DOORS,
      {id: 'press', label: 'press', sublabel: 'here to ask questions'},
    ],
  },
  render: (args) => {
    resetFork();
    return renderFork(args);
  },
  parameters: {
    docs: {
      description: {
        story:
          'The component is not limited to two doors. Doors wrap rather than compress, so a third is legible at the same width.',
      },
    },
  },
};

export const NoOptions: StoryObj<ForkArgs> = {
  name: 'Edge case: no options',
  args: {options: []},
  render: (args) => {
    resetFork();
    return renderFork(args);
  },
  parameters: {
    docs: {
      description: {
        story:
          'With no options the group renders empty rather than throwing. A caller supplying nothing gets nothing, which is easier to diagnose than a crash.',
      },
    },
  },
};
