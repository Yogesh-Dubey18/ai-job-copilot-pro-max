import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env';
import { AiProvider } from './provider';

export class GeminiProvider implements AiProvider {
  name = 'gemini' as const;

  async generateJson(prompt: string) {
    if (!env.GEMINI_API_KEY) throw new Error('Gemini API key is not configured.');
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}
