import * as vscode from 'vscode';

export interface IAIProvider {
  readonly id: string;
  readonly label: string;
  chat(messages: Array<{ role: string; content: string }>): Promise<string>;
}

export interface AIConfig {
  provider: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export function getAIConfig(): AIConfig {
  const c = vscode.workspace.getConfiguration('mycode-ai');
  return { provider: c.get<string>('provider') ?? 'openai', apiKey: c.get<string>('apiKey') ?? '', model: c.get<string>('model') ?? 'gpt-4o', temperature: 0.7, maxTokens: 4096 };
}

class OpenAIProvider implements IAIProvider {
  public readonly id = 'openai'; public readonly label = 'OpenAI';
  async chat(messages: Array<{ role: string; content: string }>): Promise<string> {
    const c = getAIConfig(); if (!c.apiKey) throw new Error('API key not set');
    const r = await fetch('https://api.openai.com/v1/chat/completions', { method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${c.apiKey}`}, body:JSON.stringify({model:c.model,messages,temperature:c.temperature,max_tokens:c.maxTokens}) });
    if (!r.ok) throw new Error(await r.text());
    const d = await r.json() as { choices?: Array<{ message?: { content?: string } }> };
    return d.choices?.[0]?.message?.content ?? '';
  }
}

export class AIService {
  private _providers = new Map<string, IAIProvider>();
  constructor() { const o = new OpenAIProvider(); this._providers.set(o.id, o); }
  getProvider(id?: string): IAIProvider { const k = id ?? getAIConfig().provider; const p = this._providers.get(k); if (!p) throw new Error(`Provider ${k} missing`); return p; }
  registerProvider(p: IAIProvider) { this._providers.set(p.id, p); }
  async chat(m: Array<{role:string;content:string}>) { return this.getProvider().chat(m); }
  async generateCode(prompt:string, lang:string) { return this.chat([{role:'system',content:`You are an expert ${lang} programmer. Generate clean code.`},{role:'user',content:prompt}]); }
  async explainCode(code:string, lang:string) { return this.chat([{role:'system',content:`Explain this ${lang} code.`},{role:'user',content:code}]); }
  async reviewCode(code:string, lang:string) { return this.chat([{role:'system',content:`Review this ${lang} code.`},{role:'user',content:code}]); }
  async refactorCode(code:string, lang:string) { return this.chat([{role:'system',content:`Refactor this ${lang} code.`},{role:'user',content:code}]); }
}
