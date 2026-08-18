import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CommentForm from '../comment-form.vue';

const mockStore = {
  postId: 'post-1',
  addComment: vi.fn(),
};

vi.mock('../../store', () => ({
  default: () => mockStore,
}));

const mockAuthStore = {
  isAuthenticated: false,
  isAwesomeAuth: false,
  user: null,
  login: vi.fn(),
};

vi.mock('../../store/auth.ts', () => ({
  default: () => mockAuthStore,
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe('comment-form.vue - 品牌与版本号控制', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('默认情况下应渲染 Awesome Comment 品牌名称并链接到 awesomecomment.org，同时附带版本号', () => {
    const wrapper = mount(CommentForm, {
      global: {
        provide: {
          ApiBaseUrl: '',
          Auth0Domain: '',
          siteId: 'site-1',
        },
      },
    });

    const brandLink = wrapper.find('a[href="https://awesomecomment.org"]');
    expect(brandLink.exists()).toBe(true);
    expect(brandLink.text()).toContain('Awesome Comment');
    expect(brandLink.text()).toContain('vtest');
    expect(brandLink.attributes('target')).toBe('_blank');
    expect(brandLink.attributes('rel')).toBe('noopener noreferrer');
  });

  it('当设置 showBrand: false 时，仅渲染版本号文本，不渲染链接', () => {
    const wrapper = mount(CommentForm, {
      props: {
        showBrand: false,
      },
      global: {
        provide: {
          ApiBaseUrl: '',
          Auth0Domain: '',
          siteId: 'site-1',
        },
      },
    });

    expect(wrapper.find('a[href="https://awesomecomment.org"]').exists()).toBe(false);
    expect(wrapper.text()).toContain('vtest');
  });

  it('当设置 showVersion: false / noVersion: true 时，仅渲染品牌链接，不含版本号', () => {
    const wrapper = mount(CommentForm, {
      props: {
        showVersion: false,
      },
      global: {
        provide: {
          ApiBaseUrl: '',
          Auth0Domain: '',
          siteId: 'site-1',
        },
      },
    });

    const brandLink = wrapper.find('a[href="https://awesomecomment.org"]');
    expect(brandLink.exists()).toBe(true);
    expect(brandLink.text()).toBe('Awesome Comment');
  });

  it('当同时关闭品牌和版本号时，底部信息区域完全隐藏', () => {
    const wrapper = mount(CommentForm, {
      props: {
        showBrand: false,
        showVersion: false,
      },
      global: {
        provide: {
          ApiBaseUrl: '',
          Auth0Domain: '',
          siteId: 'site-1',
        },
      },
    });

    expect(wrapper.find('a[href="https://awesomecomment.org"]').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('Awesome Comment');
    expect(wrapper.text()).not.toContain('vtest');
  });

  it('支持通过 provide 注入全局显隐配置', () => {
    const wrapper = mount(CommentForm, {
      global: {
        provide: {
          ApiBaseUrl: '',
          Auth0Domain: '',
          siteId: 'site-1',
          ShowBrand: false,
          ShowVersion: false,
        },
      },
    });

    expect(wrapper.find('a[href="https://awesomecomment.org"]').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('vtest');
  });
});
