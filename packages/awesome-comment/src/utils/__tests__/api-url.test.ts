import { describe, expect, it } from 'vitest';
import { buildApiUrl, normalizeApiBaseUrl } from '../api-url.ts';

describe('api-url', () => {
  it('保留服务根域作为 API base URL', () => {
    expect(normalizeApiBaseUrl('https://awesomecomment.org')).toBe('https://awesomecomment.org');
    expect(buildApiUrl('https://awesomecomment.org', '/api/comments')).toBe('https://awesomecomment.org/api/comments');
  });

  it('兼容误传 /api 后缀，避免拼出 /api/api/comments', () => {
    expect(normalizeApiBaseUrl('https://awesomecomment.org/api')).toBe('https://awesomecomment.org');
    expect(buildApiUrl('https://awesomecomment.org/api/', '/api/comments')).toBe(
      'https://awesomecomment.org/api/comments',
    );
  });
});
