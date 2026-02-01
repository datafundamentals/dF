import * as fs from 'fs';
import * as path from 'path';

export interface FrontmatterStatus {
  hasMissingFrontmatter: boolean;
  missingFileCount: number;
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
