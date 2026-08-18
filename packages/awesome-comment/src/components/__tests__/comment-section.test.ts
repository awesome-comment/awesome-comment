import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CommentSection from '../comment-section.vue';

const mockStore = {
  isLoaded: true,
  comments: {
    1: {
      id: 1,
      postId: 'post-1',
      content: 'Comment 1',
      created_at: '2026-08-18T00:00:00.000Z',
      status: 1,
      userId: 'user-1',
    },
  },
  hasMore: false,
  loadingMore: false,
  loadComments: vi.fn(),
};

vi.mock('../../store', () => ({
  default: () => mockStore,
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('../comment-item.vue', () => ({
  default: {
    name: 'CommentItem',
    template: '<div class="comment-item-stub" />',
  },
}));

describe('comment-section.vue - maxHeight 高度与滚动条控制', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('未配置 maxHeight 时，comments-wrapper 不设置 max-height 样式', () => {
    const wrapper = mount(CommentSection);
    const container = wrapper.find('.comments-wrapper');
    expect(container.exists()).toBe(true);
    expect(container.attributes('style')).toBeUndefined();
  });

  it('通过 props 传入数值型 maxHeight 时，应自动补齐 px 并设置 overflow-y: auto', () => {
    const wrapper = mount(CommentSection, {
      props: {
        maxHeight: 450,
      },
    });
    const container = wrapper.find('.comments-wrapper');
    expect(container.attributes('style')).toContain('max-height: 450px');
    expect(container.attributes('style')).toContain('overflow-y: auto');
  });

  it('通过 props 传入字符串型 maxHeight 时，应正确设置指定样式', () => {
    const wrapper = mount(CommentSection, {
      props: {
        maxHeight: '60vh',
      },
    });
    const container = wrapper.find('.comments-wrapper');
    expect(container.attributes('style')).toContain('max-height: 60vh');
    expect(container.attributes('style')).toContain('overflow-y: auto');
  });

  it('支持通过 provide 注入 MaxHeight 参数', () => {
    const wrapper = mount(CommentSection, {
      global: {
        provide: {
          MaxHeight: '500px',
        },
      },
    });
    const container = wrapper.find('.comments-wrapper');
    expect(container.attributes('style')).toContain('max-height: 500px');
    expect(container.attributes('style')).toContain('overflow-y: auto');
  });
});
