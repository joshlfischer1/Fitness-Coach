import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_PROMPT } from '../systemPrompt';

export function useGemini(apiKey) {
  const generate = async (userMessage, history = []) => {
    if (!apiKey) throw new Error('No API key provided');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    const chat = model.startChat({
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.content }],
      })),
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  };

  return { generate };
}
