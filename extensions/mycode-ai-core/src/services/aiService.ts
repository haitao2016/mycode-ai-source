import * as vscode from 'vscode';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIConfig {
  provider: string;
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export class AIService {
  private config: AIConfig;

  constructor(config?: AIConfig) {
    const workspaceConfig = vscode.workspace.getConfiguration('mycode-ai');
    this.config = config || {
      provider: workspaceConfig.get<string>('provider', 'openai'),
      apiKey: workspaceConfig.get<string>('apiKey', ''),
      model: workspaceConfig.get<string>('model', 'gpt-4'),
      temperature: 0.7,
      maxTokens: 4096,
    };
  }

  async sendMessage(messages: AIMessage[]): Promise<AIResponse> {
    if (!this.config.apiKey) {
      return { success: false, error: 'API key not configured' };
    }

    try {
      switch (this.config.provider) {
        case 'openai':
          return await this._callOpenAI(messages);
        case 'anthropic':
          return await this._callAnthropic(messages);
        case 'google':
          return await this._callGoogle(messages);
        default:
          return { success: false, error: `Unknown provider: ${this.config.provider}` };
      }
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  private async _callOpenAI(messages: AIMessage[]): Promise<AIResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    return {
      success: true,
      message: data.choices?.[0]?.message?.content || '',
    };
  }

  private async _callAnthropic(messages: AIMessage[]): Promise<AIResponse> {
    // TODO: Implement Anthropic API call
    return { success: false, error: 'Anthropic API not yet implemented' };
  }

  private async _callGoogle(messages: AIMessage[]): Promise<AIResponse> {
    // TODO: Implement Google API call
    return { success: false, error: 'Google API not yet implemented' };
  }

  async generateCode(prompt: string, language: string): Promise<AIResponse> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are an expert ${language} programmer. Generate clean, well-documented code based on the user's request.`,
      },
      { role: 'user', content: prompt },
    ];
    return this.sendMessage(messages);
  }

  async explainCode(code: string, language: string): Promise<AIResponse> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are a helpful coding assistant. Explain the following ${language} code in detail.`,
      },
      { role: 'user', content: code },
    ];
    return this.sendMessage(messages);
  }

  async reviewCode(code: string, language: string): Promise<AIResponse> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are a code reviewer. Review the following ${language} code for best practices, potential bugs, and improvements.`,
      },
      { role: 'user', content: code },
    ];
    return this.sendMessage(messages);
  }
}
