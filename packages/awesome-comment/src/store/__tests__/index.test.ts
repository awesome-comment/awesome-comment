import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { CommentStatus } from '@awesome-comment/core/data';

const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

const { formatComment } = await import('../index.ts');

describe('Comment Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
  });

  describe('formatComment', () => {
    it('should filter out shadow banned comments if user id does not match', () => {
      const userId = 'user-1';
      const comments = [
        {
          id: 1,
          content: 'Public comment',
          user_id: 'user-2',
          status: CommentStatus.Approved,
          is_shadow_banned: false,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          content: 'Shadow banned comment (other user)',
          user_id: 'user-2',
          status: CommentStatus.Approved,
          is_shadow_banned: true,
          created_at: '2024-01-01T00:01:00Z',
        },
        {
          id: 3,
          content: 'Shadow banned comment (self)',
          user_id: userId,
          status: CommentStatus.Approved,
          is_shadow_banned: true,
          created_at: '2024-01-01T00:02:00Z',
        },
      ];

      const formatted = formatComment(comments as any, userId, 'test-post');
      const formattedValues = Object.values(formatted);
      expect(formattedValues).toHaveLength(2);
      expect(formattedValues[0].id).toBe(1);
      expect(formattedValues[1].id).toBe(3);
    });

    it('should map is_shadow_banned to isShadowBanned correctly', () => {
      const comments = [
        {
          id: 1,
          content: 'Test',
          user_id: 'user-1',
          status: CommentStatus.Approved,
          is_shadow_banned: true,
          created_at: '2024-01-01T00:00:00Z',
        },
      ];

      const formatted = formatComment(comments as any, 'user-1', 'test-post');
      expect(Object.values(formatted)[0].isShadowBanned).toBe(true);
    });
  });
});
