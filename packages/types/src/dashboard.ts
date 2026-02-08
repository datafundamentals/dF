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
  apps?: string[];
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
  /** Deploy status for each app assigned to this site */
  appDeployStatus?: AppDeployStatus[];
}

export interface AppEntry {
  name: string;
  version: string;
  releaseDate: string;
  appChanges?: {
    hasChanges: boolean;
    changedFileCount: number;
  };
  /** YYMMDDHHMM tag from .bundle-manifest.json, if bundle exists */
  bundleTag?: string;
}

/** Deploy status for a single app on a single site */
export interface AppDeployStatus {
  appName: string;
  /** The bundle tag available in the app's dist/bundle */
  bundleTag?: string;
  /** The deployed tag from the site's .deploy-manifest.json */
  deployedTag?: string;
  /** True if bundleTag > deployedTag (newer bundle available) */
  needsDeploy: boolean;
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
  apps?: AppEntry[];
}
