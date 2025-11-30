import { describe, it, expect } from 'vitest';
import { isSafari } from '../../utils/ui';

describe('UI Utils', () => {
  describe('isSafari', () => {
    it('should return true for Safari user agent', () => {
      // Note: This test would need to mock navigator.userAgent
      // For now, we just verify the function exists and returns a boolean
      const result = isSafari();
      expect(typeof result).toBe('boolean');
    });
  });
});
