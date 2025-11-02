# Chat Room Ticket

This is my fifth attempt at a simple chat room widget. The first four attempts were abandoned because of code compliance issues, and just general failures to even work.

This ticket is different in that

1. I am starting all over from scratch, not attempting to re-use code from a previously failed attempt.
2. The ticketing prompt and guides process has been reworked to give the coding agent more User direction from the outset, rather than letting it fail and then trying to fix it.
3. I have inserted several User validation steps, in order to catch problems when they are smaller, and not build problems on top of other problems.
4. I tried to make the requirements simpler. One simple chat room widget, one collection, any user, one app to test the deployment on.
5. This widget includes no production quality code, thus no automated testing is required as part of the code. Only manual User testing is required for this ticket's completion.
  
## Step 1 - Clone App1 as a Temporary Testing Agent

apps/df-firebase-teaching-app1 is cloned to apps/df-chat-tmp-test-app

All relevant pnpm, turbo, and package.json adjustments are made, to assure that the new clone is usable and worthy of being worked within.

Coding Agent stops all work here and allows User to validate work so far for:
  - code and design compliance
  - broken builds etc
  - does it work, so far?

## Step 2 - New chat room Web Component

This is the simplest possible chat room widget, for all unfiltered users currently logged in to this firebase project at that time.

These new files, following as close as is reasonable to the coding approach of others.

packages/ui-lit/src/df-chat-widget.ts following the approach of packages/ui-lit/src/df-upload-link-store.ts
packages/types/src/firebase-chat.types.ts following the approach of packages/types/src/firebase-todos.types.ts
packages/state/src/stores/chat.store.ts following the approach of packages/state/src/stores/todos.store.ts

When this step is complete, <df-chat-widget> should be
  - deployable within any teaching app in the monorepo
  - read and write from and to the chatMessage collection in firestore
  - delegate all of it's authenticated user functionality to other parts of this monorepo, getting what it needs from Signals

Coding Agent stops all work here and allows User to validate work so far for:
  - code and design compliance
  - broken builds etc
  
## Step 3 - Storybook Deployment of <df-chat-widget>

This <df-chat-widget> is then deployed to storybook such that it can be visible like any other storybook component already showing.

Coding Agent stops all work here and allows User to validate work so far for:
  - code and design compliance
  - broken builds etc
  - does it work, so far?

## Step 4 - <df-chat-widget> deployment to df-chat-tmp-test-app

<df-chat-widget> is deployed to df-chat-tmp-test-app so that it can be run from localhost in many tabs, using the users that emulator is running locally. 

To do this, the chat widget is installed directly in between the following two components, in index.html

```html
    <df-auth-demo></df-auth-demo>
    <df-firestore-demo></df-firestore-demo>
```

Coding Agent stops all work here and allows User to validate work so far for:
  - code and design compliance
  - broken builds etc
  - does it work, so far?

## Step 5 - Cleanup

Coding agent takes specific directions of the User to clean up this implementation, as required



