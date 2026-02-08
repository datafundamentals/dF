/**
 * App changes utilities for scanning firebase apps and checking for changes since release
 * Pure business logic - no VS Code dependencies
 */

import * as fs from 'fs';
import * as path from 'path';
import type {AppEntry} from '@df/types';
import {getContentChanges} from './content-changes.js';
import {readBundleManifest} from './bundle-manifests.js';

/**
 * Parse YYMMDD metadata from a version string like "0.0.1-260202"
 * @returns ISO date string (e.g. "2026-02-02") or empty string if not parseable
 */
export function parseVersionDate(version: string): string {
  const match = version.match(/-(\d{6})$/);
  if (!match) {
    return '';
  }
  const yymmdd = match[1];
  const year = 2000 + parseInt(yymmdd.slice(0, 2), 10);
  const month = yymmdd.slice(2, 4);
  const day = yymmdd.slice(4, 6);
  return `${year}-${month}-${day}`;
}

/**
 * Scan apps directory for firebase apps and return AppEntry array
 */
export async function getFirebaseApps(monorepoRoot: string): Promise<AppEntry[]> {
  const appsDir = path.join(monorepoRoot, 'apps');
  if (!fs.existsSync(appsDir)) {
    return [];
  }

  const entries = fs.readdirSync(appsDir, {withFileTypes: true});
  const apps: AppEntry[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const pkgPath = path.join(appsDir, entry.name, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      continue;
    }

    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      const hasFirebase =
        pkg.dependencies?.firebase || pkg.devDependencies?.firebase;
      if (!hasFirebase) {
        continue;
      }

      const version: string = pkg.version ?? '';
      const releaseDate = parseVersionDate(version);
      if (!releaseDate) {
        continue;
      }

      // Read bundle manifest if exists
      const bundleManifest = readBundleManifest(monorepoRoot, entry.name);

      apps.push({
        name: entry.name,
        version,
        releaseDate,
        bundleTag: bundleManifest?.bundleTag,
      });
    } catch {
      continue;
    }
  }

  return apps.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Enhance an AppEntry with change information by checking git log since release date
 */
export async function enhanceAppWithChanges(
  monorepoRoot: string,
  app: AppEntry,
): Promise<AppEntry> {
  const appSubdir = path.join('apps', app.name);
  const changes = await getContentChanges(monorepoRoot, appSubdir, app.releaseDate);
  return {
    ...app,
    appChanges: {
      hasChanges: changes.hasChanges,
      changedFileCount: changes.changedFileCount,
    },
  };
}
