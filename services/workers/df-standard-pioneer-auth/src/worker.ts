import type {CfUser} from '@df/types';

interface AccessIdentity {
  email?: string;
  name?: string;
  picture?: string;
  user_uuid?: string;
  sub?: string;
}

interface AccessBinding {
  getIdentity(): Promise<AccessIdentity | null>;
}

export interface WorkerContext {
  access?: AccessBinding;
}

const jsonHeaders = {
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
};

export default {
  fetch(
    request: Request,
    _env: unknown,
    context: WorkerContext
  ): Promise<Response> {
    return handleRequest(request, context);
  },
};

export async function handleRequest(
  request: Request,
  context: WorkerContext
): Promise<Response> {
  const url = new URL(request.url);

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return jsonResponse({error: 'method-not-allowed'}, 405, {
      Allow: 'GET, HEAD',
    });
  }

  if (url.pathname === '/cf-auth/whoami') return handleWhoAmI(context);
  if (url.pathname === '/cf-auth/login') return handleLogin(url, context);

  return jsonResponse({error: 'not-found'}, 404);
}

async function handleWhoAmI(context: WorkerContext): Promise<Response> {
  if (!context.access) return jsonResponse({error: 'not-authenticated'}, 401);

  try {
    const identity = await context.access.getIdentity();
    if (!identity?.email)
      return jsonResponse({error: 'identity-unavailable'}, 403);

    const user: CfUser = {
      email: identity.email,
      sub: identity.user_uuid ?? identity.sub ?? identity.email,
      ...(identity.name ? {name: identity.name} : {}),
      ...(identity.picture ? {picture: identity.picture} : {}),
    };

    return jsonResponse(user, 200);
  } catch {
    return jsonResponse({error: 'identity-unavailable'}, 502);
  }
}

function handleLogin(url: URL, context: WorkerContext): Response {
  if (!context.access) return jsonResponse({error: 'not-authenticated'}, 401);

  if (url.searchParams.get('mode') === 'popup') {
    return new Response(popupCompletionHtml(url.origin), {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Security-Policy': `default-src 'none'; script-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'`,
        'Content-Type': 'text/html; charset=utf-8',
        'Referrer-Policy': 'no-referrer',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  const requestedTarget = url.searchParams.get('returnTo');
  const target = safeReturnTarget(requestedTarget, url.origin);
  return Response.redirect(target, 302);
}

function safeReturnTarget(
  requestedTarget: string | null,
  origin: string
): string {
  if (!requestedTarget) return origin;
  try {
    const target = new URL(requestedTarget, origin);
    return target.origin === origin ? target.toString() : origin;
  } catch {
    return origin;
  }
}

function popupCompletionHtml(origin: string): string {
  const serializedOrigin = JSON.stringify(origin).replaceAll('<', '\\u003c');
  return `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><title>Sign-in complete</title></head>
  <body>
    <p>Sign-in complete. You may close this window.</p>
    <script>
      if (window.opener) {
        window.opener.postMessage(
          {type: 'df-standard-pioneer-auth-wrapper:login-complete'},
          ${serializedOrigin}
        );
        window.close();
      }
    </script>
  </body>
</html>`;
}

function jsonResponse(
  body: unknown,
  status: number,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {...jsonHeaders, ...extraHeaders},
  });
}
