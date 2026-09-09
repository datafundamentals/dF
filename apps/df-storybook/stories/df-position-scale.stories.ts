import type {Meta, StoryObj} from '@storybook/web-components';
import {css, html, LitElement} from 'lit';
import {SignalWatcher} from '@lit-labs/signals';
import '@df/ui-lit/df-position-scale';
import {positionScaleState, resetPositionScale} from '@df/state';
import type {PositionScaleChangeDetail} from '@df/types';

const PANEL_TAG = 'df-position-scale-state-panel';

if (!customElements.get(PANEL_TAG)) {
  class PositionScaleStatePanel extends SignalWatcher(LitElement) {
    static override styles = css`
      :host {
        display: block;
        margin-top: 16px;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.45);
        background: rgba(15, 23, 42, 0.9);
        color: #f8fafc;
        padding: 16px;
        font-family: 'Roboto Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
        max-width: 520px;
      }

      h3 {
        margin: 0 0 12px;
        font-size: 0.95rem;
        font-weight: 600;
      }

      pre {
        margin: 0;
        font-size: 0.75rem;
        line-height: 1.4;
      }
    `;

    override render() {
      return html`
        <h3>Store snapshot</h3>
        <pre>${JSON.stringify(positionScaleState.get(), null, 2)}</pre>
      `;
    }
  }

  customElements.define(PANEL_TAG, PositionScaleStatePanel);
}

type PositionScaleArgs = {
  anchorLow: string;
  anchorHigh: string;
  label: string;
  scaleWords: string[];
  disabled: boolean;
};

const meta: Meta<PositionScaleArgs> = {
  title: 'Components/Position Scale',
  component: 'df-position-scale',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A five-stop scale on which a visitor places themselves. Only stops 2 and 4 carry
visible labels.

The unnamed stops are a design requirement, not an omission. Labelling the extremes
forces a self-report that people resist or game, so the poles and the midpoint are
left for the reader to define privately.

Presentation only — the current value lives in \`@df/state\` and the component
persists nothing. Built on \`<md-slider>\`; no standards exemption is claimed.

## Events
- \`df-position-scale-change\`: a stop was chosen. Detail: \`{value}\`

## Accessibility
- Renders an MD3 slider, so keyboard interaction (arrows, Home, End) comes from the
  platform rather than being hand-rolled
- \`aria-label\` names the control; \`aria-valuetext\` announces the anchor label at
  stops 2 and 4 and the \`scaleWords\` orientation at the unnamed stops, so a screen
  reader receives the same information a sighted user gets from the handle's position
- \`scaleWords\` is a property rather than hard-coded text, so callers keep visitor-facing
  copy in one place
        `,
      },
    },
  },
  args: {
    anchorLow: 'still evaluating',
    anchorHigh: 'ready to scope',
    label: 'Where are you with this?',
    scaleWords: ['least', 'middle', 'most'],
    disabled: false,
  },
  argTypes: {
    anchorLow: {control: 'text', description: 'Visible label for stop 2'},
    anchorHigh: {control: 'text', description: 'Visible label for stop 4'},
    label: {control: 'text', description: 'Accessible name for the control'},
    disabled: {control: 'boolean'},
  },
};

export default meta;

const renderScale = (args: PositionScaleArgs) => html`
  <div style="width: 420px;">
    <df-position-scale
      .anchorLow=${args.anchorLow}
      .anchorHigh=${args.anchorHigh}
      .label=${args.label}
      .scaleWords=${args.scaleWords}
      ?disabled=${args.disabled}></df-position-scale>
  </div>
`;

export const Default: StoryObj<PositionScaleArgs> = {
  render: (args) => {
    resetPositionScale();
    return renderScale(args);
  },
};

export const Interactive: StoryObj<PositionScaleArgs> = {
  render: (args) => {
    resetPositionScale();
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<PositionScaleChangeDetail>).detail;
      const log = document.querySelector('#position-scale-log');
      if (log) {
        log.textContent = `df-position-scale-change → value ${detail.value}`;
      }
    };
    return html`
      <div style="width: 420px;" @df-position-scale-change=${onChange}>
        ${renderScale(args)}
        <p
          id="position-scale-log"
          style="font-family: 'Roboto Mono', monospace; font-size: 0.75rem;">
          Move the handle to emit an event
        </p>
        <df-position-scale-state-panel></df-position-scale-state-panel>
      </div>
    `;
  },
};

export const Disabled: StoryObj<PositionScaleArgs> = {
  args: {disabled: true},
  render: (args) => {
    resetPositionScale();
    return renderScale(args);
  },
};

export const NoAnchorLabels: StoryObj<PositionScaleArgs> = {
  name: 'Edge case: no anchor labels',
  args: {anchorLow: '', anchorHigh: ''},
  render: (args) => {
    resetPositionScale();
    return renderScale(args);
  },
  parameters: {
    docs: {
      description: {
        story:
          'With both anchors empty the scale still functions and stays keyboard accessible, but a visitor has nothing to orient against. Callers are expected to supply anchors.',
      },
    },
  },
};
