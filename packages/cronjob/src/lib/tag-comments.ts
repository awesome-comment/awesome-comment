import { TagItem } from '../types';
import { CommentTags } from '@awesome-comment/core/data';
import { fetchTidb } from '../services/fetch-tidb';
import { createAIProvider } from './translate-provider';

const KV_KEY = 'cronjob-tag-lock';

export async function tagComments(env: Cloudflare.Env): Promise<void> {
  const lock = await env.KV.get(KV_KEY);
  if (lock) {
    console.log('Another instance is running, skipping this run.');
    return;
  }

  await env.KV.put(KV_KEY, 'locked', { expirationTtl: 3600 }); // Lock for 1 hour
  // read latest non-translated comments
  const queryParams: Record<string, string | number | null | undefined> = {};
  if (env.AFTER_ID) {
    queryParams.after_id = env.AFTER_ID;
  }

  let comments: TagItem[] = [];
  try {
    comments = await fetchTidb<TagItem>(env, '/v1/untagged_comments', 'GET', undefined, undefined, queryParams);
  } catch (e) {
    console.log('Error fetching comments for tagging:', e);
    await env.KV.delete(KV_KEY);
    return;
  }

  if (comments.length === 0) {
    console.log('No comments to tag.');
    await env.KV.delete(KV_KEY);
    return;
  }

  // 使用 AI provider 工厂创建服务
  const aiProvider = createAIProvider(env);
  console.log('Using AI provider:', env.TRANSLATE_PROVIDER || 'google');

  let success = 0;
  for (const comment of comments) {
    try {
      const tags = await aiProvider.classifyTags(comment.content, CommentTags);
      if (tags.length === 0) {
        console.log('Empty response for comment:', comment.id);
        continue;
      }

      await fetchTidb(
        env,
        '/v1/update_tags',
        'PUT',
        {
          id: comment.id,
          tags,
        },
      );
      success++;
      console.log('Tagged comment:', comment.id, 'with', tags);
    } catch (e) {
      console.log('Error tagging comment:', comment.id, e);
    }
  }
  await env.KV.delete(KV_KEY);
  console.log('Tagging job completed.', success, comments.length);
}

