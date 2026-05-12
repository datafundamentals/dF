# How to Refactor for Multi-Agent Support

This guide outlines the strategy for evolving the current single-provider (OpenClaw) triggering mechanism into a pluggable, multi-agent architecture.

## 1. Architectural Strategy

The current implementation in `onOpenclawMessage.ts` uses a standard OpenAI-compatible API interface. Because most AI providers (Ollama, Hermes via OpenRouter, Google Gemini, Groq) have standardized on this JSON schema, we can transition to a "Universal Adapter" pattern.

### Steps to Refactor:
1.  **Rename System Trigger**: Rename `onOpenclawMessage.ts` to `onAgentMessage.ts`.
2.  **Abstract Configuration**: Remove hardcoded URLs and tokens in favor of dynamic provider lookup.
3.  **Firestore Integration**: Add `providerId` and `modelId` fields to the `conversation` or `agent` documents to drive the logic.

## 2. Environment Variable Configuration

Move provider-specific secrets to your `.env` file (e.g., `services/functions/.env`).

```bash
# OpenClaw (Default)
OPENCLAW_BASE_URL=https://...
OPENCLAW_GATEWAY_TOKEN=...

# Hermes / OpenRouter
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_TOKEN=...

# Google Gemini (OpenAI-compatible endpoint)
GOOGLE_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
GOOGLE_TOKEN=...
```

## 3. The "Universal" Fetch Pattern

The core logic remains largely identical, swapping static constants for dynamic variables:

- **Endpoint**: `${provider.baseUrl}/chat/completions`
- **Auth**: `Bearer ${provider.token}`
- **Model**: Specific to the provider (e.g., `nousresearch/hermes-3` or `openclaw/agent-id`)

## 4. Provider Specifics

| Provider | Mechanism | Notes |
| :--- | :--- | :--- |
| **OpenClaw** | Standard REST | Current baseline. |
| **Hermes** | Standard REST | Available via OpenRouter/TogetherAI. Modestly doable swap. |
| **Ollama** | Local REST | Point to `http://localhost:11434/v1`. |
| **Google Gemini** | OAuth + REST | Supports OpenAI-compatible endpoint. Requires OAuth scopes for Workspace access. |

## 5. Potential for MCP (Model Context Protocol)

Google and other providers are increasingly using **MCP** to allow agents to interact with tools (Gmail, Drive, Chrome). 
- If using an MCP-compatible gateway, the function code stays the same.
- The "Agent" handles the tool calling internally via the MCP server connection.

## 6. Benefits
- **A/B Testing**: Run different models on different conversations simultaneously.
- **Failover**: Quickly switch providers via config if one service goes down.
- **Scalability**: Adding new agents (like Claude or Llama 3) becomes a configuration task rather than a code change.
