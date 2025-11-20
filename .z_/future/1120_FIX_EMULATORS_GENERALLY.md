# Fix Emulators Generally

I have been working on several firebase apps, as you would discover by searching for firebase.json files within the apps/ directory of this monorepo

Every time i build a new app I seem to improve things a bit. But now i am going back and fixing things that were a bit screwy in earlier apps. Emulator, function, and other setups need adjusting in all apps.


## STEP 1 - Eliminate all traces of firebase hosting

One adjustment is across the board. I need to eliminate firebase hosting from all emulators and all apps. This monorepo does not delegate hosting to firebase, either on the cloud, or in emulators. All such activity is handled by vite locally, and external resources, on the cloud. So i need to hunt down all such references in my apps and make sure that firebase hosting is removed everywhere.

There are some odd touchpoints here that you may have to investigate. This might be a hairball, code wise.

Once this step is done, you need to return control to me and allow me to conduct manual process tests to make sure nothing is broken in my normal workflow.

## STEP 2 - Establish one app to not touch

There is one app which is very special because it is for a very specific use case that is otherwise an antipattern in our monorepo - apps/df-auth-trigd-func-tool

Your only job is to acknowledge that subsequent steps should not touch this one app or it's artifacts.

## STEP 3 - Emulator fixes

All of these apps need to have their emulator set up the same way, when i launch `pnpm --filter @df/df-[whatever] emulators:start`

apps/df-activity-log
apps/df-app-starter-template
apps/df-chat-app
apps/df-firebase-teaching-app
apps/df-user-admin-app

The model which works for my workflow is apps/df-activity-log so that could be your model, except even that one I am unsure about everything in this regard. There is a file `packages/firebase/firebase.json` which has a comment in it that it is the single source of truth for all emulators. Does that mean all the firebase.json files in the apps folders should not have emulators?

At the end of this step - and it might be mostly you explaining things to me, the emulators will be working properly for the above 5 apps, and they will all make sense to me, as well.

## STEP 4 - Port logic

This is my first monorepo. The whole problem of having so many ports managed in one place, with so many opportunities for confusion, conflict, over-rides and other issues is a mess, in my brain.

In addition, we changed some of the default ports that firebase emulators use, to non-default ports, thinking that some (like 8080 and 8000 and 5000) are frequently used by apps outside the emulators. So this may or may not have created more confusion, mostly because I am not sure that our substitutions are evenly and cleanly applied across all apps.

Another issue which needs to be understood is that we recently deployed a script to handle some port assignment, so this also needs to be checked against other logic.

Thus, the task of this step is to help me examine the points and audit it for problems and logic.