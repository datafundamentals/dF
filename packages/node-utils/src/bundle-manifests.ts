/**
 * Bundle and deploy manifest utilities
 * Reads manifest files to determine bundle/deploy status for apps and sites
 */

import * as fs from 'fs';
import * as path from 'path';
import type {AppDeployStatus} from '@df/types';

export interface BundleManifest {
  bundleTag: string;
  createdAt: string;
  appName: string;
}

export interface DeployManifest {
  deployedTag: string;
  deployedAt: string;
  appName: string;
  sourceBundle?: string;
}

/**
 * Read the bundle manifest for an app
 * @param monorepoRoot Path to monorepo root
 * @param appName Name of the app (e.g., "df-chat-app")
 * @returns BundleManifest or undefined if not found
 */
export function readBundleManifest(
  monorepoRoot: string,
  appName: string,
): BundleManifest | undefined {
  const manifestPath = path.join(
    monorepoRoot,
    'apps',
    appName,
    'dist',
    'bundle',
    '.bundle-manifest.json',
  );

  if (!fs.existsSync(manifestPath)) {
    return undefined;
  }

  try {
    const content = fs.readFileSync(manifestPath, 'utf-8');
    return JSON.parse(content) as BundleManifest;
  } catch {
    return undefined;
  }
}

/**
 * Read the deploy manifest for an app at a site
 * @param sitesDirectory Path to sites directory (e.g., "../sites")
 * @param siteId Site ID (e.g., "appwriter.com")
 * @param appName Name of the app (e.g., "df-chat-app")
 * @returns DeployManifest or undefined if not found
 */
export function readDeployManifest(
  sitesDirectory: string,
  siteId: string,
  appName: string,
): DeployManifest | undefined {
  // The deploy manifest is at: sites/{siteId}/static/wc/{appName}/.deploy-manifest.json
  const manifestPath = path.join(
    sitesDirectory,
    siteId,
    'static',
    'wc',
    appName,
    '.deploy-manifest.json',
  );

  if (!fs.existsSync(manifestPath)) {
    return undefined;
  }

  try {
    const content = fs.readFileSync(manifestPath, 'utf-8');
    return JSON.parse(content) as DeployManifest;
  } catch {
    return undefined;
  }
}

/**
 * Compare bundle tags to determine if one is newer
 * Tags are in YYMMDDHHMM format, so string comparison works
 * @returns true if bundleTag > deployedTag
 */
export function isNewerBundle(bundleTag: string, deployedTag: string): boolean {
  return bundleTag > deployedTag;
}

/**
 * Get deploy status for all apps assigned to a site
 * @param monorepoRoot Path to monorepo root
 * @param sitesDirectory Path to sites directory
 * @param siteId Site ID
 * @param appNames List of app names assigned to this site
 * @returns Array of AppDeployStatus
 */
export function getAppDeployStatusForSite(
  monorepoRoot: string,
  sitesDirectory: string,
  siteId: string,
  appNames: string[],
): AppDeployStatus[] {
  return appNames.map((appName) => {
    const bundleManifest = readBundleManifest(monorepoRoot, appName);
    const deployManifest = readDeployManifest(sitesDirectory, siteId, appName);

    const bundleTag = bundleManifest?.bundleTag;
    const deployedTag = deployManifest?.deployedTag;

    let needsDeploy = false;
    if (bundleTag && !deployedTag) {
      // Bundle exists but never deployed
      needsDeploy = true;
    } else if (bundleTag && deployedTag) {
      // Both exist, compare
      needsDeploy = isNewerBundle(bundleTag, deployedTag);
    }

    return {
      appName,
      bundleTag,
      deployedTag,
      needsDeploy,
    };
  });
}
