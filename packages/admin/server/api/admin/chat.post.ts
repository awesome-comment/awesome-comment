import { H3Event } from 'h3';
import OpenAI from 'openai';
import { Model } from '~/server/utils/enum';

export default defineEventHandler(async function (event: H3Event) {
  const { messages, postId } = await readBody(event) as {
    messages: OpenAI.ChatCompletionMessageParam[];
    postId: string;
  };

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const isEnCn = /\/(en|cn|zh)(\/|$)/i.test(postId);
  const res = await openai.chat.completions.create({
    model: isEnCn ? Model.CHAT_GPT4o_MINI : Model.CHAT_GPT4o,
    messages,
    stream: false,
  });

  return {
    code: 0,
    data: res.choices[ 0 ].message.content,
  };
});
