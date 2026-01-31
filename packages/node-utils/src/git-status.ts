/**
 * Git status utilities for checking repository state
 * Pure business logic - no VS Code dependencies
 */

import * as fs from 'fs';
import * as simplegit from 'simple-git';

export interface GitStatus {
  isRepository: boolean;
  hasUncommittedChanges: boolean;
  untrackedFiles: number;
  modifiedFiles: number;
}

/**
 * Check git status for a given directory path
 * @param directoryPath Absolute path to check
 * @returns Git status information
 */
export async function getGitStatus(directoryPath: string): Promise<GitStatus> {
  if (!fs.existsSync(directoryPath)) {
    return {
      isRepository: false,
      hasUncommittedChanges: false,
      untrackedFiles: 0,
      modifiedFiles: 0,
    };
  }

  try {
    const git = simplegit.simpleGit(directoryPath);
    const status = await git.status();

    return {
      isRepository: true,
      hasUncommittedChanges: status.files.length > 0,
      untrackedFiles: status.not_added.length,
      modifiedFiles: status.modified.length,
    };
  } catch (error) {
    // Not a git repository or git command failed
    return {
      isRepository: false,
      hasUncommittedChanges: false,
      untrackedFiles: 0,
      modifiedFiles: 0,
    };
  }
}

/**
 * Check git status scoped to a subdirectory within a repository
 * @param directoryPath Absolute path to a directory inside a git repo
 * @param subdir Subdirectory to scope status to (relative to repo root or ".")
 * @returns Git status information for the subdir only
 */
export async function getGitStatusForSubdir(
  directoryPath: string,
  subdir: string,
): Promise<GitStatus> {
  if (!fs.existsSync(directoryPath)) {
    return {
      isRepository: false,
      hasUncommittedChanges: false,
      untrackedFiles: 0,
      modifiedFiles: 0,
    };
  }

  try {
    const git = simplegit.simpleGit(directoryPath);
    await git.raw(['rev-parse', '--show-toplevel']);
    const output = await git.raw(['status', '--porcelain', '--', subdir]);
    const lines = output.split('\n').filter((line) => line.trim().length > 0);
    const untrackedFiles = lines.filter((line) => line.startsWith('??')).length;
    const modifiedFiles = lines.length - untrackedFiles;

    return {
      isRepository: true,
      hasUncommittedChanges: lines.length > 0,
      untrackedFiles,
      modifiedFiles,
    };
  } catch {
    return {
      isRepository: false,
      hasUncommittedChanges: false,
      untrackedFiles: 0,
      modifiedFiles: 0,
    };
  }
}

/**
 * Check if a directory exists and is a git repository
 * @param directoryPath Absolute path to check
 * @returns true if directory exists and has .git folder
 */
export function isGitRepository(directoryPath: string): boolean {
  if (!fs.existsSync(directoryPath)) {
    return false;
  }
  
  const gitPath = `${directoryPath}/.git`;
  return fs.existsSync(gitPath);
}
