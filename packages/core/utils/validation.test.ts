import { describe, it, expect } from 'vitest';
import { validateCommentContent, sanitizeContent, getContentStats, VALIDATION_PRESETS } from './validation';

describe('Content Validation', () => {
  describe('validateCommentContent', () => {
    it('should accept valid content', () => {
      const result = validateCommentContent('This is a valid comment.');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject content with too many consecutive exclamation marks', () => {
      const result = validateCommentContent('Wow!!!!!!');
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Too many consecutive "!"');
    });

    it('should reject content with too many consecutive question marks', () => {
      const result = validateCommentContent('Really??????');
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Too many consecutive "?"');
    });

    it('should reject content with too many mixed punctuation', () => {
      const result = validateCommentContent('What!?!?!?');
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Too many consecutive punctuation');
    });

    it('should accept content with exactly 5 consecutive punctuation', () => {
      const result = validateCommentContent('Wow!!!!!');
      expect(result.valid).toBe(true);
    });

    it('should reject content that is too short', () => {
      const result = validateCommentContent('a');
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('at least');
    });

    it('should reject content with too many consecutive spaces', () => {
      const result = validateCommentContent('Hello    world');
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('consecutive spaces');
    });

    it('should reject content with too many consecutive newlines', () => {
      const result = validateCommentContent('Line 1\n\n\n\nLine 2');
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('line breaks');
    });

    it('should handle Chinese content correctly', () => {
      const result = validateCommentContent('这是一个有效的评论');
      expect(result.valid).toBe(true);
    });

    it('should reject Chinese content with too many consecutive punctuation', () => {
      const result = validateCommentContent('真的吗！！！！！！');
      expect(result.valid).toBe(false);
    });

    it('should accept emoji in content', () => {
      const result = validateCommentContent('Great post! 👍👍👍');
      expect(result.valid).toBe(true);
    });

    it('should enforce minimum words for English content', () => {
      const result = validateCommentContent('a', { minWords: 2 });
      expect(result.valid).toBe(false);
      expect(result.errors[1]).toContain('at least 2');
    });

    it('should allow custom options', () => {
      const result = validateCommentContent('Wow!!!!!!!!!!', {
        maxConsecutivePunctuation: 10,
      });
      expect(result.valid).toBe(true);
    });

    it('should block custom patterns', () => {
      const result = validateCommentContent('Visit example.com for more', {
        blockPatterns: [/\w+\.com/],
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('blocked pattern');
    });
  });

  describe('sanitizeContent', () => {
    it('should trim whitespace', () => {
      const result = sanitizeContent('  Hello  ');
      expect(result).toBe('Hello');
    });

    it('should compress excessive spaces', () => {
      const result = sanitizeContent('Hello          world');
      expect(result).toBe('Hello   world');
    });

    it('should compress excessive newlines', () => {
      const result = sanitizeContent('Line 1\n\n\n\n\n\nLine 2');
      expect(result).toBe('Line 1\n\n\nLine 2');
    });

    it('should compress excessive punctuation', () => {
      const result = sanitizeContent('Wow!!!!!!!!!!!');
      expect(result).toBe('Wow!!!!!');
    });

    it('should handle Chinese punctuation', () => {
      const result = sanitizeContent('真的吗！！！！！！！');
      expect(result).toBe('真的吗！！！！！');
    });

    it('should handle mixed content', () => {
      const result = sanitizeContent('  Hello!!!!!!!    world??????  ');
      expect(result).toBe('Hello!!!!!   world?????');
    });
  });

  describe('getContentStats', () => {
    it('should count English content correctly', () => {
      const stats = getContentStats('Hello world!');
      expect(stats.englishWords).toBe(2);
      expect(stats.punctuation).toBeGreaterThan(0);
      expect(stats.isChinese).toBe(false);
    });

    it('should count Chinese content correctly', () => {
      const stats = getContentStats('你好世界！');
      expect(stats.chineseChars).toBe(4);
      expect(stats.isChinese).toBe(true);
    });

    it('should count mixed content correctly', () => {
      const stats = getContentStats('Hello 世界!');
      expect(stats.englishWords).toBeGreaterThan(0);
      expect(stats.chineseChars).toBeGreaterThan(0);
    });

    it('should count newlines correctly', () => {
      const stats = getContentStats('Line 1\nLine 2\nLine 3');
      expect(stats.newlines).toBe(2);
    });
  });

  describe('VALIDATION_PRESETS', () => {
    it('should have lenient preset', () => {
      const result = validateCommentContent('Wow!!!!!!!!!', VALIDATION_PRESETS.lenient);
      expect(result.valid).toBe(true);
    });

    it('should have standard preset', () => {
      const result = validateCommentContent('Hello world', VALIDATION_PRESETS.standard);
      expect(result.valid).toBe(true);
    });

    it('should have strict preset', () => {
      const result = validateCommentContent('Hi', VALIDATION_PRESETS.strict);
      expect(result.valid).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      const result = validateCommentContent('');
      expect(result.valid).toBe(false);
    });

    it('should handle null content', () => {
      const result = validateCommentContent(null as any);
      expect(result.valid).toBe(false);
    });

    it('should handle undefined content', () => {
      const result = validateCommentContent(undefined as any);
      expect(result.valid).toBe(false);
    });

    it('should handle very long content', () => {
      const longContent = 'a'.repeat(6000);
      const result = validateCommentContent(longContent);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('must not exceed');
    });

    it('should handle content with only punctuation', () => {
      const result = validateCommentContent('!!!???...');
      expect(result.valid).toBe(false);
    });

    it('should handle content with only spaces', () => {
      const result = validateCommentContent('     ');
      expect(result.valid).toBe(false);
    });
  });
});
