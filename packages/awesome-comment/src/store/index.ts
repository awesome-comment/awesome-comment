import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Comment } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';

const useStore = defineStore('store', () => {
  const params = new URL(location.href).searchParams;
  const postId = params.get('post_id') || 'awesome-comment-self';

  const start = ref<number>(0);
  const message = ref<string>('');
  const comments = ref<Comment[]>([]);
  const total = ref<number>(0);

  async function loadComments() {
    message.value = '';
    const res = await fetch(__API_URL__ + `/api/comments?postId=${postId}&start=${start.value}`);

    if (!res.ok) {
      message.value = 'Load comments failed. ' + res.statusText;
      return;
    }

    const data = await res.json();
    if (data.code !== 0) {
      message.value = 'Load comments failed. ' + data.message;
      return;
    }

    comments.value = data.data;
    total.value = data.meta?.total || 0;
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
    message,
    postId,
    comments,
    total,

    loadComments,
    addComment,
  };
});
export default useStore;
