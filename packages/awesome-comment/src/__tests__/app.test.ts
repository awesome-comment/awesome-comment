import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App.vue';
import type { Theme } from '../types/theme.ts';

vi.mock('../store', () => ({
  default: () => ({
    message: '',
    total: 0,
    hasMore: false,
  }),
}));

vi.mock('../store/auth.ts', () => ({
  default: () => ({
    isLoading: false,
    isAuthenticated: false,
    isAwesomeAuth: false,
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
    renderGoogleButton: vi.fn(),
  }),
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('../components/comment-form.vue', () => ({
  default: { name: 'CommentForm', template: '<div class="comment-form-stub" />' },
}));

vi.mock('../components/comment-section.vue', () => ({
  default: { name: 'CommentSection', template: '<div class="comment-section-stub" />' },
}));

function mountWithTheme(theme?: Theme) {
  return mount(App, {
    global: {
      provide: {
        Theme: theme,
      },
    },
  });
}

describe('App.vue - theme 选项', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('显式 light 时根元素设置 data-theme="light"', () => {
    const wrapper = mountWithTheme('light');
    expect(wrapper.attributes('data-theme')).toBe('light');
  });

  it('显式 dark 时根元素设置 data-theme="dark"', () => {
    const wrapper = mountWithTheme('dark');
    expect(wrapper.attributes('data-theme')).toBe('dark');
  });

  it('auto 时不设置 data-theme，保持跟随系统', () => {
    const wrapper = mountWithTheme('auto');
    expect(wrapper.attributes('data-theme')).toBeUndefined();
  });

  it('未提供 theme 时不设置 data-theme，保持跟随系统', () => {
    const wrapper = mountWithTheme();
    expect(wrapper.attributes('data-theme')).toBeUndefined();
  });
});
