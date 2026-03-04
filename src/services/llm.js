export const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
export const MODEL = process.env.OLLAMA_MODEL || 'qwen3:8b';

/**
 * Send a chat request to Ollama.
 *
 * @param {object} params
 * @param {Array<{role: string, content: string}>} params.messages
 * @param {object} [params.format] - JSON schema to constrain the response.
 * @returns {Promise<string>} The model's reply content.
 */
export async function chat({ messages, format }) {
  const body = { model: MODEL, messages, stream: false };
  if (format) body.format = format;

  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ollama error ${response.status}: ${text}`);
  }

  const data = await response.json();
  return data.message.content;
}
