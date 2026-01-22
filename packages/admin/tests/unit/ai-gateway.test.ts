import { describe, it, expect } from 'vitest';
import { getAiGatewayConfig } from '../../server/utils/ai-gateway';

function withEnv<T>(values: Record<string, string | undefined>, fn: () => T): T {
  const original = {
    AI_GATEWAY_BASE_URL: process.env.AI_GATEWAY_BASE_URL,
    AI_GATEWAY_TOKEN: process.env.AI_GATEWAY_TOKEN,
  };
  applyEnvValue('AI_GATEWAY_BASE_URL', values.AI_GATEWAY_BASE_URL);
  applyEnvValue('AI_GATEWAY_TOKEN', values.AI_GATEWAY_TOKEN);
  try {
    return fn();
  } finally {
    applyEnvValue('AI_GATEWAY_BASE_URL', original.AI_GATEWAY_BASE_URL);
    applyEnvValue('AI_GATEWAY_TOKEN', original.AI_GATEWAY_TOKEN);
  }
}

function applyEnvValue(key: 'AI_GATEWAY_BASE_URL' | 'AI_GATEWAY_TOKEN', value: string | undefined): void {
  if (value === undefined) {
    delete process.env[key];
    return;
  }
  process.env[key] = value;
}

describe('AI Gateway Config', () => {
  it('未设置 base url 时返回空配置', () => {
    const result = withEnv({ AI_GATEWAY_BASE_URL: undefined, AI_GATEWAY_TOKEN: undefined }, () =>
      getAiGatewayConfig('openai'),
    );
    expect(result).toEqual({});
  });

  it('会拼接 openai 路径并携带鉴权头', () => {
    const result = withEnv(
      {
        AI_GATEWAY_BASE_URL: 'https://gateway.ai.cloudflare.com/v1/account/gateway/',
        AI_GATEWAY_TOKEN: 'token-123',
      },
      () => getAiGatewayConfig('openai'),
    );
    expect(result).toEqual({
      baseUrl: 'https://gateway.ai.cloudflare.com/v1/account/gateway/openai',
      headers: {
        'cf-aig-authorization': 'Bearer token-123',
      },
    });
  });

  it('base url 已包含 provider 时不会重复拼接', () => {
    const result = withEnv(
      {
        AI_GATEWAY_BASE_URL: 'https://gateway.ai.cloudflare.com/v1/account/gateway/openai/',
        AI_GATEWAY_TOKEN: 'token-123',
      },
      () => getAiGatewayConfig('openai'),
    );
    expect(result).toEqual({
      baseUrl: 'https://gateway.ai.cloudflare.com/v1/account/gateway/openai',
      headers: {
        'cf-aig-authorization': 'Bearer token-123',
      },
    });
  });

  it('未提供 token 时不返回 headers', () => {
    const result = withEnv(
      {
        AI_GATEWAY_BASE_URL: 'https://gateway.ai.cloudflare.com/v1/account/gateway',
        AI_GATEWAY_TOKEN: undefined,
      },
      () => getAiGatewayConfig('openai'),
    );
    expect(result).toEqual({
      baseUrl: 'https://gateway.ai.cloudflare.com/v1/account/gateway/openai',
      headers: undefined,
    });
  });
});
