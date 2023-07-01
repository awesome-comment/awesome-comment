import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Comment } from '@awesome-comment/core/types';

const useStore = defineStore('store', () => {
  const params = new URL(location.href).searchParams;
  const postId = params.get('postId');
  const postTitle = params.get('postTitle') || document.title;

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

  return {
    message,
    postId,
    postTitle,
    comments,
    total,

    loadComments,
  };
});
export default useStore;
