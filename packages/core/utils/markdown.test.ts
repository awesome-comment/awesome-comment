import { describe, expect, it } from 'vitest';
import { parseMarkdown } from './markdown';

describe('parseMarkdown', () => {
  describe('基础 Markdown 渲染', () => {
    it('应正确渲染段落和文本样式', () => {
      const input = '**粗体** *斜体* ~~删除线~~ `代码`';
      const output = parseMarkdown(input).trim();
      expect(output).toBe('<p><strong>粗体</strong> <em>斜体</em> <del>删除线</del> <code>代码</code></p>');
    });

    it('应支持 GFM breaks 换行', () => {
      const input = '第一行\n第二行';
      const output = parseMarkdown(input).trim();
      expect(output).toBe('<p>第一行<br>第二行</p>');
    });

    it('应正确渲染引用和代码块', () => {
      const input = '> 引用文本\n\n```js\nconsole.log("hi");\n```';
      const output = parseMarkdown(input).trim();
      expect(output).toContain('<blockquote>');
      expect(output).toContain('console.log(&quot;hi&quot;);');
    });
  });

  describe('HTML 消毒防御', () => {
    it('应丢弃 script 标签，防止脚本执行', () => {
      const inlineInput = 'hello <script>alert(1)</script> world';
      const inlineOutput = parseMarkdown(inlineInput).trim();
      expect(inlineOutput).not.toContain('<script');
      expect(inlineOutput).not.toContain('</script>');
      expect(inlineOutput).toBe('<p>hello alert(1) world</p>');

      const blockInput = '<script>alert(1)</script>';
      const blockOutput = parseMarkdown(blockInput).trim();
      expect(blockOutput).toBe('');
    });

    it('应丢弃内联 HTML 标签（如 img onerror、iframe 等）', () => {
      const input = '测试 <img src="x" onerror="alert(1)"> 标签 <iframe src="evil.com"></iframe>';
      const output = parseMarkdown(input).trim();
      expect(output).toBe('<p>测试  标签 </p>');
      expect(output).not.toContain('<img');
      expect(output).not.toContain('onerror');
      expect(output).not.toContain('<iframe');
    });

    it('应丢弃块级 HTML 标签', () => {
      const input = '<div class="danger"><strong>危险内容</strong></div>';
      const output = parseMarkdown(input).trim();
      expect(output).toBe('');
    });
  });

  describe('链接协议白名单', () => {
    it('应允许 http 和 https 链接，并添加 target="_blank" 和 rel="noopener"', () => {
      const input = '[官方网站](https://example.com) 和 [HTTP链接](http://example.com)';
      const output = parseMarkdown(input).trim();
      expect(output).toBe(
        '<p><a href="https://example.com" target="_blank" rel="noopener">官方网站</a> 和 <a href="http://example.com" target="_blank" rel="noopener">HTTP链接</a></p>',
      );
    });

    it('应支持带 title 的合法链接', () => {
      const input = '[链接](https://example.com "示例标题")';
      const output = parseMarkdown(input).trim();
      expect(output).toBe(
        '<p><a href="https://example.com" title="示例标题" target="_blank" rel="noopener">链接</a></p>',
      );
    });

    it('应允许 mailto 和 tel 协议', () => {
      const input = '[联系邮箱](mailto:test@example.com) 和 [电话](tel:10086)';
      const output = parseMarkdown(input).trim();
      expect(output).toBe(
        '<p><a href="mailto:test@example.com" target="_blank" rel="noopener">联系邮箱</a> 和 <a href="tel:10086" target="_blank" rel="noopener">电话</a></p>',
      );
    });

    it('应拦截 javascript: 协议链接并回退为纯文本', () => {
      const input = '[恶意链接](javascript:alert(1))';
      const output = parseMarkdown(input).trim();
      expect(output).toBe('<p>恶意链接</p>');
      expect(output).not.toContain('<a');
      expect(output).not.toContain('javascript:');
    });

    it('应拦截 data: 协议和 vbscript: 协议链接', () => {
      const input = '[Data链接](data:text/html,<script>alert(1)</script>) [VBS](vbscript:msgbox(1))';
      const output = parseMarkdown(input).trim();
      expect(output).toBe('<p>Data链接 VBS</p>');
      expect(output).not.toContain('<a');
    });
  });

  describe('图片协议白名单', () => {
    it('应允许 https 和 http 图片，并添加 loading="lazy"', () => {
      const input = '![封面图](https://example.com/cover.png "封面")';
      const output = parseMarkdown(input).trim();
      expect(output).toBe(
        '<p><img src="https://example.com/cover.png" alt="封面图" title="封面" loading="lazy" /></p>',
      );
    });

    it('应拦截非 http(s) 协议的图片并回退为 alt 纯文本', () => {
      const input = '![恶搞图](javascript:alert(1)) ![Base64图](data:image/png;base64,xxxx)';
      const output = parseMarkdown(input).trim();
      expect(output).toBe('<p>恶搞图 Base64图</p>');
      expect(output).not.toContain('<img');
    });
  });

  describe('边界条件', () => {
    it('空字符串、null、undefined 应返回空字符串', () => {
      expect(parseMarkdown('')).toBe('');
      expect(parseMarkdown(null)).toBe('');
      expect(parseMarkdown(undefined)).toBe('');
    });
  });
});
