/**
 * Dashboard store
 * Tracks sites list for the VS Code dashboard extension
 */

import {computed, signal} from '@lit-labs/signals';
import type {DashboardState, DashboardStatus, PubSiteEntry} from '@df/types';

const statusSignal = signal<DashboardStatus>('idle');
const sitesSignal = signal<PubSiteEntry[]>([]);
const lastUpdatedSignal = signal<number | null>(null);
const errorMessageSignal = signal<string | null>(null);

export const dashboardState = computed<DashboardState>(() => ({
  status: statusSignal.get(),
  sites: sitesSignal.get(),
  lastUpdated: lastUpdatedSignal.get(),
  errorMessage: errorMessageSignal.get(),
}));

export function setDashboardLoading(): void {
  statusSignal.set('loading');
  errorMessageSignal.set(null);
}

export function setDashboardSites(sites: PubSiteEntry[], lastUpdated?: number): void {
  sitesSignal.set(sites);
  statusSignal.set('ready');
  errorMessageSignal.set(null);
  lastUpdatedSignal.set(lastUpdated ?? Date.now());
}

export function setDashboardError(message: string): void {
  statusSignal.set('error');
  errorMessageSignal.set(message);
  lastUpdatedSignal.set(Date.now());
}

export function resetDashboardState(): void {
  statusSignal.set('idle');
  sitesSignal.set([]);
  lastUpdatedSignal.set(null);
  errorMessageSignal.set(null);
}
