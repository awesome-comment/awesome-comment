import { Comment, ResponseBody } from '@awesome-comment/core/types';
import { getCacheKey, getConfig } from '~/server/utils';
import { H3Event } from 'h3';

export default defineCachedEventHandler(async function (event: H3Event): Promise<ResponseBody<Comment[]>> {
  const query = getQuery(event);
  const { postId } = query;
  const start = Number(query.start || 0);
  if (!postId) {
    throw createError({
      statusCode: 404,
      message: 'Missing post id',
    });
  }

  const KV = event.context.cloudflare.env.KV;
  const key = getCacheKey(postId + (start ? '-' + start : ''));
  const stored = await KV.get(key, { type: 'json' }) as Comment[];
  const encodedCredentials = btoa(`${process.env.TIDB_PUBLIC_KEY}:${process.env.TIDB_PRIVATE_KEY}`);
  if (stored) {
    console.log('[cache] get comments from cache: ', key);
    // TODO remove this compatibility code after the next release
    const data = ('data' in stored ? stored.data : stored) as Comment[];
    const total = ('total' in stored ? stored.total : (data as unknown[]).length) as number;
    return {
      code: 0,
      data,
      meta: {
        total,
      },
    };
  }

  const data: Comment[] = [];
  let total = 0;
  const params = new URLSearchParams();
  params.set('post_id', postId as string);
  params.set('start', start.toString());
  try {
    const url = process.env.TIDB_END_POINT + '/v1/get';
    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${encodedCredentials}`,
      },
    });
    const result = await response.json();
    data.push(...result.data.rows);

    const config = await getConfig(KV);
    for (const item of data) {
      if (!item.user) continue;
      item.user = JSON.parse(String(item.user));
      item.isAdmin = config?.adminEmails?.includes(item.user?.email || '');
    }
  } catch (e) {
    const message = (e as Error).message || String(e);
    throw createError({
      statusCode: 400,
      message,
    });
  }
  try {
    const url = process.env.TIDB_END_POINT + '/v1/count';
    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${encodedCredentials}`,
      },
    });
    const json = await response.json();
    total = Number(json.data.rows[ 0 ].num);
  } catch (e) {
    const message = 'Failed to fetch the quantity of comments. ' + (e as Error).message || String(e);
    throw createError({
      statusCode: 400,
      message,
    });
  }

  await KV.put(key, JSON.stringify({ data, total }));
  return {
    code: 0,
    data,
    meta: {
      total,
    },
  };
}, { maxAge: 60 * 20 });
