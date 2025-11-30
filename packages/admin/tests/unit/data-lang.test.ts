import { describe, it, expect } from 'vitest';
import { LocalLanguageName, LanguageName } from '../../data/lang';

describe('Language Data', () => {
  describe('LocalLanguageName', () => {
    it('should have English for en', () => {
      expect(LocalLanguageName['en']).toBe('English');
    });

    it('should have Chinese for zh-CN', () => {
      expect(LocalLanguageName['zh-CN']).toBe('中文（简体）');
    });

    it('should have Chinese for cn (alias)', () => {
      expect(LocalLanguageName['cn']).toBe('中文（简体）');
    });

    it('should have Traditional Chinese for zh', () => {
      expect(LocalLanguageName['zh']).toBe('中文（正體）');
    });

    it('should have Japanese for ja', () => {
      expect(LocalLanguageName['ja']).toBe('日本語');
    });

    it('should have consistent keys with LanguageName', () => {
      const localKeys = Object.keys(LocalLanguageName);
      const englishKeys = Object.keys(LanguageName);
      expect(localKeys.sort()).toEqual(englishKeys.sort());
    });
  });

  describe('LanguageName', () => {
    it('should have English for en', () => {
      expect(LanguageName['en']).toBe('English');
    });

    it('should have Chinese (Simplified) for zh-CN', () => {
      expect(LanguageName['zh-CN']).toBe('Chinese (Simplified)');
    });

    it('should have Chinese (Traditional) for zh', () => {
      expect(LanguageName['zh']).toBe('Chinese (Traditional)');
    });

    it('should have Japanese for ja', () => {
      expect(LanguageName['ja']).toBe('Japanese');
    });

    it('should have Vietnamese for vi', () => {
      expect(LanguageName['vi']).toBe('Vietnamese');
    });

    it('should have Korean for ko', () => {
      expect(LanguageName['ko']).toBe('Korean');
    });
  });
});
