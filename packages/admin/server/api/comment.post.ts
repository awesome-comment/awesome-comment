import type { PostCommentRequest, ResponseBody, User } from '@awesome-comment/core/types';
import { CommentStatus, POST_INTERVAL } from '@awesome-comment/core/data';
import { getUser, getCacheKey, getConfig, checkCommentStatus, clearCache, updateUserPostHistory } from '~/server/utils';
import createStorage from '@awesome-comment/core/utils/storage';

type PostResponse = ResponseBody<{
  id: number,
  status: CommentStatus,
}>;

export default defineEventHandler(async function (event): Promise<PostResponse> {
  const headers = getHeaders(event);
  const authorization = headers[ 'authorization' ];
  if (!authorization) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  const body: PostCommentRequest = await readBody(event);
  const comment = body.comment?.replaceAll('\u200b', '').trim();
  if (!comment || comment.length < 5 || /^\w{35,}$/.test(comment)) {
    throw createError({
      statusCode: 400,
      message: 'We encourage meaningful contributions to foster a positive community. Thank you for your understanding!',
    });
  }

  const storage = createStorage(event);
  const authEndpoint = headers[ 'auth-endpoint' ];
  let user: User | null = null;
  try {
    user = await (authEndpoint
      ? getUser(storage, authorization, authEndpoint)
      : getAuth0User(storage, authorization, body.domain)
    );
  } catch (e) {
    const message = (e as Error).message || e;
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
  // check if user has posted comment in the last 15 minutes
  if (user.posts) {
    const lastPost = user.posts[ user.posts.length - 1 ];
    const now = Date.now();
    if (now - lastPost < POST_INTERVAL) {
      throw createError({
        statusCode: 429,
        message: 'You just posted a comment less than 15 minutes ago. Please edit your previous comment to contribute to a better community.',
      });
    }
  }

  const {
    name,
    nickname,
    picture,
    email,
    sub,
  } = user;
  let status: CommentStatus;

  // check if user is admin
  const config = await getConfig(storage);
  if (config.adminEmails.includes(email)) {
    status = CommentStatus.Approved;
  } else {
    status = await checkCommentStatus(sub, body, config);
  }

  const ip = headers[ 'x-real-ip' ]
    || headers[ 'x-forwarded-for' ]
    || headers[ 'x-client-ip' ]
    || '';
  let id: number | null = null;
  const encodedCredentials = btoa(`${process.env.TIDB_PUBLIC_KEY}:${process.env.TIDB_PRIVATE_KEY}`);
  try {
    const url = process.env.TIDB_END_POINT + '/v1/post';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${encodedCredentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: body.comment,
        post_id: body.postId,
        ancestor_id: body.ancestorId || 0,
        parent_id: body.parentId || 0,
        user_id: sub,
        user: JSON.stringify({
          email,
          name: name || nickname,
          avatar: picture,
          ip,
          agent: headers[ 'user-agent' ],
          window: body.window || '',
        }),
        status,
      }),
    });
    const json = await response.json();
    id = Number(json.data.rows[ 0 ].last_insert_id);
  } catch (e) {
    const message = (e as Error).message || String(e);
    throw createError({
      statusCode: 400,
      message,
    });
  }

  // if admin reply, update parent_id to be approved
  if (config.adminEmails.includes(email) && body.parentId && body.status === CommentStatus.Pending) {
    const url = process.env.TIDB_END_POINT + '/v1/moderator/review';
    await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${encodedCredentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: CommentStatus.Approved,
        id: body.parentId,
      }),
    });
  }

  // if comment directly approved, clear cache
  if (status === CommentStatus.Approved) {
    const key = getCacheKey(body.postId);
    await clearCache(storage, key);
  }
  // update user posts
  await updateUserPostHistory(storage, authorization, user, authEndpoint ? '' : body.domain);

  return {
    code: 0,
    data: {
      id,
      status,
    },
  };
})
