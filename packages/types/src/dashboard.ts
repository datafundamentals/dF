/**
 * Dashboard types
 * Used by the dashboard UI and state store
 */

export type DashboardStatus = 'idle' | 'loading' | 'ready' | 'error';

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
    pleaseReviewCount?: number;
    repairError?: string;
  };
}

export interface DashboardState {
  status: DashboardStatus;
  sites: PubSiteEntry[];
  lastUpdated: number | null;
  errorMessage: string | null;
  dfRepoStatus?: {
    isInternal: boolean;
    hasUncommittedChanges: boolean;
    untrackedFiles: number;
    modifiedFiles: number;
  };
}
