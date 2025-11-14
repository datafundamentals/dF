# Making Teaching Functions Shared

When the teaching app was first created, a web component that demonstrated function calls was needed. This was early in the life of the monorepo before other standards were put into place.

Since then these two changes happened

1. Default location for web components is packages per guides/WC_SHARED_DEFAULTS.md and also a part of storybook

2. Default location for functions is services/functions per guides/FUNCTIONS_PLACEMENT.md

Taking these two as a deliverable, apps/df-firebase-teaching-app is non compliant.

The <df-functions-demo></df-functions-demo> web component needs to move to packages, the functions need to move to services/functions, and storybook needs to be updated with <df-functions-demo></df-functions-demo> as well.

There is an odd wrinkle to this ticket which is that the functions emulator may not run without an apps/df-firebase-teaching-app/functions directory - or some other limitation similar to that. This will have to be dealt with by iterating through it.