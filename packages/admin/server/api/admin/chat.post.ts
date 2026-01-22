import { H3Event, createError, getHeader, setHeader } from 'h3';
import {
  createAdminAiProvider,
  getAdminAiProviderType,
  getDefaultAdminModel,
  type ChatMessage,
  type ToolChoice,
  type ToolDefinition,
  type StructuredOutputSchema,
} from '~/server/utils/ai-provider';

export default defineEventHandler(async function (event: H3Event) {
  const { messages, postId, stream, model, tools, toolChoice, responseSchema, responseType } = (await readBody(event)) as {
    messages: ChatMessage[];
    postId?: string;
    stream?: boolean;
    model?: string;
    tools?: ToolDefinition[];
    toolChoice?: ToolChoice;
    responseSchema?: StructuredOutputSchema;
    responseType?: 'text' | 'json' | 'full';
  };

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'messages 不能为空',
    });
  }

  const isEnCn = /\/(en|cn|zh)(\/|$)/i.test(postId || '');
  const providerType = getAdminAiProviderType();
  const provider = createAdminAiProvider(providerType);
  const resolvedModel = model || process.env.ADMIN_AI_MODEL || getDefaultAdminModel(providerType, isEnCn);

  const shouldStream = typeof stream === 'boolean' ? stream : !acceptsJson(event);

  if (shouldStream) {
    if (responseSchema || tools?.length) {
      throw createError({
        statusCode: 400,
        statusMessage: 'stream 模式暂不支持结构化输出或工具调用',
      });
    }
    setHeader(event, 'Content-Type', 'text/plain; charset=utf-8');
    return createTextStream(provider, {
      messages,
      model: resolvedModel,
    });
  }

  const result = await provider.complete({
    messages,
    model: resolvedModel,
    tools,
    toolChoice,
    responseSchema,
  });

  if (responseType === 'full') {
    return {
      code: 0,
      data: result,
    };
  }

  if (responseType === 'json' || responseSchema) {
    return {
      code: 0,
      data: parseJsonResponse(result.text),
    };
  }

  return {
    code: 0,
    data: result.text,
  };
});

function acceptsJson(event: H3Event): boolean {
  const accept = getHeader(event, 'accept') || '';
  return accept.includes('application/json');
}

function parseJsonResponse(text: string): Record<string, unknown> | string {
  if (!text) {
    return {};
  }
  try {
    const parsed: unknown = JSON.parse(text);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as Record<string, unknown>;
    }
    return text;
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: 'AI 返回的 JSON 无法解析',
    });
  }
}

function createTextStream(
  provider: ReturnType<typeof createAdminAiProvider>,
  request: { messages: ChatMessage[]; model: string },
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of provider.streamText({
          messages: request.messages,
          model: request.model,
        })) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}
