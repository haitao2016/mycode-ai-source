import * as vscode from 'vscode';
import { AIMessage, AIResponse, AIConfig } from './shared/types';

function getConfig(): AIConfig {
  const c = vscode.workspace.getConfiguration('mycode-ai');
  return { provider: c.get('provider', 'openai'), apiKey: c.get('apiKey', ''), model: c.get('model', 'gpt-4o') };
}

export async function sendMessage(messages: AIMessage[]): Promise<AIResponse> {
  const config = getConfig();
  if (!config.apiKey) return { success: false, error: 'API key not configured' };
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify({ model: config.model, messages, temperature: 0.7, max_tokens: 2000 }),
    });
    const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
    return { success: true, message: data.choices?.[0]?.message?.content ?? 'No response' };
  } catch (e) { return { success: false, error: String(e) }; }
}

export async function streamMessage(messages: AIMessage[]): Promise<AIResponse> {
  const config = getConfig();
  if (!config.apiKey) return { success: false, error: 'API key not configured' };
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify({ model: config.model, messages, temperature: 0.7, max_tokens: 2000, stream: true }),
    });
    if (!res.ok) return { success: false, error: `HTTP ${res.status}` };
    const reader = res.body?.getReader();
    if (!reader) return { success: false, error: 'No stream reader' };
    let full = '';
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
      for (const line of lines) {
        const json = line.slice(6).trim();
        if (json === '[DONE]') continue;
        try {
          const parsed = JSON.parse(json) as { choices?: Array<{ delta?: { content?: string } }> };
          full += parsed.choices?.[0]?.delta?.content ?? '';
        } catch { /* skip */ }
      }
    }
    return { success: true, message: full };
  } catch (e) { return { success: false, error: String(e) }; }
}
