# Chat Room Ticket

In this ticket, a broken application will be removed, while being careful to leave in place a similar app which is working.
  
## Step 1 - Identify the similar app that is not to be touched.

Please note the following application, and trace all of it's calls and imports to identify what not to remove.

`apps/df-chat-tmp-test-app` is the application which is **not** to be removed.

Also note from it's imports there are dependencies in packages/state packages/types and packages/ui-lit which you must be careful not to remove.

This list of things to not remove will probably include

- packages/ui-lit/src/df-chat-widget.ts
- packages/types/src/firebase-chat.types.ts
- packages/state/src/stores/chat.store.ts

Please trace down and enumerate all such places so that you can check against this list in subsequent step(s) if necessary.

Coding Agent stops all work here and allows User to validate work so far to:
  - review the list of everything **not** to be removed and validate

## Step 2 - Identify the application to be removed

  `apps/df-chat` is the application to be removed.

Please trace all dependencies before removing this application, and enumerate each carefully, before removing anything. This assures that we are not leaving orphaned code in the monorepo. 

Then compare this list against the list of dependencies to not be removed, from the step above.

Then make certain that each dependency listed as to be removed is not used elsewhere in this repository.

You should now have a list of everything which is safe to be removed.

This is the simplest possible chat room widget, for all unfiltered users currently logged in to this firebase project at that time.

These new files, following as close as is reasonable to the coding approach of others.
kages/state/src/stores/todos.store.ts

Once you have a list of everything to be removed, this step is complete

Coding Agent stops all work here and allows User to validate work so far to:
  - review the list of everything to be removed and validate
  - make certain branch is clean and ready for next step
  
## Step 3 - Delete, refactor, build, validate.

From the above lists, refactor this monorepo to delete `apps/df-chat` and all code in this monorepo which would subsequently be orphaned.

Coding Agent stops all work here and allows User to validate work so far for:
  - build still works
  - apps/df-chat-tmp-test-app still works
  - code is properly checkpointed before next step.

## Step 4 - String search and refactoring.

At this point it is possible that pnpm, turbo, and any number of other files may still contain references to apps/`df-chat` and also to `apps/df-chat-tmp-test-app`

Extreme care must be taken to refactor these conditions, removing the former, and leaving the latter.

Coding Agent stops all work here and allows User to validate work so far for:
  - everything still works
  - sanity checks

## Step 5 - Cleanup

Coding agent takes specific directions of the User to clean up this implementation, as required



