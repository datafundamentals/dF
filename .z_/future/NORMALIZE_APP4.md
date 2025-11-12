# NORMALIZE TEACHING APP 4

TL;DR: This ticket takes partial steps to prepare an abandoned app for later usage as an app template.

The primary goals of this ticket center around specific easier to implement fixes that would make this app worthy of consideration as a template app. This ticket will only attempt to do a few of the easier subtasks, leaving more challenging subtasks for subsequent tickets.

### Done manually by user before handing to coding agent:

1. remove all guides
2. remove functions folder entirely
3. clean (empty?) README.md

### Noted Scope Exclusions for this ticket:

1. emulator mode switching
2. guides
3. cloning process

### Summary of Steps in this ticket

This is just a summary, please follow the actual steps enumerated below this section

1. create and install <remove-replace-me> placeholder - your shared web components go here
2. remove Web Components that do not belong in a starter template
3. refactor app container component
3. install rollup configuration
4. refactor name to df-app-starter-template

### Testing for each step includes:

1. does the app run?
2. pnpm install, build, lint, test and running the app dev
3. visual file check in IDE - no stuff don't expect
4. later steps: does the rollup bundle run?
5. later steps: can the bundle be used in a web page?

## Step 1 - Create and install <remove-replace-me> placeholder

This work must be done following all applicable standards as set in guides/WC_SHARED_DEFAULTS.md

Hints: 
- If you are not creating this web component in packages/ui-lit you are doing something wrong
- If the new web component does not get added to storybook as a part of this step, you are doing something wrong

You are to create a new web component <remove-replace-me> with nothing other than this simple content "placeholder - your shared web components go here"

This web component is then installed as follows in index.html

```html
<body>
    <df-auth-wrapper headless>
      <remove-replace-me></remove-replace-me>
      <df-firebase-teaching-app></df-firebase-teaching-app>
      <df-firestore-demo></df-firestore-demo>
      <df-storage-demo></df-storage-demo>
      <df-functions-demo></df-functions-demo>
    </df-auth-wrapper>
    <script type="module" src="/src/main.ts"></script>
  </body>
```

Once the app is working with this new web component, this step is complete.


Coding Agent stops all work here and allows User to validate work so far for:
  - code and design compliance
  - broken builds etc
  - does it work, so far?
  - is the new shared component visible in storybook?

## Step 2 - Remove Web Components that do not belong

All of the web components listed below are completely and totally removed from this app, including code.

      <df-firestore-demo></df-firestore-demo>
      <df-storage-demo></df-storage-demo>
      <df-functions-demo></df-functions-demo>

Coding Agent stops all work here and allows User to validate work so far for:
  - code and design compliance
  - broken builds etc
  - does it work, so far?

## Step 3 - Refactor <df-firebase-teaching-app>

1. <df-firebase-teaching-app> is to be renamed to <rename-me-app-container>
2. All content is to be removed from this web component
3. Then, <remove-replace-me></remove-replace-me> becomes the entire content of this web component
4. The body of the index.html would then look like this

```html
<body>
    <df-auth-wrapper headless>
      <rename-me-app-container></rename-me-app-container>
    </df-auth-wrapper>
    <script type="module" src="/src/main.ts"></script>
  </body>
```

Once the app is working with this refactored web component, this step is complete.

Coding Agent stops all work here and allows User to validate work so far for:
  - code and design compliance
  - broken builds etc
  - does it work, so far?

## Step 4 - Install Rollup Functionality

Using code copied from apps/df-activity-log, and then making all necessary adjustments, provide rollup functionality such that the entire bundle can be built and deployed externally in an html file, either as an SPA or part of an MPA.

Coding Agent stops all work here and allows User to validate work so far for:
  - code and design compliance
  - broken builds etc
  - does it work, so far?



## Step 5 - Refactor name to df-app-starter-template 

Refactor from apps/df-firebase-teaching-app4 to apps/df-app-starter-template

- make sure that all other references are refactored as well, from pnpm turbo and package.json references to any other not mentioned.

Coding Agent stops all work here and allows User to validate work so far for:
  - code and design compliance
  - broken builds etc
  - does it work, so far?



## Step 6 - Cleanup and related

Work with user to clean up any other issues that have come up during this process, and not yet resolved.