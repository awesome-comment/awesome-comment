import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createApp } from 'vue';

// mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// 先 mock localStorage，再导入 store
const { default: useStore } = await import('../../store/index.ts');

function createTestApp() {
  const app = createApp({ template: '<div />' });
  const pinia = createPinia();
  app.use(pinia);
  app.provide('postId', 'test-post');
  app.provide('siteId', 'test-site');
  app.provide('comments', []);
  app.provide('total', 0);
  app.provide('ApiBaseUrl', 'https://api.test.com');

  // 需要在 app context 中运行
  setActivePinia(pinia);
  app.runWithContext(() => {
    useStore();
  });
  return { app, pinia };
}

describe('formatComment 兼容性', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('snake_case 格式的评论应正确嵌套（原有行为）', () => {
    const { app } = createTestApp();
    app.runWithContext(() => {
      const store = useStore();

      // 模拟 snake_case API 响应
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              code: 0,
              data: [
                {
                  id: 1,
                  post_id: 'test-post',
                  content: '顶级评论',
                  user_id: 'user1',
                  parent_id: 0,
                  ancestor_id: 0,
                  status: 1,
                  created_at: '2026-02-13',
                  user: '{"name":"User1","email":"u1@test.com","avatar":""}',
                },
                {
                  id: 2,
                  post_id: 'test-post',
                  content: '回复评论',
                  user_id: 'user2',
                  parent_id: 1,
                  ancestor_id: 1,
                  status: 1,
                  created_at: '2026-02-13',
                  user: '{"name":"User2","email":"u2@test.com","avatar":""}',
                },
              ],
              meta: { total: 2 },
            }),
        }),
      ) as unknown as typeof fetch;

      return store.loadComments().then(() => {
        const commentValues = Object.values(store.comments);
        // 应该只有1个顶级评论
        expect(commentValues).toHaveLength(1);
        // 该顶级评论应有1个子评论
        expect(commentValues[0].children).toHaveLength(1);
        expect(commentValues[0].children![0].content).toBe('回复评论');
      });
    });
  });

  it('camelCase 格式的评论应正确嵌套（新增兼容）', () => {
    const { app } = createTestApp();
    app.runWithContext(() => {
      const store = useStore();

      // 模拟 camelCase API 响应（SaaS 官网格式）
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              code: 0,
              data: [
                {
                  id: 30001,
                  post_id: 'test-post',
                  postId: 'test-post',
                  content: '你好222',
                  user_id: 'user1',
                  parentId: 0,
                  ancestorId: 0,
                  status: 1,
                  created_at: '2026-02-13',
                  user: '{"name":"Semion Mike","email":"sm@test.com","avatar":""}',
                },
                {
                  id: 60001,
                  post_id: 'test-post',
                  postId: 'test-post',
                  content: '你好呀，感谢你第一个来留言',
                  user_id: 'admin',
                  parentId: 30001,
                  ancestorId: 30001,
                  status: 1,
                  created_at: '2026-02-13',
                  user: '{"name":"Admin","email":"admin@test.com","avatar":""}',
                },
              ],
              meta: { total: 2 },
            }),
        }),
      ) as unknown as typeof fetch;

      return store.loadComments().then(() => {
        const commentValues = Object.values(store.comments);
        // 应该只有1个顶级评论（Semion Mike）
        expect(commentValues).toHaveLength(1);
        expect(commentValues[0].content).toBe('你好222');
        // 该顶级评论应有1个子评论（Admin 的回复）
        expect(commentValues[0].children).toHaveLength(1);
        expect(commentValues[0].children![0].content).toBe('你好呀，感谢你第一个来留言');
      });
    });
  });
});
