# 1007a — Separate Authentication from Application Authorization

## Ticket type

Cross-workspace authentication and authorization redesign for the Cloudflare
authentication Worker, the shared `df-standard-pioneer-auth-wrapper`, and the
Bucket Locator application.

## Objective

Redesign the pioneer authentication flow so that:

1. End users can authenticate with an external identity provider without having
   Cloudflare accounts.
2. Authentication establishes and communicates a verified identity; it does
   not decide what application content is visible or what application
   operations are permitted.
3. The authentication wrapper always renders its slotted content. The slotted
   application owns all content-level authorization decisions.
4. Cloudflare Workers authenticate requests to Cloudflare APIs using a
   server-validated session cookie. Bucket Locator continues to enforce its
   own authorization both in its UI and authoritatively in its API Worker.

The application remains hosted on Cloudflare infrastructure. Its operator
still needs the Cloudflare account and deployment resources required to run
Workers and D1. **End users do not need Cloudflare accounts.** For the initial
production provider, use Google OpenID Connect (OIDC), so users need a Google
account accepted by the provider configuration. Do not introduce Firebase or
any Firebase service, SDK, database, or authentication flow.

## Background and current behavior

- `df-standard-pioneer-auth-wrapper` currently replaces the slot with a
  full-screen sign-in view until authentication succeeds. That makes the
  wrapper an access gate and violates the intended separation of concerns.
- The wrapper and `@df/state` auth store call the pioneer Worker for session
  information, but the Worker gets identity from Cloudflare Access through
  `context.access.getIdentity()`. It does not create an application session
  or set an application cookie.
- The API Worker also trusts the Access context and independently applies
  `ALLOWED_USERS`. Bucket Locator's production profile contains two approved
  email addresses; local development simulates an Access identity.
- The component's logout currently points at Cloudflare's
  `/cdn-cgi/access/logout` endpoint. The Storybook copy describes slotted
  content as protected by Access.
- The app's browser endpoints, Worker routes, deployment profile generator,
  local worker runner, tests, and README all encode these assumptions and must
  be updated together.

## Confirmed architectural decisions

### Authentication versus authorization

- Authentication answers: **who is this user?**
- Authorization answers: **what may this identity access or do in this
  application?**
- The shared auth wrapper must not make an authorization decision, enforce an
  email allowlist, hide or disable its slot, or imply that authentication
  grants access.
- The wrapper may provide sign-in/sign-out controls and identity/status UI.
  Those controls must not cover, replace, or conditionally render the slot.
- “Always renders the slot” means the wrapper does not gate the slotted
  element. The slotted element may itself intentionally render no content (or
  as little as a blank pixel) when its own authorization decision denies
  access.
- The slotted app is responsible for its visible content and client-side
  authorization UX. Client-side checks are not security boundaries.
- The API Worker remains the security boundary for data and mutations. It
  authenticates the session independently and enforces Bucket Locator's
  application authorization server-side.
- A valid but unauthorized user must be distinguishable from an unauthenticated
  user. The Bucket Locator API returns `401` for a missing/invalid session and
  `403` for an authenticated identity denied by Bucket Locator policy.

### Session and identity

- Use a Cloudflare Worker-managed OIDC authorization-code flow with Google as
  the initial identity provider. Do not rely on Cloudflare Access to sign users
  in, provide identity headers/bindings, or manage logout.
- Create an unpredictable, opaque session credential. Store only a
  non-reversible hash of that credential in a D1 session table; resolve the
  identity and expiry server-side. Do not put an unsigned or user-editable
  identity claim in a cookie and trust it.
- Set the session cookie as `HttpOnly`, `Secure` in production, `SameSite=Lax`,
  and scoped to the application origin (`Path=/`). Do not expose the credential
  to browser JavaScript, DOM events, logs, URLs, or client bundles.
- Since browser code cannot read an `HttpOnly` cookie, the wrapper obtains the
  verified, non-secret user profile from the same-origin session endpoint. The
  shared `@df/state` auth store exposes that profile as reactive state and the
  existing user-changed event. That profile is identity information for
  application authorization; it is not a bearer credential.
- Validate OIDC state, nonce, issuer, audience, expiry, signature, and the
  verified-email claim before establishing a session. Use the provider subject
  as the stable identity; do not fall back to email as the subject identifier.
- Keep provider secrets in Cloudflare Worker secrets (and untracked local
  development configuration), never in the versioned deployment profile,
  browser bundle, HTML, or logs.
- Require exact same-origin validation for post-login return targets and
  validate `Origin` for state-changing cookie-authenticated API requests. The
  OIDC callback must validate its state/nonce and use safe redirect handling.
- Logout revokes/deletes the server-side session and expires the cookie. A
  client-only state reset is not sufficient logout.

### Bucket Locator authorization

- Preserve the production approved-user policy represented by
  `approvedUsers` in the Bucket Locator deployment profile. Treat it as
  **Bucket Locator authorization**, not as a restriction on who may complete
  the shared sign-in flow.
- A non-approved user may authenticate and receive their own verified profile.
  Bucket Locator itself decides what that user sees; it must show a clear
  unauthorized state rather than relying on the auth wrapper to suppress the
  app.
- The API Worker independently checks the authenticated identity against the
  approved-user policy before serving protected reads or writes. The browser
  check must never replace this API check.
- Normalize and compare verified email addresses case-insensitively to preserve
  the current allowlist behavior. Keep the stable provider subject in the
  authenticated profile/session as the user's identity; do not use an email
  supplied by the browser as proof of identity.

## Scope

### A. Pioneer auth Worker

Update `services/workers/df-standard-pioneer-auth` to own the complete
application login session lifecycle:

- Implement Google OIDC login initiation, callback validation, session
  creation, session lookup, and logout.
- Use the existing Cloudflare Worker runtime and Cloudflare-managed
  configuration/storage only. No Firebase and no external application server.
- Persist minimally necessary session fields in D1, with expiry and explicit
  revocation by logout. Add or update D1 migrations and bindings as needed.
- Return only the non-sensitive verified identity profile from the session
  endpoint, with `Cache-Control: no-store` and appropriate security headers.
- Do not require an Access identity binding. Do not return an identity based on
  caller-supplied headers, query parameters, or cookies other than the opaque,
  server-validated session credential.
- Keep sign-in return targets same-origin. Preserve popup completion behavior
  and strict origin validation if popup login remains supported.
- Keep the existing session and login endpoint defaults where practical to
  avoid unnecessary consumer breakage. Add callback and Worker logout routes;
  stop depending on `/cdn-cgi/access/logout`. If route names change, update all
  consumers, local proxies, tests, and docs in the same change.
- Provide a secure local development/test path that does not depend on a
  Cloudflare Access account or Access simulated identity. Any local test
  identity mechanism must be impossible to enable in production and must fail
  closed when production configuration is incomplete.
- Validate required OIDC configuration and fail with an actionable server-side
  configuration error; do not silently issue an unauthenticated or
  success-shaped session.

### B. Shared state and `df-standard-pioneer-auth-wrapper`

Update the shared package surfaces:

- Change `packages/state/src/stores/cf-auth.store.ts` so it checks and exposes
  the Worker-managed application session, not Cloudflare Access.
- Keep canonical profile/auth types in `packages/types`; ensure the user type
  can represent the verified provider subject and profile fields without
  treating the cookie/session credential as user-visible data.
- Keep the existing public custom-element tag
  `df-standard-pioneer-auth-wrapper` for compatibility unless a concrete
  naming/API reason requires otherwise.
- Always render the `<slot>` in idle, loading, authenticated,
  unauthenticated, and error states. The slot must remain present and visible
  independently of auth state; the wrapper must not apply a full-screen
  blocking layer or conditional slot template.
- Keep sign-in/sign-out affordances usable without using them as content
  authorization gates. Preserve headless mode as a way to omit wrapper chrome,
  not as a way to bypass authentication or alter slot visibility.
- Expose the current verified identity to consumers through the shared auth
  signal and existing user-changed event. Do not expose the session cookie
  value.
- Preserve popup/redirect behavior, safe redirects, and clear error reporting
  where supported. Update component API docs and Storybook text that currently
  claim Access-protected content is being rendered.
- Review `session-url`, `login-url`, and `logout-url` defaults and config type
  descriptions so they describe application sessions rather than Access
  endpoints. Remove, rename, or retain legacy properties only with documented
  compatibility behavior.

### C. Bucket Locator app and API Worker

- Update `services/workers/df-bucket-locator/src/worker.ts` to resolve the
  opaque session cookie using the shared D1 session data/verification contract.
  Remove reliance on `context.access` for both authentication and identity.
- Apply the approved-user policy after session authentication. Missing/invalid
  session is `401`; a valid session denied by Bucket Locator policy is `403`.
  Do not serve protected reads or mutations to an unauthenticated or
  unauthorized identity.
- Keep identity attribution for created/updated records derived from the
  verified session, never from request-body identity fields.
- Preserve the app's existing approved production identities and local-only
  development intent, but remove the requirement that Access itself hold the
  allowlist. Update local identity setup so tests and local use exercise the
  new session mechanism.
- Update `apps/df-bucket-locator` to consume identity/auth status and perform
  its own authorization UX. Its component remains slotted and rendered; it may
  show sign-in-required/loading/unauthorized UI within its own content.
- Ensure only an authorized Bucket Locator identity triggers normal inventory
  loading and UI actions. Handle `401` and `403` distinctly and avoid treating
  a failed authorization check as an empty successful dataset.
- Preserve same-origin endpoint resolution and existing Cloudflare Worker
  routes. No Firebase services or client credentials are introduced.

### D. Deployment tooling, configuration, docs, and examples

Update all deployment and development surfaces that currently assume Access,
including as applicable:

- `services/workers/df-standard-pioneer-auth/wrangler.jsonc` and its README.
- `services/workers/df-bucket-locator/deployment/production.json` and the
  profile validator/generator under `tools/deploy-scripts/`.
- `tools/deploy-scripts/src/run-bucket-locator-worker.mjs`,
  `tools/deploy-scripts/src/bucket-locator-deployment-config.mjs`, and their
  tests.
- Worker route/binding generation, local Worker startup, D1 migration setup,
  deploy preflight, and production deployment confirmations.
- `apps/df-bucket-locator/README.md`, its bundle/build configuration and
  integration tests.
- `apps/df-storybook/stories/df-standard-pioneer-auth-wrapper.stories.ts`,
  shared component tests, worker tests, and relevant state-store tests.
- Any affected route defaults and runtime configuration in
  `packages/types`, `packages/state`, and `packages/ui-lit`.

Production setup documentation must explain:

- End users authenticate with Google and do not need Cloudflare accounts.
- The operator still provisions/deploys Cloudflare Workers and D1.
- Google OIDC client configuration and callback URL setup.
- How to place OIDC secrets in Worker secrets and local-only configuration.
- How to run database migrations and configure Worker bindings/routes.
- How Bucket Locator's allowlist authorizes the application after sign-in.
- How to test an authenticated-but-unauthorized identity and confirm the slot
  remains rendered.
- That Cloudflare Access is not a prerequisite or identity source for these
  application endpoints. Do not instruct operators to configure an Access
  allowlist for sign-in.

## Out of scope

- Replacing Cloudflare Workers, D1, or Cloudflare hosting with Firebase or
  another cloud provider.
- Removing Bucket Locator's application allowlist or making its API public.
- Building a general role/permission management product or a generic policy
  engine. The existing Bucket Locator approved-user policy is sufficient for
  this ticket.
- Adding additional identity providers beyond Google OIDC in the first
  implementation. Keep the session/profile contract extensible without
  expanding the delivered provider scope.
- Treating visibility of the slotted DOM as authorization to read or mutate
  backend data.
- Provisioning unrelated infrastructure or redesigning the Bucket Locator
  product.

## Acceptance criteria

### Authentication Worker and session security

1. A user with a valid Google account can complete sign-in without a
   Cloudflare user account, provided the configured Google OIDC client accepts
   that user.
2. Invalid state, nonce, issuer, audience, signature, expiry, or unverified
   email never results in an authenticated session.
3. Successful authentication sets an opaque session cookie with the required
   flags. The cookie does not contain a trusted plaintext identity claim and
   is not readable from browser JavaScript.
4. A valid session returns the corresponding verified profile from the session
   endpoint; no valid session returns `401` without following an Access login
   redirect.
5. Logout revokes the session server-side, expires the browser cookie, and
   subsequent session/API requests using that cookie fail authentication.
6. Expired sessions fail closed. Return targets outside the exact requesting
   origin are rejected or replaced with the documented same-origin fallback.
7. OAuth secrets, session credentials, and provider tokens do not appear in
   browser bundles, URL query strings after callback completion, logs, or
   versioned config.
8. Production behavior does not depend on `context.access`,
   `CF-Access-*` identity headers, `/cdn-cgi/access/logout`, or an Access
   application/policy.

### Wrapper boundary and identity contract

9. Automated component tests prove the slotted content is rendered in idle,
   loading, unauthenticated, authenticated, and auth-error states.
10. Sign-in, logout, popup completion (if retained), signal updates, and
    user-changed event behavior are covered by tests. The event/profile never
    contains the session credential.
11. Headless mode changes only wrapper chrome; it does not suppress the slot
    or change authentication state semantics.
12. Storybook and component documentation demonstrate that the wrapper
    supplies identity and does not authorize/hide slotted content.

### Bucket Locator authorization

13. A valid non-approved user can establish an auth session and the wrapper
    still renders the slot, but Bucket Locator's own UI presents its
    unauthorized state and does not load normal inventory data.
14. An approved user can sign in and use the existing authorized Bucket
    Locator workflows.
15. The API Worker independently rejects missing/invalid sessions with `401`
    and authenticated non-approved identities with `403`; approved identities
    retain the existing permitted behavior.
16. The API derives record identity from the validated session and ignores or
    rejects caller-supplied identity spoofing.
17. Cookie-authenticated state-changing API operations validate the request
    origin and are covered by CSRF-focused tests.

### Development, deployment, and regression checks

18. Local auth and Bucket Locator flows work without Cloudflare Access
    configuration. Local test identity support cannot be enabled by production
    configuration.
19. Deployment profile validation and worker-generation tests cover required
    OIDC configuration, D1 session binding/migration, route generation, and
    removal of obsolete Access-specific settings/confirmations.
20. Existing production approved-user values remain application authorization
    policy and are not reused as an Access login gate.
21. Related worker, state, component, deployment-script, and Bucket Locator
    integration tests pass, along with targeted TypeScript builds/lints.
22. README, Storybook, and deployment instructions contain no stale claim that
    this wrapper/API uses Cloudflare Access for user authentication.

## Required test scenarios

### Auth Worker

- OIDC success with correct state/nonce and a valid verified identity.
- Rejection of missing/mismatched state, nonce, issuer, audience, invalid
  signature, expired token, and unverified email.
- Session cookie flags and opaque credential behavior.
- Session lookup success, missing session, unknown session, expired session,
  and logout/revocation.
- Same-origin return target accepted; cross-origin, malformed, and
  protocol-relative return targets rejected.
- Popup callback posts completion only to the expected origin, if popup mode
  remains supported.
- OIDC/configuration/storage failures return explicit errors and never create
  partial sessions.

### Wrapper and shared state

- Slot is present for every auth state, including initial loading and errors.
- Unauthenticated state can initiate sign-in without hiding the application
  slot.
- Authenticated state publishes the verified user; logout clears it and
  refreshes session state.
- No browser API or event exposes the cookie value.
- Popup blocked, callback failure, timeout, and cancellation remain visible as
  errors if popup mode is retained.

### Bucket Locator

- No session: API responds `401`; no protected D1/R2 operation occurs.
- Valid session, non-approved identity: API responds `403`; no protected
  operation occurs; app renders its own unauthorized state in the slot.
- Valid session, approved identity: existing reads/writes/photo behavior works.
- Mixed-case email matching is consistent with existing policy behavior.
- Body/header identity spoofing cannot change actor attribution or policy
  result.
- Cross-origin mutation requests are rejected.
- Local development identity/auth path works with Access configuration absent
  and is unavailable in production.

## Work sequence

1. Define and test the OIDC/session contract, profile shape, cookie semantics,
   D1 session schema, and local test-auth strategy.
2. Implement and test the pioneer auth Worker and migrations.
3. Update canonical identity types, state store, and wrapper; add tests proving
   the slot is never gated.
4. Convert the Bucket Locator API Worker to cookie-session authentication and
   preserve its server-side allowlist authorization; test `401`/`403` behavior.
5. Add app-owned authorization UX and verify authenticated-but-unauthorized
   behavior with the slot rendered.
6. Update profile validation, local/deploy scripts, routes, bindings,
   migrations, Storybook, READMEs, and integration tests.
7. Run targeted tests/build/lint for each affected workspace, then perform a
   production configuration review before deployment.

Do not deploy to production until Google OIDC credentials, callback URL,
Cloudflare Worker secrets, D1 binding/migration, and same-origin routes have
been reviewed and verified. Never place real credentials in this ticket or
repository.

## Affected areas (initial inventory)

- `services/workers/df-standard-pioneer-auth/`
- `services/workers/df-bucket-locator/`
- `services/workers/df-bucket-locator/deployment/production.json`
- `tools/deploy-scripts/src/bucket-locator-deployment-config.mjs`
- `tools/deploy-scripts/src/run-bucket-locator-worker.mjs`
- `tools/deploy-scripts/bucket-locator-tests/`
- `packages/types/src/cf-auth.types.ts`
- `packages/state/src/stores/cf-auth.store.ts` and its tests/exports
- `packages/state/src/utils/bucket-locator-backend-url.ts` and tests, if route
  defaults change
- `packages/ui-lit/src/df-standard-pioneer-auth-wrapper.ts`
- `packages/ui-lit/src/__tests__/df-standard-pioneer-auth-wrapper.test.ts`
- `apps/df-bucket-locator/src/` and `tests/integration/`
- `apps/df-storybook/stories/df-standard-pioneer-auth-wrapper.stories.ts`
- Relevant worker/app README files and auth/deployment instructions

This inventory is a starting point, not a closed file list. Search all
consumers of the public component, auth endpoints, Access context, deployment
profile fields, and local identity simulation before implementation.

## Definition of done

- All acceptance criteria are met and demonstrated by automated tests.
- No auth state suppresses, covers, or disables the wrapper's slotted content.
- No production request depends on Cloudflare Access identity.
- Bucket Locator backend authorization remains fail-closed and independently
  enforced.
- End-user sign-in works through Google without end-user Cloudflare accounts.
- No Firebase dependency or service was added.
- All related setup/deployment/docs and examples describe the new
  authentication/authorization boundary accurately.
