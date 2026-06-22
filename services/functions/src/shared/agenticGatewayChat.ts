interface AgenticGatewayMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AgenticGatewayChatRequest {
  agentId: string;
  sessionKey: string;
  model: string;
  messages: AgenticGatewayMessage[];
}

interface AgenticGatewayChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

/** Sends a synchronous chat completion through the configured Agentic gateway. */
export async function sendAgenticGatewayChat(request: AgenticGatewayChatRequest): Promise<string> {
  const baseUrl = process.env.AGENTIC_BASE_URL?.trim();
  const gatewayToken = process.env.AGENTIC_GATEWAY_TOKEN?.trim();
  if (!baseUrl || !gatewayToken) {
    throw new Error('Agentic gateway configuration is incomplete');
  }

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${gatewayToken}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Agentic gateway chat completions error: ${response.status} ${body}`);
  }

  const result = await response.json() as AgenticGatewayChatResponse;
  const content = result.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('Empty assistant reply from Agentic gateway');
  }

  return content;
}
