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
import {checkFrontmatter, countPleaseReview, repairFrontmatter} from './frontmatter-check.js';

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
  apps?: unknown;
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

export interface UpdateSiteAppTargetOptions {
  sitesYamlPath: string;
  siteId: string;
  appName: string;
  mode: 'add' | 'remove';
}

export interface UpdateSiteAppTargetResult {
  updated: boolean;
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
  const appEntries = Array.isArray(site.apps)
    ? site.apps.filter((entry): entry is string => typeof entry === 'string')
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
    apps: appEntries,
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
  const pleaseReviewCount = await countPleaseReview(resolvedContentRoot);

  return {
    ...site,
    frontmatterStatus: {
      ...frontmatterStatus,
      pleaseReviewCount,
    },
  };
}

/**
 * Repair frontmatter for a single site's content root, then return updated status.
 * @param workspaceRoot Path to the workspace root (where SITES.yaml lives)
 * @param site The site entry to repair
 * @returns Updated site entry with repair results reflected in frontmatterStatus
 */
export async function repairSiteFrontmatter(
  workspaceRoot: string,
  site: PubSiteEntry,
): Promise<PubSiteEntry> {
  if (!site.contentRoot) {
    return site;
  }

  const resolvedContentRoot = path.resolve(workspaceRoot, site.contentRoot);
  const result = await repairFrontmatter(resolvedContentRoot);

  if (result.error) {
    return {
      ...site,
      frontmatterStatus: {
        hasMissingFrontmatter: site.frontmatterStatus?.hasMissingFrontmatter ?? false,
        missingFileCount: site.frontmatterStatus?.missingFileCount ?? 0,
        pleaseReviewCount: result.pleaseReviewCount,
        repairError: result.error,
      },
    };
  }

  // Re-check frontmatter status after repair
  const updatedStatus = await checkFrontmatter(resolvedContentRoot);

  return {
    ...site,
    frontmatterStatus: {
      ...updatedStatus,
      pleaseReviewCount: result.pleaseReviewCount,
    },
  };
}

/**
 * Update one site's apps list in SITES.yaml.
 * @param options Update configuration
 * @returns Mutation status and optional error
 */
export function updateSiteAppTarget(
  options: UpdateSiteAppTargetOptions,
): UpdateSiteAppTargetResult {
  const {sitesYamlPath, siteId, appName, mode} = options;

  try {
    if (!fs.existsSync(sitesYamlPath)) {
      return {updated: false, errorMessage: `SITES.yaml not found at ${sitesYamlPath}`};
    }

    const fileContent = fs.readFileSync(sitesYamlPath, 'utf8');
    const parsed = yaml.load(fileContent) as SitesYaml | undefined;
    if (!parsed?.sites) {
      return {updated: false, errorMessage: 'Invalid SITES.yaml structure.'};
    }

    const siteConfig = parsed.sites[siteId];
    if (!siteConfig) {
      return {updated: false, errorMessage: `Site "${siteId}" not found in SITES.yaml.`};
    }

    const currentApps = Array.isArray(siteConfig.apps)
      ? siteConfig.apps.filter((entry): entry is string => typeof entry === 'string')
      : [];

    let nextApps: string[];
    if (mode === 'add') {
      if (currentApps.includes(appName)) {
        return {updated: false};
      }
      nextApps = [...currentApps, appName];
    } else {
      if (!currentApps.includes(appName)) {
        return {updated: false};
      }
      nextApps = currentApps.filter((entry) => entry !== appName);
    }

    const nextContent = updateAppsListInYamlText(fileContent, siteId, nextApps);
    fs.writeFileSync(sitesYamlPath, nextContent, 'utf8');
    return {updated: true};
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error updating SITES.yaml.';
    return {updated: false, errorMessage: message};
  }
}

function updateAppsListInYamlText(content: string, siteId: string, apps: string[]): string {
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  const lines = content.split(/\r?\n/);
  const siteHeaderPattern = new RegExp(`^\\s{2}${escapeRegExp(siteId)}:\\s*$`);
  const siteStart = lines.findIndex((line) => siteHeaderPattern.test(line));

  if (siteStart === -1) {
    throw new Error(`Site "${siteId}" not found in SITES.yaml.`);
  }

  let siteEnd = lines.length;
  for (let i = siteStart + 1; i < lines.length; i++) {
    if (/^\s{2}[^\s#][^:]*:\s*$/.test(lines[i])) {
      siteEnd = i;
      break;
    }
  }

  const nextAppsLine = apps.length > 0
    ? `    apps: [ ${apps.join(', ')} ]`
    : '    apps: [ ]';
  let appsStart = -1;
  let appsEnd = -1;

  for (let i = siteStart + 1; i < siteEnd; i++) {
    if (/^\s{4}apps:\s*$/.test(lines[i])) {
      appsStart = i;
      appsEnd = i;
      for (let j = i + 1; j < siteEnd; j++) {
        if (/^\s{6}-\s+/.test(lines[j]) || /^\s*$/.test(lines[j])) {
          appsEnd = j;
          continue;
        }
        break;
      }
      break;
    }
    if (/^\s{4}apps:\s*\[[^\]]*\]\s*$/.test(lines[i])) {
      appsStart = i;
      appsEnd = i;
      break;
    }
  }

  if (appsStart !== -1) {
    lines.splice(appsStart, appsEnd - appsStart + 1, nextAppsLine);
    return lines.join(eol);
  }

  // Insert near other primary metadata when apps is missing.
  let insertAt = -1;
  for (let i = siteStart + 1; i < siteEnd; i++) {
    if (/^\s{4}status:\s*$/.test(lines[i])) {
      insertAt = i;
      break;
    }
  }
  if (insertAt === -1) {
    insertAt = siteEnd;
  }

  lines.splice(insertAt, 0, nextAppsLine);
  return lines.join(eol);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
