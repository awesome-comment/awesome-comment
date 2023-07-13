import { defineStore } from 'pinia';
import { inject, ref } from 'vue';
import { Comment, ResponseComment } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';
import { useAuth0, User } from '@auth0/auth0-vue';

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
      status: CommentStatus.Approved,
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

    loadComments,
    addComment,
  };
});
export default useStore;
