import { GoogleGenAI, FunctionCallingConfigMode, createPartFromFunctionResponse, type Content, type Tool } from '@google/genai';
import OpenAI from 'openai';
import { Model } from './enum';
import { getAiGatewayConfig } from './ai-gateway';

export type AiProviderType = 'openai' | 'google';

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  toolCallId?: string;
};

export type ToolDefinition = {
  name: string;
  description?: string;
  parameters: Record<string, unknown>;
};

export type ToolChoice = 'auto' | 'none' | { name: string };

export type StructuredOutputSchema = {
  name?: string;
  schema: Record<string, unknown>;
};

export type ChatRequest = {
  messages: ChatMessage[];
  model: string;
  tools?: ToolDefinition[];
  toolChoice?: ToolChoice;
  responseSchema?: StructuredOutputSchema;
};

export type ToolCall = {
  id?: string;
  name: string;
  arguments: Record<string, unknown>;
};

export type ChatResponse = {
  text: string;
  toolCalls?: ToolCall[];
};

export interface AiProvider {
  complete(request: ChatRequest): Promise<ChatResponse>;
  streamText(request: ChatRequest): AsyncGenerator<string>;
}

export function getAdminAiProviderType(): AiProviderType {
  const raw = process.env.ADMIN_AI_PROVIDER?.trim().toLowerCase();
  if (raw === 'google') {
    return 'google';
  }
  return 'openai';
}

export function getDefaultAdminModel(provider: AiProviderType, isEnCn: boolean): string {
  if (provider === 'google') {
    return isEnCn ? Model.Gemini_2_5_Flash : Model.Gemini_2_5_Pro;
  }
  return isEnCn ? Model.CHAT_GPT4o_MINI : Model.CHAT_GPT4o;
}

export function createAdminAiProvider(provider: AiProviderType): AiProvider {
  if (provider === 'google') {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY is required for Google provider');
    }
    return new GoogleAiProvider(apiKey);
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for OpenAI provider');
  }
  return new OpenAiProvider(apiKey);
}

class OpenAiProvider implements AiProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    const gateway = getAiGatewayConfig('openai');
    this.client = new OpenAI({
      apiKey,
      ...(gateway.baseUrl ? { baseURL: gateway.baseUrl } : {}),
      ...(gateway.headers ? { defaultHeaders: gateway.headers } : {}),
    });
  }

  async complete(request: ChatRequest): Promise<ChatResponse> {
    const response = await this.client.chat.completions.create({
      model: request.model,
      messages: buildOpenAiMessages(request.messages),
      ...(request.tools ? { tools: buildOpenAiTools(request.tools) } : {}),
      ...(request.toolChoice ? { tool_choice: buildOpenAiToolChoice(request.toolChoice) } : {}),
      ...(request.responseSchema
        ? {
            response_format: {
              type: 'json_schema',
              json_schema: {
                name: request.responseSchema.name || 'response',
                schema: request.responseSchema.schema,
              },
            },
          }
        : {}),
    });

    const message = response.choices[0]?.message;
    const text = message?.content || '';
    const toolCalls = parseOpenAiToolCalls(message?.tool_calls);

    return {
      text,
      ...(toolCalls && toolCalls.length ? { toolCalls } : {}),
    };
  }

  async *streamText(request: ChatRequest): AsyncGenerator<string> {
    const stream = await this.client.chat.completions.create({
      model: request.model,
      messages: buildOpenAiMessages(request.messages),
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }
}

class GoogleAiProvider implements AiProvider {
  private client: GoogleGenAI;

  constructor(apiKey: string) {
    const gateway = getAiGatewayConfig('google-ai-studio');
    this.client = new GoogleGenAI({
      apiKey,
      ...(gateway.baseUrl || gateway.headers
        ? {
            httpOptions: {
              baseUrl: gateway.baseUrl,
              headers: gateway.headers,
            },
          }
        : {}),
    });
  }

  async complete(request: ChatRequest): Promise<ChatResponse> {
    const { contents, systemInstruction } = buildGoogleContents(request.messages);
    const shouldSendTools = Boolean(request.tools && request.toolChoice !== 'none');
    const response = await this.client.models.generateContent({
      model: request.model,
      contents,
      config: {
        ...(systemInstruction ? { systemInstruction } : {}),
        ...(request.responseSchema
          ? {
              responseMimeType: 'application/json',
              responseJsonSchema: request.responseSchema.schema,
            }
          : {}),
        ...(shouldSendTools && request.tools ? { tools: buildGoogleTools(request.tools) } : {}),
        ...(shouldSendTools && request.toolChoice ? { toolConfig: buildGoogleToolConfig(request.toolChoice) } : {}),
      },
    });

    const text = response.text || '';
    const toolCalls = parseGoogleToolCalls(response.functionCalls);

    return {
      text,
      ...(toolCalls && toolCalls.length ? { toolCalls } : {}),
    };
  }

  async *streamText(request: ChatRequest): AsyncGenerator<string> {
    const { contents, systemInstruction } = buildGoogleContents(request.messages);
    const stream = await this.client.models.generateContentStream({
      model: request.model,
      contents,
      config: {
        ...(systemInstruction ? { systemInstruction } : {}),
      },
    });

    let emitted = '';
    for await (const chunk of stream) {
      const text = chunk.text || '';
      if (!text) {
        continue;
      }
      const delta = getTextDelta(emitted, text);
      if (!delta) {
        continue;
      }
      emitted += delta;
      yield delta;
    }
  }
}

function buildOpenAiMessages(messages: ChatMessage[]): OpenAI.ChatCompletionMessageParam[] {
  return messages.map((message) => {
    const base: Record<string, unknown> = {
      role: message.role,
      content: message.content,
    };
    if (message.role === 'tool') {
      if (message.toolCallId) {
        base.tool_call_id = message.toolCallId;
      }
      if (message.name) {
        base.name = message.name;
      }
    }
    return base as OpenAI.ChatCompletionMessageParam;
  });
}

function buildOpenAiTools(tools: ToolDefinition[]): OpenAI.ChatCompletionTool[] {
  return tools.map((tool) => ({
    type: 'function',
    function: {
      name: tool.name,
      ...(tool.description ? { description: tool.description } : {}),
      parameters: tool.parameters,
    },
  }));
}

function buildOpenAiToolChoice(choice: ToolChoice): OpenAI.ChatCompletionToolChoiceOption {
  if (choice === 'auto' || choice === 'none') {
    return choice;
  }
  return {
    type: 'function',
    function: {
      name: choice.name,
    },
  };
}

function parseOpenAiToolCalls(raw: unknown): ToolCall[] | undefined {
  if (!Array.isArray(raw)) {
    return undefined;
  }
  const result: ToolCall[] = [];
  for (const item of raw) {
    if (!isRecord(item)) {
      continue;
    }
    const id = typeof item.id === 'string' ? item.id : undefined;
    const fn = isRecord(item.function) ? item.function : undefined;
    const name = typeof fn?.name === 'string' ? fn.name : '';
    const argsRaw = typeof fn?.arguments === 'string' ? fn.arguments : '';
    if (!name) {
      continue;
    }
    result.push({
      ...(id ? { id } : {}),
      name,
      arguments: parseJsonObject(argsRaw),
    });
  }
  return result.length ? result : undefined;
}

function buildGoogleContents(messages: ChatMessage[]): { contents: Content[]; systemInstruction?: string } {
  const systemInstructions: string[] = [];
  const contents: Content[] = [];

  for (const message of messages) {
    if (message.role === 'system') {
      systemInstructions.push(message.content);
      continue;
    }
    if (message.role === 'tool') {
      contents.push(buildGoogleToolResponse(message));
      continue;
    }
    contents.push({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }],
    });
  }

  return {
    contents,
    ...(systemInstructions.length ? { systemInstruction: systemInstructions.join('\n') } : {}),
  };
}

function buildGoogleTools(tools: ToolDefinition[]): Tool[] {
  return [
    {
      functionDeclarations: tools.map((tool) => ({
        name: tool.name,
        ...(tool.description ? { description: tool.description } : {}),
        parameters: tool.parameters,
      })),
    },
  ];
}

function buildGoogleToolConfig(
  choice: Exclude<ToolChoice, 'none'>,
): { functionCallingConfig: { mode: FunctionCallingConfigMode; allowedFunctionNames?: string[] } } {
  if (choice === 'auto') {
    return { functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO } };
  }
  return {
    functionCallingConfig: {
      mode: FunctionCallingConfigMode.ANY,
      allowedFunctionNames: [choice.name],
    },
  };
}

function parseGoogleToolCalls(raw: unknown): ToolCall[] | undefined {
  if (!Array.isArray(raw)) {
    return undefined;
  }
  const result: ToolCall[] = [];
  for (const item of raw) {
    if (!isRecord(item)) {
      continue;
    }
    const id = typeof item.id === 'string' ? item.id : undefined;
    const name = typeof item.name === 'string' ? item.name : '';
    if (!name) {
      continue;
    }
    const args = isRecord(item.args) ? item.args : {};
    result.push({
      ...(id ? { id } : {}),
      name,
      arguments: args,
    });
  }
  return result.length ? result : undefined;
}

function buildGoogleToolResponse(message: ChatMessage): Content {
  if (!message.name) {
    return {
      role: 'user',
      parts: [{ text: message.content }],
    };
  }
  const callId = message.toolCallId || message.name;
  const response = normalizeJsonValue(message.content);
  const responseObject = isRecord(response) ? response : { result: response };
  const part = createPartFromFunctionResponse(callId, message.name, responseObject);
  return {
    role: 'user',
    parts: [part],
  };
}

function parseJsonObject(raw: string): Record<string, unknown> {
  if (!raw) {
    return {};
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeJsonValue(raw: string): unknown {
  if (!raw) {
    return '';
  }
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function getTextDelta(previous: string, current: string): string {
  if (!previous) {
    return current;
  }
  if (current.startsWith(previous)) {
    return current.slice(previous.length);
  }
  return current;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
