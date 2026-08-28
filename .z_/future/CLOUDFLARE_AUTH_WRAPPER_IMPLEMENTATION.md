# Cloudflare Implementation based on df-auth-wrapper

**Status:** Planning / handoff spec — not yet implemented
**Target component name:** `standard-pioneer-auth-wrapper`
**Target platform:** Cloudflare (Workers + Zero Trust Access), replacing Firebase Authentication
**Source of truth (read-only reference, do not modify):**
- Component: `https://github.com/datafundamentals/dF/blob/dev/packages/ui-lit/src/df-auth-wrapper.ts`
- Usage example: `https://github.com/datafundamentals/dF/blob/dev/apps/df-storybook/stories/df-auth-wrapper.stories.ts`

---

## 0. How to use this document

This is a standalone spec. It is written for a developer working in a **different repository/environment** than the dF monorepo, so it does not assume access to that repo's `/guides` folder — the load-bearing conventions from those guides are restated inline in §2. If your target project already follows the dF conventions (Lit + TypeScript + `@lit-labs/signals` + Material Web 3), follow this spec as written. If it doesn't, treat §2 as "the shape to aim for" and adapt package names accordingly.

This document assumes **zero prior Cloudflare experience** on the team, per the brief. Every Cloudflare-specific term is explained the first time it's used.

---

## 1. What this project is

`df-auth-wrapper` is a Lit web component that wraps arbitrary slotted HTML and shows it only after Google Sign-In, using Firebase Authentication as the backend. It is not a full security boundary by itself — it hides content client-side and stashes a bearer token for other code to use; real authorization still has to happen server-side. It works well for its purpose today.

The company is migrating off Firebase and onto Cloudflare wherever reasonable. This is the **first real Cloudflare product test**: rebuild the same wrapper, `standard-pioneer-auth-wrapper`, backed by Cloudflare instead of Firebase, while changing as little else as possible.

### Guardrails from the brief (carried through this whole document)

1. **Don't let a Cloudflare/React-flavored ecosystem pull the codebase off Lit + Web Components + signals.** Everything Cloudflare-specific here is backend/infrastructure; the component itself stays a plain Lit element.
2. **This is iteration 1.** Where a corner must be cut to ship something real, cut it deliberately and write it down (see §8, "Technical Debt Log") rather than silently doing the harder thing or silently doing the worse thing.
3. **Google Sign-In must keep working, unchanged in spirit** (any Google account, not just an org's Workspace). GitHub and/or "login with Cloudflare" are welcome *in addition*, not instead.
4. **The JWT question is open and this document answers it**: don't try to carry Firebase ID tokens into Cloudflare. Cloudflare Access mints its own JWT that is *specifically designed* to be verified by other Cloudflare Workers/apps on the same account — see §7. That is strictly more useful than what Firebase gave you for this purpose.
5. **The dF `/guides` are outdated but the intent behind them still matters.** This document restates the load-bearing rules directly rather than pointing at files you may not have.

---

## 2. Conventions this component must follow (restated from dF's `/guides`)

These rules come from `guides/STANDARDS_STYLES.md` and `guides/WC_SHARED_DEFAULTS.md` in the dF monorepo. They are restated here so this document is self-contained.

- **Lit + TypeScript.** Author in TypeScript, compile to JS via your build tool.
- **Signals-first, presentation-only components.** The component never owns persisted state or talks to the network directly for business data — it reads signals from a small store module and calls exported functions on that store. All the actual session/auth logic lives in a `*.store.ts` file, not in the component.
- **`SignalWatcher(LitElement)`.** Any component that reads signals in `render()` extends `SignalWatcher` from `@lit-labs/signals` so it re-renders automatically when a signal changes.
- **Property declaration pattern.** Use `declare` with `@property`/`@state` and initialize real values in the constructor — never as a class-field default — to avoid Lit's property-shadowing footgun.
  ```typescript
  @property({type: Boolean}) declare headless: boolean;
  constructor() {
    super();
    this.headless = false;
  }
  ```
- **Material Design 3 components only.** No native `<button>`, `<input>`, `<select>`. Use `@material/web` elements (`<md-filled-button>`, `<md-text-button>`, `<md-circular-progress>`, etc.).
- **Event naming: `[component-name]-[action]`.** The original component fires `df-auth-wrapper-user-changed`. This component fires `standard-pioneer-auth-wrapper-user-changed`, with the same `{detail: {newValue: User | null}}` shape.
- **CSS custom properties with fallbacks at the point of use**, not at the point of definition (avoids circular var references).
- **No commented-out code, no console.log left behind, no partial features.** Small, complete, reviewable increments.

Nothing about these rules is Cloudflare-specific — they hold regardless of what's behind the wrapper, which is exactly why they survive this migration untouched.

---

## 3. Concept mapping: Firebase → Cloudflare

| Firebase concept | Cloudflare equivalent |
|---|---|
| Firebase Authentication (Google provider) | **Cloudflare Access** (part of Cloudflare Zero Trust) configured with Google as an identity provider |
| Firebase ID token (JWT), `sessionStorage.Authorization` | **Access JWT**, delivered as the `Cf-Access-Jwt-Assertion` request header and the `CF_Authorization` cookie — managed by Cloudflare, not by your code |
| `initializeAuth(app)` | `initializeCfAuth()` — no SDK "app" object; just tells the store which endpoints to call |
| `signInWithGoogle()` (popup) | Navigating (full page or popup) to an Access-protected URL; Access itself shows the "Sign in with Google" screen |
| `signOut()` | Navigating/fetching `https://<your-domain>/cdn-cgi/access/logout` |
| `firebaseAuthState` signal | `cfAuthState` signal (new store, same shape: `authUser`, `authState`, `error`, `initialized`) |
| Firebase Auth Emulator + `emailPw` dev panel | `wrangler dev`'s `access.dev` local-identity stub. **No email/password concept exists on the Cloudflare side** — the dev panel is dropped, not ported (see §8). |
| Firebase Functions `functions.auth.user()` trigger | **No equivalent.** Workers have no "new user created" event. Any such logic has to be written explicitly inside the session Worker (see §8). |
| `localStorage.getItem('User')` / manual token mirroring | Not needed. Access already manages its own `httpOnly` cookie; the component only caches the *non-sensitive* profile fields it reads back from your session endpoint. |

---

## 4. Architecture

```mermaid
flowchart LR
    subgraph Browser
        W["standard-pioneer-auth-wrapper\n(Lit component)"]
        S["cf-auth.store.ts\n(signals)"]
        W <--> S
    end

    S -- "fetch /cf-auth/whoami\ncredentials: include, redirect: manual" --> A
    W -- "click Sign In →\nopen /cf-auth/whoami as popup/redirect" --> A

    subgraph Cloudflare edge
        A["Cloudflare Access\n(path-scoped Access application:\nyourdomain.com/cf-auth/*)"]
    end

    A -- "unauthenticated:\n302 to hosted login" --> L["Access login page\n(Sign in with Google / GitHub / Cloudflare)"]
    L -- "OAuth" --> G["Google (or GitHub, or\nCloudflare account) as IdP"]
    A -- "authenticated:\nCf-Access-Jwt-Assertion header\n+ CF_Authorization cookie" --> Wk["Worker: /cf-auth/whoami\n(returns {email, name, picture})"]

    Wk -. "same JWT/cookie,\nverifiable independently" .-> Other["Any other Cloudflare Worker\non your account"]
```

**Key architectural decision:** Cloudflare Access applications are scoped by **URL path**, not by whole domain. That is what lets this component behave the same way the Firebase version did — protecting *part* of an otherwise-public page — instead of gating an entire site behind a login wall. The Access application in this design only covers `yourdomain.com/cf-auth/*`; your marketing page, nav, and everything else stays public. Only the small session endpoint the component talks to sits behind Access.

---

## 5. One-time Cloudflare setup (do this before writing any code)

You'll do this in the Cloudflare dashboard, under **Zero Trust**. This is a one-time, per-project setup, analogous to enabling Google Sign-In in the Firebase console.

1. **Confirm your Zero Trust team domain.** Every Cloudflare account gets one, of the form `<your-team-name>.cloudflareaccess.com`, under **Zero Trust → Settings → Custom Pages / Team name**. Write it down — you'll need it as `TEAM_DOMAIN`.

2. **Add Google as an identity provider.** Zero Trust → **Settings → Authentication → Login methods → Add new**.
   - If your account offers a first-class **Google** connector, use it — it only asks for a Google Cloud OAuth **Client ID** and **Client Secret**.
   - If it doesn't (or you'd rather be explicit), use the **Generic OIDC** connector with Google's own endpoints:
     - Auth URL: `https://accounts.google.com/o/oauth2/auth`
     - Token URL: `https://accounts.google.com/o/oauth2/token`
     - Certificate (JWKS) URL: `https://www.googleapis.com/oauth2/v3/certs`
     - Scopes: `openid email profile`
   - Either way, when your Google OAuth client asks for an **authorized redirect URI**, use:
     ```
     https://<your-team-name>.cloudflareaccess.com/cdn-cgi/access/callback
     ```
   - Click **Test** on the new login method to confirm it works before moving on.

3. **(Optional, per the brief) Add GitHub and/or "Login with Cloudflare" the same way** — Zero Trust ships built-in connectors for both. These are additive; Google stays the primary/default path.

4. **Create a self-hosted Access application scoped to a narrow path** — this is the step that preserves partial-page protection:
   - Zero Trust → **Access → Applications → Add an application → Self-hosted**.
   - Application domain: `yourdomain.com`, **Path**: `/cf-auth/*` (not the bare domain — the path is what keeps the rest of your site public).
   - Under **Identity providers**, enable Google (and GitHub/Cloudflare if added).
   - Add a policy: **Action: Allow**, **Include: Everyone** (any authenticated account — this matches "any Google account can sign in," the same behavior Firebase gave you). Tighten this later with an email-domain rule if you ever need to restrict it.
   - Save, and copy the application's **Audience (AUD) tag** from its Overview page — you'll need it as `POLICY_AUD`.

That's the entire Cloudflare-side configuration. Everything else below is code in your project.

---

## 6. The Worker: session endpoint

This is the Cloudflare equivalent of Firebase's auth state listener — a small server-side route the component asks "am I signed in, and as whom?"

### 6.1 `wrangler.jsonc`

`wrangler` is Cloudflare's CLI/config tool for Workers — think of it as the Firebase CLI's equivalent. This assumes your app is deployed as a Worker serving both your static site (via `assets.directory`) and this one API route, which fits the existing MPA/static-widget deployment model.

```jsonc
{
  "name": "standard-pioneer-app",
  "main": "./src/worker.ts",
  "compatibility_date": "2026-08-28",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page"
  },
  "vars": {
    "TEAM_DOMAIN": "https://<your-team-name>.cloudflareaccess.com",
    "POLICY_AUD": "<the AUD tag from step 5.4>"
  }
}
```

`vars` here are plain, non-secret config — fine for a team domain and an audience tag, both of which are not sensitive. Never put anything actually secret (API keys, client secrets) in `vars`; use `wrangler secret put NAME` instead, which stores it encrypted and keeps it out of the config file and dashboard display.

### 6.2 `src/worker.ts`

```typescript
import {jwtVerify, createRemoteJWKSet} from 'jose';

interface Env {
  TEAM_DOMAIN: string;
  POLICY_AUD: string;
  ASSETS: Fetcher;
}

interface CfIdentity {
  email: string;
  name?: string;
  picture?: string;
  sub: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/cf-auth/whoami') {
      return handleWhoAmI(request, env);
    }

    // Everything else is your public static site.
    return env.ASSETS.fetch(request);
  },
};

async function handleWhoAmI(request: Request, env: Env): Promise<Response> {
  // Defense-in-depth: this route only gets reached for requests that Access
  // already let through, but verify the JWT ourselves too rather than
  // trusting the edge blindly.
  const token = request.headers.get('Cf-Access-Jwt-Assertion');

  if (!token) {
    return new Response(JSON.stringify({error: 'not-authenticated'}), {
      status: 401,
      headers: {'Content-Type': 'application/json'},
    });
  }

  try {
    const JWKS = createRemoteJWKSet(new URL(`${env.TEAM_DOMAIN}/cdn-cgi/access/certs`));
    const {payload} = await jwtVerify(token, JWKS, {
      issuer: env.TEAM_DOMAIN,
      audience: env.POLICY_AUD,
    });

    const identity: CfIdentity = {
      email: String(payload.email ?? ''),
      name: typeof payload.name === 'string' ? payload.name : undefined,
      picture: typeof payload.picture === 'string' ? payload.picture : undefined,
      sub: String(payload.sub ?? ''),
    };

    return Response.json(identity);
  } catch (error) {
    return new Response(JSON.stringify({error: 'invalid-token'}), {
      status: 401,
      headers: {'Content-Type': 'application/json'},
    });
  }
}
```

> **Worth trying, verify first:** Cloudflare has recently started exposing authenticated Access identity directly on the Worker's request context — `ctx.access.getIdentity()` — when Access is enabled in front of a Worker, along with a `wrangler dev` stub (`"access": {"dev": {...}}` in config) for local testing without a real login. If that's available and stable for your account/compatibility date, it removes the need for the `jose` verification above entirely. The `jose`/JWKS approach in `handleWhoAmI` above is the well-established, portable fallback — implement it first, and swap in `ctx.access` as a simplification once you've confirmed it behaves the way you expect in a scratch Worker. Don't wire production code to it on the strength of this document alone.

Add `jose` as a dependency: it's the standard, widely-used JWT library for Workers (works on the Workers runtime, unlike most Node JWT libraries).

### 6.3 Local development

`wrangler dev` (Cloudflare's local dev server) can't reach the real Zero Trust login flow without a public URL. Use the `access.dev` config block to stub an identity for local work:

```jsonc
{
  "access": {
    "dev": {
      "aud": "<your POLICY_AUD>",
      "identity": {"email": "dev@example.com"}
    }
  }
}
```

With that in place, `wrangler dev` requests behave as if Access already authenticated `dev@example.com` — no popup, no real Google account needed. Remove the block (or comment it out) to test the unauthenticated path locally.

This replaces the Firebase Auth Emulator + `emailPw` panel for local iteration — see §8 for what specifically doesn't carry over.

---

## 7. Cross-app JWT verification — answering the open question

The brief asked whether the current JWT approach is appropriate for other Cloudflare-based apps to consume, or whether something different is needed. **Answer: don't try to reuse Firebase's JWT for this. Switch entirely to the Access-issued JWT, which is purpose-built for exactly this.**

Any other Worker on the same Cloudflare account — a completely separate project — can independently verify the same `Cf-Access-Jwt-Assertion` header (or `CF_Authorization` cookie) using nothing but your team domain and that app's own audience tag. No shared secret, no calling back into this project:

```typescript
// A different Worker entirely, protecting its own API:
import {jwtVerify, createRemoteJWKSet} from 'jose';

const JWKS = createRemoteJWKSet(new URL(`${TEAM_DOMAIN}/cdn-cgi/access/certs`));

const {payload} = await jwtVerify(
  request.headers.get('Cf-Access-Jwt-Assertion')!,
  JWKS,
  {issuer: TEAM_DOMAIN, audience: THIS_OTHER_APPS_OWN_AUD}
);
// payload.email now identifies the same signed-in user.
```

This is strictly better cross-app SSO than what you had: Firebase ID tokens required every consumer to have Firebase Admin SDK credentials for *your specific Firebase project*. Access JWTs are verifiable by anything on your Cloudflare account with nothing but a public JWKS URL.

Practical note: if a user has authenticated to one Access application, visiting a *different* Access-protected path issues the cookie for that path too once they visit it (or immediately, if "eager redirect cookie" is enabled on the application) — so cross-app SSO across your own Cloudflare properties works close to out of the box, not just JWT verification in isolation.

---

## 8. Technical debt log — what's deliberately not carried over

Per the brief's "loose-tight" instruction: these are conscious cuts for iteration 1, not oversights.

1. **The `emailPw` developer email/password panel is dropped entirely, not ported.** It existed so developers could create throwaway Firebase Auth-Emulator accounts to trigger `functions.auth.user()` Cloud Functions locally. Cloudflare Access has no email/password identity provider and no Firebase-Functions-style auth-triggered events, so there is nothing equivalent to build. Use the `access.dev` stub (§6.3) for local auth bypass instead.
2. **No "on new user created" server event.** If the app needs to run logic the first time a given email signs in (seed a profile record, send a welcome email, etc.), that has to be written explicitly as an `if (isFirstSeen)` check inside `handleWhoAmI` (e.g., against a Workers KV or D1 lookup) rather than relying on a framework-level trigger the way Firebase provided. Not built here — flagged for whoever adds that requirement.
3. **Popup sign-in is a thin custom shim, not a platform feature.** Unlike Firebase's SDK-provided popup flow, Access has no built-in "tell the opener window you're done" handshake. §9.3 below documents a small same-origin callback page to make it work; if that feels like too much for v1, the plain full-page-redirect flow (§9.2, the simpler default) is a perfectly fine place to start and ship, deferring the popup nicety to a later pass.
4. **No manual token mirroring into `localStorage`/`sessionStorage`/a plain `authToken` cookie.** Access already manages its own `httpOnly` cookie, which is more secure than what the Firebase version did (a script-readable `sessionStorage` bearer token). If some other piece of code in your app still expects to read `sessionStorage.getItem('Authorization')` the old way, that's a separate, not-yet-solved migration — call it out explicitly to whoever owns that code rather than silently reintroducing the old pattern here.
5. **Restricting who can sign in** (e.g., "only `@yourcompany.com`") is left as an Access **policy** change (§5.4), not application code. Don't add email-domain checks inside the Worker — Access is the correct enforcement point, and changing a policy is a dashboard/Terraform change, not a redeploy.

---

## 9. The state store: `cf-auth.store.ts`

Same signals-first shape as `firebase-auth.store.ts`, dramatically smaller because there's no SDK to wrap and no email/password branch.

```typescript
/**
 * Cloudflare Access authentication store.
 *
 * Signals-first state for a session backed by Cloudflare Access, mirroring
 * the shape of the Firebase auth store it replaces (`authUser`, `authState`,
 * `error`, `initialized`) so consuming components change minimally.
 */

import {computed, signal} from '@lit-labs/signals';

export type CfAuthState = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export interface CfUser {
  email: string;
  name?: string;
  picture?: string;
  sub: string;
}

export interface CfAuthConfig {
  /** Same-origin path Access protects, e.g. '/cf-auth/whoami'. */
  sessionUrl: string;
  /** Where to send the browser to sign in — usually the same as sessionUrl. */
  loginUrl: string;
  /** Cloudflare's own logout endpoint, e.g. 'https://yourdomain.com/cdn-cgi/access/logout'. */
  logoutUrl: string;
}

const cfUserSignal = signal<CfUser | null>(null);
const cfAuthStateSignal = signal<CfAuthState>('idle');
const cfErrorSignal = signal<string | null>(null);
const cfInitializedSignal = signal<boolean>(false);

let config: CfAuthConfig | null = null;

export const cfAuthState = computed(() => ({
  authUser: cfUserSignal.get(),
  authState: cfAuthStateSignal.get(),
  error: cfErrorSignal.get(),
  initialized: cfInitializedSignal.get(),
}));

/** Call once at app startup. Kicks off the initial session check. */
export function initializeCfAuth(cfg: CfAuthConfig): void {
  config = cfg;
  void refreshCfAuth();
}

/**
 * Checks whether the browser already has a valid Access session, without
 * triggering an interactive login. `redirect: 'manual'` is the key detail:
 * an unauthenticated request to an Access-protected path gets a 302 to
 * Access's hosted login page on a *different* origin. Left on default
 * `redirect: 'follow'`, the fetch would try to follow that cross-origin
 * redirect and typically fail with an opaque network error. `manual` mode
 * instead returns a clean, synchronous "not authenticated" signal
 * (`response.type === 'opaqueredirect'`) with no error to catch.
 */
export async function refreshCfAuth(): Promise<void> {
  if (!config) {
    throw new Error('cf-auth: call initializeCfAuth() first');
  }

  cfAuthStateSignal.set('loading');
  cfErrorSignal.set(null);

  try {
    const response = await fetch(config.sessionUrl, {
      credentials: 'include',
      redirect: 'manual',
    });

    if (response.type === 'opaqueredirect' || response.status === 401) {
      cfUserSignal.set(null);
      cfAuthStateSignal.set('unauthenticated');
      cfInitializedSignal.set(true);
      return;
    }

    if (!response.ok) {
      throw new Error(`Session check failed: ${response.status}`);
    }

    const user = (await response.json()) as CfUser;
    cfUserSignal.set(user);
    cfAuthStateSignal.set('authenticated');
    cfInitializedSignal.set(true);
  } catch (error) {
    cfAuthStateSignal.set('error');
    cfErrorSignal.set(error instanceof Error ? error.message : 'Session check failed');
    cfInitializedSignal.set(true);
  }
}

/** Full-page redirect sign-in — the simple default (see §9.2). */
export function startCfLoginRedirect(returnTo: string = window.location.href): void {
  if (!config) {
    throw new Error('cf-auth: call initializeCfAuth() first');
  }
  const url = new URL(config.loginUrl, window.location.origin);
  url.searchParams.set('redirect_to', returnTo);
  window.location.href = url.toString();
}

/** Popup sign-in — nicer UX, more moving parts (see §9.3). */
export function startCfLoginPopup(): Promise<void> {
  if (!config) {
    throw new Error('cf-auth: call initializeCfAuth() first');
  }

  return new Promise((resolve) => {
    const popup = window.open(
      config!.loginUrl,
      'standard-pioneer-auth-wrapper-login',
      'width=480,height=640'
    );

    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== 'standard-pioneer-auth-wrapper:login-complete') return;
      window.removeEventListener('message', onMessage);
      popup?.close();
      void refreshCfAuth().then(resolve);
    }

    window.addEventListener('message', onMessage);
  });
}

export function cfLogout(): void {
  if (!config) {
    throw new Error('cf-auth: call initializeCfAuth() first');
  }
  window.location.href = config.logoutUrl;
}

export function getCurrentCfUser(): CfUser | null {
  return cfUserSignal.get();
}

export function isCfAuthenticated(): boolean {
  return cfAuthStateSignal.get() === 'authenticated';
}
```

---

## 9.1 The static callback page for popup mode

Referenced by `startCfLoginPopup()` above. This is a tiny static HTML file, deployed under the same `/cf-auth/*` path so it's covered by the Access application — meaning by the time a browser can load it, Access has already authenticated the user. Save it as `dist/cf-auth/callback.html` (adjust to your static asset layout) and point `loginUrl` at it instead of directly at `whoami` when using popup mode.

```html
<!doctype html>
<html>
  <body>
    <script>
      if (window.opener) {
        window.opener.postMessage(
          {type: 'standard-pioneer-auth-wrapper:login-complete'},
          window.location.origin
        );
      }
      window.close();
    </script>
  </body>
</html>
```

---

## 10. The component: `standard-pioneer-auth-wrapper.ts`

Adapted from `df-auth-wrapper.ts`. Kept: `headless`, `showHideUser`, `bkgrd`, the header/logout UI, the Alt+click debug toggle, the event-dispatch pattern. Dropped: `emailPw` and everything under it (see §8.1). Changed: the login handler now drives the Cloudflare store instead of Firebase's `signInWithGoogle()`.

```typescript
/**
 * ⚠️ CRITICAL STANDARDS COMPLIANCE ⚠️
 *
 * Uses Material Design 3 controls for authentication UI.
 * This component wraps protected content and manages sign-in via
 * Cloudflare Access (Google, and optionally GitHub / Cloudflare, as
 * identity providers — configured on the Cloudflare side, not in code).
 */

import {LitElement, html, css, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import {styleMap} from 'lit/directives/style-map.js';
import {
  cfAuthState,
  initializeCfAuth,
  startCfLoginPopup,
  startCfLoginRedirect,
  cfLogout,
} from './cf-auth.store.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/text-button.js';
import '@material/web/progress/circular-progress.js';

/**
 * Authentication wrapper component backed by Cloudflare Access.
 *
 * Wraps protected content and shows it only when the visitor has an
 * active Cloudflare Access session for this app. Cloudflare-native
 * successor to `df-auth-wrapper` (Firebase-backed) — see
 * `.z_/future/CLOUDFLARE_AUTH_WRAPPER_IMPLEMENTATION.md` for the full
 * migration rationale.
 *
 * @fires standard-pioneer-auth-wrapper-user-changed - Dispatched when sign-in state changes
 *
 * @property {boolean} headless - If true, hides the header with user info
 * @property {boolean} showHideUser - If true, shows raw user object JSON (debug mode)
 * @property {string} bkgrd - Optional background image URL for the login screen
 * @property {string} sessionUrl - Same-origin Access-protected session endpoint
 * @property {string} loginUrl - URL to navigate/popup to start sign-in
 * @property {string} logoutUrl - Cloudflare's own Access logout URL
 * @property {boolean} usePopup - Use popup sign-in instead of full-page redirect
 *
 * @example
 * ```html
 * <standard-pioneer-auth-wrapper
 *   session-url="/cf-auth/whoami"
 *   login-url="/cf-auth/whoami"
 *   logout-url="https://yourdomain.com/cdn-cgi/access/logout"
 * >
 *   <h1>Protected Content</h1>
 *   <p>Only visible after sign-in</p>
 * </standard-pioneer-auth-wrapper>
 * ```
 */
@customElement('standard-pioneer-auth-wrapper')
export class StandardPioneerAuthWrapper extends SignalWatcher(LitElement) {
  @property({type: Boolean}) declare headless: boolean;
  @property({type: Boolean}) declare showHideUser: boolean;
  @property({type: String, attribute: 'bkgrd'}) declare bkgrd: string | null;
  @property({type: String, attribute: 'session-url'}) declare sessionUrl: string;
  @property({type: String, attribute: 'login-url'}) declare loginUrl: string;
  @property({type: String, attribute: 'logout-url'}) declare logoutUrl: string;
  @property({type: Boolean, attribute: 'use-popup'}) declare usePopup: boolean;
  @state() private declare initError: string | null;

  constructor() {
    super();
    this.headless = false;
    this.showHideUser = false;
    this.bkgrd = null;
    this.sessionUrl = '/cf-auth/whoami';
    this.loginUrl = '/cf-auth/whoami';
    this.logoutUrl = '/cdn-cgi/access/logout';
    this.usePopup = false;
    this.initError = null;
  }

  override connectedCallback() {
    super.connectedCallback();
    try {
      initializeCfAuth({
        sessionUrl: this.sessionUrl,
        loginUrl: this.loginUrl,
        logoutUrl: this.logoutUrl,
      });
    } catch (e) {
      console.error('StandardPioneerAuthWrapper: Cloudflare auth initialization failed', e);
      this.initError = (e as Error).message;
    }
  }

  static override styles = css`
    :host {
      display: block;
      font-family: var(--sp-font-family, 'Roboto', sans-serif);
    }

    .full-screen {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      width: 100%;
      background-position: center;
      background-size: cover;
      background-repeat: no-repeat;
      background-color: var(--md-sys-color-surface, #fff);
    }

    .login-button {
      padding: 16px 32px;
      font-size: 16px;
    }

    .full-width-div {
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 50px;
      background: var(--md-sys-color-surface, #d3d3d3);
      border-radius: 5px;
    }

    .full-width-div > div {
      text-align: center;
      flex-grow: 1;
    }

    .user-photo {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      padding: 2px;
    }

    .user-name {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 500;
      color: var(--md-sys-color-on-surface, #000);
    }

    .user-json {
      padding: 16px;
      background: var(--md-sys-color-surface-container, #f0f0f0);
      border-radius: 8px;
      margin: 16px;
      overflow-x: auto;
    }

    .user-json pre {
      margin: 0;
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
    }
  `;

  override render() {
    const {authUser, authState} = cfAuthState.get();

    if (this.initError) {
      return html`
        <div class="full-screen" style="color: var(--md-sys-color-error, red); padding: 20px; text-align: center;">
          <p><strong>Authentication Error</strong></p>
          <p>${this.initError}</p>
          <p style="font-size: 0.8em">Check console for details.</p>
        </div>
      `;
    }

    if (authState === 'loading' || authState === 'idle') {
      return html`
        <div class="full-screen">
          <md-circular-progress indeterminate></md-circular-progress>
        </div>
      `;
    }

    if (authState !== 'authenticated' || !authUser) {
      return this._renderLoginScreen();
    }

    if (this.headless) {
      return html`<slot></slot>`;
    }

    return html`
      ${this._renderHeader(authUser)}
      ${this.showHideUser ? this._renderUserJson(authUser) : nothing}
      <slot></slot>
    `;
  }

  private _renderLoginScreen() {
    return html`
      <div class="full-screen" style=${styleMap(this._loginBackgroundStyles())}>
        <md-filled-button class="login-button" @click=${this._handleLoginClick}>
          Sign in
        </md-filled-button>
      </div>
    `;
  }

  private _renderHeader(user: {picture?: string; name?: string}) {
    return html`
      <div class="full-width-div">
        ${user.picture ? html`<img class="user-photo" src="${user.picture}" alt="User photo" />` : nothing}
        <h2 class="user-name">${user.name || 'User'}</h2>
        <md-text-button @click=${this._handleLogoutClick} aria-label="Sign out"> LOG OUT </md-text-button>
      </div>
    `;
  }

  private _renderUserJson(user: unknown) {
    return html`
      <div class="user-json">
        <pre>${JSON.stringify(user, null, 2)}</pre>
      </div>
    `;
  }

  private async _handleLoginClick() {
    try {
      if (this.usePopup) {
        await startCfLoginPopup();
      } else {
        startCfLoginRedirect();
        return; // page is navigating away; nothing left to do
      }
      this._dispatchUserChanged(cfAuthState.get().authUser);
    } catch (error) {
      console.error('Login failed:', error);
      alert(error instanceof Error ? error.message : 'Login failed');
    }
  }

  private _handleLogoutClick(event: MouseEvent) {
    if (event.altKey) {
      this.showHideUser = !this.showHideUser;
      return;
    }
    cfLogout(); // navigates away; the store re-checks on next load
  }

  private _dispatchUserChanged(user: unknown) {
    this.dispatchEvent(
      new CustomEvent('standard-pioneer-auth-wrapper-user-changed', {
        detail: {newValue: user},
        bubbles: true,
        composed: true,
      })
    );
  }

  private _loginBackgroundStyles(): Record<string, string> {
    if (!this.bkgrd) return {};
    return {backgroundImage: `url(${this.bkgrd})`};
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'standard-pioneer-auth-wrapper': StandardPioneerAuthWrapper;
  }
}
```

### 10.1 Usage (mirrors the original's storybook example)

```html
<standard-pioneer-auth-wrapper>
  <h1>Protected Content</h1>
  <p>Only visible after sign-in</p>
</standard-pioneer-auth-wrapper>

<!-- Headless mode: no built-in header, same as before -->
<standard-pioneer-auth-wrapper headless>
  <div>Protected content without header</div>
</standard-pioneer-auth-wrapper>

<!-- Popup sign-in instead of full-page redirect -->
<standard-pioneer-auth-wrapper use-popup>
  <div>Protected content, popup login</div>
</standard-pioneer-auth-wrapper>
```

---

## 11. Sign-in UX: pick a starting point

Two valid options; §8.3 already flags this as an intentional v1 simplification point.

- **Full-page redirect (`use-popup` unset — the default).** Clicking "Sign in" navigates the whole page to `loginUrl`; Access shows its hosted login screen (Google/GitHub/Cloudflare per your policy); on success it lands back at `loginUrl`, which the store's next `refreshCfAuth()` call (on page load) will see as authenticated. **Start here.** It's less code, has no popup-blocker edge cases, and matches how most Access-protected apps behave by default.
- **Popup (`use-popup` set).** Preserves the exact "stay on the same page" feel of the old Firebase popup flow, at the cost of the small callback page in §9.1 and a `postMessage` handshake. Worth doing once the redirect flow is proven end-to-end.

---

## 12. Rollout checklist

- [ ] Zero Trust team domain confirmed (§5.1)
- [ ] Google identity provider connected and tested (§5.2)
- [ ] GitHub / Cloudflare identity providers added, if wanted (§5.3)
- [ ] Self-hosted Access application scoped to `/cf-auth/*` — **not** the whole domain (§5.4)
- [ ] Access policy allows the intended audience (start with "Everyone")
- [ ] `TEAM_DOMAIN` / `POLICY_AUD` set as Worker `vars` (§6.1)
- [ ] `/cf-auth/whoami` Worker route deployed and verified with `jose` (§6.2)
- [ ] `access.dev` stub confirmed working for local iteration (§6.3)
- [ ] `cf-auth.store.ts` wired into the app entry point
- [ ] `standard-pioneer-auth-wrapper` renders login/authenticated states correctly
- [ ] Logout round-trips through `/cdn-cgi/access/logout`
- [ ] Cross-app JWT verification tested against a second, independent Worker (§7)
- [ ] Technical debt log (§8) reviewed and any must-fix items ticketed

---

## 13. Summary: answers to the brief's five points

1. **Non-Firebase conventions untouched** — nothing in this document asks the team to change Lit, signals, MD3, file/event naming, or the presentation-only component boundary. Only the auth backend changes.
2. **Loose-tight, iteration 1** — §8 names every corner deliberately cut (dev email/password panel, "new user" trigger, token mirroring, popup handshake) instead of silently under- or over-building.
3. **Google Sign-In preserved, GitHub/Cloudflare additive** — §5.2–5.3; Access supports all three as identity providers on the same application with no code-level difference between them.
4. **JWT question answered** — don't carry Firebase tokens forward; use the Access-issued JWT instead. It's independently verifiable by any other Cloudflare Worker on the account with nothing but a JWKS URL — see §7.
5. **Guides looked past, intent preserved** — §2 restates the load-bearing rules from `STANDARDS_STYLES.md` / `WC_SHARED_DEFAULTS.md` inline so this document stands alone in a different repository.
