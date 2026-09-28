# Fetch MCP Server

A minimal remote MCP (Model Context Protocol) server, deployed as its own Cloudflare
Worker, exposing one tool: `fetch_url`. It fetches a public http(s) URL and returns
the content as plain text (HTML is stripped of tags/scripts/styles; JSON/other text
passes through as-is), truncated to a `maxChars` param.

## Why this exists

Created 2026-09-27 to give gadgets in the **Cloudflare OS / Gadgets Workshop**
project (`~/work/primary/cloudflare-os`) a way to make outbound HTTP requests.
Gadget server code in that platform runs in a sandbox with no direct internet
access — it can only reach the outside world through a "connection"
(a gatekeeper, in that project's terms), and MCP connections are one kind of
gatekeeper (`gatekeeper-mcp`, which takes a user-pasted endpoint URL).

Rather than trust a random third-party hosted "fetch" MCP server, this is a
self-hosted instance of the same tool shape as the official MCP reference
`fetch` server — small enough to read every line of, and something I own the
uptime/trust boundary of.

First consumer: the "Agentic Trends" gadget, which polls Bluesky's public search
API (`api.bsky.app`) every 30 minutes for posts about agentic AI use cases,
through this server. Not specific to that gadget — reusable for any future
gadget/tool that needs to fetch a URL (YouTube Data API, Google News RSS, SERP
APIs, etc.).

## Structure

Self-contained — not part of the `dF` monorepo's pnpm workspace (`tools/*` is
not in the root `workspaces` glob) and not wired into the root `package.json`
scripts. It has its own `node_modules` and its own deploy lifecycle, same
pattern as `tools/zoom_meeting_downloader`.

## Prerequisites

- Node + npm.
- A Cloudflare account, logged into `wrangler` (`npx wrangler login` — only
  needed once per machine; skip if `npx wrangler whoami` already shows you
  logged in).

## Generating the shared secret

Every request to this server (local or deployed) must present a secret value —
see [Auth](#auth) below. It's a bearer credential, so generate a real random
one rather than typing something memorable:

```bash
openssl rand -hex 32
```

Save the output somewhere you can find it again (a password manager, or your
team's secrets store) — neither `.dev.vars` nor `wrangler secret put` will
show it back to you later. You'll use this same value in both of the next two
sections; a different value for local dev vs. the deployed instance is fine
too (they're independent), just keep track of which is which.

## Dev

```bash
npm install
cp .dev.vars.example .dev.vars   # first time only
```

Edit `.dev.vars` and replace the placeholder with the secret you generated
above:

```
MCP_SHARED_SECRET=<paste your generated value here>
```

```bash
npm run dev      # wrangler dev, local — listens on :8788 (see wrangler.jsonc
                 # "dev.port"; 8787 is taken by cloudflare-os's own dev server)
```

Test with the MCP inspector: `npx @modelcontextprotocol/inspector@latest`,
point it at `http://localhost:8788/mcp` with an `Authorization: Bearer
<secret>` header (see [Auth](#auth) below).

## Deploy

```bash
wrangler secret put MCP_SHARED_SECRET
```

This prompts interactively — paste the secret you generated above (or a
fresh one; see [Generating the shared secret](#generating-the-shared-secret))
and press enter. Re-run this same command to rotate the secret later.

```bash
npm run deploy   # wrangler deploy
```

This prints the live URL, e.g. `https://fetch-mcp-server.<your-subdomain>.workers.dev`.

## Auth

Every request must present the value of `MCP_SHARED_SECRET`, either as:
- `Authorization: Bearer <secret>` header, or
- the secret as a trailing path segment: `https://<worker>.workers.dev/mcp/<secret>`

The path-segment form exists because this platform's own MCP connect form
only takes a URL to paste — no custom-header field — so that's the form to
give the Workshop. The header form is for clients that can set one (curl,
the MCP inspector). Requests without a matching secret get a 401.

Rotate the secret with `wrangler secret put MCP_SHARED_SECRET` again; update
whatever URL/header the Workshop (or anything else) is using afterward.

## Connecting it to a Cloudflare OS gadget

1. In the Workshop, open the gadget's workspace, click **+** next to the
   message box, then **Add a new connection**.
2. Search **MCP**, choose **Any MCP server**, then **Connect MCP Server**.
3. A popup asks for a **Server URL** — paste:
   ```
   https://<your-worker>.workers.dev/mcp/<your-secret>
   ```
   (the deployed URL from `npm run deploy`, plus your secret from
   [Generating the shared secret](#generating-the-shared-secret)).
4. It discovers `fetch_url` automatically. It's registered read-only
   (`annotations: { readOnlyHint: true }` in `src/index.ts`), so the Workshop
   treats calls to it as automatic observations rather than queuing every one
   for manual approval — required for a gadget that calls it unattended on a
   schedule. Click **Add connection**.
5. If the gadget's own code asks to bind this connection (a card in its chat
   reading "Connect MCP Server ... Please pick the one you already
   connected"), click **Set up** and confirm — a connection has to be both
   added to the workspace *and* wired into the gadget's own binding list
   before the gadget's code can call it.

## Security notes

- Only `http:`/`https:` schemes are allowed; `localhost`/loopback hostnames
  are refused. This is a basic sanity check, not full SSRF protection (no DNS
  resolution/IP-range checking).
- The shared secret gates *use* of the tool (who can make it fetch things on
  their behalf), not what it fetches — it still fetches whatever public URL
  it's asked to. No secrets/tokens/credentials of your own are ever passed
  through the `fetch_url` tool itself.
- The `/mcp/<secret>` path form puts the secret in the URL, which can end up
  in server logs, browser history, or a Referer header — the same tradeoff
  this platform's own gatekeeper connect-handoff design accepts for a
  single-use connect URL. Prefer the header form wherever the caller allows it.
- `readOnlyHint: true` is accurate here (a plain GET, no side effects) and is
  what lets a scheduled poll call this tool without a human approving every
  call — don't add a write-capable tool to this server without reconsidering
  that annotation.
