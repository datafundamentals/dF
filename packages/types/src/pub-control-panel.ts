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
  gitStatus?: {
    isInternal: boolean;
    hasUncommittedChanges: boolean;
    untrackedFiles: number;
    modifiedFiles: number;
  };
  contentChanges?: {
    hasChanges: boolean;
    changedFileCount: number;
  };
  contentGitStatus?: {
    isInternal: boolean;
    hasUncommittedChanges: boolean;
    untrackedFiles: number;
    modifiedFiles: number;
  };
  contentRootChanges?: {
    hasChanges: boolean;
    changedFileCount: number;
  };
  frontmatterStatus?: {
    hasMissingFrontmatter: boolean;
    missingFileCount: number;
  };
}

export interface PubControlPanelState {
  status: PubControlPanelStatus;
  sites: PubSiteEntry[];
  lastUpdated: number | null;
  errorMessage: string | null;
}
