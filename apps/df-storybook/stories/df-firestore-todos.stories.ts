import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';

import '@df/ui-lit/firebase';
import {
  __setTodoDemoFilters,
  __setTodoDemoState,
  todoCollectionState,
  todoFilterState,
} from '@df/state';
import type {TodoDocument, FirestoreCollectionState, TodoFilterState} from '@df/types';

const sampleTodo: TodoDocument = {
  id: 'demo-todo',
  title: 'Publish Storybook docs',
  description: 'Ensure Firestore UI components appear with knobs and usage notes.',
  completed: false,
  priority: 'medium',
  tags: ['storybook', 'docs'],
  createdAt: new Date('2025-09-26T09:30:00Z'),
  updatedAt: new Date('2025-09-26T09:30:00Z'),
  dueDate: new Date('2025-09-30T21:00:00Z'),
};

const demoState: FirestoreCollectionState<TodoDocument> = {
  status: 'ready',
  documents: [
    sampleTodo,
    {
      id: 'plan-firestore-demo',
      title: 'Plan Firestore CRUD walkthrough',
      description: 'Outline create, read, update, delete flows for the teaching app demo.',
      completed: false,
      priority: 'high',
      tags: ['teaching', 'planning'],
      createdAt: new Date('2025-09-18T14:30:00Z'),
      updatedAt: new Date('2025-09-18T14:30:00Z'),
      dueDate: new Date('2025-09-20T17:00:00Z'),
    },
    {
      id: 'review-accessibility',
      title: 'Review accessibility for todo list',
      description: 'Check keyboard navigation and ARIA labels for new components.',
      completed: true,
      priority: 'high',
      tags: ['a11y', 'review'],
      createdAt: new Date('2025-09-24T16:50:00Z'),
      updatedAt: new Date('2025-09-24T16:55:00Z'),
      dueDate: null,
    },
  ],
  error: null,
  isListening: false,
  lastUpdated: Date.now(),
  currentPage: 1,
  pageSize: 5,
  hasNextPage: false,
  hasPreviousPage: false,
  queryDescription: 'All todos (demo data)',
};

const demoFilters: TodoFilterState = {
  showCompleted: true,
  priority: 'all',
  tag: 'all',
  search: '',
};

const meta: Meta = {
  title: 'Firebase/Firestore Todos',
};

export default meta;

type Story = StoryObj;

export const ItemExample: Story = {
  render: () => html`<df-firestore-item .todo=${sampleTodo}></df-firestore-item>`,
};

export const FormCreate: Story = {
  render: () => html`<df-firestore-form mode="create"></df-firestore-form>`,
};

export const FormEdit: Story = {
  render: () => html`<df-firestore-form mode="edit" .todo=${sampleTodo}></df-firestore-form>`,
};

export const DeleteConfirm: Story = {
  render: () => html`
    <df-firestore-delete todoId="demo" todoTitle="Archive recordings"></df-firestore-delete>
  `,
};

export const ListDemo: Story = {
  render: () => {
    __setTodoDemoState(demoState);
    __setTodoDemoFilters(demoFilters);
    return html`<df-firestore-list></df-firestore-list>`;
  },
};
