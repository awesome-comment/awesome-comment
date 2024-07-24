import { H3Event } from 'h3';
import OpenAI from 'openai';
import { Model } from '~/server/utils/enum';

export default defineEventHandler(async function (event: H3Event) {
  const { messages } = await readBody(event) as {
    messages: OpenAI.ChatCompletionMessageParam[],
  };

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const res = await openai.chat.completions.create({
    model: Model.CHAT_GPT4o_MINI,
    messages,
    stream: false,
  });

  return {
    code: 0,
    data: res.choices[ 0 ].message.content,
  };
});
