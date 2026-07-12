export interface ProviderModel {
  id: string;
  name: string;
  contextWindow?: number;
  pricing?: {
    input: number;
    output: number;
  };
}

export type ProviderFormat = 'openai' | 'claude' | 'gemini';
export type ProviderCategory = 'oauth' | 'apikey' | 'free';

export interface ProviderRegistry {
  id: string;
  name: string;
  alias?: string;
  baseUrl: string;
  format: ProviderFormat;
  category: ProviderCategory;
  models: ProviderModel[];
}