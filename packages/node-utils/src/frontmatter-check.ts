import * as fs from 'fs';
import * as path from 'path';

export interface FrontmatterStatus {
  hasMissingFrontmatter: boolean;
  missingFileCount: number;
}

export interface RepairFrontmatterResult {
  repaired: boolean;
  repairedFiles: string[];
  pleaseReviewCount: number;
  error?: string;
}

/**
 * Recursively find index.md files and check for frontmatter
 * @param directory Path to search
 * @returns Status of frontmatter in index.md files
 */
export async function checkFrontmatter(directory: string): Promise<FrontmatterStatus> {
  let missingFileCount = 0;

  async function walk(dir: string) {
    try {
      const entries = await fs.promises.readdir(dir, {withFileTypes: true});

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Skip node_modules and .git
          if (entry.name !== 'node_modules' && entry.name !== '.git') {
            await walk(fullPath);
          }
        } else if (entry.isFile() && entry.name === 'index.md') {
          const hasFrontmatter = await fileHasFrontmatter(fullPath);
          if (!hasFrontmatter) {
            missingFileCount++;
          }
        }
      }
    } catch (error) {
      // Ignore errors for now (e.g. permission denied), just continue
      // console.error(`Error processing ${dir}:`, error);
    }
  }

  await walk(directory);

  return {
    hasMissingFrontmatter: missingFileCount > 0,
    missingFileCount,
  };
}

/**
 * Repair missing frontmatter in index.md files within a content root.
 * Walks the tree, detects folder names with spaces (fails early),
 * then repairs files at each nesting level with appropriate frontmatter.
 * @param contentRootDir Absolute path to the content root directory
 * @returns Result describing what was repaired
 */
export async function repairFrontmatter(contentRootDir: string): Promise<RepairFrontmatterResult> {
  const spacesError = await detectSpacesInFolderNames(contentRootDir);
  if (spacesError) {
    return {repaired: false, repairedFiles: [], pleaseReviewCount: 0, error: spacesError};
  }

  const repairedFiles: string[] = [];

  // Step 1: Repair contentRoot index.md
  const contentRootIndex = path.join(contentRootDir, 'index.md');
  try {
    const exists = await fileExists(contentRootIndex);
    if (exists) {
      const hasFm = await fileHasFrontmatter(contentRootIndex);
      if (!hasFm) {
        await writeContentRootFrontmatter(contentRootIndex);
        repairedFiles.push(contentRootIndex);
      }
    }
  } catch {
    // Continue even if contentRoot index.md repair fails
  }

  // Step 2: Repair navigationRoot index.md files (one level deep)
  try {
    const entries = await fs.promises.readdir(contentRootDir, {withFileTypes: true});
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name === 'node_modules' || entry.name === '.git') {
        continue;
      }
      const navRootIndex = path.join(contentRootDir, entry.name, 'index.md');
      const exists = await fileExists(navRootIndex);
      if (exists) {
        const hasFm = await fileHasFrontmatter(navRootIndex);
        if (!hasFm) {
          await writeNavigationRootFrontmatter(navRootIndex, entry.name);
          repairedFiles.push(navRootIndex);
        }
      }

      // Step 3: Repair navigationNested index.md files (two+ levels deep, recursive)
      const nestedRepairs = await repairNavigationNested(
        path.join(contentRootDir, entry.name),
        navRootIndex,
      );
      repairedFiles.push(...nestedRepairs);
    }
  } catch {
    // Continue even if navigation repair fails
  }

  // Final pass: count all index.md files with pleaseReview: true
  const pleaseReviewCount = await countPleaseReview(contentRootDir);

  return {
    repaired: repairedFiles.length > 0,
    repairedFiles,
    pleaseReviewCount,
  };
}

/**
 * Recursively repair navigationNested index.md files (depth 2+ under contentRoot).
 * Each repaired file gets a `parent` value read from its parent folder's frontmatter `key`.
 */
async function repairNavigationNested(
  parentDir: string,
  parentIndexPath: string,
): Promise<string[]> {
  const repairedFiles: string[] = [];

  try {
    const entries = await fs.promises.readdir(parentDir, {withFileTypes: true});
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name === 'node_modules' || entry.name === '.git') {
        continue;
      }
      const nestedIndex = path.join(parentDir, entry.name, 'index.md');
      const exists = await fileExists(nestedIndex);
      if (exists) {
        const hasFm = await fileHasFrontmatter(nestedIndex);
        if (!hasFm) {
          const parentKey = await readFrontmatterKey(parentIndexPath);
          await writeNavigationNestedFrontmatter(nestedIndex, entry.name, parentKey);
          repairedFiles.push(nestedIndex);
        }
      }

      // Recurse deeper
      const deeperRepairs = await repairNavigationNested(
        path.join(parentDir, entry.name),
        nestedIndex,
      );
      repairedFiles.push(...deeperRepairs);
    }
  } catch {
    // Continue on errors
  }

  return repairedFiles;
}

/**
 * Read the `key` value from a file's frontmatter.
 * Falls back to the parent folder name if frontmatter or key is missing.
 */
async function readFrontmatterKey(filePath: string): Promise<string> {
  const folderName = path.basename(path.dirname(filePath));
  try {
    const exists = await fileExists(filePath);
    if (!exists) {
      return folderName;
    }
    const content = await fs.promises.readFile(filePath, 'utf8');
    const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fmMatch) {
      return folderName;
    }
    const keyMatch = fmMatch[1].match(/^\s*key:\s*(.+)$/m);
    if (!keyMatch) {
      return folderName;
    }
    return keyMatch[1].trim();
  } catch {
    return folderName;
  }
}

/**
 * Write contentRoot-level frontmatter to an index.md file.
 * Prepends frontmatter to the existing file content.
 */
async function writeContentRootFrontmatter(filePath: string): Promise<void> {
  const existing = await fs.promises.readFile(filePath, 'utf8');
  const frontmatter = `---
title: Home
layout: layout-home
pleaseReview: true
---
`;
  await fs.promises.writeFile(filePath, frontmatter + existing, 'utf8');
}

/** Format a folder name as a title: kebab-case to Title Case */
function formatTitle(folderName: string): string {
  return folderName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Write navigationRoot-level frontmatter to an index.md file.
 */
async function writeNavigationRootFrontmatter(filePath: string, folderName: string): Promise<void> {
  const existing = await fs.promises.readFile(filePath, 'utf8');
  const title = formatTitle(folderName);
  const frontmatter = `---
layout: layout-sidebar
title: ${title}
pleaseReview: true
eleventyNavigation:
  key: ${folderName}
  title: ${title}
  # order: 42
---
`;
  await fs.promises.writeFile(filePath, frontmatter + existing, 'utf8');
}

/**
 * Write navigationNested-level frontmatter to an index.md file.
 */
async function writeNavigationNestedFrontmatter(
  filePath: string,
  folderName: string,
  parentKey: string,
): Promise<void> {
  const existing = await fs.promises.readFile(filePath, 'utf8');
  const title = formatTitle(folderName);
  const frontmatter = `---
layout: layout-sidebar
title: ${title}
pleaseReview: true
eleventyNavigation:
  key: ${folderName}
  title: ${title}
  parent: ${parentKey}
  # order: 42
---
`;
  await fs.promises.writeFile(filePath, frontmatter + existing, 'utf8');
}

/**
 * Recursively check for folder names containing spaces.
 * Returns an error message if found, or null if clean.
 */
async function detectSpacesInFolderNames(dir: string): Promise<string | null> {
  try {
    const entries = await fs.promises.readdir(dir, {withFileTypes: true});
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name === 'node_modules' || entry.name === '.git') {
        continue;
      }
      if (entry.name.includes(' ')) {
        return `Folder name contains a space: "${path.join(dir, entry.name)}". Please rename it before running frontmatter repair.`;
      }
      const nested = await detectSpacesInFolderNames(path.join(dir, entry.name));
      if (nested) {
        return nested;
      }
    }
  } catch {
    // Ignore read errors
  }
  return null;
}

/**
 * Recursively count index.md files that have pleaseReview: true in their frontmatter.
 */
export async function countPleaseReview(dir: string): Promise<number> {
  let count = 0;

  async function walk(d: string) {
    try {
      const entries = await fs.promises.readdir(d, {withFileTypes: true});
      for (const entry of entries) {
        const fullPath = path.join(d, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== 'node_modules' && entry.name !== '.git') {
            await walk(fullPath);
          }
        } else if (entry.isFile() && entry.name === 'index.md') {
          const hasPleaseReview = await fileHasPleaseReview(fullPath);
          if (hasPleaseReview) {
            count++;
          }
        }
      }
    } catch {
      // Continue on errors
    }
  }

  await walk(dir);
  return count;
}

/**
 * Check if a file's frontmatter contains pleaseReview: true
 */
async function fileHasPleaseReview(filePath: string): Promise<boolean> {
  try {
    const content = await fs.promises.readFile(filePath, 'utf8');
    const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fmMatch) {
      return false;
    }
    return /^\s*pleaseReview:\s*true\s*$/m.test(fmMatch[1]);
  } catch {
    return false;
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function fileHasFrontmatter(filePath: string): Promise<boolean> {
  try {
    // Read the first 4 bytes to check for ---\n or ---\r
    const handle = await fs.promises.open(filePath, 'r');
    const buffer = Buffer.alloc(4);
    const {bytesRead} = await handle.read(buffer, 0, 4, 0);
    await handle.close();

    if (bytesRead < 3) {
      return false;
    }

    const start = buffer.toString('utf8', 0, 3);
    // Basic check: starts with ---
    // Strictly speaking, it should be followed by newline, but standard 11ty behavior
    // expects --- at the start.
    return start === '---';
  } catch {
    return false;
  }
}
