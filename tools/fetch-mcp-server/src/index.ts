import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { z } from "zod";

const MAX_CHARS_DEFAULT = 5000;
const MAX_CHARS_LIMIT = 50000;
const FETCH_TIMEOUT_MS = 10000;

// Blocks the obvious cases of a caller pointing this Worker at itself or a
// loopback address. Not a general SSRF defense (no DNS resolution here) —
// just a cheap guard against the most common accidental/malicious targets.
const BLOCKED_HOSTNAMES = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();
}

export class FetchMCP extends McpAgent<Env, unknown, {}> {
  server = new McpServer({ name: "fetch-mcp-server", version: "1.0.0" });

  async init() {
    this.server.registerTool(
      "fetch_url",
      {
        description:
          "Fetch a public URL over HTTP(S) and return its content as plain text. " +
          "HTML responses have tags/scripts/styles stripped; JSON and other text " +
          "responses are returned as-is. Output is truncated to maxChars.",
        inputSchema: {
          url: z.string().url().describe("The http(s) URL to fetch"),
          maxChars: z
            .number()
            .int()
            .positive()
            .max(MAX_CHARS_LIMIT)
            .optional()
            .describe(`Truncate the returned text to this length (default ${MAX_CHARS_DEFAULT}, max ${MAX_CHARS_LIMIT})`),
        },
        // A plain GET with no side effects: safe to run unattended (e.g. a scheduled poll)
        // without per-call approval from whichever client is enforcing that.
        annotations: { readOnlyHint: true },
      },
      async ({ url, maxChars }) => {
        const parsed = new URL(url);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          return {
            content: [{ type: "text", text: `Refused: only http/https URLs are supported (got ${parsed.protocol})` }],
            isError: true,
          };
        }
        if (BLOCKED_HOSTNAMES.has(parsed.hostname)) {
          return {
            content: [{ type: "text", text: `Refused: ${parsed.hostname} is not a fetchable target` }],
            isError: true,
          };
        }

        const limit = Math.min(maxChars ?? MAX_CHARS_DEFAULT, MAX_CHARS_LIMIT);

        try {
          const response = await fetch(parsed.toString(), {
            headers: { "User-Agent": "fetch-mcp-server/1.0 (+https://developers.cloudflare.com/agents/)" },
            signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
          });

          const contentType = response.headers.get("content-type") ?? "";
          const body = await response.text();
          const text = contentType.includes("text/html") ? stripHtml(body) : body;
          const truncated = text.length > limit;

          return {
            content: [
              {
                type: "text",
                text: `Status: ${response.status}\nContent-Type: ${contentType}\n\n${text.slice(0, limit)}${truncated ? "\n\n[truncated]" : ""}`,
              },
            ],
          };
        } catch (err) {
          return {
            content: [{ type: "text", text: `Fetch failed: ${err instanceof Error ? err.message : String(err)}` }],
            isError: true,
          };
        }
      },
    );
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);
  if (aBytes.length !== bBytes.length) return false;
  let diff = 0;
  for (let i = 0; i < aBytes.length; i++) diff |= aBytes[i] ^ bBytes[i];
  return diff === 0;
}

// Two ways to present the secret: an `Authorization: Bearer` header for
// clients that can set one (curl, the MCP inspector), or the secret as a
// trailing path segment (/mcp/<secret>) for clients that can only be given
// a single URL to paste — e.g. this platform's own MCP connect form, which
// takes a URL and nothing else.
function extractProvidedSecret(request: Request, url: URL): string | null {
  const auth = request.headers.get("Authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice("Bearer ".length);
  const pathSecret = url.pathname.match(/^\/mcp\/([^/]+)$/);
  return pathSecret ? decodeURIComponent(pathSecret[1]) : null;
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    const provided = extractProvidedSecret(request, url);
    if (!provided || !timingSafeEqual(provided, env.MCP_SHARED_SECRET)) {
      return new Response("Unauthorized", { status: 401 });
    }

    const canonical = url.pathname === "/mcp" ? request : new Request(new URL(`/mcp${url.search}`, url), request);
    return FetchMCP.serve("/mcp", { binding: "FETCH_MCP" }).fetch(canonical, env, ctx);
  },
};
