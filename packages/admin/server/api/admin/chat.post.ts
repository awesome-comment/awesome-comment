import { H3Event } from 'h3';
import OpenAI from 'openai';
import { Model } from '~/server/utils/enum';

export default defineEventHandler(async function (event: H3Event) {
  const { messages, postId } = await readBody(event) as {
    messages: OpenAI.ChatCompletionMessageParam[];
    postId: string;
  };

  const isEnCn = /\/(en|cn|zh)(\/|$)/i.test(postId);
  let result = '';
  if (process.env.AI_ADMIN_ENDPOINT) {
    const message = messages.map((m) => m.content).join('\n');
    result = await $fetch(`${process.env.AI_ADMIN_ENDPOINT}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        AC_REQUEST_AUTH: process.env.AI_ADMIN_AUTH_TOKEN || '',
      },
      body: {
        message,
        model: Model.Gemini_2_5_Flash,
      },
    });
  } else {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const res = await openai.chat.completions.create({
      model: isEnCn ? Model.CHAT_GPT4o_MINI : Model.CHAT_GPT4o,
      messages,
      stream: false,
    });
    const { content } = res.choices[ 0 ].message;
    result = content || '';
  }


  return {
    code: 0,
    data: result,
  };
});
