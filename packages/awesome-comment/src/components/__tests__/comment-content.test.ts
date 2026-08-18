import type { Comment } from '@awesome-comment/core/types';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import CommentContent from '../comment-content.vue';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

const mockStore = {
  comments: {
    10: {
      id: 10,
      children: [
        { id: 11, isAdmin: true, user: { name: 'AdminUser' } },
        { id: 12, isAdmin: false, user: { name: 'NormalUser', email: 'normal@example.com' } },
      ],
    },
  },
};

vi.mock('../../store', () => ({
  default: () => mockStore,
}));

describe('comment-content.vue', () => {
  function createComment(overrides: Partial<Comment> = {}): Comment {
    return {
      id: 1,
      postId: 'post-1',
      content: 'Hello world',
      created_at: '2026-08-18T00:00:00.000Z',
      status: 1,
      userId: 'user-1',
      ...overrides,
    };
  }

  describe('普通访客评论 (isAdmin = false)', () => {
    it('应使用 p 标签渲染普通文本，不解析为 HTML', () => {
      const comment = createComment({
        content: '**粗体文本** <script>alert(1)</script>',
        isAdmin: false,
      });
      const wrapper = mount(CommentContent, {
        props: {
          ancestorId: 0,
          comment,
        },
      });

      const p = wrapper.find('p');
      expect(p.exists()).toBe(true);
      expect(p.text()).toContain('**粗体文本** <script>alert(1)</script>');
      expect(wrapper.find('article').exists()).toBe(false);
      expect(wrapper.find('script').exists()).toBe(false);
    });
  });

  describe('管理员评论 (isAdmin = true)', () => {
    it('应正确解析 Markdown 语法并渲染为 article 标签', () => {
      const comment = createComment({
        content: '**管理员回复**：请访问 [官网](https://example.com)',
        isAdmin: true,
      });
      const wrapper = mount(CommentContent, {
        props: {
          ancestorId: 0,
          comment,
        },
      });

      const article = wrapper.find('article');
      expect(article.exists()).toBe(true);
      expect(article.find('strong').text()).toBe('管理员回复');
      const link = article.find('a');
      expect(link.exists()).toBe(true);
      expect(link.attributes('href')).toBe('https://example.com');
      expect(link.attributes('target')).toBe('_blank');
      expect(link.attributes('rel')).toBe('noopener');
    });

    it('应消毒并丢弃原生 HTML 和恶意 script', () => {
      const comment = createComment({
        content: '恶意测试 <script>alert("xss")</script> <img src="x" onerror="alert(1)">',
        isAdmin: true,
      });
      const wrapper = mount(CommentContent, {
        props: {
          ancestorId: 0,
          comment,
        },
      });

      const article = wrapper.find('article');
      expect(article.html()).not.toContain('<script');
      expect(article.html()).not.toContain('onerror');
      expect(article.find('script').exists()).toBe(false);
    });

    it('应拦截恶意 javascript: 协议链接', () => {
      const comment = createComment({
        content: '[点击中奖](javascript:alert("xss"))',
        isAdmin: true,
      });
      const wrapper = mount(CommentContent, {
        props: {
          ancestorId: 0,
          comment,
        },
      });

      const article = wrapper.find('article');
      expect(article.find('a').exists()).toBe(false);
      expect(article.text()).toContain('点击中奖');
      expect(article.html()).not.toContain('javascript:');
    });

    it('应允许合法的 https 图片并添加 loading="lazy"', () => {
      const comment = createComment({
        content: '![说明图](https://example.com/demo.png)',
        isAdmin: true,
      });
      const wrapper = mount(CommentContent, {
        props: {
          ancestorId: 0,
          comment,
        },
      });

      const img = wrapper.find('article img');
      expect(img.exists()).toBe(true);
      expect(img.attributes('src')).toBe('https://example.com/demo.png');
      expect(img.attributes('alt')).toBe('说明图');
      expect(img.attributes('loading')).toBe('lazy');
    });
  });

  describe('父级回复展示', () => {
    it('当是子级回复时应展示父级用户名', () => {
      const comment = createComment({
        id: 13,
        ancestorId: 10,
        parentId: 11,
        content: '回复管理员',
        isAdmin: false,
      });
      const wrapper = mount(CommentContent, {
        props: {
          ancestorId: 10,
          comment,
        },
      });

      expect(wrapper.text()).toContain('@admin');
    });
  });
});
