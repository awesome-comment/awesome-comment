import { Comment, ResponseBody } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';

export default defineEventHandler(async function (event): Promise<ResponseBody<Comment[]>> {
  const query = getQuery(event);
  const {
    start = 0,
    status, // 0=to be reviewed, 1=approved
    postId = '',
    user = '',
    language = '',
  } = query;

  const data: Comment[] = [];
  const encodedCredentials = btoa(`${process.env.TIDB_PUBLIC_KEY}:${process.env.TIDB_PRIVATE_KEY}`);
  try {
    let url = process.env.TIDB_END_POINT + '/v3/moderator/get';
    const params = new URLSearchParams();
    params.set('start', start as string);
    params.set('emails', event.context.config.adminEmails);
    if (language) {
      params.set('lang', `%/${language}/%`);
    }
    if (status) {
      switch (Number(status)) {
        case CommentStatus.UnReplied:
          url = process.env.TIDB_END_POINT + '/v3/moderator/uncommented';
          break;

        case CommentStatus[ 'Replied to Admin' ]:
          url = process.env.TIDB_END_POINT + '/v3/moderator/reply_admin';
          break;

        default:
          params.set('status', status as string);
          break;
      }
    }
    if (postId) {
      params.set('post_id', postId as string);
    }
    if (user) {
      params.set('user_id', user as string);
    }
    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${encodedCredentials}`,
      },
    });
    const result = await response.json();
    data.push(...result.data.rows);
  } catch (e) {
    const message = (e as Error).message || String(e);
    throw createError({
      statusCode: 400,
      message,
    });
  }

  return {
    code: 0,
    data,
    meta: {
      config: event.context.config,
    },
  };
});
