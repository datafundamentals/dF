# Why This Monorepo?

What is the **motivation** for this monorepo?

Wouldn't it just be easier to create repo for each separate project?

TL;DR: There are lots of reasons not to go to the trouble of a monorepo, but the reasons **for** a monorepo shifted dramatically, recently.

## Separate Projects Are Easier, Until

Keeping projects simple is the holy grail of time management.

- Two endpoints
- One conversation, between them
- Keep it simple

This works perfectly until there are dozens of endpoints, not just 2.

It can also fall down when you ask it to be better than just good enough to get the job done.

## Performance

When you start seeing numbers like this, performance starts to matter. A lot. From [_this internal doc_](apps/df-firebase-teaching-app/guides/PERFORMANCE_PATTERNS.md)


| Approach | App Startup Time | Memory Usage | Network Calls |
|----------|------------------|--------------|---------------|
| **Eager** (all services at startup) | 800ms | 15MB | 5 requests |
| **Lazy** (on-demand) | 200ms ✅ | 5MB ✅ | 1 request ✅ |

## Copy-Pasting: _Bad_

You have multiple apps sharing a lot of small chunks of code. You don't want to start copy-pasting the same code into multiple projects, just because you need them everywhere.

These are all the shared code modules _**that could have been copy-pasted to multiple repositories**_, as of Oct 2025, within this monorepo

```asci


packages
├── config
│   ├── src
│   │   └── index.ts
├── firebase
│   ├── src
│   │   ├── auth
│   │   ├── emulator-detection.d.ts
│   │   ├── emulator-detection.ts
│   │   ├── firebase-app.ts
│   │   ├── firestore
│   │   ├── functions
│   │   ├── index.ts
│   │   └── storage
├── state
│   ├── coverage
│   │   ├── base.css
│   │   ├── block-navigation.js
│   │   ├── coverage-final.json
│   │   ├── favicon.png
│   │   ├── index.html
│   │   ├── prettify.css
│   │   ├── prettify.js
│   │   ├── sort-arrow-sprite.png
│   │   ├── sorter.js
│   │   ├── stores
│   │   └── utils
├── types
│   ├── src
│   │   ├── df-segmented-button.ts
│   │   ├── df-upload-link.ts
│   │   ├── firebase-auth.types.ts
│   │   ├── firebase-firestore.types.ts
│   │   ├── firebase-storage.types.ts
│   │   ├── firebase-todos.types.ts
│   │   ├── firebase.types.ts
│   │   ├── index.ts
│   │   ├── npm-info.ts
│   │   └── practice-widget.ts
└── ui-lit
    ├── src
    │   ├── __tests__
    │   ├── df-markdown-codemirror.ts
    │   ├── df-npm-info-widget.ts
    │   ├── df-practice-widget.ts
    │   ├── df-segmented-button.ts
    │   ├── df-upload-link-auth.ts
    │   ├── df-upload-link-store.ts
    │   ├── df-upload-link-types.ts
    │   ├── df-upload-link.ts
    │   ├── file-processing.ts
    │   ├── firebase
    │   ├── index.ts
    │   └── my-element.ts

```

## Multiple Apps With 80% Shared Foundations




