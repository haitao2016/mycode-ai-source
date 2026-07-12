import type { ProviderRegistry, ProviderFormat, ProviderCategory } from './types';
import providerConfig from './providers.json';

interface RawProvider {
  id: string;
  name: string;
  alias?: string;
  baseUrl: string;
  format: string;
  category: string;
  models: Array<{
    id: string;
    name: string;
    contextWindow?: number;
    pricing?: { input: number; output: number };
  }>;
}

const providers = providerConfig.providers as Record<string, RawProvider>;

export const EXTENDED_PROVIDER_REGISTRY: Record<string, ProviderRegistry> = {};

Object.keys(providers).forEach(key => {
  const raw = providers[key];
  EXTENDED_PROVIDER_REGISTRY[key] = {
    ...raw,
    format: raw.format as ProviderFormat,
    category: raw.category as ProviderCategory,
  };
});

export const EXTENDED_ALIAS_MAP: Record<string, string> = providerConfig.aliasMap;

export function getExtendedProviderCount(): number {
  return Object.keys(EXTENDED_PROVIDER_REGISTRY).length;
}

export function getExtendedProviderModels(): number {
  return Object.values(EXTENDED_PROVIDER_REGISTRY).reduce(
    (sum, p) => sum + p.models.length,
    0
  );
}
