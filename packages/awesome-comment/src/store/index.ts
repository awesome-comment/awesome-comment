import { defineStore } from 'pinia';
import { inject, ref } from 'vue';
import { Comment, ResponseBody, ResponseComment } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';
import { User } from '@auth0/auth0-vue';

function formatHelper(item: ResponseComment): Comment {
  const {
    id,
    created_at: createdAt,
    parent_id: parentId,
    ancestor_id: ancestorId,
    user_id: userId,
    ...rest
  } = item;
  return {
    ...rest,
    id: Number(id),
    userId,
    parentId: Number(parentId),
    ancestorId: Number(ancestorId),
    status: Number(item.status),
    createdAt: new Date(createdAt),
  };
}

const LOCAL_STORAGE_KEY = 'awesome-comment-comments';
const local = localStorage.getItem(LOCAL_STORAGE_KEY);
const localComments: Record<string, Comment> = local ? JSON.parse(local) : {};

const useStore = defineStore('store', () => {
  const postId = inject('postId') as string;
  const preloaded = inject('comments') as ResponseComment[];
  const isLoaded = ref<boolean>(!!preloaded?.length);
  const start = ref<number>(0);
  const message = ref<string>('');
  const comments = ref<Record<number, Comment>>(formatComment(preloaded || []));
  const total = ref<number>(0);
  const baseUrl = inject('ApiBaseUrl');
  const loadingMore = ref<boolean>(false);
  const hasMore = ref<boolean>(false);

  function formatComment(from: ResponseComment[]): Record<number, Comment> {
    const res: Record<number, Comment> = {};
    const deeper: Comment[] = [];
    from.forEach((item: ResponseComment) => {
      removeLocalComment(Number(item.id));
      const formatted = formatHelper(item);
      if (!item.ancestor_id || Number(item.ancestor_id) === 0) {
        res[ item.id as number ] = formatted;
      } else {
        deeper.push(formatted);
      }
    });
    const comment = localComments[ postId ];
    if (comment) {
      comment.createdAt = new Date(comment.createdAt);
      if (!comment.ancestorId || Number(comment.ancestorId) === 0) {
        res[ comment.id as number ] = comment;
      } else {
        deeper.push(comment);
      }
    }

    deeper.forEach((item: Comment) => {
      if (item.ancestorId as number in res) {
        const parent = res[ item.ancestorId as number ];
        parent.children = [item, ...(parent.children || [])];
      }
    });
    return res;
  }

  async function loadComments() {
    message.value = '';
    loadingMore.value = true;
    const params = new URLSearchParams();
    params.append('postId', postId);
    params.append('start', start.value.toString());
    const res = await fetch(`${baseUrl}/api/comments?${params}`);

    if (!res.ok) {
      message.value = 'Load comments failed. ' + res.statusText;
      isLoaded.value = true;
      loadingMore.value = false;
      return;
    }

    const data = (await res.json()) as ResponseBody<ResponseComment[]>;
    if (data.code !== 0) {
      message.value = 'Load comments failed. ' + data.message;
      isLoaded.value = true;
      loadingMore.value = false;
      return;
    }

    const formatted = formatComment(data.data || []);
    Object.assign(comments.value, formatted);
    const count = data.data?.length || 0;
    hasMore.value = Object.values(formatted).length >= 20;
    total.value += count;
    isLoaded.value = true;
    loadingMore.value = false;
    return data;
  }
  function addComment(
    id: number,
    comment: string,
    user: User,
    status: CommentStatus = CommentStatus.Pending,
    ancestorId?: number,
    parentId?: number
  ): void {
    const {
      sub = '',
      name = '',
      picture = '',
      email = '',
      nickname = '' ,
    } = user;
    const newComment: Comment = {
      id,
      postId,
      content: comment,
      createdAt: new Date(),
      user: {
        avatar: picture,
        email: email,
        name: nickname || name,
      },
      userId: sub,
      status,
      isNew: true,
    }
    if (ancestorId || parentId) {
      newComment.ancestorId = ancestorId;
      newComment.parentId = parentId;
      const ancestor = comments.value[ ancestorId as number ];
      if (!ancestor.children) {
        ancestor.children = []
      }
      if (ancestorId === parentId) { // if same value, means the comment is just reply to the ancestor item
        ancestor.children!.unshift(newComment);
      } else { // means the comment is the reply to the previous parent item
        const idx = ancestor.children!.findIndex(i => Number(i.id) === parentId);
        ancestor.children!.splice(idx + 1, 0, newComment); // insert after parent
      }
    } else {
      newComment.ancestorId = 0;
      newComment.parentId = 0;
      comments.value = { [ id ]: newComment, ...comments.value }; // new comment should be positioned at the beginning
    }
    total.value++;

    // save comment to local if user is not admin
    if (status !== CommentStatus.Approved) {
      localComments[ postId ] = newComment;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localComments));
    }
  }
  function removeLocalComment(id: number): void {
    if (localComments[ postId ]?.id !== id) return;
    delete localComments[ postId ];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localComments));
  }

  return {
    isLoaded,
    message,
    postId,
    comments,
    total,
    start,
    hasMore,
    loadingMore,

    loadComments,
    addComment,
  };
});
export default useStore;
