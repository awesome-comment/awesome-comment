import { H3Event } from 'h3';
import OpenAI from 'openai';
import { Model } from '~/server/utils/enum';

export default defineEventHandler(async function (event: H3Event) {
  const { messages, postId } = (await readBody(event)) as {
    messages: OpenAI.ChatCompletionMessageParam[];
    postId: string;
  };

  const isEnCn = /\/(en|cn|zh)(\/|$)/i.test(postId);
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.AI_GATEWAY_BASE_URL ? `${process.env.AI_GATEWAY_BASE_URL}/openai` : undefined,
    defaultHeaders: process.env.AI_GATEWAY_TOKEN ? {
      'cf-aig-authorization': `Bearer ${process.env.AI_GATEWAY_TOKEN}`,
    } : undefined,
  });
  const res = await openai.chat.completions.create({
    model: isEnCn ? Model.CHAT_GPT4o_MINI : Model.CHAT_GPT4o,
    messages,
    stream: false,
  });
  const { content } = res.choices[0].message;

  return {
    code: 0,
    data: content || '',
  };
});
