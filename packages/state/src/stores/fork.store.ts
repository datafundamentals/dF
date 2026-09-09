import {computed, signal} from '@lit-labs/signals';
import type {ForkConfig} from '@df/types';

const selectedIdSignal = signal<string | null>(null);

export const forkState = computed<ForkConfig>(() => ({
  selectedId: selectedIdSignal.get(),
}));

/**
 * Record the chosen door.
 *
 * Option ids live on the component as static configuration, so this store cannot know
 * which ids are legitimate and does not try to. It rejects only structurally invalid
 * input; the component is responsible for calling this with an id it actually rendered.
 */
export function selectFork(id: string) {
  if (typeof id !== 'string' || id.trim() === '') {
    return;
  }
  selectedIdSignal.set(id);
}

/** Return to the unchosen state, so the fork is presented again. */
export function resetFork() {
  selectedIdSignal.set(null);
}
