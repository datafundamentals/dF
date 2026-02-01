/**
 * YAML parsing and site management utilities
 * Pure business logic - no VS Code dependencies
 */

import * as fs from 'fs';
import * as yaml from 'js-yaml';
import type {PubSiteEntry} from '@df/types';
import * as path from 'path';
import {getGitStatus, getGitStatusForSubdir} from './git-status.js';
import {getContentChanges} from './content-changes.js';
import {checkFrontmatter} from './frontmatter-check.js';

interface SiteConfig {
  ignore?: boolean;
  url?: unknown;
  description?: unknown;
  host?: unknown;
  status?: unknown;
  purpose?: unknown;
  theme?: unknown;
  content?: unknown;
  contentRoot?: unknown;
  since?: unknown;
  [key: string]: unknown;
}

interface SitesYaml {
  sites?: Record<string, SiteConfig>;
}

export interface LoadSitesOptions {
  sitesYamlPath: string;
  sitesDirectory: string;
  onWarning?: (message: string) => void;
}

export interface LoadSitesResult {
  sites: PubSiteEntry[];
  errorMessage?: string;
}

/**
 * Load and parse SITES.yaml with git status enrichment
 * @param options Configuration for loading sites
 * @returns Site entries with git status
 */
export async function loadSites(options: LoadSitesOptions): Promise<LoadSitesResult> {
  const {sitesYamlPath, sitesDirectory, onWarning} = options;

  try {
    if (!fs.existsSync(sitesYamlPath)) {
      return {sites: [], errorMessage: `SITES.yaml not found at ${sitesYamlPath}`};
    }

    const fileContent = fs.readFileSync(sitesYamlPath, 'utf8');
    const parsed = yaml.load(fileContent) as SitesYaml | undefined;

    if (!parsed?.sites) {
      return {sites: [], errorMessage: 'Invalid SITES.yaml structure.'};
    }

    const siteEntries = Object.entries(parsed.sites)
      .filter(([, site]) => !site?.ignore)
      .map(([id, site]) => {
        // Warn about suspicious site IDs
        if (id.endsWith(':') && onWarning) {
          onWarning(`Site ID "${id}" ends with a colon - likely a YAML typo (double colon)`);
        }
        return mapSiteEntry(id, site);
      });

    // Enhance with git status and content changes
    const workspaceRoot = path.dirname(sitesYamlPath);
    const enhancedSites = await Promise.all(
      siteEntries.map(async (site) => {
        let enhanced = site;
        try {
          enhanced = await enhanceWithGitStatus(sitesDirectory, enhanced);
        } catch {
          // Return site without git status on error
        }
        try {
          enhanced = await enhanceWithContentChanges(sitesDirectory, enhanced);
        } catch {
          // Return site without content changes on error
        }
        try {
          enhanced = await enhanceWithContentGitStatus(workspaceRoot, enhanced);
        } catch {
          // Return site without content git status on error
        }
        try {
          enhanced = await enhanceWithContentRootChanges(workspaceRoot, enhanced);
        } catch {
          // Return site without content root changes on error
        }
        try {
          enhanced = await enhanceWithFrontmatterStatus(workspaceRoot, enhanced);
        } catch {
          // Return site without frontmatter status on error
        }
        return enhanced;
      }),
    );

    return {sites: enhancedSites};
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error reading SITES.yaml.';
    return {sites: [], errorMessage: message};
  }
}

function mapSiteEntry(id: string, site: SiteConfig): PubSiteEntry {
  const statusEntries = Array.isArray(site.status)
    ? site.status.filter((entry) => typeof entry === 'string')
    : site.status
      ? [String(site.status)]
      : undefined;

  return {
    id,
    url: typeof site.url === 'string' ? site.url : undefined,
    description: typeof site.description === 'string' ? site.description : undefined,
    host: typeof site.host === 'string' ? site.host : undefined,
    status: statusEntries,
    purpose: typeof site.purpose === 'string' ? site.purpose : undefined,
    theme: typeof site.theme === 'string' ? site.theme : undefined,
    content: typeof site.content === 'string' ? site.content : undefined,
    contentRoot: typeof site.contentRoot === 'string' ? site.contentRoot : undefined,
    since: typeof site.since === 'string'
      ? site.since
      : site.since instanceof Date
        ? site.since.toISOString()
        : undefined,
  };
}

async function enhanceWithGitStatus(sitesDirectory: string, site: PubSiteEntry): Promise<PubSiteEntry> {
  const sitePath = `${sitesDirectory}/${site.id}`;
  const gitStatus = await getGitStatus(sitePath);

  return {
    ...site,
    gitStatus: {
      isInternal: gitStatus.isRepository,
      hasUncommittedChanges: gitStatus.hasUncommittedChanges,
      untrackedFiles: gitStatus.untrackedFiles,
      modifiedFiles: gitStatus.modifiedFiles,
    },
  };
}

async function enhanceWithContentChanges(sitesDirectory: string, site: PubSiteEntry): Promise<PubSiteEntry> {
  if (!site.since) {
    return site;
  }

  const sitePath = `${sitesDirectory}/${site.id}`;
  const contentChanges = await getContentChanges(sitePath, '.', site.since);

  return {
    ...site,
    contentChanges,
  };
}

async function enhanceWithContentGitStatus(
  workspaceRoot: string,
  site: PubSiteEntry,
): Promise<PubSiteEntry> {
  if (!site.contentRoot) {
    return site;
  }

  const resolvedContentRoot = path.resolve(workspaceRoot, site.contentRoot);
  const gitStatus = await getGitStatusForSubdir(resolvedContentRoot, '.');

  return {
    ...site,
    contentGitStatus: {
      isInternal: gitStatus.isRepository,
      hasUncommittedChanges: gitStatus.hasUncommittedChanges,
      untrackedFiles: gitStatus.untrackedFiles,
      modifiedFiles: gitStatus.modifiedFiles,
    },
  };
}

async function enhanceWithContentRootChanges(
  workspaceRoot: string,
  site: PubSiteEntry,
): Promise<PubSiteEntry> {
  if (!site.since || !site.contentRoot) {
    return site;
  }

  const resolvedContentRoot = path.resolve(workspaceRoot, site.contentRoot);
  const contentRootChanges = await getContentChanges(resolvedContentRoot, '.', site.since);

  return {
    ...site,
    contentRootChanges,
  };
}

async function enhanceWithFrontmatterStatus(
  workspaceRoot: string,
  site: PubSiteEntry,
): Promise<PubSiteEntry> {
  if (!site.contentRoot) {
    return site;
  }

  const resolvedContentRoot = path.resolve(workspaceRoot, site.contentRoot);
  const frontmatterStatus = await checkFrontmatter(resolvedContentRoot);

  return {
    ...site,
    frontmatterStatus,
  };
}
