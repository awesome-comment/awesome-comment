import { describe, it, expect } from 'vitest';
import { getAdminAiProviderType, getDefaultAdminModel } from '../../server/utils/ai-provider';
import { Model } from '../../server/utils/enum';

function withEnv<T>(value: string | undefined, fn: () => T): T {
  const original = process.env.ADMIN_AI_PROVIDER;
  applyEnvValue(value);
  try {
    return fn();
  } finally {
    applyEnvValue(original);
  }
}

function applyEnvValue(value: string | undefined): void {
  if (value === undefined) {
    delete process.env.ADMIN_AI_PROVIDER;
    return;
  }
  process.env.ADMIN_AI_PROVIDER = value;
}

describe('admin ai provider', () => {
  it('默认使用 openai', () => {
    const result = withEnv(undefined, () => getAdminAiProviderType());
    expect(result).toBe('openai');
  });

  it('支持切换为 google', () => {
    const result = withEnv('google', () => getAdminAiProviderType());
    expect(result).toBe('google');
  });

  it('异常值回退为 openai', () => {
    const result = withEnv('invalid', () => getAdminAiProviderType());
    expect(result).toBe('openai');
  });

  it('openai 默认模型选择', () => {
    expect(getDefaultAdminModel('openai', true)).toBe(Model.CHAT_GPT4o_MINI);
    expect(getDefaultAdminModel('openai', false)).toBe(Model.CHAT_GPT4o);
  });

  it('google 默认模型选择', () => {
    expect(getDefaultAdminModel('google', true)).toBe(Model.Gemini_2_5_Flash);
    expect(getDefaultAdminModel('google', false)).toBe(Model.Gemini_2_5_Pro);
  });
});
