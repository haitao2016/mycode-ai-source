import * as vscode from 'vscode';
import { AIMessage, AIResponse, AIConfig } from './types';

function getConfig(): AIConfig {
  const c = vscode.workspace.getConfiguration('mycode-ai');
  return {
    provider: c.get<string>('provider') ?? 'openai',
    apiKey: c.get<string>('apiKey') ?? '',
    model: c.get<string>('model') ?? 'gpt-4o',
    temperature: 0.7,
    maxTokens: 4096,
  };
}

export async function sendMessage(messages: AIMessage[]): Promise<AIResponse> {
  const config = getConfig();
  if (!config.apiKey) return { success: false, error: 'API key not configured. Set mycode-ai.apiKey in Settings.' };
  try {
    if (config.provider === 'openai') return await callOpenAI(config, messages);
    return { success: false, error: `Provider ${config.provider} is not yet implemented.` };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

async function callOpenAI(config: AIConfig, messages: AIMessage[]): Promise<AIResponse> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
    body: JSON.stringify({ model: config.model, messages, temperature: config.temperature, max_tokens: config.maxTokens }),
  });
  if (!res.ok) {
    const err = await res.text();
    return { success: false, error: `OpenAI API error: ${err}` };
  }
  const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
  return { success: true, message: data.choices?.[0]?.message?.content ?? '' };
}

export async function generateCode(prompt: string, language: string): Promise<AIResponse> {
  return sendMessage([
    { role: 'system', content: `You are an expert ${language} programmer. Generate clean, well-documented code.` },
    { role: 'user', content: prompt },
  ]);
}

export async function explainCode(code: string, language: string): Promise<AIResponse> {
  return sendMessage([
    { role: 'system', content: `Explain the following ${language} code in detail.` },
    { role: 'user', content: code },
  ]);
}

export async function reviewCode(code: string, language: string): Promise<AIResponse> {
  return sendMessage([
    { role: 'system', content: `Review the following ${language} code for best practices, potential bugs, and improvements.` },
    { role: 'user', content: code },
  ]);
}
