import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, config } from '@vue/test-utils';
import { createPinia, setActivePinia, defineStore } from 'pinia';
import CommentActions from '../comment-actions.vue';

// mock store
const mockStore = {
  postId: 'store-post-123',
  updateComment: vi.fn(),
};
vi.mock('../../store', () => ({
  default: () => mockStore,
}));

// mock i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe('comment-actions.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ code: 0, data: { like: 1 } }),
      }),
    ) as unknown as typeof fetch;
  });

  function createWrapper(comment: Record<string, unknown>) {
    return mount(CommentActions, {
      props: { comment: comment as never },
      global: {
        provide: {
          ApiBaseUrl: 'https://api.example.com',
          siteId: 'site123',
        },
      },
    });
  }

  it('当 comment.postId 缺失时，应使用 store.postId 作为 fallback', async () => {
    const wrapper = createWrapper({
      id: 1,
      content: 'Test comment',
      createdAt: new Date(),
      status: 1,
      user_id: 'user1',
      userId: 'user1',
      // 注意：没有 postId
    });

    // 点击"赞"按钮
    const likeButton = wrapper.findAll('button').at(0)!;
    await likeButton.trigger('click');

    // 等待异步操作
    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalledOnce();
    });

    const fetchCall = vi.mocked(global.fetch).mock.calls[0];
    expect(fetchCall[0]).toBe('https://api.example.com/api/like/1');

    const body = JSON.parse((fetchCall[1] as RequestInit).body as string);
    expect(body).toEqual({
      like: true,
      postId: 'store-post-123', // 应当使用 store 中的 postId
      siteId: 'site123',
    });
  });

  it('当 comment.postId 存在时，应优先使用 comment.postId', async () => {
    const wrapper = createWrapper({
      id: 2,
      postId: 'comment-post-456',
      post_id: 'comment-post-456',
      content: 'Test comment 2',
      createdAt: new Date(),
      status: 1,
      user_id: 'user1',
      userId: 'user1',
    });

    const likeButton = wrapper.findAll('button').at(0)!;
    await likeButton.trigger('click');

    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalledOnce();
    });

    const fetchCall = vi.mocked(global.fetch).mock.calls[0];
    const body = JSON.parse((fetchCall[1] as RequestInit).body as string);
    expect(body).toEqual({
      like: true,
      postId: 'comment-post-456', // 应当优先使用 comment 自身的 postId
      siteId: 'site123',
    });
  });

  it('点击"踩"按钮时，like 应为 false 且 postId 不能缺失', async () => {
    const wrapper = createWrapper({
      id: 3,
      content: 'Test comment 3',
      createdAt: new Date(),
      status: 1,
      user_id: 'user1',
      userId: 'user1',
    });

    // 第二个按钮是"踩"按钮
    const dislikeButton = wrapper.findAll('button').at(1)!;
    await dislikeButton.trigger('click');

    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalledOnce();
    });

    const fetchCall = vi.mocked(global.fetch).mock.calls[0];
    const body = JSON.parse((fetchCall[1] as RequestInit).body as string);
    expect(body.like).toBe(false);
    expect(body.postId).toBe('store-post-123');
    expect(body.siteId).toBe('site123');
  });
});
