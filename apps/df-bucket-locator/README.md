# Bucket Locator

## Workflow

1. Start the API Worker and the pioneer Access session Worker locally.
2. Start this Vite app and authenticate with the locally configured Access identity.
3. Create locations and buckets, then photograph or select a photo on mobile, or choose/drop an image on desktop, and describe parts into an active bucket.
4. Search by text, location, bucket, intersecting tag filters, and optionally limit results to buckets created by the signed-in user. The API derives this identity from Cloudflare Access. The default scrolling table lists all matching parts in creator, location, bucket, and part-name order; switch to cards when desired. Edit or directly delete parts, or remove one unit with **Take 1**; quantity zero deletes the part and queues its photo for cleanup.
5. Use **Manage records** to rename or delete empty locations and buckets, and to create, rename, or delete tags. Locations with buckets and buckets with parts cannot be deleted; move or remove their contents first. Audit history is append-only.

## Local Development

The versioned deployment profile is `services/workers/df-bucket-locator/deployment/production.json`. It is the source of truth for the public origin, routes, approved users, account, and shared D1/R2 resource names/IDs. The app's Rollup build injects only the public origin. Worker configs are generated from the profile for local and production commands; do not edit separate production host/user copies into Wrangler configs.

The app listens on `http://127.0.0.1:4178` and proxies `/api` to the bucket Worker on port `8788`, plus `/cf-auth` and `/cdn-cgi` to the pioneer auth Worker on port `8787`. The local page sets the backend origin to its own origin, so inventory and auth requests remain same-origin through these proxies.

```sh
pnpm --filter @df/bucket-locator-worker db:migrate:local
pnpm --filter @df/bucket-locator-worker dev
pnpm --filter @df/standard-pioneer-auth-worker dev
pnpm --filter @df/df-bucket-locator dev
```

The generated local Wrangler configs use the profile's simulated Access identity (`sahar.ayazian@gmail.com`) only for local development and assign the app's local Worker ports. Production uses the two approved users in the profile; no local identity override is needed.

## Production Gate

Run the non-destructive profile check with `pnpm validate:bucket-locator-profile` and account/resource preflight with `pnpm --filter @df/bucket-locator-worker preflight`. Before deployment, the `btrg.org` zone must be active and proxied through Cloudflare. Configure Access policies for `btrg.org/api/*` and `btrg.org/cf-auth/_protected/*` to allow only the two approved users in the profile. Enable R2, create/select the shared bucket, create/select the shared D1 database, and put its real UUID in `sharedStorage.d1DatabaseId` in the profile.

After Access and resources are provisioned and preflight passes, deploy with explicit confirmations:

```sh
pnpm deploy:bucket-locator-workers -- --confirm-access-policy --apply-migrations
```

This applies remote migrations before deploying both profile-generated Workers. It leaves D1/R2 creation and Access policy configuration to the account owner; deployment is blocked until resource bindings exist. Keep public `workers.dev` access disabled.

The Worker trusts only `context.access.getIdentity()` from Cloudflare's Access integration, never a request header supplied by the browser. Failed R2 deletions remain queued in D1 and are retried by the hourly scheduled event. A successful local bundle build or simulated Access identity does not verify production authentication; test sign-in/return, reads/writes, photo upload/read, logout, and unauthorized-user rejection from the actual `btrg.org` page after account resources are provisioned.

## 11ty MPA Release

Bucket Locator follows the repo's MPA Rollup deployment convention. The build artifact is `dist/bundle/df-bucket-locator.js`; `_bundle/inner.html` and `_bundle/outer.html` provide the inner app page and outer iframe wrapper.

```sh
pnpm bundle:release df-bucket-locator
pnpm deploy:copy-bundle df-bucket-locator /absolute/path/to/11ty/site/static/wc
```

The copy command places the app under a `df-bucket-locator/` directory at the target and generates the site's `inner.html` plus `move-me/df-bucket-locator/index.html`. Configure the destination site and its iframe height in `.env.deploy` or pass the target directory explicitly. The Rollup bundle embeds `siteOrigin` from the deployment profile and initializes `window.__DF_BUCKET_LOCATOR_CONFIG__` before registering the auth wrapper; the HTML does not duplicate the origin. Configure same-origin Cloudflare routes `btrg.org/api/*` and `btrg.org/cf-auth/_protected/*`, plus the Access-managed logout endpoint at `btrg.org/cdn-cgi/access/logout`; Eleventy does not proxy these paths or host backend code.

## Checks

```sh
pnpm --filter @df/df-bucket-locator build
pnpm --filter @df/df-bucket-locator build:rollup
pnpm --filter @df/df-bucket-locator test
pnpm --filter @df/deploy-scripts test
pnpm --filter @df/bucket-locator-worker build
pnpm --filter @df/bucket-locator-worker test
```

Bucket Locator deployment tests live in `tools/deploy-scripts/bucket-locator-tests/`.
The same-origin URL helper is `packages/state/src/utils/bucket-locator-backend-url.ts`,
with its test in the existing `packages/state/src/stores/__tests__/bucket-locator-backend-url.test.ts`.

For an 11ty page, copy `apps/df-bucket-locator/dist/bundle/df-bucket-locator.js` to the site's static directory and use:

```html
<df-standard-pioneer-auth-wrapper headless>
	<bucket-locator-app></bucket-locator-app>
</df-standard-pioneer-auth-wrapper>
<script type="module" src="/wc/df-bucket-locator.js"></script>
```

The app bundle includes the pioneer auth wrapper registration and injects the app stylesheet. The standalone wrapper bundle is `packages/ui-lit/dist/df-standard-pioneer-auth-wrapper.bundled.js`; do not include that second bundle on the same page as the Bucket Locator bundle. Configure the public site's same-origin `/api`, `/cf-auth`, and `/cdn-cgi` routes to Cloudflare before expecting authentication or data requests to work.