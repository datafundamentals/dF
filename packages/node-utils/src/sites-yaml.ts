/**
 * YAML parsing and site management utilities
 * Pure business logic - no VS Code dependencies
 */

import * as fs from 'fs';
import * as yaml from 'js-yaml';
import type {PubSiteEntry} from '@df/types';
import {getGitStatus} from './git-status.js';

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

    // Enhance with git status
    const enhancedSites = await Promise.all(
      siteEntries.map(async (site) => {
        try {
          return await enhanceWithGitStatus(sitesDirectory, site);
        } catch (e) {
          // Return site without git status on error
          return site;
        }
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
    since: typeof site.since === 'string' ? site.since : undefined,
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
