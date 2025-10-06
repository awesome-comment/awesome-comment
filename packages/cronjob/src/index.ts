import pkg from '../package.json' with { type: 'json' };
import { fetchTidb } from './services/fetch-tidb';
import { CommentItem } from './types';
import { GoogleGenAI } from '@google/genai';
import { checkShouldTranslate } from './utils';

const KV_KEY = 'cronjob-lock';

export default {
  async fetch() {
    return new Response(
      JSON.stringify({
        code: 0,
        data: {
          version: pkg.version,
        },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  },

  async scheduled(event, env): Promise<void> {
    const lock = await env.KV.get(KV_KEY);
    if (lock) {
      console.log('Another instance is running, skipping this run.');
      return;
    }

    await env.KV.put(KV_KEY, 'locked', { expirationTtl: 3600 }); // Lock for 1 hour
    // read latest non-translated comments
    const comments = [];
    try {
      const queryParams: Record<string, string | number | null | undefined> = {};
      if (env.AFTER_ID) {
        queryParams.after_id = env.AFTER_ID;
      }
      const _ = await fetchTidb<CommentItem>(env, '/v1/need_translate', 'GET', undefined, undefined, queryParams);
      comments.push(..._);
    } catch (e) {
      console.log('Error fetching comments:', e);
      await env.KV.delete(KV_KEY);
      return;
    }

    if (comments.length === 0) {
      console.log('No comments to translate.');
      await env.KV.delete(KV_KEY);
      return;
    }

    const ai = new GoogleGenAI({
      apiKey: env.GOOGLE_GEMINI_API_KEY,
    });
    let success = 0;
    for (const comment of comments) {
      if (/\/(en|cn|zh)\/?/i.test(comment.post_id)
        || !checkShouldTranslate(comment.content)
      ) {
        // skip if contains link with /en/ or /cn/ or /zh/
        console.log('Skipping comment with link:', comment.id);
        await fetchTidb(
          env,
          '/v1/update_translation',
          'PUT',
          {
            id: comment.id,
            translation: '',
          },
        );
        success++;
        continue;
      }

      try {
        const response = await ai.models.generateContent({
          model: env.DEFAULT_AI_MODEL,
          contents: `Please translate the following text between \`"""\` to English.

"""${comment.content}"""

Note:
- JUST return the translated text, no other content.
- If the text is Chinese, JUST return the original text.
- Try to keep the format same as original text.`
        });
        const translation = response.text?.trim() || '';
        console.log('xxx', comment.content, translation);
        await fetchTidb(
          env,
          '/v1/update_translation',
          'PUT',
          {
            id: comment.id,
            translation,
          },
        );
        success += translation ? 1 : 0;
        console.log('Translated comment:', comment.id);
      } catch (e) {
        console.log('Error translating comment:', comment.id, e);
      }
    }
    console.log('Translation job completed.', success, comments.length);
    await env.KV.delete(KV_KEY);
    },
} satisfies ExportedHandler<Env>;
