import { Comment, ResponseBody } from '@awesome-comment/core/types';

export default defineEventHandler(async function (event): Promise<ResponseBody<Comment[]>> {
  const query = getQuery(event);
  const {
    start = 0,
    postId,
  } = query;

  const response = await fetch(`https://api.awesome-comment.com/comments?postId=${postId}&start=${start}`);
  const data = await response.json();
  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      message: data,
    });
  }
  return {
    code: 0,
    data,
    meta: {
      total: 0,
    },
  };
});
