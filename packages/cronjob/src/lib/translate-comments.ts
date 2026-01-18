import { fetchTidb } from '../services/fetch-tidb';
import { CommentItem } from '../types';
import { checkShouldTranslate } from '../utils';
import { createTranslateProvider } from './translate-provider';

const KV_KEY = 'cronjob-lock';
export async function translateComments(env: Cloudflare.Env): Promise<void> {
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

  // 使用 provider 工厂创建翻译服务
  const translateProvider = createTranslateProvider(env);
  console.log('Using translate provider:', env.TRANSLATE_PROVIDER || 'google');

  let success = 0;
  for (const comment of comments) {
    if (/\/(en|cn|zh)\/?/i.test(comment.post_id) || !checkShouldTranslate(comment.content)) {
      // skip if contains link with /en/ or /cn/ or /zh/
      console.log('Skipping comment with link:', comment.id);
      await fetchTidb(env, '/v1/update_translation', 'PUT', {
        id: comment.id,
        translation: '',
      });
      success++;
      continue;
    }

    try {
      const translation = await translateProvider.translate(comment.content);
      console.log('Translated:', comment.content, '->', translation);
      await fetchTidb(env, '/v1/update_translation', 'PUT', {
        id: comment.id,
        translation,
      });
      success += translation ? 1 : 0;
      console.log('Translated comment:', comment.id);
    } catch (e) {
      console.log('Error translating comment:', comment.id, e);
    }
  }
  console.log('Translation job completed.', success, comments.length);
  await env.KV.delete(KV_KEY);
}
