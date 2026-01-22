type AiGatewayConfig = {
  baseUrl?: string;
  headers?: Record<string, string>;
};

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '');
}

function appendProviderPath(baseUrl: string, provider: string): string {
  const normalized = normalizeBaseUrl(baseUrl);
  if (normalized.endsWith(`/${provider}`)) {
    return normalized;
  }
  return `${normalized}/${provider}`;
}

export function getAiGatewayConfig(provider: 'openai' | 'google-ai-studio'): AiGatewayConfig {
  const baseUrl = process.env.AI_GATEWAY_BASE_URL?.trim();
  if (!baseUrl) {
    return {};
  }

  const token = process.env.AI_GATEWAY_TOKEN?.trim();
  const headers = token ? { 'cf-aig-authorization': `Bearer ${token}` } : undefined;

  return {
    baseUrl: appendProviderPath(baseUrl, provider),
    headers,
  };
}
