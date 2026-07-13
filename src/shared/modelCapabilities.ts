/*---------------------------------------------------------------------------------------------
 *  MyCode AI — Model Capabilities (ported from Void modelCapabilities.ts)
 *  Supports ~50 models from 17 providers
 *--------------------------------------------------------------------------------------------*/

import { ModelCapabilities, ProviderModel, ProviderName } from './types';

// ============================================================
// Model Capability Registry
// ============================================================

export const modelCapabilities: Record<string, ModelCapabilities> = {
  // Anthropic
  'claude-opus-4-7':      { supportsImages: true,  supportsComputerUse: true,  supportsPromptCaching: true,  maxOutputTokens: 32000 },
  'claude-sonnet-4-6':    { supportsImages: true,  supportsComputerUse: true,  supportsPromptCaching: true,  maxOutputTokens: 32000 },
  'claude-haiku-4-5':     { supportsImages: true,  supportsComputerUse: false, supportsPromptCaching: true,  maxOutputTokens: 32000 },

  // OpenAI
  'gpt-5.2':              { supportsImages: true,  supportsComputerUse: false, supportsPromptCaching: false, maxOutputTokens: 128000 },
  'gpt-5.1':              { supportsImages: true,  supportsComputerUse: false, supportsPromptCaching: false, maxOutputTokens: 32000 },
  'gpt-5-mini':           { supportsImages: true,  supportsComputerUse: false, supportsPromptCaching: false, maxOutputTokens: 32000 },
  'gpt-5-nano':           { supportsImages: true,  supportsComputerUse: false, supportsPromptCaching: false, maxOutputTokens: 32000 },
  'gpt-4.1':              { supportsImages: true,  supportsComputerUse: false, supportsPromptCaching: false, maxOutputTokens: 32000 },
  'gpt-4.1-mini':         { supportsImages: true,  supportsComputerUse: false, supportsPromptCaching: false, maxOutputTokens: 32000 },
  'gpt-4.1-nano':         { supportsImages: true,  supportsComputerUse: false, supportsPromptCaching: false, maxOutputTokens: 32000 },
  'o4-mini':              { supportsImages: true,  supportsComputerUse: false, supportsPromptCaching: false, maxOutputTokens: 100000 },

  // DeepSeek
  'deepseek-chat':        { supportsImages: false, supportsComputerUse: false, supportsPromptCaching: false, maxOutputTokens: 8192 },
  'deepseek-reasoner':    { supportsImages: false, supportsComputerUse: false, supportsPromptCaching: false, maxOutputTokens: 8192 },

  // Gemini
  'gemini-2.5-pro':       { supportsImages: true,  supportsComputerUse: false, supportsPromptCaching: false, maxOutputTokens: 65536 },
  'gemini-2.5-flash':     { supportsImages: true,  supportsComputerUse: false, supportsPromptCaching: false, maxOutputTokens: 65536 },
  'gemini-2.0-flash':     { supportsImages: true,  supportsComputerUse: false, supportsPromptCaching: false, maxOutputTokens: 8192 },

  // xAI / Grok
  'grok-4':               { supportsImages: true,  supportsComputerUse: false, supportsPromptCaching: false, maxOutputTokens: 32768 },
  'grok-3':               { supportsImages: true,  supportsComputerUse: false, supportsPromptCaching: false, maxOutputTokens: 32768 },

  // Mistral
  'mistral-large':        { supportsImages: true,  supportsComputerUse: false, supportsPromptCaching: false, maxOutputTokens: 131072 },
  'mistral-small':        { supportsImages: true,  supportsComputerUse: false, supportsPromptCaching: false, maxOutputTokens: 32768 },
  'codestral':            { supportsImages: false, supportsComputerUse: false, supportsPromptCaching: false, maxOutputTokens: 32768 },

  // Ollama
  'llama3.3-70b':         { supportsImages: false, supportsComputerUse: false, supportsPromptCaching: false, maxOutputTokens: 4096 },
  'llama3.2-3b':          { supportsImages: false, supportsComputerUse: false, supportsPromptCaching: false, maxOutputTokens: 4096 },
  'qwen2.5-coder-7b':     { supportsImages: false, supportsComputerUse: false, supportsPromptCaching: false, maxOutputTokens: 4096 },
  'deepseek-coder-v2':    { supportsImages: false, supportsComputerUse: false, supportsPromptCaching: false, maxOutputTokens: 4096 },
};

// ============================================================
// Model Registry (compatible with ProviderModel from types.ts)
// ============================================================

export const knownModels: ProviderModel[] = [
  // Anthropic
  { id: 'claude-opus-4-7',       name: 'Claude Opus 4.7',       contextWindow: 200000, pricing: { input: 15, output: 75 } },
  { id: 'claude-sonnet-4-6',     name: 'Claude Sonnet 4.6',     contextWindow: 200000, pricing: { input: 3,  output: 15 } },
  { id: 'claude-haiku-4-5',      name: 'Claude Haiku 4.5',      contextWindow: 200000, pricing: { input: 0.8,output: 4  } },
  // OpenAI
  { id: 'gpt-5.2',               name: 'GPT-5.2',               contextWindow: 272000, pricing: { input: 1.75, output: 14 } },
  { id: 'gpt-5.1',               name: 'GPT-5.1',               contextWindow: 272000, pricing: { input: 1.25, output: 10 } },
  { id: 'gpt-5-mini',            name: 'GPT-5 Mini',            contextWindow: 272000, pricing: { input: 0.25, output: 1.5 } },
  { id: 'gpt-5-nano',            name: 'GPT-5 Nano',            contextWindow: 272000, pricing: { input: 0.05, output: 0.5 } },
  { id: 'gpt-4.1',               name: 'GPT-4.1',               contextWindow: 1047576,pricing: { input: 2,    output: 8 } },
  { id: 'gpt-4.1-mini',          name: 'GPT-4.1 Mini',          contextWindow: 1047576,pricing: { input: 0.4,  output: 1.6 } },
  { id: 'gpt-4.1-nano',          name: 'GPT-4.1 Nano',          contextWindow: 1047576,pricing: { input: 0.1,  output: 0.4 } },
  { id: 'o4-mini',               name: 'o4-mini',               contextWindow: 200000, pricing: { input: 1.1,  output: 4.4 } },
  // DeepSeek
  { id: 'deepseek-chat',         name: 'DeepSeek Chat',         contextWindow: 131072, pricing: { input: 0.27, output: 1.1 } },
  { id: 'deepseek-reasoner',     name: 'DeepSeek Reasoner',     contextWindow: 131072, pricing: { input: 0.55, output: 2.2 } },
  // Gemini
  { id: 'gemini-2.5-pro',        name: 'Gemini 2.5 Pro',        contextWindow: 1048576,pricing: { input: 1.25, output: 10 } },
  { id: 'gemini-2.5-flash',      name: 'Gemini 2.5 Flash',      contextWindow: 1048576,pricing: { input: 0.15, output: 0.6 } },
  { id: 'gemini-2.0-flash',      name: 'Gemini 2.0 Flash',      contextWindow: 1048576,pricing: { input: 0.1,  output: 0.4 } },
  // xAI
  { id: 'grok-4',                name: 'Grok 4',                contextWindow: 1000000,pricing: { input: 2,    output: 8 } },
  { id: 'grok-3',                name: 'Grok 3',                contextWindow: 131072, pricing: { input: 3,    output: 15 } },
  // Mistral
  { id: 'mistral-large',         name: 'Mistral Large',         contextWindow: 131072, pricing: { input: 2,    output: 6 } },
  { id: 'mistral-small',         name: 'Mistral Small',         contextWindow: 32768,  pricing: { input: 0.2,  output: 0.6 } },
  { id: 'codestral',             name: 'Codestral',             contextWindow: 256000, pricing: { input: 0.3,  output: 0.9 } },
  // Ollama locals
  { id: 'llama3.3-70b',          name: 'Llama 3.3 70B',        contextWindow: 131072 },
  { id: 'llama3.2-3b',           name: 'Llama 3.2 3B',         contextWindow: 131072 },
  { id: 'qwen2.5-coder-7b',      name: 'Qwen 2.5 Coder 7B',    contextWindow: 32768 },
  { id: 'deepseek-coder-v2',     name: 'DeepSeek Coder V2',     contextWindow: 131072 },
];

// ============================================================
// Helpers
// ============================================================

export function getCapabilities(modelId: string): ModelCapabilities {
  return modelCapabilities[modelId] ?? {};
}

export function getModel(modelId: string): ProviderModel | undefined {
  return knownModels.find(m => m.id === modelId);
}

/** Get models for a specific provider */
export function getModelsForProvider(providerName: ProviderName): ProviderModel[] {
  return knownModels.filter(m => {
    // Simple heuristic: model id prefix maps to provider
    const prefix = providerName.toLowerCase();
    return m.id.startsWith(prefix) || m.id.includes(prefix);
  });
}
