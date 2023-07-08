import { defineStore } from 'pinia';
import { inject, ref } from 'vue';
import { Comment, ResponseComment } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';

const useStore = defineStore('store', () => {
  const postId = inject('postId') as string;
  const isLoaded = ref<boolean>(false);
  const start = ref<number>(0);
  const message = ref<string>('');
  const comments = ref<Comment[]>([]);
  const total = ref<number>(0);

  async function loadComments() {
    message.value = '';
    const baseUrl = inject('ApiBaseUrl');
    const res = await fetch(`${baseUrl}/api/comments?postId=${postId}&start=${start.value}`);

    if (!res.ok) {
      message.value = 'Load comments failed. ' + res.statusText;
      isLoaded.value = true;
      return;
    }

    const data = await res.json();
    if (data.code !== 0) {
      message.value = 'Load comments failed. ' + data.message;
      isLoaded.value = true;
      return;
    }

    comments.value = data.data.map((item: ResponseComment) => {
      const { user, created_at: createdAt, ...rest } = item;
      return {
        ...rest,
        createdAt: new Date(createdAt),
        user: JSON.parse(item.user as string),
      };
    });
    total.value = data.meta?.total || 0;
    isLoaded.value = true;
    return data;
  }
  function addComment(comment: string): void {
    comments.value.unshift({
      id: 0,
      postId,
      content: comment,
      createdAt: new Date().toString(),
      userId: '',
      status: CommentStatus.Approved,
    });
    total.value++;
  }

  return {
    isLoaded,
    message,
    postId,
    comments,
    total,

    loadComments,
    addComment,
  };
});
export default useStore;
