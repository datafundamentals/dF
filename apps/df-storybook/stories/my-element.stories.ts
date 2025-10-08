import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';
import '@df/ui-lit/my-element';

type MyElementProps = {
  name: string;
  count: number;
};

const meta: Meta<MyElementProps> = {
  title: 'Components/My Element',
  component: 'my-element',
  tags: ['autodocs'],
  args: {
    name: 'World',
    count: 0,
  },
  argTypes: {
    name: {control: 'text'},
    count: {control: 'number'},
  },
};

export default meta;

type Story = StoryObj<MyElementProps>;

export const Default: Story = {
  render: (args) =>
    html`<my-element name=${args.name} .count=${args.count}></my-element>`,
};

export const Slotted: Story = {
  args: {
    name: 'Storybook',
  },
  render: (args) => html`
    <my-element name=${args.name}>
      <p>Custom slotted content</p>
    </my-element>
  `,
};
