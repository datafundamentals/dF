/**
 * Pub Control Panel types
 * Used by the Pub Control Panel UI and state store
 */

export type PubControlPanelStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface PubSiteEntry {
  id: string;
  url?: string;
  description?: string;
  host?: string;
  status?: string[];
  purpose?: string;
  theme?: string;
  content?: string;
  contentRoot?: string;
  since?: string;
}

export interface PubControlPanelState {
  status: PubControlPanelStatus;
  sites: PubSiteEntry[];
  lastUpdated: number | null;
  errorMessage: string | null;
}
