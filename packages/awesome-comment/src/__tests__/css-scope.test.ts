import { describe, expect, it } from 'vitest';
import { scopeSelector, splitSelectors } from '../../postcss.config.js';

describe('splitSelectors', () => {
  it('普通逗号正常切分', () => {
    expect(splitSelectors(':root, [data-theme]')).toEqual([':root', '[data-theme]']);
  });

  it('括号内的逗号不切分', () => {
    expect(splitSelectors(':where(:root, [data-theme])')).toEqual([':where(:root, [data-theme])']);
    expect(
      splitSelectors(':where(:root),:root:has(input.ac-theme-controller[value=light]:checked),[data-theme=light]'),
    ).toEqual([':where(:root)', ':root:has(input.ac-theme-controller[value=light]:checked)', '[data-theme=light]']);
  });
});

describe('scopeSelector', () => {
  it('[data-theme=light] 展开为祖先式 + 自身式', () => {
    expect(scopeSelector('[data-theme=light]')).toEqual([
      '[data-theme=light] .awesome-comment',
      '.awesome-comment[data-theme=light]',
    ]);
  });

  it('带引号的 [data-theme="dark"] 同样展开并保留引号', () => {
    expect(scopeSelector('[data-theme="dark"]')).toEqual([
      '[data-theme="dark"] .awesome-comment',
      '.awesome-comment[data-theme="dark"]',
    ]);
  });

  it('无值的 [data-theme] 同样展开', () => {
    expect(scopeSelector('[data-theme]')).toEqual(['[data-theme] .awesome-comment', '.awesome-comment[data-theme]']);
  });

  it(':root 映射到 widget 根', () => {
    expect(scopeSelector(':root')).toEqual(['.awesome-comment']);
  });

  it(':host 映射到 widget 根', () => {
    expect(scopeSelector(':host')).toEqual(['.awesome-comment']);
  });

  it(':where(:root) 映射到 widget 根', () => {
    expect(scopeSelector(':where(:root)')).toEqual(['.awesome-comment']);
  });

  it(':root:has(theme-controller) 同时支持内部与外部切换器', () => {
    expect(scopeSelector(':root:has(input.ac-theme-controller[value=light]:checked)')).toEqual([
      '.awesome-comment:has(input.ac-theme-controller[value=light]:checked)',
      ':root:has(input.ac-theme-controller[value=light]:checked) .awesome-comment',
    ]);
  });

  it(':where(:root, [data-theme]) 展开为根 + 祖先式 + 自身式', () => {
    expect(scopeSelector(':where(:root, [data-theme])')).toEqual([
      '.awesome-comment',
      '[data-theme] .awesome-comment',
      '.awesome-comment[data-theme]',
    ]);
  });

  it(':root:not([data-theme]) 只映射自身否定式（避免祖先式误覆盖显式主题）', () => {
    expect(scopeSelector(':root:not([data-theme])')).toEqual(['.awesome-comment:not([data-theme])']);
  });

  it(':root:not(span) 保持后缀映射', () => {
    expect(scopeSelector(':root:not(span)')).toEqual(['.awesome-comment:not(span)']);
  });

  it('普通组件类保持后代式前缀（回归）', () => {
    expect(scopeSelector('.ac-btn')).toEqual(['.awesome-comment .ac-btn']);
    expect(scopeSelector('.ac-textarea')).toEqual(['.awesome-comment .ac-textarea']);
  });

  it('已含 .awesome-comment 的选择器保持不变（回归）', () => {
    expect(scopeSelector('.awesome-comment')).toEqual(['.awesome-comment']);
    expect(scopeSelector('[data-theme="light"] .awesome-comment')).toEqual(['[data-theme="light"] .awesome-comment']);
    expect(scopeSelector('.awesome-comment:has(input.ac-theme-controller[value=dark]:checked)')).toEqual([
      '.awesome-comment:has(input.ac-theme-controller[value=dark]:checked)',
    ]);
  });
});
