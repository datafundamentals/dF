# Next steps after the routing selector

Written 2026-09-09 on branch `0909a`, updated the same day once the host landed.

Delivered on this branch: `df-position-scale`, `df-fork-toggle`, and the
`df-routing-selector` host that composes them, plus stores, tests, stories, exports and a
rollup bundle entry for the host. Nothing below is required for that work to be reviewed.

## 1. Bundle deployment to the external site

`packages/ui-lit/rollup.config.js` now emits `dist/df-routing-selector.bundled.js` — the
host only, since bundling each leaf would ship near-duplicate copies of the same
dependencies. Getting that artifact onto the consuming 11ty site is a human operation
(`guides/BUNDLE_DEPLOYMENT.md`, Tier 4).

The consuming page mounts one element and listens for one event:

```html
<df-routing-selector></df-routing-selector>
```

`df-routing-selector-change` carries `{forkId, position, category}`. Options, anchors and
all labels are set as properties by the page, so no visitor-facing copy lives in
`@df/ui-lit`.

## 2. Persistence stays with the consumer

The components emit and store nothing. The consuming site records `category` itself and
has its own open question about doing that across origins, tracked on its side.

## Pre-existing findings, unrelated to this work

**`dist/segmented-button.js` has no source file.** There is only
`src/df-segmented-button.ts`. It is orphaned output from a rename that survived because
`dist/` was never cleaned, and `package.json` maps `./segmented-button` and
`./segmented-button.js` to it. A clean build would break both entry points. Worth checking
whether other short-named exports have the same problem — every export currently resolves
only because stale artifacts are still on disk.

**`df-segmented-button` does not honour its own store.** `segmented-button.store.ts`
exports `optionsSignal`, `setOptions` and `disableSegments`, but the component hard-codes
four icon options inside `render()` and ignores the store's options entirely. It also
assigns `this.selected` directly rather than routing through the store, against the
signals-first rule in `WC_SHARED_DEFAULTS.md`. Evaluated for reuse while building
`df-fork-toggle` and rejected for these reasons.

Neither is fixed here. Changing published export paths and reworking a shipped
component's API each deserve their own ticket.
