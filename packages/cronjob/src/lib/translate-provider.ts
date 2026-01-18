import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import z from 'zod';

// 默认模型配置
export const DEFAULT_OPENAI_MODEL = 'gpt-5-mini';
export const DEFAULT_GOOGLE_MODEL = 'gemini-3-flash-preview';

export type AIProviderType = 'google' | 'openai';

// AI Provider 接口
export interface AIProvider {
  translate(content: string): Promise<string>;
  classifyTags(content: string, tags: readonly string[]): Promise<string[]>;
}

// 构建翻译 prompt
function buildTranslatePrompt(content: string): string {
  return `Please translate the following text between \`"""\` to English.

"""${content}"""

Note:
- JUST return the translated text, no other content.
- If the text is Chinese, JUST return the original text.
- Try to keep the format same as original text.`;
}

// 构建标签分类 prompt
function buildTagPrompt(content: string, tags: readonly string[]): string {
  return `Please classify the following comment between \`"""\` into one or more of these categories: ${tags.join(', ')}.

"""${content}"""

Note:
- If uncertain, choose the most likely category.`;
}

// Google Gemini Provider
export class GoogleAIProvider implements AIProvider {
  private ai: GoogleGenAI;
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.ai = new GoogleGenAI({ apiKey });
    this.model = model || DEFAULT_GOOGLE_MODEL;
  }

  async translate(content: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: buildTranslatePrompt(content),
    });
    return response.text?.trim() || '';
  }

  async classifyTags(content: string, tags: readonly string[]): Promise<string[]> {
    const tagsSchema = z.array(z.enum(tags as [string, ...string[]]));
    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: buildTagPrompt(content, tags),
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: tagsSchema,
      },
    });
    if (!response.text) {
      return [];
    }
    return tagsSchema.parse(JSON.parse(response.text));
  }
}

// OpenAI Provider
export class OpenAIProvider implements AIProvider {
  private openai: OpenAI;
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.openai = new OpenAI({ apiKey });
    this.model = model || DEFAULT_OPENAI_MODEL;
  }

  async translate(content: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'user',
          content: buildTranslatePrompt(content),
        },
      ],
    });
    return response.choices[0]?.message?.content?.trim() || '';
  }

  async classifyTags(content: string, tags: readonly string[]): Promise<string[]> {
    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: `You are a comment classifier. Classify the comment into one or more of these categories: ${tags.join(', ')}. Return a JSON array of matching category names.`,
        },
        {
          role: 'user',
          content: content,
        },
      ],
      response_format: { type: 'json_object' },
    });
    const text = response.choices[0]?.message?.content?.trim() || '{}';
    const result = JSON.parse(text);
    // OpenAI 可能返回 { tags: [...] } 或 { categories: [...] } 或直接 [...]
    const tagArray = result.tags || result.categories || result;
    if (!Array.isArray(tagArray)) {
      console.log('xxx', text);
      return [];
    }
    return tagArray.filter((t: string) => tags.includes(t));
  }
}

// Provider 工厂函数
export function createAIProvider(env: Cloudflare.Env): AIProvider {
  const providerType = (env.TRANSLATE_PROVIDER || 'google') as AIProviderType;

  switch (providerType) {
    case 'openai':
      if (!env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is required for OpenAI provider');
      }
      return new OpenAIProvider(env.OPENAI_API_KEY, env.TRANSLATE_MODEL || DEFAULT_OPENAI_MODEL);

    case 'google':
    default:
      if (!env.GOOGLE_GEMINI_API_KEY) {
        throw new Error('GOOGLE_GEMINI_API_KEY is required for Google provider');
      }
      return new GoogleAIProvider(
        env.GOOGLE_GEMINI_API_KEY,
        env.TRANSLATE_MODEL || env.DEFAULT_AI_MODEL || DEFAULT_GOOGLE_MODEL,
      );
  }
}

// 向后兼容的别名
export type TranslateProvider = AIProvider;
export type TranslateProviderType = AIProviderType;
export const createTranslateProvider = createAIProvider;
export const GoogleTranslateProvider = GoogleAIProvider;
export const OpenAITranslateProvider = OpenAIProvider;
