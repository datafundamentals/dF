# df-standard-pioneer-auth Worker

This Worker exposes the Cloudflare Access session used by
`df-standard-pioneer-auth-wrapper`.

## Routes

- `GET /cf-auth/whoami` returns the authenticated user's non-sensitive profile.
- `GET /cf-auth/login` returns to the requesting same-origin page after Access login.
- `GET /cf-auth/login?mode=popup` completes the optional popup flow.

## Local development

1. Replace the placeholder `access.dev.aud` in `wrangler.jsonc` with the Access
   application's AUD tag.
2. Run `pnpm --filter @df/standard-pioneer-auth-worker dev`.
3. Edit the local identity in `wrangler.jsonc` as needed. Remove the `access.dev`
   block to exercise the unauthenticated response.

## Production setup

Create a hostname-based Cloudflare Access application for
`yourdomain.example/cf-auth/*`, attach this Worker to the matching proxied route,
and configure Google as an identity provider. Do not protect the whole hostname
unless the whole site is meant to require authentication.

The checked-in configuration intentionally has no production route. Add the real
route only after the zone and hostname are known, for example:

```jsonc
"routes": [
  {"pattern": "yourdomain.example/cf-auth/*", "zone_name": "yourdomain.example"}
]
```

Cloudflare provides the authenticated identity through `ctx.access`. The Worker
does not store tokens or secrets and all identity responses are marked `no-store`.
