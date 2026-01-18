import { describe, it, expect } from 'vitest';
import { getCacheKey, getVoteCacheKey, getConfigKey, getMyConfigKey, isAutoApprove } from '../../server/utils';
import { CommentStatus } from '@awesome-comment/core/data';
import type { AcConfig, ResponseComment } from '@awesome-comment/core/types';

describe('Server Utils', () => {
  describe('getCacheKey', () => {
    it('should generate correct cache key for post', () => {
      const key = getCacheKey('https://example.com/post/1');
      expect(key).toBe('comments-https://example.com/post/1');
    });

    it('should handle empty postId', () => {
      const key = getCacheKey('');
      expect(key).toBe('comments-');
    });
  });

  describe('getVoteCacheKey', () => {
    it('should generate correct vote cache key', () => {
      const key = getVoteCacheKey('https://example.com/post/1');
      expect(key).toBe('vote-comment-https://example.com/post/1');
    });
  });

  describe('getConfigKey', () => {
    it('should generate config key with site prefix', () => {
      const originalEnv = process.env.ADMIN_SITE;
      process.env.ADMIN_SITE = 'mysite';
      const key = getConfigKey();
      expect(key).toBe('mysite_ac_config');
      process.env.ADMIN_SITE = originalEnv;
    });
  });

  describe('getMyConfigKey', () => {
    it('should generate user-specific config key', () => {
      const originalEnv = process.env.ADMIN_SITE;
      process.env.ADMIN_SITE = 'mysite';
      const key = getMyConfigKey('user@example.com');
      expect(key).toBe('mysite_ac_config_user@example.com');
      process.env.ADMIN_SITE = originalEnv;
    });
  });

  describe('isAutoApprove', () => {
    const baseConfig: AcConfig = {
      adminEmails: ['admin@example.com'],
      adminDisplayName: 'Admin',
      adminDisplayAvatar: '',
      autoApprove: {
        enabled: true,
      },
      shortcutEmojis: [],
    };

    const createHistory = (count: number, status: CommentStatus): ResponseComment[] => {
      return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        post_id: 'https://example.com/post/1',
        postId: 'https://example.com/post/1',
        content: `Comment ${i + 1}`,
        user_id: 'user123',
        userId: 'user123',
        status,
        created_at: new Date().toISOString(),
      }));
    };

    it('should return false when autoApprove is disabled', () => {
      const config = {
        ...baseConfig,
        autoApprove: { enabled: false },
      };
      const history = createHistory(5, CommentStatus.Approved);
      const result = isAutoApprove(config, 'https://example.com/post/1', history, 'test comment');
      expect(result).toBe(false);
    });

    it('should return true when user has 2+ approved comments', () => {
      const history = createHistory(3, CommentStatus.Approved);
      const result = isAutoApprove(baseConfig, 'https://example.com/post/1', history, 'test comment');
      expect(result).toBe(true);
    });

    it('should return false when user has less than 2 approved comments', () => {
      const history = createHistory(1, CommentStatus.Approved);
      const result = isAutoApprove(baseConfig, 'https://example.com/post/1', history, 'test comment');
      expect(result).toBe(false);
    });

    it('should return false when comment contains markdown link', () => {
      const history = createHistory(5, CommentStatus.Approved);
      const result = isAutoApprove(
        baseConfig,
        'https://example.com/post/1',
        history,
        'Check [this link](https://spam.com)',
      );
      expect(result).toBe(false);
    });

    it('should return false when postId does not match include pattern', () => {
      const config = {
        ...baseConfig,
        autoApprove: {
          enabled: true,
          include: '/blog/',
        },
      };
      const history = createHistory(5, CommentStatus.Approved);
      const result = isAutoApprove(config, 'https://example.com/docs/1', history, 'test comment');
      expect(result).toBe(false);
    });

    it('should return true when postId matches include pattern', () => {
      const config = {
        ...baseConfig,
        autoApprove: {
          enabled: true,
          include: '/blog/',
        },
      };
      const history = createHistory(5, CommentStatus.Approved);
      const result = isAutoApprove(config, 'https://example.com/blog/1', history, 'test comment');
      expect(result).toBe(true);
    });

    it('should return false when postId matches exclude pattern', () => {
      const config = {
        ...baseConfig,
        autoApprove: {
          enabled: true,
          exclude: '/private/',
        },
      };
      const history = createHistory(5, CommentStatus.Approved);
      const result = isAutoApprove(config, 'https://example.com/private/1', history, 'test comment');
      expect(result).toBe(false);
    });
  });
});
