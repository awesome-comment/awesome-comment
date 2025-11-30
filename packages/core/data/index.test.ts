import { describe, it, expect } from 'vitest';
import {
  CommentStatus,
  CommentTags,
  MarkdownLinkRegex,
  EmailAppendixRegex,
  Languages,
  POST_INTERVAL,
} from './index';

describe('Core Data Constants', () => {
  describe('CommentStatus', () => {
    it('should have Pending status as 0', () => {
      expect(CommentStatus.Pending).toBe(0);
    });

    it('should have Approved status as 1', () => {
      expect(CommentStatus.Approved).toBe(1);
    });

    it('should have Rejected status as 2', () => {
      expect(CommentStatus.Rejected).toBe(2);
    });

    it('should have UnReplied status as 255', () => {
      expect(CommentStatus.UnReplied).toBe(255);
    });

    it('should have Replied to Admin status as 256', () => {
      expect(CommentStatus['Replied to Admin']).toBe(256);
    });
  });

  describe('CommentTags', () => {
    it('should contain 5 tags', () => {
      expect(CommentTags).toHaveLength(5);
    });

    it('should include Greeting', () => {
      expect(CommentTags).toContain('Greeting');
    });

    it('should include Bug report', () => {
      expect(CommentTags).toContain('Bug report');
    });

    it('should include Question', () => {
      expect(CommentTags).toContain('Question');
    });

    it('should include Suggestion', () => {
      expect(CommentTags).toContain('Suggestion');
    });

    it('should include Criticism', () => {
      expect(CommentTags).toContain('Criticism');
    });
  });

  describe('MarkdownLinkRegex', () => {
    it('should match markdown links', () => {
      const text = '[Example](https://example.com)';
      const match = text.match(MarkdownLinkRegex);
      expect(match).toBeTruthy();
      expect(match![1]).toBe('Example');
      expect(match![2]).toBe('https://example.com');
    });

    it('should match links with titles', () => {
      const text = '[Example](https://example.com "Title")';
      const match = text.match(MarkdownLinkRegex);
      expect(match).toBeTruthy();
      expect(match![1]).toBe('Example');
      expect(match![2]).toBe('https://example.com');
    });

    it('should not match image links', () => {
      const text = '![Image](https://example.com/image.png)';
      const match = text.match(MarkdownLinkRegex);
      expect(match).toBeNull();
    });
  });

  describe('EmailAppendixRegex', () => {
    it('should match email domain suffix', () => {
      const email = 'user@example.com';
      expect(EmailAppendixRegex.test(email)).toBe(true);
    });

    it('should match complex email domains', () => {
      const email = 'user@mail.example.co.uk';
      expect(EmailAppendixRegex.test(email)).toBe(true);
    });

    it('should not match invalid email format', () => {
      const notEmail = 'not-an-email';
      expect(EmailAppendixRegex.test(notEmail)).toBe(false);
    });
  });

  describe('Languages', () => {
    it('should be an array', () => {
      expect(Array.isArray(Languages)).toBe(true);
    });

    it('should contain en', () => {
      expect(Languages).toContain('en');
    });

    it('should contain zh', () => {
      expect(Languages).toContain('zh');
    });
  });

  describe('POST_INTERVAL', () => {
    it('should be 15 minutes in milliseconds', () => {
      expect(POST_INTERVAL).toBe(900000); // 15 * 60 * 1000
    });
  });
});
