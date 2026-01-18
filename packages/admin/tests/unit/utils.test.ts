import { describe, it, expect } from 'vitest';
import { replaceTemplate, parseUserAgent } from '../../utils';
import type { Comment } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';

describe('Utils', () => {
  describe('replaceTemplate', () => {
    const mockComment: Comment = {
      id: 1,
      postId: 'https://example.com/post/en/',
      content: 'This is a test comment',
      userId: 'user123',
      status: CommentStatus.Approved,
      createdAt: new Date(),
      user: {
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://example.com/avatar.jpg',
      },
    };

    it('should replace $TITLE$ with title', () => {
      const template = 'Hello $TITLE$!';
      const result = replaceTemplate(template, mockComment, 'My Post', '');
      expect(result).toBe('Hello My Post!');
    });

    it('should replace $USERNAME$ with user name', () => {
      const template = 'Hello $USERNAME$!';
      const result = replaceTemplate(template, mockComment, '', '');
      expect(result).toBe('Hello John Doe!');
    });

    it('should replace $USERNAME$ with email if name is empty', () => {
      const commentWithoutName = {
        ...mockComment,
        user: { email: 'jane@example.com', avatar: '', name: '' },
      };
      const template = 'Hello $USERNAME$!';
      const result = replaceTemplate(template, commentWithoutName, '', '');
      expect(result).toBe('Hello jane@example.com!');
    });

    it('should replace $COMMENT$ with comment content', () => {
      const template = 'Comment: $COMMENT$';
      const result = replaceTemplate(template, mockComment, '', '');
      expect(result).toBe('Comment: This is a test comment');
    });

    it('should replace $CURRENT_COMMENT$ with reply', () => {
      const template = 'Reply: $CURRENT_COMMENT$';
      const result = replaceTemplate(template, mockComment, '', 'My reply');
      expect(result).toBe('Reply: My reply');
    });

    it('should replace $LANG_EN$ with English language name', () => {
      const template = 'Language: $LANG_EN$';
      const result = replaceTemplate(template, mockComment, '', '');
      expect(result).toBe('Language: English');
    });

    it('should replace $LANG_LOCAL$ with local language name', () => {
      const template = 'Language: $LANG_LOCAL$';
      const result = replaceTemplate(template, mockComment, '', '');
      expect(result).toBe('Language: English');
    });

    it('should handle Chinese language path', () => {
      const chineseComment = {
        ...mockComment,
        postId: 'https://example.com/post/zh-CN/',
      };
      const template = 'Language: $LANG_LOCAL$';
      const result = replaceTemplate(template, chineseComment, '', '');
      expect(result).toBe('Language: 中文（简体）');
    });

    it('should keep unknown placeholders unchanged', () => {
      const template = 'Hello $UNKNOWN$!';
      const result = replaceTemplate(template, mockComment, '', '');
      expect(result).toBe('Hello $UNKNOWN$!');
    });

    it('should replace multiple placeholders', () => {
      const template = 'Hi $USERNAME$, thanks for "$COMMENT$" on $TITLE$!';
      const result = replaceTemplate(template, mockComment, 'My Post', '');
      expect(result).toBe('Hi John Doe, thanks for "This is a test comment" on My Post!');
    });
  });

  describe('parseUserAgent', () => {
    it('should parse Chrome on Windows', () => {
      const ua =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      const result = parseUserAgent(ua);
      expect(result.browser).toBe('Chrome');
      expect(result.browserVersion).toBe('120.0.0.0');
      expect(result.os).toBe('Windows');
      expect(result.osVersion).toBe('10.0');
      expect(result.deviceType).toBe('Desktop');
    });

    it('should parse Firefox on Mac', () => {
      const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Gecko/20100101 Firefox/121.0';
      const result = parseUserAgent(ua);
      expect(result.browser).toBe('Firefox');
      expect(result.browserVersion).toBe('121.0');
      expect(result.os).toBe('Mac OS');
      expect(result.osVersion).toBe('10.15.7');
      expect(result.deviceType).toBe('Desktop');
    });

    it('should parse Safari on iOS', () => {
      const ua =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1';
      const result = parseUserAgent(ua);
      expect(result.browser).toBe('Safari');
      expect(result.browserVersion).toBe('17.2');
      expect(result.os).toBe('iOS');
      expect(result.deviceType).toBe('Mobile / Tablet');
    });

    it('should parse Chrome on Android', () => {
      const ua =
        'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.210 Mobile Safari/537.36';
      const result = parseUserAgent(ua);
      expect(result.browser).toBe('Chrome');
      expect(result.browserVersion).toBe('120.0.6099.210');
      expect(result.os).toBe('Android');
      expect(result.osVersion).toBe('14');
      expect(result.deviceType).toBe('Mobile / Tablet');
    });

    it('should parse Edge on Windows', () => {
      const ua =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.2210.91';
      const result = parseUserAgent(ua);
      expect(result.browser).toBe('Edge');
      expect(result.browserVersion).toBe('120.0.2210.91');
      expect(result.os).toBe('Windows');
      expect(result.deviceType).toBe('Desktop');
    });

    it('should handle unknown browser', () => {
      const ua = 'Some Unknown Browser/1.0';
      const result = parseUserAgent(ua);
      expect(result.browser).toBe('');
      expect(result.browserVersion).toBe('');
    });

    it('should detect iPad as Mobile/Tablet', () => {
      const ua =
        'Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1';
      const result = parseUserAgent(ua);
      expect(result.deviceType).toBe('Mobile / Tablet');
    });
  });
});
