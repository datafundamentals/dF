Here is a concrete example of how to structure a **Bundle Migration Tool** within your `tools/` workspace.

This setup allows you to write your migration logic using the full power of Node.js (and npm packages) while keeping your main apps clean.

### 1\. The Tool Structure

**Location:** `tools/bundle-migrator/`

We use the `bin` field in `package.json`. This is the "magic trick" that allows you to run the command `migrate-bundles` inside your other apps, just like you would run `vite` or `firebase`.

#### `tools/bundle-migrator/package.json`

```json
{
  "name": "@tooling/bundle-migrator",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "description": "Moves build artifacts to external locations",
  "bin": {
    "migrate-bundles": "./src/index.js"
  },
  "scripts": {
    "test": "echo 'Error: no test specified'"
  },
  "dependencies": {
    "chalk": "^5.3.0",    
    "fs-extra": "^11.2.0",
    "yargs": "^17.7.0"    
  },
  "engines": {
    "node": ">=18"
  }
}
```

  * **`bin`**: This maps the command name `migrate-bundles` to your script file.
  * **`dependencies`**: Notice `fs-extra` (great for moving files) and `chalk` (for colored terminal output) are isolated here. They will *not* bloat your web app's bundle size.

#### `tools/bundle-migrator/src/index.js`

You must add a "shebang" (`#!/usr/bin/env node`) at the very top so the system knows to execute this file with Node.

```javascript
#!/usr/bin/env node

import fs from 'fs-extra';
import chalk from 'chalk';
import path from 'path';

// Example: Logic to move a dist folder
const run = async () => {
  console.log(chalk.blue('📦 Starting Bundle Migration...'));

  const source = path.resolve(process.cwd(), 'dist');
  const destination = process.env.EXTERNAL_BUNDLE_PATH; 
  
  if (!destination) {
    console.error(chalk.red('Error: EXTERNAL_BUNDLE_PATH not set.'));
    process.exit(1);
  }

  try {
    // The heavy lifting
    await fs.copy(source, destination);
    console.log(chalk.green(`✅ Successfully moved bundle to ${destination}`));
  } catch (err) {
    console.error(chalk.red('Migration failed:'), err);
    process.exit(1);
  }
};

run();
```

-----

### 2\. The Consumer Structure

**Location:** `apps/my-web-app/`

Now you connect the tool to your app. Because this is a pnpm workspace, pnpm will link the local folder rather than downloading it from the internet.

#### `apps/my-web-app/package.json`

```json
{
  "name": "my-web-app",
  "version": "0.1.0",
  "scripts": {
    "build": "vite build",
    
    "postbuild": "migrate-bundles",
    
    "deploy:external": "migrate-bundles --destination=/some/external/path"
  },
  "devDependencies": {
    "@tooling/bundle-migrator": "workspace:*" 
  }
}
```

  * **`workspace:*`**: This tells pnpm "Use the version of `@tooling/bundle-migrator` that exists in my local `tools/` folder, whatever version that happens to be."
  * **`postbuild`**: Because we set up the `bin` entry in the tool, you can just type `migrate-bundles` here. No need to type `node ../../tools/bundle-migrator/src/index.js`.

### Why this fits your "Strict Rules" philosophy

1.  **Decoupled Logic:** Your web app knows *that* it needs to migrate a bundle, but it doesn't know *how*. The *how* is encapsulated in the tool.
2.  **Single Source of Truth:** If you change how migration works (e.g., switching from local copy to uploading to S3), you update the code in `tools/bundle-migrator` once, and all 5 of your apps update instantly.
3.  **Memory Aid:** When you look at `apps/my-web-app`, the dependencies list tells a story: "This app uses React, it uses Lit, and it uses the Bundle Migrator." It documents itself.

**Would you like me to detail how to configure TypeScript for this tool, or are you happy sticking to plain JavaScript for build scripts?**

yes

Here is the **strict, structured TypeScript configuration** for your tooling workspace.

Since you prefer rules and predictability, we will use a "Build Strategy" rather than a "Runtime Strategy." This means we will compile your TypeScript tool into a JavaScript artifact using `tsup`.

**Why compile the tool?**

1.  **Speed:** `tsup` bundles everything into a single efficient file.
2.  **Caching:** `turbo` can cache the build. If you don't change the tool code, Turbo restores the binary instantly.
3.  **Safety:** You catch type errors at build time, not when the script crashes halfway through a migration.

### 1\. The Directory Structure

We add a `tsconfig.json` and strict source organization.

```text
tools/bundle-migrator/
├── package.json
├── tsconfig.json
└── src/
    └── index.ts      <-- Your typed logic here
```

### 2\. `package.json` (The Configuration)

We will use **tsup** (a zero-config bundler) to turn your TypeScript into an executable Node script.

**File:** `tools/bundle-migrator/package.json`

```json
{
  "name": "@tooling/bundle-migrator",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "bin": {
    "migrate-bundles": "./dist/index.js" 
  },
  "scripts": {
    "build": "tsup src/index.ts --format esm --clean",
    "dev": "tsup src/index.ts --format esm --watch",
    "lint": "eslint ."
  },
  "dependencies": {
    "chalk": "^5.3.0",
    "fs-extra": "^11.2.0",
    "yargs": "^17.7.2"
  },
  "devDependencies": {
    "@types/fs-extra": "^11.0.4",
    "@types/node": "^20.0.0",
    "@types/yargs": "^17.0.24",
    "tsup": "^8.0.0",
    "typescript": "^5.3.0"
  }
}
```

### 3\. `tsconfig.json` (The Rules)

This ensures strict typing. If you have a base config in your monorepo (e.g., `@packages/config/tsconfig.base.json`), you can extend it. Here is a standalone version for the tool.

**File:** `tools/bundle-migrator/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,              // The strict rules you like
    "skipLibCheck": true,
    "noEmit": true               // tsup handles the emit, tsc just checks types
  },
  "include": ["src"]
}
```

### 4\. `src/index.ts` (The Typed Code)

Here is how we write the script with Types. Notice how we can now use strict types for our variables, making the "migration" logic much less error-prone.

**File:** `tools/bundle-migrator/src/index.ts`

```typescript
#!/usr/bin/env node

import fs from 'fs-extra';
import chalk from 'chalk';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Define the shape of our arguments
interface Arguments {
  destination: string;
  source?: string;
}

const run = async () => {
  // 1. Parse Arguments safely
  const argv = await yargs(hideBin(process.argv))
    .option('destination', {
      alias: 'd',
      type: 'string',
      description: 'Absolute path to external location',
      demandOption: true,
    })
    .option('source', {
      alias: 's',
      type: 'string',
      description: 'Source directory (default: ./dist)',
      default: './dist',
    })
    .help()
    .parse() as Arguments;

  // 2. Resolve Paths
  const sourcePath = path.resolve(process.cwd(), argv.source!);
  const destPath = path.resolve(argv.destination);

  console.log(chalk.blue(`📦 Migrating bundle...`));
  console.log(chalk.gray(`   Source: ${sourcePath}`));
  console.log(chalk.gray(`   Target: ${destPath}`));

  // 3. Validation Logic
  if (!fs.existsSync(sourcePath)) {
    console.error(chalk.red(`❌ Error: Source folder not found at ${sourcePath}`));
    process.exit(1);
  }

  try {
    // 4. Execute Copy
    await fs.copy(sourcePath, destPath, { overwrite: true });
    console.log(chalk.green(`✅ Success! Bundle migrated.`));
  } catch (err) {
    console.error(chalk.red(`❌ Migration failed:`));
    if (err instanceof Error) {
      console.error(err.message);
    }
    process.exit(1);
  }
};

run();
```

### 5\. The Turbo Pipeline (Critical)

Because we are *building* the tool now, we must tell Turbo that the tool needs to be built **before** the app can use it.

In your root `turbo.json`, ensure your pipeline handles dependencies correctly:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"], 
      "outputs": ["dist/**", ".next/**"]
    },
    // ... other tasks
  }
}
```

  * `^build`: This syntax means "Run the `build` command in all my dependencies before running `build` in the current package."
  * When you run `pnpm build` in `apps/my-web-app`, Turbo sees it depends on `@tooling/bundle-migrator`.
  * Turbo will automatically go compile the TypeScript in `tools/bundle-migrator` into JavaScript.
  * Then it will run the build for `my-web-app`.
  * Then the `postbuild` script in the app can safely execute the tool.

### Summary of the Workflow

1.  **Write code** in `tools/bundle-migrator/src/index.ts`.
2.  **Dependencies** (`fs-extra`, `chalk`) stay isolated in the tool's folder.
3.  **Apps** utilize the tool via the command line in their `scripts`.

This creates a "Black Box" implementation. The app doesn't care that the tool is written in TypeScript, or how it parses arguments. It just asks the tool to do a job.

**Would you like me to explain how to "watch" this tool so that if you edit the script, it automatically rebuilds while you are working on an app?**

yes

This is where the "monorepo magic" really shines, but it requires one specific configuration tweak in `turbo.json` to work correctly.

The goal is:

1.  You edit `tools/bundle-migrator/src/index.ts`.
2.  The system automatically recompiles it to `dist/index.js`.
3.  The next time you run the command in your app, it uses the new logic immediately.

Here is the setup to make that happen.

### 1\. Update the Tool's `package.json`

We already added a `dev` script in the previous step, but let's verify it uses the `--watch` flag. This tells `tsup` to stay alive and watch for file changes.

**File:** `tools/bundle-migrator/package.json`

```json
"scripts": {
  "build": "tsup src/index.ts --format esm --clean",
  "dev": "tsup src/index.ts --format esm --watch",  <-- The secret sauce
  "lint": "eslint ."
}
```

### 2\. Update `turbo.json` (The Parallel Execution)

You need to tell Turbo that the `dev` script is a "persistent" task (it never ends). If you don't do this, Turbo might block other tasks waiting for this one to finish.

**File:** `turbo.json`

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true  <-- Crucial: Tells Turbo "this runs forever"
    }
  }
}
```

### 3\. The Workflow: How to use it

Now, you have two ways to work, depending on your focus at the moment.

#### Scenario A: You are actively developing the Tool

You want to edit the tool and immediately test it against an app.

1.  Open your terminal at the **root** of the monorepo.

2.  Run:

    ```bash
    pnpm turbo dev --filter=@tooling/bundle-migrator
    ```

    *This starts the watcher only for your tool. It will say something like `Build success` and then hang there, waiting for changes.*

3.  Open a **second terminal** (or split pane) inside `apps/my-web-app`.

4.  Run your migration command manually to test:

    ```bash
    pnpm migrate-bundles
    ```

**The Loop:**

  * You change a line of code in `tools/.../index.ts` and hit save.
  * Terminal 1 (Watcher) flashes: `Rebuild success`.
  * You switch to Terminal 2 and run `pnpm migrate-bundles`.
  * The new logic runs instantly.

-----

#### Scenario B: The "Everything" Mode

If you are working on the entire stack (App + Tool) simultaneously, you can run the dev command for the whole repo.

1.  Run from root:
    ```bash
    pnpm turbo dev
    ```
2.  Turbo will parallelize everything:
      * It starts your App (e.g., `vite dev` on localhost:3000).
      * It starts your Tool watcher.
      * It starts your Backend watcher.

*Note: Since your migration script is likely a "post-build" operation (it runs after a build, not during a dev server session), Scenario A is usually cleaner for testing build tools specifically.*

### Advanced: "On Success" Hooks

If you want to get fancy, `tsup` has an `--onSuccess` flag. You could configure your tool to automatically run a test script every time it recompiles.

**In `tools/bundle-migrator/package.json`:**

```json
"dev": "tsup src/index.ts --watch --onSuccess \"node dist/index.js --help\""
```

Now, every time you save a file, it rebuilds *and* runs the command immediately in the console, giving you instant feedback that it's working.

**Would you like me to show you how to add a unit test (using a framework like Vitest) to this tool so you don't have to manually run it against an app to verify it works?**

yes

Adding unit tests is a great move. It transforms your tool from "I hope this script works" to "I *know* this script works," and it prevents you from accidentally breaking your migration logic 6 months from now.

Since your tool interacts with the **File System** (reading/writing files) and **Process Arguments** (yargs), testing it directly can be tricky. If you aren't careful, your tests might accidentally delete real files on your computer.

To solve this safely, we will use **Vitest** and **Mocks**. We will "fake" the file system so the test runs in memory, not on your hard drive.

### 1\. Refactor for Testability (The "Separation of Concerns")

Currently, your `src/index.ts` mixes **Logic** (copying files) with **Execution** (parsing CLI args). To test properly, we need to split them.

**New Structure:**

  * `src/core.ts`: The pure logic function (We test this).
  * `src/cli.ts`: The entry point that handles arguments and calls the logic.

#### `src/core.ts` (The Logic)

```typescript
import fs from 'fs-extra';
import chalk from 'chalk';
import path from 'path';

interface MigrationOptions {
  source: string;
  destination: string;
  cwd?: string; // Allow injecting cwd for testing
}

export const migrate = async ({ source, destination, cwd = process.cwd() }: MigrationOptions) => {
  const sourcePath = path.resolve(cwd, source);
  const destPath = path.resolve(destination);

  // Validation logic
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source folder not found at ${sourcePath}`);
  }

  // Execution logic
  await fs.copy(sourcePath, destPath, { overwrite: true });
  
  return { sourcePath, destPath }; // Return paths for verification if needed
};
```

#### `src/cli.ts` (The Execution)

Update your `package.json` `bin` entry to point to this file's output (e.g., `dist/cli.js`).

```typescript
#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import { migrate } from './core.js'; // Import the logic

const run = async () => {
  const argv = await yargs(hideBin(process.argv))
    .option('destination', { alias: 'd', type: 'string', demandOption: true })
    .option('source', { alias: 's', type: 'string', default: './dist' })
    .parse();

  try {
    console.log(chalk.blue('📦 Starting Migration...'));
    await migrate({ 
      source: argv.source as string, 
      destination: argv.destination as string 
    });
    console.log(chalk.green('✅ Success!'));
  } catch (error) {
    if (error instanceof Error) console.error(chalk.red(error.message));
    process.exit(1);
  }
};

run();
```

-----

### 2\. Install Vitest

In `tools/bundle-migrator`:

```bash
pnpm add -D vitest
```

### 3\. Create the Test File

Create `src/core.test.ts`. We will use Vitest's `vi.mock` to intercept calls to `fs-extra`.

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra'; // This will be the mocked version
import { migrate } from './core';

// 1. Tell Vitest to mock the entire fs-extra module
vi.mock('fs-extra');

describe('migrate() logic', () => {
  
  beforeEach(() => {
    // Reset mocks before each test so they don't interfere with each other
    vi.clearAllMocks();
  });

  it('should copy files from source to destination', async () => {
    // Setup: Pretend the source folder exists
    // We use vi.mocked() to get TypeScript autocomplete on the mock
    vi.mocked(fs.existsSync).mockReturnValue(true);

    // Execute
    await migrate({
      source: './build',
      destination: '/external/server',
      cwd: '/test/app'
    });

    // Verify: Did we call fs.copy with the right paths?
    // Note: path.resolve joins '/test/app' and './build' -> '/test/app/build'
    expect(fs.copy).toHaveBeenCalledWith(
      expect.stringContaining('/test/app/build'), // Source
      expect.stringContaining('/external/server'), // Dest
      { overwrite: true }
    );
  });

  it('should throw an error if source does not exist', async () => {
    // Setup: Pretend source does NOT exist
    vi.mocked(fs.existsSync).mockReturnValue(false);

    // Execute & Verify
    await expect(migrate({
      source: './ghost-folder',
      destination: '/tmp'
    })).rejects.toThrow('Source folder not found');

    // Ensure we strictly did NOT try to copy anything
    expect(fs.copy).not.toHaveBeenCalled();
  });
});
```

### 4\. Configure `package.json`

Update your scripts to include testing.

```json
"scripts": {
  "build": "tsup src/cli.ts --format esm --clean", 
  "dev": "tsup src/cli.ts --format esm --watch",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

*(Note: Ensure your `bin` entry in package.json is updated to `"bin": { "migrate-bundles": "./dist/cli.js" }` since we renamed the entry point).*

### 5\. Run It

1.  **Single Run:** `pnpm test` inside the tool directory.
2.  **Watch Mode:** `pnpm test:watch`. This is beautiful—you can refactor your logic in `core.ts`, and the test will instantly turn green or red in your terminal.

### The Result

You now have a "Production Grade" internal tool:

1.  **Strict Types:** No guessing what variables are.
2.  **Isolated Dependencies:** Doesn't pollute your apps.
3.  **Unit Tested:** You can verify logic without actually moving gigabytes of data or needing a real external server connection.