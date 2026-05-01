export interface AiProvider {
  name: 'gemini' | 'openai';
  generateJson(prompt: string): Promise<string>;
}

export interface AiCallOptions {
  userId?: string;
  feature: string;
}
