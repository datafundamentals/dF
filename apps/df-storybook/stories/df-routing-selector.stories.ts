import type {Meta, StoryObj} from '@storybook/web-components';
import {css, html, LitElement} from 'lit';
import {SignalWatcher} from '@lit-labs/signals';
import '@df/ui-lit/df-routing-selector';
import {forkState, positionScaleState, resetFork, resetPositionScale} from '@df/state';
import type {
  ForkAnchors,
  ForkOption,
  RoutingSelectorChangeDetail,
} from '@df/types';

const PANEL_TAG = 'df-routing-selector-state-panel';

if (!customElements.get(PANEL_TAG)) {
  class RoutingSelectorStatePanel extends SignalWatcher(LitElement) {
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
      const snapshot = {
        fork: forkState.get(),
        scale: positionScaleState.get(),
      };
      return html`
        <h3>Store snapshot</h3>
        <pre>${JSON.stringify(snapshot, null, 2)}</pre>
      `;
    }
  }

  customElements.define(PANEL_TAG, RoutingSelectorStatePanel);
}

const DOORS: ForkOption[] = [
  {id: 'dev', label: 'dev', sublabel: 'here to build'},
  {id: 'business', label: 'business', sublabel: 'here to hire'},
];

const ANCHORS: Record<string, ForkAnchors> = {
  dev: {low: "still deciding if it's real", high: 'already building agents'},
  business: {low: 'still evaluating', high: 'ready to scope'},
};

type SelectorArgs = {
  options: ForkOption[];
  anchors: Record<string, ForkAnchors>;
  forkLabel: string;
  scaleLabel: string;
  changeLabel: string;
};

const meta: Meta<SelectorArgs> = {
  title: 'Components/Routing Selector',
  component: 'df-routing-selector',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Two-step self-placement. A visitor chooses a door, then places themselves on a five-stop
scale scoped to that door. **The steps are never shown together** — the second only
appears once the first is answered.

Anchors differ per door, because what the scale measures differs per door. The component
takes them as a map keyed by door id, so all visitor-facing copy stays with the caller.

Presentation only. Both halves of the answer live in \`@df/state\` and nothing is
persisted here. A consumer listens for the change event and decides what to do with the
result, including whether to navigate.

## Events
- \`df-routing-selector-change\`: a position was chosen within a door.
  Detail: \`{forkId, position, category}\` where \`category\` is e.g. \`dev-4\`

## Accessibility
- Both steps delegate to their child components, which use \`<md-radio>\` and
  \`<md-slider>\` respectively
- Returning to step one is an \`<md-text-button>\`, a tertiary action
        `,
      },
    },
  },
  args: {
    options: DOORS,
    anchors: ANCHORS,
    forkLabel: 'What brings you here?',
    scaleLabel: 'Where are you with this?',
    changeLabel: 'Change',
  },
  argTypes: {
    forkLabel: {control: 'text'},
    scaleLabel: {control: 'text'},
    changeLabel: {control: 'text'},
  },
};

export default meta;

const renderSelector = (args: SelectorArgs) => html`
  <df-routing-selector
    .options=${args.options}
    .anchors=${args.anchors}
    .forkLabel=${args.forkLabel}
    .scaleLabel=${args.scaleLabel}
    .changeLabel=${args.changeLabel}></df-routing-selector>
`;

const resetAll = () => {
  resetFork();
  resetPositionScale();
};

export const Default: StoryObj<SelectorArgs> = {
  render: (args) => {
    resetAll();
    return html`<div style="width: 480px;">${renderSelector(args)}</div>`;
  },
};

export const Interactive: StoryObj<SelectorArgs> = {
  name: 'Interactive: full two-step flow',
  render: (args) => {
    resetAll();
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<RoutingSelectorChangeDetail>).detail;
      const log = document.querySelector('#selector-log');
      if (log) {
        log.textContent = `df-routing-selector-change → category "${detail.category}" (door ${detail.forkId}, stop ${detail.position})`;
      }
    };
    return html`
      <div style="width: 480px;" @df-routing-selector-change=${onChange}>
        ${renderSelector(args)}
        <p
          id="selector-log"
          style="font-family: 'Roboto Mono', monospace; font-size: 0.75rem;">
          Choose a door, then move the handle
        </p>
        <df-routing-selector-state-panel></df-routing-selector-state-panel>
      </div>
    `;
  },
};

export const UnknownDoorAnchors: StoryObj<SelectorArgs> = {
  name: 'Edge case: door with no anchors',
  args: {anchors: {}},
  render: (args) => {
    resetAll();
    return html`<div style="width: 480px;">${renderSelector(args)}</div>`;
  },
  parameters: {
    docs: {
      description: {
        story:
          'A door with no anchor entry falls back to empty anchors rather than throwing. The scale still works and stays keyboard accessible, but the visitor has nothing to orient against — so callers are expected to supply anchors for every door.',
      },
    },
  },
};

export const NoOptions: StoryObj<SelectorArgs> = {
  name: 'Edge case: no options',
  args: {options: []},
  render: (args) => {
    resetAll();
    return html`<div style="width: 480px;">${renderSelector(args)}</div>`;
  },
  parameters: {
    docs: {
      description: {
        story:
          'With no doors configured the host renders nothing at all, rather than an empty step-one shell that looks broken.',
      },
    },
  },
};
