import { SYSTEM_PROMPT } from '../systemPrompt';

export function useGemini(apiKey) {
  const generate = async (userMessage, history = []) => {
    if (!apiKey) throw new Error('No API key provided');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const body = {
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents: [
        ...history.map(h => ({
          role: h.role,
          parts: [{ text: h.content }]
        })),
        {
          role: 'user',
          parts: [{ text: userMessage }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const msg = err?.error?.message || `HTTP ${response.status}`;
      throw new Error(msg);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Gemini');
    return text;
  };

  return { generate };
}
