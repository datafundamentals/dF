/**
 * Pub Control Panel store
 * Tracks sites list for the VS Code pub control panel extension
 */

import {computed, signal} from '@lit-labs/signals';
import type {PubControlPanelState, PubControlPanelStatus, PubSiteEntry} from '@df/types';

const statusSignal = signal<PubControlPanelStatus>('idle');
const sitesSignal = signal<PubSiteEntry[]>([]);
const lastUpdatedSignal = signal<number | null>(null);
const errorMessageSignal = signal<string | null>(null);

export const pubControlPanelState = computed<PubControlPanelState>(() => ({
  status: statusSignal.get(),
  sites: sitesSignal.get(),
  lastUpdated: lastUpdatedSignal.get(),
  errorMessage: errorMessageSignal.get(),
}));

export function setPubControlPanelLoading(): void {
  statusSignal.set('loading');
  errorMessageSignal.set(null);
}

export function setPubControlPanelSites(sites: PubSiteEntry[], lastUpdated?: number): void {
  sitesSignal.set(sites);
  statusSignal.set('ready');
  errorMessageSignal.set(null);
  lastUpdatedSignal.set(lastUpdated ?? Date.now());
}

export function setPubControlPanelError(message: string): void {
  statusSignal.set('error');
  errorMessageSignal.set(message);
  lastUpdatedSignal.set(Date.now());
}

export function resetPubControlPanelState(): void {
  statusSignal.set('idle');
  sitesSignal.set([]);
  lastUpdatedSignal.set(null);
  errorMessageSignal.set(null);
}
