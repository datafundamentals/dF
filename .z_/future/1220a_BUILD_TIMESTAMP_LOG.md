# 1220a Build Timestamp Log

## Goal
Inject a build timestamp into the console logs of both the Extension Host and the Webview.

## Context
See [.z_/future/1220_VSF_DESIGN_DOC.md] for architectural context.
Ensures developers are debugging the latest deployed code.

## Action Items

### 1. Update `df-yaml-tools-ui` (Webview)
- [ ] Modify `extensions/df-yaml-tools-ui/vite.config.ts` to define `__BUILD_DATE__`.
- [ ] In `extensions/df-yaml-tools-ui/src/df-yaml-tools-app.ts`, add:
  ```typescript
  // @ts-ignore
  console.log(`%c df-yaml-tools-ui built: ${__BUILD_DATE__}`, 'color: #00ff00; font-weight: bold;');
  ```

### 2. Update `df-yaml-tools` (Extension Host)
- [ ] In `extensions/df-yaml-tools/src/extension.ts`, add a log line in `activate` with the current runtime timestamp.

## Verification
- Run extension.
- Verify green timestamp in Developer Tools console.
