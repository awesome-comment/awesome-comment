import { ResponseBody, User } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';
import digestFetch, { FetchError } from '@meathill/digest-fetch';
import { getUser, getUserComments } from '~/utils/api';
import { getTidbKey } from '~/utils/tidb';

export default defineEventHandler(async function (event): Promise<ResponseBody<number>> {
  const headers = getHeaders(event);
  const authorization = headers[ 'authorization' ];
  if (!authorization) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  const body = await readBody(event);
  if (!body.comment) {
    throw createError({
      statusCode: 400,
      message: 'Comment content is required',
    });
  }

  let user: User | null = null;
  try {
    user = await getUser(authorization, body.domain);
  } catch (e) {
    const message =  (e as Error).message || e;

    throw createError({
      statusCode: 401,
      message: 'Failed to authorized user. ' + message,
    });
  }
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'User not found.',
    });
  }

  const {
    name,
    nickname,
    picture,
    email,
    sub,
  } = user;
  let status = 0;
  try {
    const history = await getUserComments(sub);
    const lastCommentTime = new Date(history[ 0 ].created_at);
    // users can only post once every 30 seconds
    if (Date.now() - lastCommentTime.getTime() < 3e4) {
      throw Error('You can post comment once in 30 seconds.');
    }
    // if user has 2 or more pending comments, they cannot post new comment
    if (history.filter(c => Number(c.status) === CommentStatus.Pending).length >= 2) {
      console.log(`user_id: ${sub} have 2 or more pending comments, cannot post new comment.`);
      throw createError({
        statusCode: 405,
        message: 'You have 2 or more pending comments. Please wait for approval first.',
      });
    } else if (history.filter(c => Number(c.status) === CommentStatus.Approved).length >= 2) {
      // if user has 2 or more approved comments, they can post comment freely
      console.log(`user_id: ${sub} can post comment freely.`);
      status = 1;
    } else if (history.filter(c => Number(c.status) === CommentStatus.Rejected).length >= 5) {
      // if user has 5 or more rejected comments, they will be keep out until we give them a pass
      console.log(`user_id: ${sub} have 5 or more rejected comments, is banned currently.`);
      throw createError({
        statusCode: 405,
        message: 'You have too many rejected comments. You are not allowed to post comment.',
      });
    }

  } catch (e) {
    throw createError({
      statusCode: 405,
      message: (e as Error).message || String(e) || 'Cannot get comment history for this user. ',
    });
  }

  const ip = headers[ 'x-real-ip' ]
    || headers[ 'x-forwarded-for' ]
    || headers[ 'x-client-ip' ]
    || '';
  let id: number | null = null;
  try {
    const url = 'https://ap-northeast-1.data.tidbcloud.com/api/v1beta/app/dataapp-NFYbhmOK/endpoint/v1/post';
    const kv = await getTidbKey();
    const response = await digestFetch(
      url,
      {
        content: body.comment,
        post_id: body.postId,
        user_id: sub,
        user: JSON.stringify({
          email,
          name: nickname || name,
          avatar: picture,
          ip,
        }),
        status,
      },
      {
        method: 'POST',
        realm: 'tidb.cloud',
        ...kv,
      },
    );
    const json = await response.json();
    id = Number(json.data.rows[ 0 ].last_insert_id);
  } catch (e) {
    const message = (e as Error).message || String(e);
    throw createError({
      statusCode: (e as FetchError).status,
      message,
    });
  }

  return {
    code: 0,
    data: id,
  };
})
