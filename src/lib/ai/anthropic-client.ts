import Anthropic from '@anthropic-ai/sdk';

export class AnthropicClient {
  private client: Anthropic | null;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      this.client = null;
      return;
    }
    this.client = new Anthropic({ apiKey });
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  async generateResponse(
    systemPrompt: string,
    userMessage: string,
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<string> {
    if (!this.client) {
      throw new Error('Anthropic client not initialized');
    }

    const messages: Anthropic.MessageParam[] = [];

    if (conversationHistory) {
      messages.push(...conversationHistory);
    }

    messages.push({
      role: 'user',
      content: userMessage,
    });

    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      system: systemPrompt,
      messages,
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    throw new Error('Unexpected response format from Claude');
  }

  async generateStructuredResponse<T>(
    systemPrompt: string,
    userMessage: string,
    schema: Record<string, unknown>,
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<T> {
    if (!this.client) {
      throw new Error('Anthropic client not initialized');
    }

    const messages: Anthropic.MessageParam[] = [];

    if (conversationHistory) {
      messages.push(...conversationHistory);
    }

    const enhancedUserMessage = `${userMessage}\n\nPlease respond ONLY with valid JSON. Do not include any markdown formatting or explanatory text. Your entire response should be parseable as JSON.`;

    messages.push({
      role: 'user',
      content: enhancedUserMessage,
    });

    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      system: systemPrompt + '\n\nIMPORTANT: You must respond with ONLY valid JSON. Do not wrap your response in markdown code blocks or include any explanatory text.',
      messages,
    });

    const content = response.content[0];
    if (content.type === 'text') {
      try {
        let text = content.text.trim();
        if (text.startsWith('```json')) {
          text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (text.startsWith('```')) {
          text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        return JSON.parse(text) as T;
      } catch (error) {
        console.error('Failed to parse JSON from Claude:', content.text);
        throw new Error('Failed to parse JSON response from Claude');
      }
    }

    throw new Error('Unexpected response format from Claude');
  }
}

export const anthropicClient = new AnthropicClient();