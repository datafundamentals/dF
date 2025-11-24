import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

// --- Configuration ---
// Define your symlinks here.
// 'target': The external folder you want to link TO (can use ~ for home dir)
// 'path': The location inside this repo where the link should live
const SYMLINKS = [
  // Example:
  // {
  //   target: '~/work/primary/writer/content',
  //   path: 'apps/df-my-app/src/content'
  // },
];

// --- Script ---

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..'); // Assuming this script is in tools/

function resolveHome(filepath) {
  if (filepath.startsWith('~')) {
    return path.join(os.homedir(), filepath.slice(1));
  }
  return filepath;
}

async function manageSymlinks() {
  console.log('🔗 Checking symlinks...\n');

  for (const link of SYMLINKS) {
    const targetPath = resolveHome(link.target);
    const linkPath = path.resolve(ROOT_DIR, link.path);
    const linkDir = path.dirname(linkPath);

    console.log(`Checking: ${link.path}`);
    console.log(`   -> Target: ${targetPath}`);

    try {
      // 1. Check if target exists
      try {
        await fs.access(targetPath);
      } catch {
        console.error(`   ❌ ERROR: Target path does not exist: ${targetPath}`);
        continue;
      }

      // 2. Ensure parent directory for the link exists
      await fs.mkdir(linkDir, { recursive: true });

      // 3. Check if link already exists
      let stats;
      try {
        stats = await fs.lstat(linkPath);
      } catch (e) {
        if (e.code !== 'ENOENT') throw e;
      }

      if (stats) {
        if (stats.isSymbolicLink()) {
          const currentTarget = await fs.readlink(linkPath);
          if (path.resolve(linkDir, currentTarget) === targetPath || currentTarget === targetPath) {
            console.log('   ✅ OK: Symlink exists and is correct.');
          } else {
            console.warn(`   ⚠️ WARNING: Symlink exists but points to: ${currentTarget}`);
            console.warn(`      Expected: ${targetPath}`);
            // Optional: unlink and recreate?
            // await fs.unlink(linkPath);
          }
        } else {
          console.error(`   ❌ ERROR: Path exists but is not a symlink: ${linkPath}`);
        }
      } else {
        // 4. Create the symlink
        // We use absolute paths for simplicity in this script, but relative is often better for portability.
        // Here we use the absolute target path.
        await fs.symlink(targetPath, linkPath, 'dir');
        console.log('   ✨ CREATED: Symlink established.');
      }

    } catch (err) {
      console.error(`   ❌ FAILED: ${err.message}`);
    }
    console.log('---');
  }
}

manageSymlinks();
