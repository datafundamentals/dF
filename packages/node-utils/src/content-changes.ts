/**
 * Content changes utilities for checking if files changed since last publication
 * Pure business logic - no VS Code dependencies
 */

import * as fs from 'fs';
import * as simplegit from 'simple-git';

export interface ContentChangesStatus {
  hasChanges: boolean;
  changedFileCount: number;
}

/**
 * Check if content files have changed since a given date
 * @param contentDir Absolute path to the git repository containing content
 * @param contentSubdir Subdirectory within the repo to scope the check to
 * @param since Date string for --since filter (e.g. "2025-01-15")
 * @returns Content changes status
 */
export async function getContentChanges(
  contentDir: string,
  contentSubdir: string,
  since: string,
): Promise<ContentChangesStatus> {
  if (!fs.existsSync(contentDir)) {
    return {hasChanges: false, changedFileCount: 0};
  }

  try {
    const git = simplegit.simpleGit(contentDir);
    const output = await git.raw([
      'log',
      `--since=${since}`,
      '--name-only',
      '--pretty=format:',
      '--',
      contentSubdir,
    ]);

    const changedFiles = new Set(
      output.split('\n').filter((line) => line.trim().length > 0),
    );

    return {
      hasChanges: changedFiles.size > 0,
      changedFileCount: changedFiles.size,
    };
  } catch {
    return {hasChanges: false, changedFileCount: 0};
  }
}
