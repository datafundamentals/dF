# Tools

TL;DR; I would like assistance in organizing tools and scripts spread out in this monorepo, into a tools/ directory

Directions for implementing this ticket are found at the bottom of this document. 

## Background on this task

I asked gemini3 where to put tools that do not fit inside apps/ or packages/ or services/ and this was it's response. Directions for implementing this ticket are found at the bottom of this document. The following was the response, from gemini3

### Response from gemini3 begins here

This is a classic "growing pains" moment in monorepo evolution. You have successfully categorized your *runtime* code (apps, packages, services), but you now have *meta* code—code that operates on the repository itself.

Since you value strict rules to reduce cognitive load, you need a designated home for these tools so you don't have to "remember" where they live.

Here is the industry-standard approach for handling tooling in a pnpm/turbo environment, specifically designed to keep your `apps` and `packages` clean.

### The Strategy: The `tools/` (or `internal/`) Workspace

The cleanest way to handle this is to introduce a new top-level directory, distinct from `packages`. While `packages` implies code that might be imported into an app and shipped to production, `tools` implies code used to facilitate the development or deployment process.

#### 1\. The Directory Structure

Add a `tools/` directory at the root.

```text
my-monorepo/
├── apps/
├── packages/
├── services/
├── tools/               <-- New Home for Meta-Code
│   ├── deploy-scripts/  <-- Your bundle migration logic
│   ├── eslint-config/   <-- Shared linting rules
│   ├── ts-config/       <-- Shared TS configs
│   └── generators/      <-- Scaffolding scripts (plop, etc.)
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

#### 2\. Why this works for your "Bundle Migration" example

You mentioned a script that migrates app bundles to external locations. This likely requires dependencies (e.g., `shelljs`, `aws-sdk`, `firebase-tools`, or `fs-extra`).

If you put this script in the root, you have to pollute your **root** `package.json` with these dependencies. If you put it in a specific app, you lose reusability.

By creating `tools/deploy-scripts`:

1.  **Isolation:** It has its own `package.json`. You install `fs-extra` *only* there.
2.  **Execution:** You can run it via Turbo.
3.  **Mental Model:** If it moves files, it lives in `tools`. If it renders UI, it lives in `packages`.

### Implementation Details

#### Step 1: Update Workspace Config

You need to tell pnpm that this new folder contains workspaces.

**`pnpm-workspace.yaml`**

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "services/*"
  - "tools/*"  <-- Add this
```

#### Step 2: Create the Tool Package

For your specific migration script, you would create `tools/migrator/package.json`:

```json
{
  "name": "@tooling/migrator",
  "version": "0.0.0",
  "private": true, 
  "scripts": {
    "migrate:bundles": "node ./src/index.js"
  },
  "dependencies": {
    "fs-extra": "^11.0.0",
    "chalk": "^5.0.0"
  }
}
```

#### Step 3: Usage

You can now run this from the root using pnpm filters or Turbo.

  * **Directly:** `pnpm --filter @tooling/migrator run migrate:bundles`
  * **As a dependency:** You can actually install this tool into your apps as a `devDependency` if you want to call it from an app's build pipeline.

In `apps/my-web-app/package.json`:

```json
"devDependencies": {
  "@tooling/migrator": "workspace:*"
},
"scripts": {
  "postbuild": "migrator migrate:bundles"
}
```

-----

### Alternative: The `./scripts` folder (For Bash/Shell only)

If your tools are strictly **Bash** or **Zsh** scripts (no Node dependencies, just standard shell commands), the convention is slightly different.

Create a `./scripts` folder at the root.

```text
my-monorepo/
├── scripts/
│   ├── clean-all.sh
│   ├── verify-env.sh
│   └── migrate-bundles.sh
```

**The Rule of Thumb:**

  * **Use `./scripts`** if it is a simple shell script that runs natively without `npm install`.
  * **Use `tools/package-name`** if the script is written in TypeScript/JavaScript and requires 3rd party libraries (node\_modules).

### Summary Recommendation

Given your description of "migrating bundles" (which implies file system operations, potential logic, and perhaps network requests), I recommend the **`tools/` workspace** approach.

It codifies the "place for everything" rule:

1.  **`apps/`**: Entry points for users.
2.  **`services/`**: Entry points for APIs/Backends.
3.  **`packages/`**: Shared code imported by the above.
4.  **`tools/`**: Code that operates *on* the above.

**Would you like me to draft a `package.json` structure for that migration script to see how the dependencies would look separated out?**

I answered yes, to this question. To see the response from please consult ./1118_BOOTSTRAP_PROBLEM_SOLUTION.md

## Directions for implementing this ticket are found at the bottom of this document. 

NOTE: This ticket is a "best efforts" ticket. Perfection is not critical, as the effort started in this ticket will be continuing through the life of this monorepo. We just need to the direction set and be as thorough as is reasonable for this given moment. There will random scripts and or tools which may fall between the cracks.

- help me organize an initial refactoring of this monorepo, to accomplish the above noted objectives
- help me find all of the candidates for refactoring spread around in this monorepo
- for each candidate, help me get it all put in place
- once it is done, write the documentation, including an entry point from guides/STANDARDS_STYLES.md which seems to be the primary entry point(?) for all other guides? 