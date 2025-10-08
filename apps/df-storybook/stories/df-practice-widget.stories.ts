import type {Meta, StoryObj} from '@storybook/web-components';
import {css, html, LitElement} from 'lit';
import {SignalWatcher} from '@lit-labs/signals';
import '@df/ui-lit/df-practice-widget';
import {practiceWidgetState, resetPracticeWidget} from '@df/state';
import type {PracticeTopic, PracticeWidgetState} from '@df/types';

const PANEL_TAG = 'df-practice-state-panel';

if (!customElements.get(PANEL_TAG)) {
  class PracticeStatePanel extends SignalWatcher(LitElement) {
    static override styles = css`
      :host {
        display: block;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.45);
        background: rgba(15, 23, 42, 0.9);
        color: #f8fafc;
        padding: 16px;
        font-family: 'Roboto Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
        white-space: pre-wrap;
        max-width: 520px;
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.25);
      }

      h3 {
        margin: 0 0 12px;
        font-size: 0.95rem;
        font-weight: 600;
        letter-spacing: 0.02em;
      }

      pre {
        margin: 0;
        font-size: 0.75rem;
        line-height: 1.4;
      }
    `;

    override render() {
      const snapshot: PracticeWidgetState = practiceWidgetState.get();
      return html`
        <h3>Store snapshot</h3>
        <pre>${JSON.stringify(snapshot, null, 2)}</pre>
      `;
    }
  }

  customElements.define(PANEL_TAG, PracticeStatePanel);
}

type PracticeArgs = {
  topic: PracticeTopic;
  autoRefresh: boolean;
  refreshInterval: number;
  onTopicChange?: (topic: PracticeTopic) => void;
};

const meta: Meta<PracticeArgs> = {
  title: 'Components/Practice Widget',
  component: 'df-practice-widget',
  parameters: {
    layout: 'centered',
  },
  args: {
    topic: 'web-components',
    autoRefresh: false,
    refreshInterval: 15000,
  },
  argTypes: {
    topic: {
      control: 'inline-radio',
      options: ['web-components', 'signals', 'monorepo'],
    },
    autoRefresh: {control: 'boolean'},
    refreshInterval: {control: 'number'},
    onTopicChange: {action: 'topic-change'},
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<PracticeArgs>;

const renderWidget = (args: PracticeArgs) => {
  resetPracticeWidget();
  return html`
    <df-practice-widget
      .topic=${args.topic}
      .autoRefresh=${args.autoRefresh}
      .refreshInterval=${args.refreshInterval}
      @df-practice-topic-change=${(event: CustomEvent<{topic: PracticeTopic}>) =>
        args.onTopicChange?.(event.detail.topic)}
    ></df-practice-widget>
  `;
};

export const Default: Story = {
  render: renderWidget,
};

export const AutoRefresh: Story = {
  args: {
    autoRefresh: true,
    refreshInterval: 8000,
  },
  render: renderWidget,
};

export const SignalsDeepDive: Story = {
  args: {
    topic: 'signals',
  },
  render: (args) => {
    resetPracticeWidget();
    return html`
      <div style="display: grid; gap: 24px; align-items: start; max-width: 960px;">
        <df-practice-widget
          .topic=${args.topic}
          .autoRefresh=${args.autoRefresh}
          .refreshInterval=${args.refreshInterval}
        ></df-practice-widget>
        <df-practice-state-panel></df-practice-state-panel>
      </div>
    `;
  },
};
