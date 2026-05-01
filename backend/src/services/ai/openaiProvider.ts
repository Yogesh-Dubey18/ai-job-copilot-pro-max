import { env } from '../../config/env';
import { AiProvider } from './provider';

export class OpenAIProvider implements AiProvider {
  name = 'openai' as const;

  async generateJson(prompt: string) {
    if (!env.OPENAI_API_KEY) throw new Error('OpenAI API key is not configured.');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'Return valid JSON only. No markdown.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) throw new Error(`OpenAI request failed with ${response.status}`);
    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return data.choices?.[0]?.message?.content || '{}';
  }
}
