import { H3Event } from 'h3';
import OpenAI from 'openai';
import { Model } from '~/server/utils/enum';
import { Readable } from 'node:stream';

export default defineEventHandler(async function (event: H3Event) {
  const { messages } = await readBody(event) as {
    messages: OpenAI.ChatCompletionMessageParam[],
  };

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const gptStream = await openai.chat.completions.create({
    model: Model.CHAT_GPT4o_MINI,
    messages,
    stream: true,
  });

  const outputStream = new Readable({
    read(size) {},
  });
  sendStream(event, outputStream);

  for await (const part of gptStream) {
    const content = part.choices[ 0 ]?.delta?.content || '';
    outputStream.push(JSON.stringify(part));
  }
  outputStream.push(null);
});
