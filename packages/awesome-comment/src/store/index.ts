import { defineStore } from 'pinia';
import { inject, ref } from 'vue';
import { Comment, ResponseBody, ResponseComment } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';
import { useAuth0, User } from '@auth0/auth0-vue';

const useStore = defineStore('store', () => {
  const postId = inject('postId') as string;
  const preloaded = inject('comments') as ResponseComment[];
  const isLoaded = ref<boolean>(!!preloaded?.length);
  const start = ref<number>(0);
  const message = ref<string>('');
  const comments = ref<Comment[]>(formatComment(preloaded || []));
  const total = ref<number>(0);

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
    const baseUrl = inject('ApiBaseUrl');
    const domain = inject('Auth0Domain') as string;
    const auth0 = useAuth0();
    const accessToken = await auth0.getAccessTokenSilently();
    const params = new URLSearchParams();
    params.append('postId', postId);
    params.append('start', start.value.toString());
    if (accessToken) {
      params.append('domain', domain || '');
    }
    const res = await fetch(`${baseUrl}/api/comments?${params}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      message.value = 'Load comments failed. ' + res.statusText;
      isLoaded.value = true;
      return;
    }

    const data = (await res.json()) as ResponseBody<ResponseComment[]>;
    if (data.code !== 0) {
      message.value = 'Load comments failed. ' + data.message;
      isLoaded.value = true;
      return;
    }

    comments.value = formatComment(data.data || []);
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

    loadComments,
    addComment,
  };
});
export default useStore;
