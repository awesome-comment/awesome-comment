import EventEmitter3 from 'eventemitter3';
import OpenAI from 'openai';

export enum StreamFetchEvent {
  CHANGE = 'change',
}

export async function sendMessage(
  token: string,
  data: OpenAI.ChatCompletionMessageParam[],
): Promise<Response> {
  return fetch('/api/admin/chat', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      messages: data,
    }),
  });
}

export default class StreamFetch extends EventEmitter3 {
  promise: Promise<void>;

  constructor(messages = [], token: string) {
    super();

    const response = sendMessage(token, messages);
    this.promise = this.fetch(response);
  }

  private async fetch(p: Promise<Response>): Promise<void> {
    const response = await p;

    if (!response.ok) {
      throw new Error('Network error');
    }

    const data: ReadableStream<Uint8Array> = response.body as ReadableStream<Uint8Array>;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (!value) {
        break;
      }

      const chunkValue = decoder.decode(value);
      this.emit(StreamFetchEvent.CHANGE, chunkValue);
    }
  }
}
