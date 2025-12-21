export interface GeminiResponse {
  title?: string;
  summary?: string;
  keyPoints?: string[];
  speakers?: string[];
  [key: string]: unknown;
}

export interface GeminiOptions {
  apiKey: string;
  prompt: string;
  models?: string[];
  logger?: (message: string) => void;
}

export async function callGemini(options: GeminiOptions): Promise<GeminiResponse> {
  const { apiKey, prompt, logger } = options;
  const models = options.models || ['gemini-2.0-flash-exp', 'gemini-1.5-flash', 'gemini-1.5-pro'];

  let lastError: unknown;

  for (const model of models) {
    try {
      if (logger) logger(`Calling Gemini model: ${model}`);

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        const errorMsg = `${response.status} ${response.statusText}: ${errorText}`;

        if (response.status === 404) {
          lastError = new Error(`Model ${model} not found: ${errorMsg}`);
          continue;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json() as {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }> };
        }>;
      };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('No response text from Gemini');

      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }

      return { title: 'Extracted', summary: text, keyPoints: [] };
    } catch (e) {
      lastError = e;
      if (e instanceof Error && (e.message.includes('404') || e.message.includes('not found'))) {
        continue;
      }
      if (logger) logger(`Model ${model} failed: ${e}`);
    }
  }

  throw lastError || new Error('All Gemini models failed');
}
