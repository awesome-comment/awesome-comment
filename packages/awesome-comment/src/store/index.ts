import { defineStore } from 'pinia';
import { inject, ref } from 'vue';
import { Comment, ResponseBody, ResponseComment } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';
import { User } from '@auth0/auth0-vue';

function formatHelper(item: ResponseComment) {
  const { user, created_at: createdAt, ...rest } = item;
  return {
    ...rest,
    status: Number(item.status),
    createdAt: new Date(createdAt),
    user: JSON.parse(item.user as string),
  };
}

const useStore = defineStore('store', () => {
  const postId = inject('postId') as string;
  const preloaded = inject('comments') as ResponseComment[];
  const isLoaded = ref<boolean>(!!preloaded?.length);
  const start = ref<number>(0);
  const message = ref<string>('');
  const comments = ref<Comment[]>(formatComment(preloaded || []));
  const total = ref<number>(0);
  const baseUrl = inject('ApiBaseUrl');
  const loadingMore = ref<boolean>(false);
  const hasMore = ref<boolean>(false);

  function formatComment(from: ResponseComment[]): Comment[] {
    const res: Comment[] = [];
    const deeper: ResponseComment[] = [];
    from.forEach((item: ResponseComment) => {
      if (!item.ancestor_id || Number(item.ancestor_id) === 0) {
        res.push(formatHelper(item));
      } else {
        deeper.push(item);
      }
    });

    deeper.forEach((item: ResponseComment) => {
      const parent = res.find(i => item.ancestor_id === i.id);
      if (parent) {
        parent.children = [...(parent.children || []), formatHelper(item)];
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

    comments.value.push(...formatComment(data.data || []));
    const count = data.data?.length || 0;
    hasMore.value = count >= 20;
    total.value += count;
    isLoaded.value = true;
    loadingMore.value = false;
    return data;
  }
  function addComment(id: number, comment: string, user: User, ancestorId?: number, parentId?: number): void {
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
      status: CommentStatus.Pending,
      isNew: true,
    }
    if (ancestorId || parentId) {
      newComment.ancestorId = ancestorId;
      newComment.parentId = parentId;
      const idx = comments.value.findIndex(i => Number(i.id) === ancestorId);
      if (ancestorId === parentId) { // if same value, means the comment is just reply to the ancestor item
        if (!comments.value[ idx ].children) {
          comments.value[ idx ].children = []
        }
        comments.value[ idx ].children!.unshift(newComment);
      } else { // means the comment is the reply to the previous parent item
        const idx2 = comments.value[ idx ].children!.findIndex(i => Number(i.id) === parentId);
        comments.value[ idx ].children!.splice(idx2 + 1, 0, newComment); // insert after parent
      }
    } else {
      newComment.ancestorId = 0;
      newComment.parentId = 0;
      comments.value.unshift(newComment);
    }
    total.value++;
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
