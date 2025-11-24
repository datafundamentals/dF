# .md Writer

## Problem statement

I am writing content for/with/from:
  - maybe 20 different sites as md content
  - at least 3 different non-sites youtube linkedin social media
  - as many as thousands of different ai chunks as md content
  - as many as thousands of random image and video artifacts
  - dozens of site specific and workflow specific rules delegating to ai prompt feeds for different sites and workflows
  - ability to shovel ai content tasks to any of copilot or internal tooling
  - 2, or any number more, content IDEs or apps
  - dual option of cloud and/or local storage for markdown content
  - frontmatter and site content
  - frontmatter and ai chunk management
  - delegation to git and other versioning
  - publishing controls/automation
  - the possible need to hook up to other unforseen tooling workflows such as n8n, or ???
  - ability to delegate ai work to my own internal ai either local or cloude, or any of the others
  - possible yet to be determined tree/hierarchy based tag set (betterology)
  - what about prez?
  - what about calling in from outside to make queries?
  - from thousands of daily context dumps on specific related and unrelated topics
  - walk through thousands of yaml file thousands of times and come up with learning
  - maintain external and internal metadata for each source file

Nothing that is mentioned above is beyond my capacity with existing tooling, but it is all ad hoc, and has to be re-invented for every new doc in every repeated workflow across many different tools. I might do each workflow in a very similar manner, but I still have to reinvent it every time.

What is needed is not a single workflow or a single toolset, because that is just as big a problem, only in the opposite direction. What i need is a way to stitch all of this gogether


## design notes

```yaml
- works with or without:
    - cloud or local storage
    - app cloud or local IDE authoring
- provides file uploads and links
- provides token counting
- provides contexts for ai advice:
  - selectable
  - by frontmatter
- allows for local ai or AI by cloud API
- 
```

## How to implement local file storage - high level

The goal is to allow the web app to read/write to a specific local folder (e.g., `~/work/primary/writer`) without constant navigation, while respecting browser security.

### 1. Strategy: IndexedDB + File System Access API
Browsers don't allow hardcoding paths like `~/work`. Instead, we use a "One-Time Setup" pattern:
1. User selects the root folder *once*.
2. App saves that **Directory Handle** to IndexedDB.
3. Future file operations use that handle as the `startIn` location.

### 2. Implementation Steps

#### A. One-Time Setup (Set Default Folder)
Create a "Set Project Folder" button. This stores the permission handle.

```javascript
import { set } from 'idb-keyval'; // Tiny wrapper for IndexedDB

async function setProjectFolder() {
  // Opens native picker. User selects '~/work/primary/writer' here.
  const dirHandle = await window.showDirectoryPicker();
  
  // Save the handle object (not the path string) to the database
  await set('default-project-folder', dirHandle);
  console.log("Default folder saved!");
}
```

#### B. Opening Files (Using the Default Folder)
When opening a file, retrieve the handle and use it to set the picker's starting location.

```javascript
import { get } from 'idb-keyval';

async function openMarkdownFile() {
  // Retrieve the saved directory handle
  const startInHandle = await get('default-project-folder');

  const options = {
    types: [{ description: 'Markdown', accept: {'text/markdown': ['.md']} }],
  };

  // If handle exists, picker opens INSIDE '~/work/primary/writer'
  if (startInHandle) {
    // Verify permission if needed (browser may ask on reload)
    if ((await startInHandle.queryPermission()) !== 'granted') {
       await startInHandle.requestPermission({ mode: 'read' });
    }
    options.startIn = startInHandle;
  }

  const [fileHandle] = await window.showOpenFilePicker(options);
  return fileHandle;
}
```

#### C. Saving & Persisting File Handles
To edit a specific file repeatedly without re-opening the picker, save the *specific file handle* too.

```javascript
import { set } from 'idb-keyval';

async function saveFile(fileHandle, content) {
  // 1. Write to the file
  const writable = await fileHandle.createWritable();
  await writable.write(content); 
  await writable.close();

  // 2. Store this specific file handle as "last edited"
  await set('last-edited-file', fileHandle);
}
```

#### D. Restoring Session (On Page Reload)
When the app reloads, check for the last edited file handle.

```javascript
import { get } from 'idb-keyval';

async function loadRecentFile() {
  const fileHandle = await get('last-edited-file');

  if (fileHandle) {
    // Browser requires a user gesture or explicit permission check here
    if ((await fileHandle.queryPermission()) === 'granted') {
      const file = await fileHandle.getFile();
      return await file.text();
    } else {
      // Request permission again
      if ((await fileHandle.requestPermission({ mode: 'readwrite' })) === 'granted') {
        const file = await fileHandle.getFile();
        return await file.text();
      }
    }
  }
}
```

## Managing External Content via Symlinks

To avoid the brittleness of manual symlinks for 11ty content, use the automated script at `tools/manage-content-links.mjs`.

1.  **Edit the configuration** in `tools/manage-content-links.mjs`:
    ```javascript
    const SYMLINKS = [
      {
        target: '~/work/primary/writer/content', // External source
        path: 'apps/df-my-app/src/content'       // Internal destination
      },
    ];
    ```
2.  **Run the script**:
    ```bash
    node tools/manage-content-links.mjs
    ```

This ensures your environment is reproducible and links are always correctly established.
