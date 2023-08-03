import { defineStore } from 'pinia';
import { inject, ref } from 'vue';
import { Comment, ResponseBody, ResponseComment } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';
import { User } from '@auth0/auth0-vue';

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
    return from.map((item: ResponseComment) => {
      const { user, created_at: createdAt, ...rest } = item;
      return {
        ...rest,
        status: Number(item.status),
        createdAt: new Date(createdAt),
        user: JSON.parse(item.user as string),
      };
    });
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
    if (count >= 20) {
      hasMore.value = true;
    } else {
      hasMore.value = false;
    }
    total.value += count;
    isLoaded.value = true;
    loadingMore.value = false;
    return data;
  }
  function addComment(id: number, comment: string, user: User): void {
    const {
      sub = '',
      name = '',
      picture = '',
      email = '',
      nickname = '' ,
    } = user;
    comments.value.unshift({
      id,
      postId,
      content: comment,
      ancestorId: -1,
      parentId: -1,
      createdAt: new Date(),
      user: {
        avatar: picture,
        email: email,
        name: nickname || name,
      },
      userId: sub,
      status: CommentStatus.Pending,
      isNew: true,
    });
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
